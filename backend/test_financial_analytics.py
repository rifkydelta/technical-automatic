"""
Unit Tests for FinancialAnalyticsEngine (7 Sub-Tabs Engine)
"""
import sys

sys.path.insert(0, '.')

from services.financial_analytics_engine import FinancialAnalyticsEngine

def test_financial_analytics_engine():
    engine = FinancialAnalyticsEngine()
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
    print("FINANCIAL ANALYTICS ENGINE UNIT TESTS (7 SUB-TABS)")
    print("=" * 60)

    # 1. Test Piotroski F-Score
    print("\n1. Piotroski F-Score Tests:")
    f_res = engine.calculate_piotroski_f_score(eps=500, ocf=600000, roa=8.5, der=0.8, current_ratio=1.5, margin_growing=True)
    check("Piotroski Score Range", f_res["score"], 0 <= f_res["score"] <= 9, f"Score = {f_res['score']}/9 ({f_res['status']})")
    check("F-Score Criteria List", len(f_res["criteria"]), len(f_res["criteria"]) == 9, "9 boolean criteria returned")

    # 2. Test Beneish M-Score
    print("\n2. Beneish M-Score Tests:")
    m_res = engine.calculate_beneish_m_score(der=0.8, roa=8.5, eps=500)
    check("Beneish M-Score Value", m_res["m_score"], m_res["m_score"] <= -1.78, f"M-Score = {m_res['m_score']} ({m_res['status']})")

    # 3. Test Standard Deviation Bands
    print("\n3. Standard Deviation Bands Tests:")
    sd_res = engine.calculate_sd_bands(current_price=9500, eps=500, bvps=2800, pe_ratio=19.0, pb_ratio=3.4)
    check("P/E Bands Structure", "pe_bands", "sd_plus_2" in sd_res["pe_bands"] and "sd_minus_2" in sd_res["pe_bands"],
          f"P/E Mean = {sd_res['pe_bands']['mean']}x, +2SD = {sd_res['pe_bands']['sd_plus_2']}x")
    check("Historical Points Count", len(sd_res["history_points"]), len(sd_res["history_points"]) == 12, "12 quarterly points generated")

    # 4. Test Sector Peers Comparison
    print("\n4. Sector Peers Comparison Tests:")
    peers = engine.get_sector_peers_comparison("BBCA", "Banking", 9500, 19.0, 3.4, 18.2)
    check("Peers List Length", len(peers), len(peers) >= 5, f"{len(peers)} emiten in leaderboard")

    # 5. Test Risk Matrix
    print("\n5. Risk Matrix Tests:")
    risks = engine.evaluate_risk_matrix(der=0.8, roa=8.5, ocf=600000)
    check("Risk Grid Count", len(risks), len(risks) == 8, "8 risk indicators evaluated")

    print(f"\n{'=' * 60}")
    total = passed + failed
    print(f"RESULTS: {passed}/{total} passed, {failed} failed")
    print("=" * 60)
    
    return failed == 0

if __name__ == "__main__":
    success = test_financial_analytics_engine()
    sys.exit(0 if success else 1)
