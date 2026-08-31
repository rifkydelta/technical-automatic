import json
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))

from services.ai_prompt_service import AiPromptService
from db import _init_db_sync, get_db_connection


class TestAiPromptEngine(unittest.TestCase):
    def setUp(self):
        _init_db_sync()

    def test_json_schema_structure(self):
        schema = AiPromptService.get_strict_json_schema()
        self.assertIn("meta", schema)
        self.assertIn("executive_summary", schema)
        self.assertIn("perspectives", schema)
        self.assertIn("scenario_matrix", schema)
        self.assertIn("execution_blueprint", schema)
        self.assertIn("forensic_checklist", schema)
        
        # Check all 5 perspectives + portfolio context
        perspectives = schema["perspectives"]
        self.assertIn("price_action_smc", perspectives)
        self.assertIn("bandarmology_order_flow", perspectives)
        self.assertIn("quantitative_momentum", perspectives)
        self.assertIn("fundamental_valuation", perspectives)
        self.assertIn("risk_reward_execution", perspectives)
        self.assertIn("portfolio_context", schema)

    def test_build_deep_prompt(self):
        mock_data = {
            "ticker": "BBCA",
            "company_name": "Bank Central Asia Tbk",
            "sector": "Financials",
            "last_price": 9850,
            "date": "31 August 2026",
            "company_profile": {
                "industry": "Banking",
                "description": "Commercial bank in Indonesia",
                "shares_outstanding": 123000000000
            },
            "valuation": {
                "market_cap": 1210000000000000
            },
            "trend_analysis": {
                "trend_besar": "BULLISH",
                "trend_menengah": "BULLISH",
                "trend_pendek": "PULLBACK"
            },
            "multi_timeframe": {
                "alignment": "Confirmed",
                "daily": "Bullish",
                "h1": "Bullish",
                "m15": "Pullback"
            },
            "indicators": {
                "ema20": 9800,
                "ema50": 9600,
                "ema200": 9200,
                "rsi": 58.5,
                "macd": 45.2,
                "macd_signal": 38.1,
                "macd_hist": 7.1
            },
            "relt_signal": {
                "action": "ULTRA BUY",
                "rating": "Grade A+",
                "score": 92,
                "trend_strength": "Very Strong",
                "trade_setup": {
                    "entry_price": 9850,
                    "stop_loss": 9450,
                    "tp1": 10450,
                    "tp2": 10850,
                    "risk_reward_ratio": 2.5,
                    "risk_percent": 4.06,
                    "tp1_percent": 6.09,
                    "tp2_percent": 10.15,
                    "trailing_stop": 9650
                },
                "smc": {
                    "market_phase": "Markup",
                    "bullish_fvg_active": True,
                    "bullish_ob_active": True,
                    "bos_bull": True
                }
            },
            "support_resistance": {
                "supports": [{"id": "S1", "zone": "9650-9750", "strength": "Kuat", "reason": "EMA50 + Demand Zone"}],
                "resistances": [{"id": "R1", "zone": "10400-10500", "strength": "Kuat", "reason": "All-Time High"}]
            },
            "order_flow": {
                "status": "Akumulasi",
                "buy_dominance_pct": "68%",
                "haka_condition": "Agresif",
                "bandar_activity": "Big Money Accumulation",
                "bandar_area": "9700-9850"
            },
            "fair_value_analysis": {
                "consolidated_fair_value": 11500,
                "margin_of_safety_pct": 16.7,
                "valuation_badge": "UNDERVALUED",
                "models": [
                    {"name": "DCF Growth Model", "fair_value": 11800, "upside_pct": 19.8, "status": "Undervalued"},
                    {"name": "Benjamin Graham", "fair_value": 11200, "upside_pct": 13.7, "status": "Fair"}
                ]
            },
            "financials_analytics": {
                "quality": {
                    "piotroski_f_score": 8,
                    "beneish_m_score": -2.65,
                    "beneish_status": "SAFE (Risiko Sangat Rendah)"
                }
            }
        }

        mock_news = [
            {"title": "Laba Bersih BBCA Tumbuh Solid di Kuartal II 2026", "published_date": "2026-08-30", "source": "Bisnis.com"}
        ]

        prompt = AiPromptService.build_deep_prompt(mock_data, mock_news, style="institutional")
        self.assertIn("BBCA", prompt)
        self.assertIn("Bank Central Asia Tbk", prompt)
        self.assertIn("ULTRA BUY", prompt)
        self.assertIn("Piotroski F-Score", prompt)
        self.assertIn("FORMAT OUTPUT: STRICT JSON SCHEMA", prompt)
        self.assertIn("Laba Bersih BBCA Tumbuh Solid", prompt)
        self.assertIn("Fresh Entry / Watchlist Mode", prompt)

    def test_build_prompt_with_avg_price(self):
        mock_data = {
            "ticker": "BBRI",
            "company_name": "Bank Rakyat Indonesia Tbk",
            "last_price": 5000,
            "relt_signal": {"action": "BUY"}
        }

        # Case 1: Floating Profit (avg 4500 vs last 5000 -> +11.11%)
        prompt_profit = AiPromptService.build_deep_prompt(mock_data, avg_price=4500)
        self.assertIn("Harga Average Modal Beli Pengguna**: Rp 4,500", prompt_profit)
        self.assertIn("FLOATING PROFIT +11.11%", prompt_profit)
        self.assertIn("Perspektif 6 (Personalized Portfolio Strategy)", prompt_profit)

        # Case 2: Floating Loss (avg 5500 vs last 5000 -> -9.09%)
        prompt_loss = AiPromptService.build_deep_prompt(mock_data, avg_price=5500)
        self.assertIn("Harga Average Modal Beli Pengguna**: Rp 5,500", prompt_loss)
        self.assertIn("FLOATING LOSS -9.09%", prompt_loss)

    def test_build_ultra_dense_prompt_financials(self):
        mock_data = {
            "ticker": "ASII",
            "company_name": "Astra International Tbk",
            "last_price": 5200,
            "financials_data": [
                {"year": "2023", "revenue": 312000000000000, "gross_profit": 68000000000000, "operating_income": 38000000000000, "net_income": 33800000000000, "eps": 835, "operating_cash_flow": 42000000000000, "free_cash_flow": 28000000000000, "total_assets": 445000000000000, "total_liabilities": 205000000000000, "total_equity": 240000000000000, "net_margin": 10.8},
                {"year": "2024", "revenue": 335000000000000, "gross_profit": 72000000000000, "operating_income": 41000000000000, "net_income": 35500000000000, "eps": 877, "operating_cash_flow": 45000000000000, "free_cash_flow": 31000000000000, "total_assets": 468000000000000, "total_liabilities": 215000000000000, "total_equity": 253000000000000, "net_margin": 10.6}
            ],
            "financials_analytics": {
                "quality": {
                    "piotroski_f_score": 8,
                    "f_score_status": "Strong Fundamental",
                    "f_score_criteria": [
                        {"name": "Positive ROA", "passed": True},
                        {"name": "Positive Cash Flow", "passed": True}
                    ],
                    "beneish_m_score": -2.75,
                    "beneish_status": "SAFE (Risiko Sangat Rendah)",
                    "altman_z_score": 3.45
                },
                "dupont": {
                    "net_profit_margin": 10.6,
                    "asset_turnover": 0.72,
                    "equity_multiplier": 1.85
                }
            },
            "technical_detail": {
                "pivots": {
                    "classic": {"pp": 5180, "s1": 5100, "s2": 5020, "r1": 5260, "r2": 5340},
                    "camarilla": {"h3": 5240, "h4": 5300, "l3": 5160, "l4": 5100}
                }
            }
        }

        mock_news = [
            {"title": "ASII Bagikan Dividen Interim Rp 98 per Saham", "publisher": "Kontan", "published_date": "2026-08-28"},
            {"title": "Penjualan Otomotif Nasional Naik 5.2% YoY", "publisher": "CNBC Indonesia", "published_date": "2026-08-29"}
        ]

        prompt = AiPromptService.build_deep_prompt(mock_data, mock_news, style="value_investing")
        self.assertIn("ASII", prompt)
        self.assertIn("| 2023 |", prompt)
        self.assertIn("| 2024 |", prompt)
        self.assertIn("Piotroski F-Score", prompt)
        self.assertIn("Beneish M-Score", prompt)
        self.assertIn("Altman Z-Score", prompt)
        self.assertIn("DuPont ROE 3-Stage Decomposition", prompt)
        self.assertIn("PP: Rp5,180", prompt)
        self.assertIn("ASII Bagikan Dividen Interim", prompt)
        self.assertIn("Penjualan Otomotif Nasional Naik", prompt)

    def test_build_prompt_with_target_provider(self):
        mock_data = {"ticker": "TLKM", "last_price": 3100}
        
        # Test ChatGPT provider tag
        prompt_chatgpt = AiPromptService.build_deep_prompt(mock_data, provider_name="ChatGPT")
        self.assertIn('"ai_provider_model": "Tentukan nama model yang kamu gunakan seperti GPT-4o / o3-mini / atau yang lain"', prompt_chatgpt)

        # Test Claude provider tag
        prompt_claude = AiPromptService.build_deep_prompt(mock_data, provider_name="Claude")
        self.assertIn('"ai_provider_model": "Tentukan nama model yang kamu gunakan seperti Claude 3.7 Sonnet / Claude 3.5 Sonnet / atau yang lain"', prompt_claude)

        # Test DeepSeek provider tag
        prompt_deepseek = AiPromptService.build_deep_prompt(mock_data, provider_name="DeepSeek")
        self.assertIn('"ai_provider_model": "Tentukan nama model yang kamu gunakan seperti DeepSeek R1 / DeepSeek V3 / atau yang lain"', prompt_deepseek)

        # Test Generic / None provider tag
        prompt_generic = AiPromptService.build_deep_prompt(mock_data, provider_name=None)
        self.assertIn("Tentukan nama model yang kamu gunakan seperti GPT-4o / Claude 3.7 Sonnet / DeepSeek R1 / Gemini 2.0 Pro / atau yang lain", prompt_generic)

    def test_database_crud(self):
        conn = get_db_connection()
        sample_json = json.dumps({
            "meta": {"ticker": "TEST", "company_name": "Test Tbk"},
            "executive_summary": {
                "master_bias": "BULLISH",
                "conviction_score": 85,
                "primary_action": "PULLBACK BUY",
                "one_sentence_thesis": "Test thesis statement."
            }
        })

        with conn:
            cursor = conn.execute("""
                INSERT INTO ai_analyses (
                    ticker, company_name, analysis_date, provider_model,
                    master_bias, conviction_score, primary_action,
                    one_sentence_thesis, raw_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, ("TEST", "Test Tbk", "2026-08-31", "Claude 3.7", "BULLISH", 85, "PULLBACK BUY", "Test thesis statement.", sample_json))
            row_id = cursor.lastrowid

        self.assertIsNotNone(row_id)

        # Retrieve
        row = conn.execute("SELECT * FROM ai_analyses WHERE id = ?", (row_id,)).fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row["ticker"], "TEST")
        self.assertEqual(row["conviction_score"], 85)

        # Delete
        with conn:
            conn.execute("DELETE FROM ai_analyses WHERE id = ?", (row_id,))

        deleted_row = conn.execute("SELECT * FROM ai_analyses WHERE id = ?", (row_id,)).fetchone()
        self.assertIsNone(deleted_row)


if __name__ == "__main__":
    unittest.main()
