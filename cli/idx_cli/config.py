import os

API_URL = os.getenv("IDX_API_URL", "https://technical-automatic.onrender.com")
DEFAULT_TIMEOUT = float(os.getenv("IDX_TIMEOUT", "30.0"))
SCREENER_TIMEOUT = float(os.getenv("IDX_SCREENER_TIMEOUT", "120.0"))

# Color Mapping matching Frontend CSS Tokens
COLORS = {
    "bullish": "green",
    "bearish": "red",
    "neutral": "yellow",
    "warning": "bright_yellow",
    "info": "bright_blue",
    "primary": "bright_white",
    "secondary": "grey70",
    "muted": "grey50",
    "border": "grey30",
}
