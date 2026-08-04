import asyncio
from api.endpoints.analyze import analyze_screener
from models.request import ScreenerRequest

async def main():
    req = ScreenerRequest(tickers=["BBCA", "BBRI", "BUMI", "BRPT", "BREN"])
    res = await analyze_screener(req)
    print("Fetched count:", len(res.data))
    for item in res.data:
        print(f"[{item.ticker}] Price: {item.last_price} | Chg: {item.change_pct:.2f}% | Trend: {item.trend} | Score: {item.score} ({item.score_display}) | Rec: {item.recommendation}")

if __name__ == "__main__":
    asyncio.run(main())
