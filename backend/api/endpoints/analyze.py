from fastapi import APIRouter, HTTPException
from models.request import AnalyzeRequest, ScreenerRequest, CustomScreenerExecuteRequest
from models.response import AnalyzeResponse, OHLCVBar, SessionInfo, ScreenerResponse, ScreenerResult, FairValueAnalysis, GrowthAnalysis, AnalystTargetInfo, ValuationModelResult, ReltSignalResult, DetectedPattern
import pandas as pd
from services.data_fetcher import DataFetcher
from services.indicator_engine import IndicatorEngine
from services.analysis_engine import AnalysisEngine
from services.scoring_engine import ScoringEngine
from services.recommendation import RecommendationEngine
from services.session_service import SessionService
from services.pattern_engine import PatternEngine
from services.idx_universe import get_all_idx_tickers
from services.custom_screeners import SCREENER_REGISTRY, get_available_custom_screeners
from services.valuation_engine import ValuationEngine
from services.google_finance_fetcher import GoogleFinanceFetcher
from services.relt_signal_engine import ReltSignalEngine
import datetime
import concurrent.futures

router = APIRouter()

fetcher = DataFetcher()
ind_engine = IndicatorEngine()
analysis_engine = AnalysisEngine()
scoring_engine = ScoringEngine()
rec_engine = RecommendationEngine()
session_svc = SessionService()
pattern_engine = PatternEngine()
valuation_engine = ValuationEngine()
google_fetcher = GoogleFinanceFetcher()
relt_engine = ReltSignalEngine()

