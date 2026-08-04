from services.data_fetcher import DataFetcher
from services.indicator_engine import IndicatorEngine
import json

def test():
    fetcher = DataFetcher()
    engine = IndicatorEngine()
    
    print("Fetching BBCA info...")
    info = fetcher.fetch_ticker_info("BBCA")
    print(info)
    
    print("Fetching BBCA data...")
    data = fetcher.fetch_stock_data("BBCA")
    daily_df = data["daily"]
    
    print(f"Daily shape: {daily_df.shape}")
    
    print("Calculating indicators...")
    indicators = engine.calculate_all(daily_df)
    print(json.dumps(indicators, indent=2))

if __name__ == "__main__":
    test()
