from fastapi import APIRouter
import yfinance as yf
import datetime

router = APIRouter()

@router.get("/market/ihsg")
def get_ihsg_realtime():
    try:
        t = yf.Ticker('^JKSE')
        df = t.history(period='2d')
        if df.empty or len(df) < 1:
            return {"error": "No data"}
            
        current_price = df['Close'].iloc[-1]
        
        if len(df) > 1:
            prev_price = df['Close'].iloc[-2]
            change = current_price - prev_price
            change_pct = (change / prev_price) * 100
        else:
            change = 0.0
            change_pct = 0.0
            
        return {
            "price": current_price,
            "change": change,
            "change_pct": change_pct,
            "timestamp": datetime.datetime.now().strftime("%d %B %Y - %H:%M")
        }
    except Exception as e:
        return {"error": str(e)}
