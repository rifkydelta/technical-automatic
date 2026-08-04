"""
Unit Tests for ValuationEngine & Dividend Yield Normalization
"""
import sys
import math

sys.path.insert(0, '.')

from services.valuation_engine import ValuationEngine
from services.data_fetcher import normalize_dividend_yield

def test_valuation_engine():
    engine = ValuationEngine()
    passed = 0
    failed = 0

    def check(test_name, result, expected_condition, details=""):
        nonlocal passed, failed
        if expected_condition:
            print(f"  [OK] {test_name}: {details}")
            passed += 1
        else:
            print(f"  [FAIL] {test_name}: {details} (got: {result})")
            failed += 1

    print("=" * 60)
    print("VALUATION ENGINE & NORMALIZATION UNIT TESTS")
    print("=" * 60)

    # --- Test 1: Dividend Yield Normalization (Fix for 707.00% bug) ---
    print("\nDividend Yield Normalization Tests:")
    y1 = normalize_dividend_yield(7.07)  # Already percentage (7.07%)
    check("DivYield already % (7.07)", y1, y1 == 7.07, f"Result = {y1}%")

    y2 = normalize_dividend_yield(0.0707)  # Decimal ratio (0.0707)
    check("DivYield decimal ratio (0.0707)", y2, y2 == 7.07, f"Result = {y2}%")

    y3 = normalize_dividend_yield(None, dps=350, current_price=5000)  # Manual calculation
    check("DivYield fallback (DPS=350, Price=5000)", y3, y3 == 7.00, f"Result = {y3}%")

    # --- Test 2: DCF Model ---
    print("\nDCF Model Tests:")
    dcf = engine.calculate_dcf(fcf_per_share=500.0, current_price=9000.0)
    check("DCF with positive FCF", dcf, dcf is not None and dcf > 0, f"Fair Value = Rp{dcf:,.2f}" if dcf else "None")
    
    dcf_neg = engine.calculate_dcf(fcf_per_share=-100.0, current_price=5000.0)
    check("DCF with negative FCF", dcf_neg, dcf_neg is None, "Should return None")

    # --- Test 3: Graham Formula Klasik & Revised ---
    print("\nGraham Formula Tests:")
    graham = engine.calculate_graham_formula(eps=400.0, bvps=3000.0)
    check("Graham Klasik", graham, graham is not None and graham > 0, f"Fair Value = Rp{graham:,.2f}" if graham else "None")

    graham_rev = engine.calculate_graham_revised(eps=400.0, growth_rate_pct=10.0)
    check("Graham Revised (g=10%)", graham_rev, graham_rev is not None and graham_rev > 0, f"Fair Value = Rp{graham_rev:,.2f}" if graham_rev else "None")

    # --- Test 4: PE & PBV Relative Valuation ---
    print("\nRelative Valuation Tests:")
    pe = engine.calculate_pe_valuation(eps=400.0, target_pe=20.0)
    check("PE Valuation", pe, pe == 8000.0, f"Fair Value = Rp{pe:,.2f}" if pe else "None")

    pbv = engine.calculate_pbv_valuation(bvps=3000.0, target_pbv=2.0)
    check("PBV Valuation", pbv, pbv == 6000.0, f"Fair Value = Rp{pbv:,.2f}" if pbv else "None")

    # --- Test 5: Consolidated Fair Value ---
    print("\nConsolidated Fair Value Tests:")
    result = engine.evaluate_fair_value(
        current_price=9700.0,
        eps=500.0,
        bvps=2800.0,
        fcf_per_share=380.0,
        pe_ratio=19.4,
        pb_ratio=3.46,
        growth_rate_pct=8.5
    )
    check("Consolidated has models", result, len(result.get("models", [])) >= 5, f"{len(result.get('models', []))} models computed")
    check("Consolidated has range", result, result.get("fair_value_min") is not None and result.get("fair_value_max") is not None,
          f"Min = Rp{result.get('fair_value_min'):,.0f}, Max = Rp{result.get('fair_value_max'):,.0f}")
    check("Consolidated MOS", result, "margin_of_safety_pct" in result, f"MOS = {result.get('margin_of_safety_pct'):.1f}%")

    print(f"\n{'=' * 60}")
    total = passed + failed
    print(f"RESULTS: {passed}/{total} passed, {failed} failed")
    print("=" * 60)
    
    return failed == 0

if __name__ == "__main__":
    success = test_valuation_engine()
    sys.exit(0 if success else 1)
