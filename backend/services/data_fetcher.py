import time
import yfinance as yf
import pandas as pd
from typing import Optional, Dict, Any, List, cast

def normalize_dividend_yield(raw_yield: Any, dps: Any = None, current_price: Any = None) -> Optional[float]:
    """
    Normalizes dividend yield value into percentage float (e.g. 7.07 for 7.07%).
    Solves 707.00% anomaly caused by double 100x scaling.
    """
    if raw_yield is not None and not pd.isna(raw_yield):
        try:
            val = float(raw_yield)
            if val <= 0:
                return 0.0
            if val <= 1.0:
                return round(val * 100, 2)
            elif val <= 100.0:
                return round(val, 2)
        except Exception:
            pass

    if dps is not None and current_price is not None:
        try:
            d_val = float(dps)
            p_val = float(current_price)
            if d_val > 0 and p_val > 0:
                return round((d_val / p_val) * 100, 2)
        except Exception:
            pass

    return None

class DataFetcher:
    _cache: Dict[str, Any] = {}
    _cache_ttl: float = 30.0  # 30 seconds TTL

    def __init__(self):
        pass

    def _get_from_cache(self, key: str) -> Optional[Any]:
        if key in self._cache:
            entry = self._cache[key]
            if (time.time() - entry["ts"]) < self._cache_ttl:
                return entry["data"]
            else:
                del self._cache[key]
        return None

    def _set_cache(self, key: str, data: Any):
        self._cache[key] = {
            "ts": time.time(),
            "data": data
        }

    def fetch_ticker_info(self, ticker: str) -> Dict[str, Any]:
        """
        Fetch basic and profile information about the ticker.
        Handles crumb and 401 errors gracefully with fast_info fallback.
        """
        cache_key = f"info_{ticker.upper()}"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached

        yf_ticker = f"{ticker}.JK"
        stock = yf.Ticker(yf_ticker)
        
        name = ticker
        sector = "Unknown"
        industry = "Unknown"
        desc = f"PT {ticker} merupakan emiten yang terdaftar di Bursa Efek Indonesia (IDX)."
        price = 0.0
        div_yield = None
        market_cap = None
        pe_ratio = None
        pb_ratio = None
        ps_ratio = None
        shares_out = None
        
        # 1. Try fast_info first (does not require crumb token)
        try:
            if hasattr(stock, 'fast_info') and stock.fast_info:
                fi = stock.fast_info
                price = float(fi.get('lastPrice') or fi.get('regularMarketPrice') or 0.0)
                market_cap = fi.get('marketCap')
                shares_out = fi.get('shares')
        except Exception:
            pass

        # 2. Try stock.info with safe fallback
        try:
            info = stock.info or {}
            if info:
                name = info.get("longName") or info.get("shortName") or name
                sector = info.get("sector", sector)
                industry = info.get("industry", sector)
                if info.get("longBusinessSummary"):
                    desc = info.get("longBusinessSummary")
                
                if price == 0.0:
                    price = float(info.get("currentPrice") or info.get("regularMarketPrice") or 0.0)
                
                div_yield = normalize_dividend_yield(
                    info.get("dividendYield") or info.get("trailingAnnualDividendYield"),
                    dps=info.get("trailingAnnualDividendRate"),
                    current_price=price
                )
                market_cap = market_cap or info.get("marketCap")
                pe_ratio = info.get("trailingPE")
                pb_ratio = info.get("priceToBook")
                ps_ratio = info.get("priceToSalesTrailing12Months")
                shares_out = shares_out or info.get("sharesOutstanding")
        except Exception:
            pass

        res = {
            "name": name,
            "sector": sector,
            "industry": industry,
            "description": desc,
            "website": "",
            "employees": None,
            "city": "Indonesia",
            "address": "-",
            "shares_outstanding": shares_out,
            "float_shares": None,
            "last_price": price,
            "currency": "IDR",
            "valuation": {
                "market_cap": market_cap,
                "pe_ratio": pe_ratio,
                "pb_ratio": pb_ratio,
                "ps_ratio": ps_ratio,
                "dividend_yield": div_yield
            },
            "is_valid": True if price > 0 or name != ticker else False
        }
        self._set_cache(cache_key, res)
        return res

    def fetch_daily_only(self, ticker: str) -> Optional[pd.DataFrame]:
        """
        Fetch only Daily data to save bandwidth for the screener.
        """
        cache_key = f"daily_{ticker.upper()}"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached

        yf_ticker = f"{ticker}.JK"
        try:
            daily_df = yf.download(yf_ticker, period="1y", interval="1d", progress=False)
            if daily_df.empty:
                return None
            if isinstance(daily_df.columns, pd.MultiIndex):
                daily_df.columns = daily_df.columns.get_level_values(0)
            self._set_cache(cache_key, daily_df)
            return daily_df
        except Exception:
            return None

    def fetch_bulk_daily(self, tickers: list[str], period: str = "1mo") -> Dict[str, pd.DataFrame]:
        """
        Bulk download daily OHLCV for multiple tickers in a single HTTP request.
        """
        yf_tickers = [f"{t}.JK" for t in tickers]
        try:
            df_all = yf.download(yf_tickers, period=period, interval="1d", group_by="ticker", progress=False, threads=True)
            result = {}
            if df_all.empty:
                return result

            for t in tickers:
                try:
                    yf_symbol = f"{t}.JK"
                    if len(tickers) == 1:
                        df = df_all.copy()
                        if isinstance(df.columns, pd.MultiIndex):
                            df.columns = df.columns.get_level_values(0)
                    else:
                        if not isinstance(df_all.columns, pd.MultiIndex) or yf_symbol not in df_all.columns.levels[0]:
                            continue
                        df = df_all[yf_symbol].copy()
                    
                    df = df.dropna(subset=['Close'])
                    if not df.empty and len(df) >= 5:
                        result[t] = df
                except Exception:
                    pass
            return result
        except Exception:
            return {}

    def fetch_stock_data(self, ticker: str) -> Dict[str, Any]:
        """
        Fetch Daily, 1H, and 15M OHLCV data safely with robust error handling.
        """
        cache_key = f"stock_{ticker.upper()}"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached

        yf_ticker = f"{ticker}.JK"
        
        # 1. Daily data (1 year for EMA200)
        try:
            daily_df = yf.download(yf_ticker, period="1y", interval="1d", progress=False)
        except Exception:
            daily_df = pd.DataFrame()
            
        if daily_df.empty:
            return {
                "daily": pd.DataFrame(),
                "h1": None,
                "m15": None,
                "m1": None
            }
            
        # 2. 1H data (180 days avoids 730d API overflow limit and speeds up scan)
        h1_df = pd.DataFrame()
        try:
            h1_df = yf.download(yf_ticker, period="180d", interval="1h", progress=False)
        except Exception:
            pass
        
        # 3. 15M data (60 days max for yfinance)
        m15_df = pd.DataFrame()
        try:
            m15_df = yf.download(yf_ticker, period="60d", interval="15m", progress=False)
        except Exception:
            pass
        
        # 4. 1M data (5 days max for yfinance)
        m1_df = pd.DataFrame()
        try:
            m1_df = yf.download(yf_ticker, period="5d", interval="1m", progress=False)
        except Exception:
            pass
        
        res = {
            "daily": self._format_dataframe(daily_df),
            "h1": self._format_dataframe(h1_df) if not h1_df.empty else None,
            "m15": self._format_dataframe(m15_df) if not m15_df.empty else None,
            "m1": self._format_dataframe(m1_df) if not m1_df.empty else None,
        }
        self._set_cache(cache_key, res)
        return res

    def _format_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        if df.empty:
            return df
        
        # yfinance sometimes returns multi-index columns for downloads
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.droplevel(1)
            
        # Clean up column names
        formatted_df = cast(pd.DataFrame, df[['Open', 'High', 'Low', 'Close', 'Volume']].copy())
        
        # Drop rows with NaN in critical columns
        formatted_df = formatted_df.dropna(subset=['Close'])
        
        return formatted_df

    def fetch_yearly_financials(self, ticker: str) -> list:
        """
        Fetch the last 3 years of income statement, balance sheet, and cash flow data.
        """
        yf_ticker = f"{ticker}.JK"
        stock = yf.Ticker(yf_ticker)
        
        financials_list = []
        try:
            inc_stmt = stock.income_stmt
            bs = stock.balance_sheet
            cf = stock.cash_flow
            divs = stock.dividends
            
            yearly_divs = {}
            if divs is not None and not divs.empty:
                for dt, amount in divs.items():
                    try:
                        y = str(pd.to_datetime(dt).year)
                        val = float(amount) if pd.notna(amount) else 0.0
                        yearly_divs[y] = yearly_divs.get(y, 0.0) + val
                    except Exception:
                        continue
            
            if inc_stmt is None or inc_stmt.empty:
                return financials_list
            
            # Columns are usually timestamps
            dates = inc_stmt.columns
            # Sort descending
            dates = sorted(dates, reverse=True)
            
            for date in dates[:3]:
                try:
                    year = str(pd.to_datetime(date).year)
                except Exception:
                    year = str(date)[:4]
                inc_col = inc_stmt[date] if date in inc_stmt.columns else pd.Series()
                bs_col = bs[date] if bs is not None and date in bs.columns else pd.Series()
                cf_col = cf[date] if cf is not None and date in cf.columns else pd.Series()
                
                rev = inc_col.get('Total Revenue')
                gross = inc_col.get('Gross Profit', inc_col.get('Total Revenue'))
                op_inc = inc_col.get('Operating Income')
                ni = inc_col.get('Net Income')
                eps = inc_col.get('Diluted EPS', inc_col.get('Basic EPS'))
                
                assets = bs_col.get('Total Assets')
                debt = bs_col.get('Total Debt')
                
                ocf = cf_col.get('Operating Cash Flow')
                fcf = cf_col.get('Free Cash Flow')
                
                def format_money(val):
                    if val is None or pd.isna(val):
                        return "N/A"
                    try:
                        v = float(val)
                    except (ValueError, TypeError):
                        return "N/A"
                    if v >= 1e12 or v <= -1e12:
                        return f"Rp{v/1e12:.1f}T"
                    elif v >= 1e9 or v <= -1e9:
                        return f"Rp{v/1e9:.1f}B"
                    elif v >= 1e6 or v <= -1e6:
                        return f"Rp{v/1e6:.1f}M"
                    else:
                        return f"Rp{v:,.0f}"
                        
                def format_num(val):
                    if val is None or pd.isna(val):
                        return "N/A"
                    try:
                        v = float(val)
                        return f"Rp{v:,.0f}"
                    except (ValueError, TypeError):
                        return "N/A"
                
                net_margin = "N/A"
                if rev is not None and ni is not None and not pd.isna(rev) and not pd.isna(ni):
                    try:
                        r_val = float(rev)
                        n_val = float(ni)
                        if r_val > 0:
                            net_margin = f"{(n_val / r_val) * 100:.1f}%"
                    except (ValueError, TypeError, ZeroDivisionError):
                        pass
                    
                div_val = yearly_divs.get(year, 0)
                dps_str = f"Rp{div_val:,.0f}" if div_val > 0 else "-"
                    
                financials_list.append({
                    "year": year,
                    "revenue": format_money(rev),
                    "gross_profit": format_money(gross),
                    "operating_income": format_money(op_inc),
                    "net_income": format_money(ni),
                    "net_margin": net_margin,
                    "eps": format_num(eps),
                    "dps": dps_str,
                    "total_assets": format_money(assets),
                    "total_debt": format_money(debt),
                    "operating_cash_flow": format_money(ocf),
                    "free_cash_flow": format_money(fcf)
                })
        except Exception:
            pass
            
        return financials_list

    def fetch_comprehensive_financials(self, ticker: str, current_price: float) -> Dict[str, Any]:
        """
        Fetch financials + raw numeric metrics for valuation engine + growth analysis.
        """
        cache_key = f"fin_{ticker.upper()}"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached

        financials = self.fetch_yearly_financials(ticker)

        raw_metrics: Dict[str, Any] = {
            "eps": None,
            "bvps": None,
            "fcf_per_share": None,
            "pe_ratio": None,
            "pb_ratio": None,
            "shares_outstanding": None,
        }

        growth_analysis: Dict[str, Any] = {
            "revenue_cagr_3y_pct": None,
            "net_income_cagr_3y_pct": None,
            "growth_status": "Data Tidak Tersedia",
            "growth_summary": "Data keuangan belum cukup untuk analisis pertumbuhan.",
            "is_expanding": False,
        }

        try:
            yf_ticker = f"{ticker}.JK"
            stock = yf.Ticker(yf_ticker)
            info = stock.info

            # Raw valuation metrics
            eps = info.get("trailingEps") or info.get("forwardEps")
            bvps = info.get("bookValue")
            shares = info.get("sharesOutstanding")
            pe = info.get("trailingPE")
            pb = info.get("priceToBook")

            # FCF per share
            fcf_ps = None
            try:
                cf = stock.cash_flow
                if cf is not None and not cf.empty:
                    latest_col = sorted(cf.columns, reverse=True)[0]
                    fcf_raw = cf[latest_col].get("Free Cash Flow")
                    if fcf_raw is not None and not pd.isna(fcf_raw) and shares and shares > 0:
                        fcf_ps = float(fcf_raw) / float(shares)
            except Exception:
                pass

            raw_metrics.update({
                "eps": float(eps) if eps and not pd.isna(eps) else None,
                "bvps": float(bvps) if bvps and not pd.isna(bvps) else None,
                "fcf_per_share": round(fcf_ps, 2) if fcf_ps else None,
                "pe_ratio": float(pe) if pe and not pd.isna(pe) else None,
                "pb_ratio": float(pb) if pb and not pd.isna(pb) else None,
                "shares_outstanding": float(shares) if shares else None,
            })

            # Growth Analysis: 3-year CAGR for Revenue & Net Income
            inc_stmt = stock.income_stmt
            if inc_stmt is not None and not inc_stmt.empty:
                dates = sorted(inc_stmt.columns, reverse=True)

                rev_values = []
                ni_values = []
                for d in dates[:4]:  # Up to 4 years for 3-year CAGR
                    col = inc_stmt[d]
                    rev = col.get("Total Revenue")
                    ni = col.get("Net Income")
                    if rev is not None and not pd.isna(rev):
                        rev_values.append(float(rev))
                    if ni is not None and not pd.isna(ni):
                        ni_values.append(float(ni))

                def calc_cagr(latest, earliest, years):
                    if earliest <= 0 or latest <= 0 or years <= 0:
                        return None
                    return round(((latest / earliest) ** (1 / years) - 1) * 100, 1)

                rev_cagr = None
                ni_cagr = None

                if len(rev_values) >= 2:
                    n_years = len(rev_values) - 1
                    rev_cagr = calc_cagr(rev_values[0], rev_values[-1], n_years)

                if len(ni_values) >= 2:
                    n_years = len(ni_values) - 1
                    ni_cagr = calc_cagr(ni_values[0], ni_values[-1], n_years)

                # Determine growth status
                is_expanding = False
                if rev_cagr is not None and ni_cagr is not None:
                    if rev_cagr > 10 and ni_cagr > 10:
                        status = "Sangat Berkembang (High Growth)"
                        summary = f"Pendapatan tumbuh {rev_cagr:.1f}% CAGR dan laba bersih tumbuh {ni_cagr:.1f}% CAGR selama 3 tahun terakhir. Perusahaan menunjukkan kinerja pertumbuhan yang kuat."
                        is_expanding = True
                    elif rev_cagr > 5 and ni_cagr > 0:
                        status = "Berkembang (Growing)"
                        summary = f"Pendapatan tumbuh moderat {rev_cagr:.1f}% CAGR dan laba bersih {ni_cagr:.1f}% CAGR. Pertumbuhan stabil dan positif."
                        is_expanding = True
                    elif rev_cagr > 0:
                        status = "Stabil (Stable)"
                        summary = f"Pendapatan tumbuh tipis {rev_cagr:.1f}% CAGR, laba bersih {ni_cagr:.1f if ni_cagr else 'N/A'}% CAGR. Perusahaan dalam fase konsolidasi."
                        is_expanding = rev_cagr > 0
                    else:
                        status = "Terganggu (Declining)"
                        summary = f"Pendapatan menurun {rev_cagr:.1f}% CAGR dan laba bersih {ni_cagr:.1f}% CAGR. Kinerja keuangan mengalami penurunan."
                        is_expanding = False
                elif rev_cagr is not None:
                    status = "Berkembang (Growing)" if rev_cagr > 5 else "Stabil (Stable)"
                    summary = f"Pendapatan tumbuh {rev_cagr:.1f}% CAGR selama 3 tahun terakhir."
                    is_expanding = rev_cagr > 0
                else:
                    status = "Data Terbatas"
                    summary = "Data keuangan historis tidak cukup untuk menghitung CAGR."

                growth_analysis.update({
                    "revenue_cagr_3y_pct": rev_cagr,
                    "net_income_cagr_3y_pct": ni_cagr,
                    "growth_status": status,
                    "growth_summary": summary,
                    "is_expanding": is_expanding,
                })

                # Add raw revenue & NI values for trend bar chart in frontend
                if len(rev_values) >= 2:
                    growth_analysis["revenue_trend"] = list(reversed(rev_values[:3]))
                if len(ni_values) >= 2:
                    growth_analysis["net_income_trend"] = list(reversed(ni_values[:3]))

            # Financial Health Metrics
            roe = info.get("returnOnEquity")
            roa = info.get("returnOnAssets")
            der = info.get("debtToEquity")
            curr_ratio = info.get("currentRatio")
            
            roe_val = round(float(roe) * 100, 1) if roe and not pd.isna(roe) else None
            roa_val = round(float(roa) * 100, 1) if roa and not pd.isna(roa) else None
            
            # yfinance sometimes returns DER as percentage (e.g. 150 for 1.5x) or ratio
            der_val = None
            if der and not pd.isna(der):
                d_num = float(der)
                der_val = round(d_num / 100.0, 2) if d_num > 5.0 else round(d_num, 2)
                
            cr_val = round(float(curr_ratio), 2) if curr_ratio and not pd.isna(curr_ratio) else None

            # Cash flow quality: Operating Cash Flow / Net Income
            cf_quality = None
            try:
                if stock.cash_flow is not None and not stock.cash_flow.empty and stock.income_stmt is not None and not stock.income_stmt.empty:
                    latest_cf_col = sorted(stock.cash_flow.columns, reverse=True)[0]
                    latest_inc_col = sorted(stock.income_stmt.columns, reverse=True)[0]
                    ocf_val = stock.cash_flow[latest_cf_col].get("Operating Cash Flow")
                    ni_val = stock.income_stmt[latest_inc_col].get("Net Income")
                    if ocf_val and ni_val and float(ni_val) > 0:
                        cf_quality = round(float(ocf_val) / float(ni_val), 2)
            except Exception:
                pass

            health_status = "Kategori Sehat"
            if der_val and der_val > 2.5:
                health_status = "Beban Utang Tinggi (High Debt)"
            elif roe_val and roe_val > 15:
                health_status = "Sangat Profitabel (High ROE)"
            elif roe_val and roe_val < 5:
                health_status = "Profitabilitas Rendah"

            health_summary = f"ROE: {f'{roe_val}%' if roe_val else 'N/A'} • DER: {f'{der_val}x' if der_val else 'N/A'} • Cash Flow Quality: {f'{cf_quality}x' if cf_quality else 'N/A'}."

            financial_health = {
                "roe": roe_val,
                "roa": roa_val,
                "der": der_val,
                "current_ratio": cr_val,
                "cash_flow_quality_ratio": cf_quality,
                "health_status": health_status,
                "health_summary": health_summary
            }

        except Exception as e:
            import traceback
            traceback.print_exc()
            financial_health = {
                "roe": None, "roa": None, "der": None, "current_ratio": None,
                "cash_flow_quality_ratio": None, "health_status": "Data Terbatas", "health_summary": ""
            }

        res = {
            "financials": financials,
            "raw_metrics": raw_metrics,
            "growth_analysis": growth_analysis,
            "financial_health": financial_health,
        }
        self._set_cache(cache_key, res)
        return res