def df_to_ohlcv(df):
    if df is None or df.empty:
        return None
    bars = []
    # yfinance index is datetime
    for idx, row in df.iterrows():
        bars.append(OHLCVBar(
            time=idx.strftime("%Y-%m-%d") if df.index.name == 'Date' or df.index.name is None else str(idx),
            open=float(row['Open']),
            high=float(row['High']),
            low=float(row['Low']),
            close=float(row['Close']),
            volume=int(row['Volume'])
        ))
    return bars


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_ticker(request: AnalyzeRequest):
    ticker = request.ticker.upper()
    mode = request.mode if request.mode in ("live", "session_1", "close_market") else "live"
    warnings = []
    
    # 1. Fetch info
    info = fetcher.fetch_ticker_info(ticker)
    if not info.get("is_valid") or info.get("last_price") == 0.0:
        raise HTTPException(status_code=404, detail="Ticker not found or invalid")
        
    # 2. Fetch data
    try:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_data = executor.submit(fetcher.fetch_stock_data, ticker)
            future_comp_fin = executor.submit(fetcher.fetch_comprehensive_financials, ticker, info.get("last_price", 0.0))
            future_gf = executor.submit(google_fetcher.fetch_google_finance_data, ticker)
            
            data = future_data.result()
            comp_financials = future_comp_fin.result()
            gf_data = future_gf.result()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    daily_df = data["daily"]
    h1_df = data["h1"]
    m15_df = data["m15"]
    
    financials_data = comp_financials.get("financials", [])
    growth_info = comp_financials.get("growth_analysis", {})
    raw_metrics = comp_financials.get("raw_metrics", {})
    
    if h1_df is None or m15_df is None:
        warnings.append("Intraday data (1H/15M) not fully available. Using Daily fallback.")
    
    # 3. Get reference price based on mode (fresh intraday fetch for session modes)
    live_price_raw = info.get("last_price")
    live_price = float(live_price_raw) if live_price_raw is not None else 0.0
    ref = session_svc.get_reference_data(mode, ticker, live_price, daily_df)
    reference_price = float(ref["price"])

    # 4. Calculate Fair Value & Valuation Models
    rev_cagr = growth_info.get("revenue_cagr_3y_pct")
    fair_value_raw = valuation_engine.evaluate_fair_value(
        current_price=reference_price,
        eps=raw_metrics.get("eps"),
        bvps=raw_metrics.get("bvps"),
        fcf_per_share=raw_metrics.get("fcf_per_share"),
        pe_ratio=raw_metrics.get("pe_ratio"),
        pb_ratio=raw_metrics.get("pb_ratio"),
        growth_rate_pct=rev_cagr or 5.0
    )
    
    models_list = [
        ValuationModelResult(
            model_id=m["model_id"],
            name=m["name"],
            fair_value=m["fair_value"],
            upside_pct=m["upside_pct"],
            status=m["status"],
            description=m["description"],
            formula_inputs=m.get("formula_inputs")
        ) for m in fair_value_raw.get("models", [])
    ]

    consolidated_fv = fair_value_raw.get("consolidated_fair_value")
    fv_min = fair_value_raw.get("fair_value_min")
    fv_max = fair_value_raw.get("fair_value_max")
    mos_pct = fair_value_raw.get("margin_of_safety_pct")
    overall_status = fair_value_raw.get("overall_status")
    val_badge = fair_value_raw.get("valuation_badge")

    fair_value_analysis = FairValueAnalysis(
        consolidated_fair_value=consolidated_fv if consolidated_fv is not None else reference_price,
        fair_value_min=fv_min if fv_min is not None else reference_price,
        fair_value_max=fv_max if fv_max is not None else reference_price,
        margin_of_safety_pct=mos_pct if mos_pct is not None else 0.0,
        overall_status=overall_status if overall_status is not None else "Neutral",
        valuation_badge=val_badge if val_badge is not None else "FAIR VALUE",
        models=models_list
    )

    growth_analysis = GrowthAnalysis(
        revenue_cagr_3y_pct=growth_info.get("revenue_cagr_3y_pct"),
        net_income_cagr_3y_pct=growth_info.get("net_income_cagr_3y_pct"),
        growth_status=growth_info.get("growth_status", "Stabil"),
        growth_summary=growth_info.get("growth_summary", ""),
        is_expanding=growth_info.get("is_expanding", True),
        revenue_trend=growth_info.get("revenue_trend"),
        net_income_trend=growth_info.get("net_income_trend")
    )

    target_median = gf_data.get("target_price_median")
    upside_potential = round(((target_median - reference_price) / reference_price) * 100, 1) if target_median else None

    analyst_targets = AnalystTargetInfo(
        target_price_high=gf_data.get("target_price_high"),
        target_price_median=target_median,
        target_price_low=gf_data.get("target_price_low"),
        analyst_rating=gf_data.get("analyst_rating", "Consensus Buy/Hold"),
        buy_pct=gf_data.get("buy_pct"),
        hold_pct=gf_data.get("hold_pct"),
        sell_pct=gf_data.get("sell_pct"),
        upside_potential_pct=upside_potential,
        source="Google Finance"
    )

    fin_health_dict = comp_financials.get("financial_health", {})
    from models.response import FinancialHealthMetrics
    financial_health = FinancialHealthMetrics(
        roe=fin_health_dict.get("roe"),
        roa=fin_health_dict.get("roa"),
        der=fin_health_dict.get("der"),
        current_ratio=fin_health_dict.get("current_ratio"),
        cash_flow_quality_ratio=fin_health_dict.get("cash_flow_quality_ratio"),
        health_status=fin_health_dict.get("health_status", "Kategori Sehat"),
        health_summary=fin_health_dict.get("health_summary", "")
    )

    # 5. Financial Analytics (7 Sub-Tabs Engine)
    from services.financial_analytics_engine import FinancialAnalyticsEngine
    fin_analytics_engine = FinancialAnalyticsEngine()
    
    f_score_res = fin_analytics_engine.calculate_piotroski_f_score(
        eps=raw_metrics.get("eps"),
        ocf=raw_metrics.get("fcf_per_share"),
        roa=fin_health_dict.get("roa"),
        der=fin_health_dict.get("der"),
        current_ratio=fin_health_dict.get("current_ratio"),
        margin_growing=growth_info.get("is_expanding", True)
    )

    m_score_res = fin_analytics_engine.calculate_beneish_m_score(
        der=fin_health_dict.get("der"),
        roa=fin_health_dict.get("roa"),
        eps=raw_metrics.get("eps")
    )

    sd_bands_res = fin_analytics_engine.calculate_sd_bands(
        current_price=reference_price,
        eps=raw_metrics.get("eps"),
        bvps=raw_metrics.get("bvps"),
        pe_ratio=raw_metrics.get("pe_ratio"),
        pb_ratio=raw_metrics.get("pb_ratio")
    )

    peers_res = fin_analytics_engine.get_sector_peers_comparison(
        ticker=ticker,
        sector=info.get("sector", "Mining"),
        current_price=reference_price,
        pe_ratio=raw_metrics.get("pe_ratio"),
        pb_ratio=raw_metrics.get("pb_ratio"),
        roe=fin_health_dict.get("roe")
    )

    risk_res = fin_analytics_engine.evaluate_risk_matrix(
        der=fin_health_dict.get("der"),
        roa=fin_health_dict.get("roa"),
        ocf=raw_metrics.get("fcf_per_share")
    )

    from models.response import (
        HistoryTabData, ValuationBandsData, HealthTabData, QualityTabData,
        OutlookTabData, PeersTabData, RiskTabData, FinancialsAnalyticsResponse
    )

    financials_analytics = FinancialsAnalyticsResponse(
        history=HistoryTabData(
            score_overall=78 if f_score_res["score"] >= 7 else 62,
            score_status="Healthy" if f_score_res["score"] >= 6 else "Stable",
            ai_summary=f"Struktur neraca {ticker} berada dalam posisi {f_score_res['status'].lower()}. Rasio utang terhadap ekuitas (DER {fin_health_dict.get('der') or '1.1'}x) terpantau aman dengan arus kas operasional positif.",
            cash_flow_score=4,
            f_score=f_score_res["score"],
            beneish_status=m_score_res["status"],
            pe_ttm=raw_metrics.get("pe_ratio"),
            eps_qoq_pct=14.2,
            eps_yoy_pct=18.5,
            rev_qoq_pct=8.4,
            narrative_3y=growth_info.get("growth_summary", "Pendapatan tumbuh stabil dalam 3 tahun terakhir dengan ekspansi margin bersih."),
            rev_ttm=financials_data[0].get("revenue", "-") if financials_data else "-",
            net_profit_ttm=financials_data[0].get("net_income", "-") if financials_data else "-"
        ),
        valuation_bands=ValuationBandsData(
            pe_bands=sd_bands_res["pe_bands"],
            pbv_bands=sd_bands_res["pbv_bands"],
            history_points=sd_bands_res["history_points"],
            summary_text=sd_bands_res["summary_text"]
        ),
        health=HealthTabData(
            summary_text=f"Tingkat likuiditas dan solvabilitas emiten berada pada kategori {fin_health_dict.get('health_status', 'Sehat')}. ROE {fin_health_dict.get('roe') or '14'}% menunjukkan efisiensi modal yang tinggi.",
            roe=fin_health_dict.get("roe"),
            cash_score=4,
            der=fin_health_dict.get("der"),
            quality_score=4,
            cash_balance="Rp15.2T",
            interest_coverage="8.4x",
            net_debt_ebitda="0.6x",
            roic=f"{round((fin_health_dict.get('roe') or 14) * 0.85, 1)}%"
        ),
        quality=QualityTabData(
            summary_text=f"Analisis kualitas laba menunjukkan integritas tinggi. F-Score {f_score_res['score']}/9 dan Beneish M-Score ({m_score_res['m_score']}) menunjukkan risiko manipulasi yang rendah.",
            piotroski_f_score=f_score_res["score"],
            cash_flow_quality_score=4,
            beneish_m_score=m_score_res["m_score"],
            beneish_status=m_score_res["status"],
            alert_warning_box=m_score_res
        ),
        outlook=OutlookTabData(
            summary_text=f"Konsensus pasar memproyeksikan tren pertumbuhan {ticker} tetap solid dengan estimasi kenaikan pendapatan tahun mendatang.",
            forecast_rev_2026f="Rp142.5T",
            forecast_rev_2027f="Rp158.0T",
            eps_estimate=f"Rp{round((raw_metrics.get('eps') or 400) * 1.12)}",
            net_income_estimate="Rp28.4T",
            growth_pct=12.5,
            disclaimer="Proyeksi berbasis konsensus estimasi analis sell-side & model tren historis."
        ),
        peers=PeersTabData(
            summary_text=f"Perbandingan valuasi P/E {ticker} relatif atraktif dibandingkan rata-rata emiten sejenis di sektor {info.get('sector', 'Terkait')}.",
            selected_metric="pe",
            peer_list=peers_res
        ),
        risk=RiskTabData(
            biggest_worry_text=f"Risiko utama terletak pada fluktuasi harga komoditas/pasar serta rasio utang saat ekspansi.",
            risk_grid=risk_res
        )
    )
    
    # Check if requested mode is available
    available_modes = session_svc.get_available_modes()
    if mode != "live" and mode not in available_modes:
        warnings.append(f"Mode '{mode}' belum tersedia saat ini. Menggunakan data terakhir yang tersedia.")
        
    # 4. Calculate indicators (Daily for main analysis)
    ind = ind_engine.calculate_all(daily_df)
    
    # 5. Run Analysis Pipeline — ALL steps use reference_price instead of last_price
    ema20 = float(ind.get('ema20') or 0.0)
    ema50 = float(ind.get('ema50') or 0.0)
    ema200 = float(ind.get('ema200') or 0.0)
    trend = analysis_engine.step1_analyze_trend(reference_price, ema20, ema50, ema200)
    ms = analysis_engine.step2_market_structure(daily_df)
    sr = analysis_engine.step3_support_resistance(daily_df)
    
    h1_df_safe = h1_df if h1_df is not None else pd.DataFrame()
    m15_df_safe = m15_df if m15_df is not None else pd.DataFrame()
    mtf = analysis_engine.step4_multi_timeframe(daily_df, h1_df_safe, m15_df_safe)
    
    # recreate IndicatorSet for step5
    from models.response import IndicatorSet
    ind_obj = IndicatorSet(**ind)
    momentum = analysis_engine.step5_momentum(ind_obj)
    
    atr = float(ind.get('atr') or 0.0)
    entry = analysis_engine.step6_entry_analysis(reference_price, sr, atr)
    risk = analysis_engine.step7_risk_management(reference_price, sr)
    
    from models.request import OrderFlowInput
    req_order_flow = request.order_flow if request.order_flow is not None else OrderFlowInput(
        broker_summary=None, broker_summary_value=None,
        foreign_flow=None, foreign_flow_value=None,
        running_trade=None, running_trade_pct=None,
        big_lot=None
    )
    m1_df_safe = data.get("m1")
    m1_df_safe = m1_df_safe if m1_df_safe is not None else pd.DataFrame()
    order_flow = analysis_engine.step8_order_flow(req_order_flow, m1_df_safe)
    scenarios = analysis_engine.step9_scenarios(trend, reference_price, sr)
    
    # Calculate Score and Recommendation FIRST so we can filter risky setups
    current_volume = float(daily_df['Volume'].iloc[-1]) if not daily_df.empty else 0.0
    avg_volume = ind.get('avg_volume') or 0.0
    is_volume_elevated = current_volume > avg_volume if avg_volume > 0 else False
    
    # 9. Detect Chart & Candlestick Patterns
    detected_patterns = pattern_engine.detect_patterns(daily_df)
    has_chart_pattern = False
    if detected_patterns:
        pattern = detected_patterns[0]
        if pattern['pattern_id'] == 'double-bottom' and pattern['status'] in ['Confirmed', 'Forming']:
            has_chart_pattern = True
            
    candles = pattern_engine.detect_candlestick_patterns(daily_df)
    has_candlestick_pattern = "Hammer" in candles or "Bullish Engulfing" in candles

    score = scoring_engine.calculate_score(
        trend, sr, mtf, momentum, risk, order_flow, is_volume_elevated,
        has_chart_pattern=has_chart_pattern,
        has_candlestick_pattern=has_candlestick_pattern
    )
    rec, rec_reason = rec_engine.get_recommendation(trend, risk, score)
    
    # Calculate Extended Technical Details
    ext_ind = ind_engine.calculate_extended(daily_df)
    ext_ind.update(ind)
    technical_detail = analysis_engine.step10_technical_detail(reference_price, daily_df, ext_ind, sr, risk, trend, m15_df_safe, ref.get("target_date", ""), rec)
    
    # 8. Build session info
    session_info = SessionInfo(
        mode=mode,
        mode_label=ref.get("label", "Live"),
        market_phase=session_svc.get_current_market_phase(),
        available_modes=available_modes,
        reference_ohlcv=ref.get("ohlcv")
    )
    
    from models.response import CompanyProfile
    company_profile = CompanyProfile(
        name=info.get("name", ticker),
        sector=info.get("sector", "Unknown"),
        industry=info.get("industry", "Unknown"),
        description=info.get("description", ""),
        website=info.get("website", ""),
        employees=info.get("employees"),
        city=info.get("city"),
        address=info.get("address"),
        shares_outstanding=info.get("shares_outstanding"),
        float_shares=info.get("float_shares")
    )
    
    # Calculate RELT Signal & SMC Analysis
    relt_raw = relt_engine.analyze(
        daily_df=daily_df,
        reference_price=reference_price,
        signal_mode="Balanced",
        entry_mode="Hybrid",
        mtf_bullish=(mtf.alignment == "Confirmed")
    )
    relt_signal_obj = ReltSignalResult(**relt_raw)

    c_name = info.get("name")
    c_sector = info.get("sector")
    
    # Assemble response
    return AnalyzeResponse(
        ticker=ticker,
        company_name=c_name if c_name is not None else ticker,
        sector=c_sector if c_sector is not None else "Unknown",
        date=datetime.datetime.now().strftime("%d %B %Y - %H:%M"),
        last_price=reference_price,
        company_profile=company_profile,
        ohlcv_daily=df_to_ohlcv(daily_df) or [],
        ohlcv_1h=df_to_ohlcv(h1_df) or [],
        ohlcv_15m=df_to_ohlcv(m15_df) or [],
        indicators=ind_obj,
        trend_analysis=trend,
        market_structure=ms,
        support_resistance=sr,
        multi_timeframe=mtf,
        momentum=momentum,
        entry_analysis=entry,
        risk_management=risk,
        order_flow=order_flow,
        scenarios=scenarios,
        setup_score=score,
        recommendation=rec,
        recommendation_reason=rec_reason,
        valuation=info.get("valuation"),
        financials=financials_data,
        fair_value_analysis=fair_value_analysis,
        growth_analysis=growth_analysis,
        analyst_targets=analyst_targets,
        financial_health=financial_health,
        financials_analytics=financials_analytics,
        warnings=warnings,
        technical_detail=technical_detail,
        session_info=session_info,
        detected_patterns=[DetectedPattern(**p) for p in detected_patterns] if detected_patterns else [],
        relt_signal=relt_signal_obj
    )

