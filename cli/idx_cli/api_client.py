"""HTTP API client wrapper for IDX Technical Analysis Backend."""
import httpx
from typing import Dict, Any, List, Optional
from idx_cli.config import API_URL, DEFAULT_TIMEOUT, SCREENER_TIMEOUT

class APIClientError(Exception):
    """Exception thrown on API call failures."""
    pass

class APIClient:
    def __init__(self, base_url: str = API_URL):
        self.base_url = base_url.rstrip("/")

    def _client(self, timeout: float = DEFAULT_TIMEOUT) -> httpx.Client:
        return httpx.Client(base_url=self.base_url, timeout=timeout)

    def ping(self) -> bool:
        try:
            with self._client(timeout=5.0) as client:
                res = client.get("/")
                return res.status_code == 200
        except Exception:
            return False

    def analyze_ticker(self, ticker: str, mode: str = "live", order_flow: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        payload = {
            "ticker": ticker.upper(),
            "mode": mode,
            "order_flow": order_flow
        }
        try:
            with self._client(timeout=DEFAULT_TIMEOUT) as client:
                res = client.post("/api/analyze", json=payload)
                if res.status_code == 404:
                    raise APIClientError(f"Ticker '{ticker.upper()}' tidak ditemukan atau invalid.")
                res.raise_for_status()
                return res.json()
        except httpx.HTTPStatusError as e:
            raise APIClientError(f"HTTP Error {e.response.status_code}: {e.response.text}")
        except httpx.RequestError as e:
            raise APIClientError(f"Gagal menghubungi backend API ({self.base_url}): {str(e)}")

    def screen_tickers(self, tickers: List[str], mode: str = "live") -> Dict[str, Any]:
        payload = {
            "tickers": [t.upper() for t in tickers],
            "mode": mode
        }
        try:
            with self._client(timeout=SCREENER_TIMEOUT) as client:
                res = client.post("/api/screener", json=payload)
                res.raise_for_status()
                return res.json()
        except Exception as e:
            raise APIClientError(f"Gagal melakukan screener: {str(e)}")

    def custom_screener(self, screener_id: str = "bpjs_daytrade", mode: str = "live", custom_tickers: Optional[List[str]] = None) -> Dict[str, Any]:
        payload = {
            "screener_id": screener_id,
            "mode": mode,
            "custom_tickers": custom_tickers
        }
        try:
            with self._client(timeout=SCREENER_TIMEOUT) as client:
                res = client.post("/api/screener/custom-preset", json=payload)
                res.raise_for_status()
                return res.json()
        except Exception as e:
            raise APIClientError(f"Gagal melakukan custom screener ({screener_id}): {str(e)}")

    def list_custom_screeners(self) -> Dict[str, Any]:
        try:
            with self._client() as client:
                res = client.get("/api/screener/custom-list")
                res.raise_for_status()
                return res.json()
        except Exception as e:
            raise APIClientError(f"Gagal mengambil daftar custom screener: {str(e)}")

    def fetch_news(self, ticker: str, company_name: Optional[str] = None) -> List[Dict[str, Any]]:
        params = {"ticker": ticker.upper()}
        if company_name:
            params["company_name"] = company_name
        try:
            with self._client(timeout=15.0) as client:
                res = client.get("/api/news", params=params)
                res.raise_for_status()
                data = res.json()
                return data.get("data", [])
        except Exception:
            return []

    def fetch_ihsg(self) -> Dict[str, Any]:
        try:
            with self._client(timeout=10.0) as client:
                res = client.get("/api/market/ihsg")
                res.raise_for_status()
                return res.json()
        except Exception as e:
            raise APIClientError(f"Gagal mengambil data IHSG: {str(e)}")

    def fetch_live_price(self, ticker: str, mode: str = "live") -> Dict[str, Any]:
        try:
            with self._client(timeout=5.0) as client:
                res = client.get(f"/api/price/{ticker.upper()}", params={"mode": mode})
                res.raise_for_status()
                return res.json()
        except Exception as e:
            raise APIClientError(f"Gagal mengambil harga live: {str(e)}")

    def fetch_ticker_info(self, ticker: str) -> Dict[str, Any]:
        try:
            with self._client() as client:
                res = client.get(f"/api/ticker-info/{ticker.upper()}")
                res.raise_for_status()
                return res.json()
        except Exception as e:
            raise APIClientError(f"Gagal mengambil info ticker: {str(e)}")

    def fetch_session_info(self) -> Dict[str, Any]:
        try:
            with self._client() as client:
                res = client.get("/api/session-info")
                res.raise_for_status()
                return res.json()
        except Exception as e:
            raise APIClientError(f"Gagal mengambil session info: {str(e)}")
