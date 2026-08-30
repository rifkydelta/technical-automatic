import unittest
import asyncio
from fastapi.testclient import TestClient
from main import app
from db import init_db

class TestSignalAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        asyncio.run(init_db())
        cls.client = TestClient(app)

    def test_get_signals_stats(self):
        response = self.client.get("/api/signals/stats")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_signals", data)
        self.assertIn("buy_count", data)
        self.assertIn("sell_count", data)

    def test_get_latest_signals(self):
        response = self.client.get("/api/signals/latest?limit=10")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)

    def test_scan_signals_endpoint(self):
        response = self.client.post("/api/signals/scan", json={"tickers": ["BBCA", "BBRI"], "max_workers": 2})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("scan_time", data)
        self.assertIn("total_scanned", data)
        self.assertIn("signals", data)

if __name__ == "__main__":
    unittest.main()
