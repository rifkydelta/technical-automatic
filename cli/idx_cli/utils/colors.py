"""Colors helper for Rich console styling."""

def get_rec_color(rec: str) -> str:
    if not rec:
        return "yellow"
    r = rec.upper()
    if "STRONG BUY" in r or "BUY" in r:
        return "green"
    if "WATCHLIST" in r or "WARN" in r:
        return "yellow"
    if "NOT BUY" in r or "SELL" in r or "BEAR" in r:
        return "red"
    return "bright_white"

def get_bias_color(bias: str) -> str:
    if not bias:
        return "yellow"
    b = bias.lower()
    if "bullish" in b:
        return "green"
    if "bearish" in b:
        return "red"
    if "pullback" in b:
        return "yellow"
    return "white"

def get_score_color(score: float) -> str:
    if score >= 80:
        return "green"
    if score >= 60:
        return "yellow"
    return "red"

def status_color(status: str) -> str:
    if not status:
        return "grey50"
    s = status.upper()
    if any(k in s for k in ["HEALTHY", "SAFE", "STRONG", "UNDERVALUED", "MURAH", "CLEAR", "GOOD"]):
        return "green"
    if any(k in s for k in ["RISK", "WEAK", "OVERVALUED", "MAHAL", "HIGH DEBT", "WARNING", "REJECTED"]):
        return "red"
    return "yellow"
