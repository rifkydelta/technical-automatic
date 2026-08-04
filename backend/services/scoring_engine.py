from models.response import *
import math

class ScoringEngine:
    def __init__(self):
        pass

    def calculate_score(
        self,
        trend: TrendAnalysis,
        sr: SupportResistanceResult,
        mtf: MultiTimeframeResult,
        momentum: MomentumResult,
        risk: RiskManagement,
        order_flow: OrderFlowResult,
        is_volume_elevated: bool = False,
        has_chart_pattern: bool = False,
        has_candlestick_pattern: bool = False
    ) -> SetupScore:
        
        score = 0
        
        # 1. Chart Pattern - 15%
        if has_chart_pattern: score += 15
        
        # 2. Candlestick Pattern - 10%
        if has_candlestick_pattern: score += 10
        
        # 3. Trend Besar (EMA200) - 20%
        if trend.trend_besar == "Bullish": score += 20
        
        # 4. Support Resistance - 15%
        if sr.supports and len(sr.supports) > 0: score += 15
            
        # 5. Volume - 15%
        if is_volume_elevated: score += 15
            
        # 6. Multi Timeframe - 15%
        if mtf.alignment == "Confirmed": score += 15
        
        # 7. Momentum - 5%
        if momentum.status == "Bullish": score += 5
        
        # 8. Risk Reward - 5%
        if not risk.is_rejected: score += 5
            
        # 9. Order Flow - 5%
        if order_flow.status == "Accumulation": score += 5
            
        # Total max = 100
        
        # Rating
        if score >= 90: rating = "Strong Bullish Setup"
        elif score >= 80: rating = "Bullish Setup"
        elif score >= 70: rating = "Cautious Bullish Bounce"
        elif score >= 60: rating = "Weak Setup"
        else: rating = "Bearish Setup"
        
        # Calculate 1-5 score for display
        display = max(1, math.floor(score / 20 + 0.5))
        score_display = f"{display}/5"
        
        return SetupScore(score=score, rating=rating, score_display=score_display)
