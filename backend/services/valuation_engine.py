"""
Valuation Engine Module
Menghitung Nilai Intrinsik / Harga Wajar Saham menggunakan 5 Metode Utama:
1. Discounted Cash Flow (DCF Model)
2. Formula Benjamin Graham Klasik (V = sqrt(22.5 * EPS * BVPS))
3. Formula Benjamin Graham Revised (V = (EPS * (8.5 + 2g) * 4.4) / Y)
4. Relative PE Ratio Valuation
5. Relative PBV Ratio Valuation
"""

import math
from typing import Dict, Any, List, Optional

class ValuationEngine:
    def __init__(self):
        pass

    def calculate_dcf(self, fcf_per_share: float, current_price: float, growth_rate: float = 0.08, discount_rate: float = 0.10, terminal_growth: float = 0.03, projection_years: int = 5) -> Optional[float]:
        """
        Discounted Cash Flow (DCF) per share calculation.
        """
        if fcf_per_share is None or fcf_per_share <= 0:
            return None

        # Project 5-year FCF
        pv_fcf_sum = 0.0
        current_fcf = fcf_per_share
        
        for t in range(1, projection_years + 1):
            current_fcf *= (1 + growth_rate)
            pv_fcf_sum += current_fcf / math.pow(1 + discount_rate, t)

        # Terminal Value calculation
        terminal_value = (current_fcf * (1 + terminal_growth)) / (discount_rate - terminal_growth)
        pv_terminal_value = terminal_value / math.pow(1 + discount_rate, projection_years)

        intrinsic_value = pv_fcf_sum + pv_terminal_value
        return round(intrinsic_value, 2)

    def calculate_graham_formula(self, eps: float, bvps: float) -> Optional[float]:
        """
        Benjamin Graham Classic Valuation Formula:
        V = sqrt(22.5 * EPS * BVPS)
        Only applicable when EPS > 0 and BVPS > 0.
        """
        if eps is None or bvps is None or eps <= 0 or bvps <= 0:
            return None

        try:
            value = math.sqrt(22.5 * eps * bvps)
            return round(value, 2)
        except Exception:
            return None

    def calculate_graham_revised(self, eps: float, growth_rate_pct: float = 5.0, bond_yield: float = 6.8) -> Optional[float]:
        """
        Benjamin Graham Revised Growth Valuation Formula:
        V = (EPS * (8.5 + 2g) * 4.4) / Y
        where g = expected 5Y growth rate in %, Y = 10Y SUN Bond yield in % (default 6.8%).
        """
        if eps is None or eps <= 0:
            return None

        g = max(0.0, min(growth_rate_pct or 5.0, 25.0))  # Cap growth rate conservatively
        try:
            value = (eps * (8.5 + 2 * g) * 4.4) / bond_yield
            return round(value, 2)
        except Exception:
            return None

    def calculate_pe_valuation(self, eps: float, target_pe: float = 15.0) -> Optional[float]:
        """
        Relative Valuation using Target / Historical Median P/E Ratio.
        Fair Value = EPS * Target P/E
        """
        if eps is None or eps <= 0 or target_pe is None or target_pe <= 0:
            return None

        return round(eps * target_pe, 2)

    def calculate_pbv_valuation(self, bvps: float, target_pbv: float = 1.5) -> Optional[float]:
        """
        Relative Valuation using Target / Historical Median P/BV Ratio.
        Fair Value = BVPS * Target P/BV
        """
        if bvps is None or bvps <= 0 or target_pbv is None or target_pbv <= 0:
            return None

        return round(bvps * target_pbv, 2)

    def evaluate_fair_value(self, current_price: float, eps: float, bvps: float, fcf_per_share: float, pe_ratio: float = None, pb_ratio: float = None, growth_rate_pct: float = 5.0) -> Dict[str, Any]:
        """
        Consolidate all valuation models into a unified Fair Value Analysis object.
        """
        models = []

        # 1. DCF Model
        dcf_val = self.calculate_dcf(fcf_per_share, current_price, growth_rate=(growth_rate_pct or 8.0) / 100.0)
        if dcf_val is not None:
            diff_pct = ((dcf_val - current_price) / current_price) * 100
            models.append({
                "model_id": "dcf",
                "name": "Discounted Cash Flow (DCF)",
                "fair_value": dcf_val,
                "upside_pct": round(diff_pct, 1),
                "status": "Undervalued" if diff_pct > 5 else ("Overvalued" if diff_pct < -5 else "Fair Value"),
                "description": "Proyeksi arus kas bebas (FCF) 5 tahun dengan diskon WACC 10%.",
                "formula_inputs": {
                    "FCF/Share": f"Rp{fcf_per_share:,.0f}" if fcf_per_share else "-",
                    "Discount Rate": "10.0%",
                    "Terminal Growth": "3.0%"
                }
            })

        # 2. Graham Formula Klasik
        graham_val = self.calculate_graham_formula(eps, bvps)
        if graham_val is not None:
            diff_pct = ((graham_val - current_price) / current_price) * 100
            models.append({
                "model_id": "graham",
                "name": "Benjamin Graham Klasik",
                "fair_value": graham_val,
                "upside_pct": round(diff_pct, 1),
                "status": "Undervalued" if diff_pct > 5 else ("Overvalued" if diff_pct < -5 else "Fair Value"),
                "description": "Kombinasi klasik laba bersih (EPS) & nilai buku (BVPS). Formula: √(22.5 × EPS × BVPS).",
                "formula_inputs": {
                    "EPS": f"Rp{eps:,.0f}" if eps else "-",
                    "BVPS": f"Rp{bvps:,.0f}" if bvps else "-",
                    "Multiplier": "22.5x"
                }
            })

        # 3. Graham Formula Revised (Growth)
        graham_rev_val = self.calculate_graham_revised(eps, growth_rate_pct=growth_rate_pct or 5.0)
        if graham_rev_val is not None:
            diff_pct = ((graham_rev_val - current_price) / current_price) * 100
            models.append({
                "model_id": "graham_revised",
                "name": "Benjamin Graham Growth",
                "fair_value": graham_rev_val,
                "upside_pct": round(diff_pct, 1),
                "status": "Undervalued" if diff_pct > 5 else ("Overvalued" if diff_pct < -5 else "Fair Value"),
                "description": f"Formula Graham berbasis pertumbuhan g={growth_rate_pct or 5:.1f}% & SUN 10Y Yield 6.8%.",
                "formula_inputs": {
                    "EPS": f"Rp{eps:,.0f}" if eps else "-",
                    "Growth (g)": f"{growth_rate_pct or 5:.1f}%",
                    "Bond Yield (Y)": "6.8%"
                }
            })

        # 4. P/E Relative Valuation
        target_pe = 15.0 if (pe_ratio is None or pe_ratio <= 0) else max(10.0, pe_ratio)
        pe_val = self.calculate_pe_valuation(eps, target_pe)
        if pe_val is not None:
            diff_pct = ((pe_val - current_price) / current_price) * 100
            models.append({
                "model_id": "pe_ratio",
                "name": "Valuasi Relatif P/E",
                "fair_value": pe_val,
                "upside_pct": round(diff_pct, 1),
                "status": "Undervalued" if diff_pct > 5 else ("Overvalued" if diff_pct < -5 else "Fair Value"),
                "description": f"Berdasarkan rasio P/E acuan historis ({target_pe:.1f}x) × EPS terkini.",
                "formula_inputs": {
                    "EPS": f"Rp{eps:,.0f}" if eps else "-",
                    "Target P/E": f"{target_pe:.1f}x"
                }
            })

        # 5. P/BV Relative Valuation
        target_pbv = 1.8 if (pb_ratio is None or pb_ratio <= 0) else max(1.0, pb_ratio)
        pbv_val = self.calculate_pbv_valuation(bvps, target_pbv)
        if pbv_val is not None:
            diff_pct = ((pbv_val - current_price) / current_price) * 100
            models.append({
                "model_id": "pbv_ratio",
                "name": "Valuasi Relatif P/BV",
                "fair_value": pbv_val,
                "upside_pct": round(diff_pct, 1),
                "status": "Undervalued" if diff_pct > 5 else ("Overvalued" if diff_pct < -5 else "Fair Value"),
                "description": f"Berdasarkan rasio P/BV acuan historis ({target_pbv:.1f}x) × BVPS terkini.",
                "formula_inputs": {
                    "BVPS": f"Rp{bvps:,.0f}" if bvps else "-",
                    "Target P/BV": f"{target_pbv:.1f}x"
                }
            })

        # Consolidate average & range fair value
        valid_values = [m["fair_value"] for m in models if m["fair_value"] is not None]
        if not valid_values:
            return {
                "consolidated_fair_value": current_price,
                "fair_value_min": current_price,
                "fair_value_max": current_price,
                "margin_of_safety_pct": 0.0,
                "overall_status": "Neutral / Data Terbatas",
                "valuation_badge": "N/A",
                "models": []
            }

        avg_fair_value = round(sum(valid_values) / len(valid_values), 2)
        min_fair_value = round(min(valid_values), 2)
        max_fair_value = round(max(valid_values), 2)
        mos_pct = round(((avg_fair_value - current_price) / current_price) * 100, 1)

        if mos_pct >= 20.0:
            overall_status = "Sangat Murah (Strong Margin of Safety)"
            valuation_badge = "UNDERVALUED"
        elif mos_pct >= 5.0:
            overall_status = "Slightly Undervalued (Diskon Moderat)"
            valuation_badge = "UNDERVALUED"
        elif mos_pct <= -20.0:
            overall_status = "Sangat Mahal (High Premium)"
            valuation_badge = "OVERVALUED"
        elif mos_pct <= -5.0:
            overall_status = "Slightly Overvalued"
            valuation_badge = "OVERVALUED"
        else:
            overall_status = "Fairly Valued (Di Area Harga Wajar)"
            valuation_badge = "FAIR VALUE"

        return {
            "consolidated_fair_value": avg_fair_value,
            "fair_value_min": min_fair_value,
            "fair_value_max": max_fair_value,
            "margin_of_safety_pct": mos_pct,
            "overall_status": overall_status,
            "valuation_badge": valuation_badge,
            "models": models
        }
