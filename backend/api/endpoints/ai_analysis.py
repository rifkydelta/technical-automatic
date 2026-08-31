import json
import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field
from db import get_db_connection
from services.ai_prompt_service import AiPromptService
from services.data_fetcher import DataFetcher
from services.news_scraper import get_news_by_ticker

logger = logging.getLogger("idx-api.ai")
router = APIRouter()

fetcher = DataFetcher()
prompt_service = AiPromptService()


class GeneratePromptRequest(BaseModel):
    ticker: str
    style: str = "institutional" # "institutional", "smc_swing", "scalping", "value_investing"
    avg_price: Optional[float] = None # User's personal holding average cost
    data: Optional[Dict[str, Any]] = None # If provided from client frontend


class SaveAnalysisRequest(BaseModel):
    ticker: str
    company_name: Optional[str] = ""
    analysis_date: Optional[str] = ""
    provider_model: Optional[str] = ""
    master_bias: Optional[str] = ""
    conviction_score: Optional[int] = 0
    primary_action: Optional[str] = ""
    one_sentence_thesis: Optional[str] = ""
    raw_json: str # Complete JSON string


@router.get("/schema")
def get_ai_schema():
    """Returns the strict JSON output schema expected from external AI providers."""
    return {
        "status": "success",
        "schema": prompt_service.get_strict_json_schema()
    }


@router.post("/generate-prompt")
async def generate_ai_prompt(req: GeneratePromptRequest):
    """
    Generates a high-density, multi-perspective AI analysis prompt for any IDX ticker.
    Can use client-provided analysis payload or fetch fresh analysis.
    """
    ticker = req.ticker.upper().strip()
    if not ticker:
        raise HTTPException(status_code=400, detail="Ticker wajib diisi.")

    try:
        # If client passed full analysis data, use it directly
        analysis_data = req.data
        news_data = []

        if not analysis_data:
            # Call analyze internally or fetch ticker data
            from api.endpoints.analyze import analyze_ticker
            from models.request import AnalyzeRequest
            res_obj = await analyze_ticker(AnalyzeRequest(ticker=ticker, mode="live"))
            analysis_data = res_obj.dict() if hasattr(res_obj, "dict") else dict(res_obj)

        # Try to fetch news if not present
        try:
            company_name = analysis_data.get("company_name", ticker)
            news_res = get_news_by_ticker(ticker, company_name)
            if news_res and isinstance(news_res, list):
                news_data = news_res
        except Exception as e:
            logger.warning(f"Failed to fetch news for prompt: {e}")

        prompt_text = prompt_service.build_deep_prompt(
            data=analysis_data,
            news_data=news_data,
            style=req.style,
            avg_price=req.avg_price
        )

        return {
            "status": "success",
            "ticker": ticker,
            "style": req.style,
            "prompt": prompt_text,
            "schema": prompt_service.get_strict_json_schema()
        }
    except Exception as e:
        logger.error(f"Error generating AI prompt for {ticker}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Gagal membuat AI prompt: {str(e)}")


@router.post("/save-analysis")
def save_ai_analysis(req: SaveAnalysisRequest):
    """
    Saves an imported AI analysis JSON payload into the SQLite database.
    Auto-parses summary fields if not provided.
    """
    ticker = req.ticker.upper().strip()
    if not ticker:
        raise HTTPException(status_code=400, detail="Ticker wajib diisi.")

    try:
        # Validate raw_json
        parsed = json.loads(req.raw_json)
        exec_sum = parsed.get("executive_summary", {})
        meta = parsed.get("meta", {})

        company_name = req.company_name or meta.get("company_name", ticker)
        analysis_date = req.analysis_date or meta.get("analysis_date", "")
        provider_model = req.provider_model or meta.get("ai_provider_model", "External AI")
        master_bias = req.master_bias or exec_sum.get("master_bias", "NEUTRAL")
        conviction_score = req.conviction_score or exec_sum.get("conviction_score", 0)
        primary_action = req.primary_action or exec_sum.get("primary_action", "WATCHLIST")
        one_sentence_thesis = req.one_sentence_thesis or exec_sum.get("one_sentence_thesis", "")

        conn = get_db_connection()
        with conn:
            cursor = conn.execute("""
                INSERT INTO ai_analyses (
                    ticker, company_name, analysis_date, provider_model,
                    master_bias, conviction_score, primary_action,
                    one_sentence_thesis, raw_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                ticker, company_name, analysis_date, provider_model,
                master_bias, conviction_score, primary_action,
                one_sentence_thesis, req.raw_json
            ))
            new_id = cursor.lastrowid

        return {
            "status": "success",
            "message": f"Analisis AI untuk {ticker} berhasil disimpan.",
            "id": new_id
        }
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Format JSON tidak valid: {str(e)}")
    except Exception as e:
        logger.error(f"Error saving AI analysis for {ticker}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan analisis AI: {str(e)}")


@router.get("/history/{ticker}")
def get_ai_history(ticker: str):
    """
    Returns list of saved AI analyses for a specific ticker.
    """
    ticker = ticker.upper().strip()
    try:
        conn = get_db_connection()
        rows = conn.execute("""
            SELECT id, ticker, company_name, analysis_date, provider_model,
                   master_bias, conviction_score, primary_action,
                   one_sentence_thesis, created_at
            FROM ai_analyses
            WHERE ticker = ?
            ORDER BY created_at DESC
        """, (ticker,)).fetchall()

        history = [dict(row) for row in rows]
        return {
            "status": "success",
            "ticker": ticker,
            "total": len(history),
            "data": history
        }
    except Exception as e:
        logger.error(f"Error fetching AI history for {ticker}: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal mengambil riwayat AI: {str(e)}")


@router.get("/analysis/{analysis_id}")
def get_single_analysis(analysis_id: int):
    """
    Returns full raw JSON and parsed metadata for a single saved analysis.
    """
    try:
        conn = get_db_connection()
        row = conn.execute("""
            SELECT * FROM ai_analyses WHERE id = ?
        """, (analysis_id,)).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Analisis AI tidak ditemukan.")

        res_dict = dict(row)
        res_dict["parsed_json"] = json.loads(res_dict["raw_json"])
        return {
            "status": "success",
            "data": res_dict
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching analysis {analysis_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal memuat analisis: {str(e)}")


@router.delete("/analysis/{analysis_id}")
def delete_single_analysis(analysis_id: int):
    """
    Deletes a saved analysis by ID.
    """
    try:
        conn = get_db_connection()
        with conn:
            cursor = conn.execute("DELETE FROM ai_analyses WHERE id = ?", (analysis_id,))
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Analisis AI tidak ditemukan.")

        return {
            "status": "success",
            "message": f"Analisis ID {analysis_id} berhasil dihapus."
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting analysis {analysis_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal menghapus analisis: {str(e)}")
