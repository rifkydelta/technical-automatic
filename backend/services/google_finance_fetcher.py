"""
Google Finance Data Fetcher Module
Fetches supplementary financial data from Google Finance:
- Analyst Price Targets (High, Median, Low)
- Analyst Consensus Recommendations (Buy/Hold/Sell percentages)
- Quarterly YoY financial performance metrics

Uses safe fallback mechanism if Google Finance is unavailable or rate-limited.
"""

import re
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

try:
    import requests
    from bs4 import BeautifulSoup
    HAS_SCRAPING_DEPS = True
except ImportError:
    HAS_SCRAPING_DEPS = False


class GoogleFinanceFetcher:
    BASE_URL = "https://www.google.com/finance/quote"

    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    def _empty_result(self) -> Dict[str, Any]:
        """Return safe empty fallback object."""
        return {
            "target_price_high": None,
            "target_price_median": None,
            "target_price_low": None,
            "analyst_rating": None,
            "buy_pct": None,
            "hold_pct": None,
            "sell_pct": None,
            "source": "Google Finance",
            "available": False,
        }

    def fetch_google_finance_data(self, ticker: str) -> Dict[str, Any]:
        """
        Fetch analyst price targets and consensus data from Google Finance.
        Safe fallback if scraping fails or dependencies are missing.
        """
        if not HAS_SCRAPING_DEPS:
            logger.warning("requests/bs4 not installed — Google Finance data unavailable.")
            return self._empty_result()

        url = f"{self.BASE_URL}/{ticker}:IDX"

        try:
            resp = requests.get(url, headers=self.HEADERS, timeout=10)
            if resp.status_code != 200:
                logger.info(f"Google Finance returned {resp.status_code} for {ticker}")
                return self._empty_result()

            soup = BeautifulSoup(resp.text, "html.parser")
            result = self._empty_result()

            # --- Extract Analyst Price Targets ---
            result.update(self._extract_analyst_targets(soup))

            # --- Extract Analyst Consensus ---
            result.update(self._extract_analyst_consensus(soup))

            result["available"] = (
                result.get("target_price_median") is not None
                or result.get("analyst_rating") is not None
            )

            return result

        except requests.exceptions.Timeout:
            logger.warning(f"Google Finance request timed out for {ticker}")
            return self._empty_result()
        except Exception as e:
            logger.warning(f"Google Finance scraping error for {ticker}: {e}")
            return self._empty_result()

    def _extract_analyst_targets(self, soup) -> Dict[str, Any]:
        """Extract High/Median/Low price targets from Google Finance page."""
        targets = {}
        try:
            # Google Finance uses specific data attributes and class patterns
            # for analyst price targets. We look for the price target section.
            # The structure may change; this is best-effort.

            page_text = soup.get_text(separator=" ")

            # Pattern: look for price target values near keywords
            # Google Finance typically shows: "Low IDR X,XXX" / "Median IDR X,XXX" / "High IDR X,XXX"
            patterns = {
                "target_price_low": r'(?:Low|Rendah)\s*(?:IDR|Rp)?\s*([\d,\.]+)',
                "target_price_median": r'(?:Median|Tengah)\s*(?:IDR|Rp)?\s*([\d,\.]+)',
                "target_price_high": r'(?:High|Tinggi)\s*(?:IDR|Rp)?\s*([\d,\.]+)',
            }

            for key, pattern in patterns.items():
                match = re.search(pattern, page_text, re.IGNORECASE)
                if match:
                    raw_val = match.group(1).replace(",", "").replace(".", "")
                    try:
                        targets[key] = float(raw_val)
                    except ValueError:
                        pass

        except Exception as e:
            logger.debug(f"Could not extract analyst targets: {e}")

        return targets

    def _extract_analyst_consensus(self, soup) -> Dict[str, Any]:
        """Extract Buy/Hold/Sell consensus percentages."""
        consensus = {}
        try:
            page_text = soup.get_text(separator=" ")

            # Pattern: "Buy XX%" / "Hold XX%" / "Sell XX%"
            buy_match = re.search(r'(?:Buy|Beli)\s*(\d+)%', page_text, re.IGNORECASE)
            hold_match = re.search(r'(?:Hold|Tahan)\s*(\d+)%', page_text, re.IGNORECASE)
            sell_match = re.search(r'(?:Sell|Jual)\s*(\d+)%', page_text, re.IGNORECASE)

            if buy_match:
                consensus["buy_pct"] = int(buy_match.group(1))
            if hold_match:
                consensus["hold_pct"] = int(hold_match.group(1))
            if sell_match:
                consensus["sell_pct"] = int(sell_match.group(1))

            # Determine overall analyst rating from percentages
            buy = consensus.get("buy_pct", 0)
            hold = consensus.get("hold_pct", 0)
            sell = consensus.get("sell_pct", 0)

            if buy > hold and buy > sell:
                consensus["analyst_rating"] = "Consensus Buy"
            elif sell > buy and sell > hold:
                consensus["analyst_rating"] = "Consensus Sell"
            elif buy + hold + sell > 0:
                consensus["analyst_rating"] = "Consensus Hold"

        except Exception as e:
            logger.debug(f"Could not extract analyst consensus: {e}")

        return consensus
