import asyncio
from api.endpoints.analyze import analyze_custom_screener, list_custom_screeners
from models.request import CustomScreenerExecuteRequest

async def test():
    # 1. List available custom screeners
    screener_list = await list_custom_screeners()
    print("Available Custom Screeners:")
    for s in screener_list.get("screeners", []):
        print(f" - [{s['id']}] {s['name']}: {s['description']}")
        print("   Rules:")
        for r in s['rules']:
            print(f"    * {r}")

    # 2. Test BPJS Screener execution over full IDX universe
    print("\nScanning Full IDX Universe for DAYTRADE BPJS (09.05-09.20)...")
    req = CustomScreenerExecuteRequest(screener_id="bpjs_daytrade", mode="live")
    response = await analyze_custom_screener(req)

    print(f"\nFound {len(response.data)} stocks matching BPJS Daytrade strategy!")
    for item in response.data[:5]:
        print(f" -> [{item.ticker}] {item.company_name} | Price: Rp {item.last_price:,} ({item.change_pct:+.2f}%) | Vol: {item.volume:,} | Trend: {item.trend} | Score: {item.score_display} | Rec: {item.recommendation}")

    # 3. Test OPENING (08.58) Screener execution
    print("\nScanning Full IDX Universe for OPENING (08.58)...")
    req2 = CustomScreenerExecuteRequest(screener_id="opening_0858", mode="live")
    response2 = await analyze_custom_screener(req2)

    print(f"\nFound {len(response2.data)} stocks matching OPENING (08.58) strategy!")
    for item in response2.data[:5]:
        print(f" -> [{item.ticker}] {item.company_name} | Price: Rp {item.last_price:,} ({item.change_pct:+.2f}%) | Vol: {item.volume:,} | Trend: {item.trend} | Score: {item.score_display} | Rec: {item.recommendation}")

    # 4. Test BSJP (15.30-15.40) Screener execution
    print("\nScanning Full IDX Universe for BSJP (15.30-15.40)...")
    req3 = CustomScreenerExecuteRequest(screener_id="bsjp_1530", mode="live")
    response3 = await analyze_custom_screener(req3)

    print(f"\nFound {len(response3.data)} stocks matching BSJP (15.30-15.40) strategy!")
    for item in response3.data[:5]:
        print(f" -> [{item.ticker}] {item.company_name} | Price: Rp {item.last_price:,} ({item.change_pct:+.2f}%) | Vol: {item.volume:,} | Trend: {item.trend} | Score: {item.score_display} | Rec: {item.recommendation}")

if __name__ == "__main__":
    asyncio.run(test())