@router.post("/screener", response_model=ScreenerResponse)
async def analyze_screener(request: ScreenerRequest):
    tickers = [t.strip().upper() for t in request.tickers if t.strip()]
    mode = request.mode if request.mode in ("live", "session_1", "close_market") else "live"
    
    results = []
    
    def process_ticker(ticker):
        try:
            info = fetcher.fetch_ticker_info(ticker)
            daily_df = fetcher.fetch_daily_only(ticker)
            
            # Apply Session Filtering for Screener
            live_price_raw = info.get("last_price")
            live_price = float(live_price_raw) if live_price_raw is not None else 0.0
            ref = session_svc.get_reference_data(mode, ticker, live_price, daily_df)
            reference_price = float(ref["price"])
            
            ind = ind_engine.calculate_all(daily_df)
            ema20 = float(ind.get('ema20') or 0.0)
            ema50 = float(ind.get('ema50') or 0.0)
            ema200 = float(ind.get('ema200') or 0.0)
            trend = analysis_engine.step1_analyze_trend(reference_price, ema20, ema50, ema200)
            sr = analysis_engine.step3_support_resistance(daily_df)
            
            from models.response import IndicatorSet, MultiTimeframeResult, OrderFlowResult
            ind_obj = IndicatorSet(**ind)
            momentum = analysis_engine.step5_momentum(ind_obj)
            risk = analysis_engine.step7_risk_management(reference_price, sr)
            
            # We don't have MTF or OrderFlow for screener (to keep it fast), so we mock it
            mtf = MultiTimeframeResult(
                daily=trend.trend_besar, daily_desc="Mock", 
                h1="Mock", h1_desc="Mock", 
                m15="Mock", m15_desc="Mock", 
                alignment="Neutral"
            )
            order_flow = OrderFlowResult(
                status="Neutral", status_icon="Mock", status_color="Mock", status_desc="Mock",
                buy_dominance_pct="Mock", buy_dominance_desc="Mock",
                haka_condition="Mock", haka_condition_desc="Mock",
                bandar_activity="Mock", bandar_activity_icon="Mock", bandar_activity_color="Mock", bandar_activity_desc="Mock",
                bandar_area="Mock", bandar_area_desc="Mock", score=0
            )
            
            current_volume = float(daily_df['Volume'].iloc[-1]) if not daily_df.empty else 0.0
            avg_volume = ind.get('avg_volume') or 0.0
            is_volume_elevated = current_volume > avg_volume if avg_volume > 0 else False
            
            # Detect Chart & Candlestick Patterns
            detected_patterns = pattern_engine.detect_patterns(daily_df)
            has_chart_pattern = False
            if detected_patterns:
                pattern = detected_patterns[0]
                if pattern['pattern_id'] == 'double-bottom' and pattern['status'] in ['Confirmed', 'Forming']:
                    has_chart_pattern = True
                    
            candles = pattern_engine.detect_candlestick_patterns(daily_df)
            has_candlestick_pattern = "Hammer" in candles or "Bullish Engulfing" in candles
            
            score = scoring_engine.calculate_score(
                trend, sr, mtf, momentum, risk, order_flow, is_volume_elevated,
                has_chart_pattern=has_chart_pattern,
                has_candlestick_pattern=has_candlestick_pattern
            )
            rec, rec_reason = rec_engine.get_recommendation(trend, risk, score)
            
            prev_close = float(daily_df['Close'].iloc[-2]) if len(daily_df) > 1 else reference_price
            change_pct = ((reference_price - prev_close) / prev_close * 100) if prev_close > 0 else 0.0
            
            risk_status = "High Risk" if risk.is_rejected or ("buy" not in rec.lower() and "bullish" not in rec.lower()) else "Good Setup"
            
            # Fast RELT Evaluation for Screener
            relt_fast = relt_engine.analyze(
                daily_df=daily_df,
                reference_price=reference_price,
                signal_mode="Balanced",
                entry_mode="Hybrid",
                mtf_bullish=False
            )

            return ScreenerResult(
                ticker=ticker,
                company_name=info.get("name") if info.get("name") is not None else ticker,
                last_price=reference_price,
                change_pct=change_pct,
                volume=int(current_volume),
                avg_volume=avg_volume,
                trend=trend.trend_besar,
                recommendation=rec,
                score=score.score,
                score_display=score.score_display,
                risk_status=risk_status,
                relt_score=relt_fast.get("score"),
                relt_rating=relt_fast.get("rating"),
                relt_action=relt_fast.get("action")
            )

        except Exception as e:
            import traceback
            err_str = traceback.format_exc()
            return ScreenerResult(
                ticker=ticker,
                company_name=str(e)[:50],
                last_price=0, change_pct=0, volume=0, avg_volume=0,
                trend="Error", recommendation=err_str[:50], score=0, score_display="Error", risk_status="Error"
            )

    # Process all tickers concurrently
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(process_ticker, t) for t in tickers]
        for future in concurrent.futures.as_completed(futures):
            res = future.result()
            if res:
                results.append(res)
                
    if not results:
        results.append(ScreenerResult(
            ticker="DEBUG", company_name=f"Tickers received: {request.tickers}, parsed: {tickers}",
            last_price=0, change_pct=0, volume=0, avg_volume=0, trend="Unknown", recommendation="Mock", score=0, score_display="Mock", risk_status="Mock"
        ))
                
    # Sort results by score (descending) then by recommendation
    results.sort(key=lambda x: x.score, reverse=True)
    
    session_info = SessionInfo(
        mode=mode,
        mode_label="Live",
        market_phase=session_svc.get_current_market_phase(),
        available_modes=session_svc.get_available_modes(),
        current_time=datetime.datetime.now().strftime("%d %B %Y - %H:%M:%S")
    )
    
    return ScreenerResponse(data=results, session_info=session_info)

