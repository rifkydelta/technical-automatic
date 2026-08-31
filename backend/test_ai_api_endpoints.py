import json
import os
import sys
import unittest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(__file__))

from main import app
from db import _init_db_sync

client = TestClient(app)


class TestAiApiEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        _init_db_sync()

    def test_get_ai_schema(self):
        res = client.get("/api/ai/schema")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("schema", data)
        self.assertIn("perspectives", data["schema"])

    def test_save_fetch_delete_ai_analysis(self):
        sample_json = json.dumps({
            "meta": {
                "ticker": "BBRI",
                "company_name": "PT Bank Rakyat Indonesia Tbk",
                "analysis_date": "2026-08-31",
                "ai_provider_model": "DeepSeek R1",
                "time_horizon": "Swing (1-4 Minggu)"
            },
            "executive_summary": {
                "master_bias": "STRONG BULLISH",
                "conviction_score": 92,
                "primary_action": "ULTRA BUY",
                "one_sentence_thesis": "Valuasi sangat terdiskon dengan konfluensi mitigasi Bullish FVG.",
                "key_catalysts": ["Katalis A", "Katalis B"],
                "key_risks": ["Risiko A"]
            },
            "perspectives": {
                "price_action_smc": {"score": 95, "status": "Bullish"},
                "bandarmology_order_flow": {"score": 90, "status": "Accumulation"},
                "quantitative_momentum": {"score": 88, "status": "Expansion"},
                "fundamental_valuation": {"score": 94, "status": "Deep Undervalued"},
                "risk_reward_execution": {"score": 93, "status": "High Asymmetry"}
            }
        })

        # Save
        save_res = client.post("/api/ai/save-analysis", json={
            "ticker": "BBRI",
            "company_name": "PT Bank Rakyat Indonesia Tbk",
            "analysis_date": "2026-08-31",
            "provider_model": "DeepSeek R1",
            "master_bias": "STRONG BULLISH",
            "conviction_score": 92,
            "primary_action": "ULTRA BUY",
            "one_sentence_thesis": "Valuasi sangat terdiskon dengan konfluensi mitigasi Bullish FVG.",
            "raw_json": sample_json
        })
        self.assertEqual(save_res.status_code, 200)
        save_data = save_res.json()
        self.assertEqual(save_data["status"], "success")
        analysis_id = save_data["id"]

        # Fetch history
        hist_res = client.get("/api/ai/history/BBRI")
        self.assertEqual(hist_res.status_code, 200)
        hist_data = hist_res.json()
        self.assertEqual(hist_data["status"], "success")
        self.assertGreaterEqual(hist_data["total"], 1)

        # Fetch single
        single_res = client.get(f"/api/ai/analysis/{analysis_id}")
        self.assertEqual(single_res.status_code, 200)
        single_data = single_res.json()
        self.assertEqual(single_data["status"], "success")
        self.assertEqual(single_data["data"]["ticker"], "BBRI")
        self.assertEqual(single_data["data"]["conviction_score"], 92)

        # Delete
        del_res = client.delete(f"/api/ai/analysis/{analysis_id}")
        self.assertEqual(del_res.status_code, 200)

        # Verify not found
        single_res_after = client.get(f"/api/ai/analysis/{analysis_id}")
        self.assertEqual(single_res_after.status_code, 404)


if __name__ == "__main__":
    unittest.main()
