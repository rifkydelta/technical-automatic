from models.response import TrendAnalysis, RiskManagement, SetupScore

class RecommendationEngine:
    def __init__(self):
        pass

    def get_recommendation(self, trend: TrendAnalysis, risk: RiskManagement, score: SetupScore):
        # Rules PRD:
        # Tidak boleh BUY apabila Trend Besar masih Bearish.
        # Tidak boleh BUY apabila Risk Reward kurang dari 1:2.
        
        if trend.trend_besar == "Bearish":
            if score.score < 50:
                return "NOT BUY", "Trend besar Bearish dan momentum turun sangat kuat. Jauhi saham ini untuk posisi Long."
            return "WAIT", "Setup menarik secara teknikal jangka pendek, namun Trend besar masih Bearish. Risiko sangat tinggi."
            
        if risk.is_rejected:
            return "WAIT", "Setup ditolak karena Risk/Reward ratio tidak memenuhi syarat minimum 1:2."
            
        if score.score >= 90:
            return "STRONG BUY", "Semua parameter teknikal dan aliran pesanan terkonfirmasi kuat."
        elif score.score >= 70:
            return "BUY", "Setup solid dengan risk/reward yang baik. Perhatikan area support terdekat."
        elif score.score >= 60:
            return "WATCHLIST", "Setup belum sepenuhnya terkonfirmasi. Tunggu konfirmasi breakout atau pullback."
        else:
            return "WAIT", "Kondisi pasar belum memberikan sinyal arah yang jelas."