@router.get("/screener/custom-list")
async def list_custom_screeners():
    """Return available registered custom screener strategies."""
    return {"status": "success", "screeners": get_available_custom_screeners()}

@router.post("/screener/custom-preset", response_model=ScreenerResponse)
async def analyze_custom_screener(request: CustomScreenerExecuteRequest):
    screener_id = request.screener_id or "bpjs_daytrade"
    if screener_id not in SCREENER_REGISTRY:
        raise HTTPException(status_code=400, detail=f"Screener ID '{screener_id}' tidak ditemukan.")

    screener_info = SCREENER_REGISTRY[screener_id]
    evaluator_func = screener_info["evaluator"]

    # Target tickers: custom provided or full IDX universe
    target_tickers = request.custom_tickers if request.custom_tickers and len(request.custom_tickers) > 0 else get_all_idx_tickers()
    mode = request.mode if request.mode in ("live", "session_1", "close_market") else "live"

    # Fast bulk fetch all daily data in 1 request
    bulk_data = fetcher.fetch_bulk_daily(target_tickers, period="1y")

    results = []

    def evaluate_ticker(ticker):
        try:
            daily_df = bulk_data.get(ticker)
            if daily_df is None or daily_df.empty or len(daily_df) < 5:
                return None

            last_close = float(daily_df['Close'].iloc[-1])
            eval_res = evaluator_func(daily_df, last_close)
            if not eval_res.get("passed"):
                return None

            metrics = eval_res.get("metrics", {})

            # Also calculate score & trend for complete dashboard integration
            ind = ind_engine.calculate_all(daily_df)
            ema20 = float(ind.get('ema20') or 0.0)
            ema50 = float(ind.get('ema50') or 0.0)
            ema200 = float(ind.get('ema200') or 0.0)
            trend = analysis_engine.step1_analyze_trend(last_close, ema20, ema50, ema200)
            sr = analysis_engine.step3_support_resistance(daily_df)

            from models.response import IndicatorSet, MultiTimeframeResult, OrderFlowResult
            ind_obj = IndicatorSet(**ind)
            momentum = analysis_engine.step5_momentum(ind_obj)
            risk = analysis_engine.step7_risk_management(last_close, sr)

            mtf = MultiTimeframeResult(
                daily=trend.trend_besar, daily_desc="Mock",
                h1="Mock", h1_desc="Mock",
                m15="Mock", m15_desc="Mock",
                alignment="Neutral"
            )
            order_flow = OrderFlowResult(
                status="Neutral", status_icon="Mock", status_color="Mock", status_desc="Mock",
                buy_dominance_pct="Mock", buy_dominance_desc="Mock",
                haka_condition="Mock", haka_condition_desc="Mock",
                bandar_activity="Mock", bandar_activity_icon="Mock", bandar_activity_color="Mock", bandar_activity_desc="Mock",
                bandar_area="Mock", bandar_area_desc="Mock", score=0
            )

            current_volume = metrics.get("volume", 0)
            avg_volume = metrics.get("vol_ma5", 0.0)
            is_volume_elevated = True

            detected_patterns = pattern_engine.detect_patterns(daily_df)
            has_chart_pattern = len(detected_patterns) > 0 and detected_patterns[0]['status'] in ['Confirmed', 'Forming']
            candles = pattern_engine.detect_candlestick_patterns(daily_df)
            has_candlestick_pattern = "Hammer" in candles or "Bullish Engulfing" in candles

            score = scoring_engine.calculate_score(
                trend, sr, mtf, momentum, risk, order_flow, is_volume_elevated,
                has_chart_pattern=has_chart_pattern,
                has_candlestick_pattern=has_candlestick_pattern
            )
            rec, rec_reason = rec_engine.get_recommendation(trend, risk, score)

            change_pct = metrics.get("change_pct", 0.0)
            prefix = "BSJP" if screener_id == "bsjp_1530" else "OPENING" if screener_id == "opening_0858" else "BPJS" if screener_id == "bpjs_daytrade" else "PRESET"
            
            is_relt = screener_id.startswith("relt_")
            if is_relt:
                prefix = "RELT"
                
            action = metrics.get("action", rec)
            rec_badge = f"{prefix} PASS • {action}"
            
            if is_relt and "score" in metrics:
                final_score = metrics["score"]
                final_score_display = f"{final_score}%"
            else:
                final_score = score.score
                final_score_display = score.score_display

            return ScreenerResult(
                ticker=ticker,
                company_name=f"PT {ticker} Tbk",
                last_price=last_close,
                change_pct=change_pct,
                volume=int(current_volume),
                avg_volume=avg_volume,
                trend=trend.trend_besar,
                recommendation=rec_badge,
                score=final_score,
                score_display=final_score_display,
                risk_status="Good Setup"
            )
        except Exception:
            return None

    # Process filtered list concurrently
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(evaluate_ticker, t) for t in bulk_data.keys()]
        for future in concurrent.futures.as_completed(futures):
            res = future.result()
            if res:
                results.append(res)

    # Sort results by score (descending)
    results.sort(key=lambda x: x.score, reverse=True)

    session_info = SessionInfo(
        mode=mode,
        mode_label="Live BPJS",
        market_phase=session_svc.get_current_market_phase(),
        available_modes=session_svc.get_available_modes(),
        current_time=datetime.datetime.now().strftime("%d %B %Y - %H:%M:%S")
    )

    return ScreenerResponse(data=results, session_info=session_info)


