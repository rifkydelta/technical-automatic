from pydantic import BaseModel, Field
from typing import Optional, List

class OHLCVBar(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: int = 0

class Point(BaseModel):
    time: str
    val: float

class PatternLine(BaseModel):
    type: str # "support", "resistance", "neckline", "trendline"
    points: List[Point]

class DetectedPattern(BaseModel):
    pattern_id: str
    name: str
    status: str
    lines: List[PatternLine]
    prediction: List[Point]

class IndicatorSet(BaseModel):
    ema20: Optional[float] = None
    ema50: Optional[float] = None
    ema200: Optional[float] = None
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_hist: Optional[float] = None
    stoch_rsi: Optional[float] = None
    atr: Optional[float] = None
    adx: Optional[float] = None
    vwap: Optional[float] = None
    avg_volume: Optional[float] = None
    bb_upper: Optional[float] = None
    bb_middle: Optional[float] = None
    bb_lower: Optional[float] = None

class TrendAnalysis(BaseModel):
    trend_besar: str
    trend_menengah: str
    trend_pendek: str
    confidence: float
    reason: str

class MarketStructure(BaseModel):
    structure: str # e.g., "Uptrend (HH/HL)", "Downtrend (LH/LL)", "Sideways"
    reason: str

class SupportResistanceZone(BaseModel):
    id: str # e.g., "S1", "R1"
    zone: str # e.g., "9600-9650"
    strength: str
    reason: str
    rating: int # 1 to 5 (confluence score)
    details: str = ""  # Detailed confluence conditions met
    date_detected: Optional[str] = None  # Date of swing low/high detection

class SupportResistanceResult(BaseModel):
    supports: List[SupportResistanceZone]
    resistances: List[SupportResistanceZone]

class MultiTimeframeResult(BaseModel):
    daily: str
    daily_desc: str
    h1: str
    h1_desc: str
    m15: str
    m15_desc: str
    alignment: str

class MomentumResult(BaseModel):
    status: str # "Bullish", "Neutral", "Bearish"
    reason: str

class EntryAnalysis(BaseModel):
    entry_zone: str
    entry_type: str
    reason: str

class RiskManagement(BaseModel):
    entry_zone: str
    stop_loss: float
    target_1: float
    target_2: float
    target_3: float
    risk_reward_ratio: float
    is_rejected: bool

class OrderFlowResult(BaseModel):
    status: str
    status_icon: str
    status_color: str
    status_desc: str
    
    buy_dominance_pct: str
    buy_dominance_desc: str
    
    haka_condition: str
    haka_condition_desc: str
    
    bandar_activity: str
    bandar_activity_icon: str
    bandar_activity_color: str
    bandar_activity_desc: str
    
    bandar_area: str
    bandar_area_desc: str

class Scenario(BaseModel):
    name: str # "Primary", "Alternative", "Worst Case"
    probability: int
    description: str
    trigger: str
    target: str

class ScenarioSet(BaseModel):
    primary: Scenario
    alternative: Scenario
    worst_case: Scenario

class SetupScore(BaseModel):
    score: int
    score_display: str
    rating: str # "★★★★★"

class ValuationMetrics(BaseModel):
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    ps_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None

class FinancialYear(BaseModel):
    year: str
    revenue: str
    gross_profit: str
    operating_income: str
    net_income: str
    net_margin: str
    eps: str
    dps: str
    total_assets: str
    total_debt: str
    operating_cash_flow: str
    free_cash_flow: str

class SMAItem(BaseModel):
    name: str
    value: float
    diff_pct: float
    position: str

class TrendDetail(BaseModel):
    grade: str
    main_trend: str
    short_term_trend: str
    main_reason: str
    short_term_reason: str
    adx_value: float
    adx_status: str
    di_plus: float
    di_minus: float
    sma_table: List[SMAItem]

class MomentumDetail(BaseModel):
    rsi_value: float
    rsi_zone: str
    stoch_rsi_value: float
    stoch_rsi_zone: str
    mfi_value: float
    mfi_zone: str
    macd_value: float
    macd_signal_value: float
    macd_hist_value: float
    macd_cross: str

class VolatilityDetail(BaseModel):
    atr_value: float
    atr_regime: str
    atr_pct: float
    range_1w: float
    range_1m: float
    range_ytd: float
    bb_upper: float
    bb_middle: float
    bb_lower: float
    bb_width: float
    bb_position: str

class PriceLevel(BaseModel):
    label: str
    price: float
    level_type: str
    strength: str
    distance_pct: float
    reason: Optional[str] = None

class BacktestResult(BaseModel):
    status: str           # "waiting_entry", "floating", "hit_tp1", "hit_tp2", "hit_sl", "expired"
    status_label: str     # "⏳ Waiting Entry", "🎯 HIT TP1", "🛑 STOP LOSS"
    entry_hit_price: float = 0.0
    exit_price: float = 0.0
    pnl_pct: float = 0.0
    time_elapsed: str = "" # e.g., "2 hours", "same session"

class StrategyDetail(BaseModel):
    timeframe: str
    grade: str
    signal_type: str
    description: str
    entry_low: float
    entry_high: float
    stop_loss: float
    risk_pct: float
    target_1: float
    target_2: float
    risk_reward: float
    trigger_price: float
    trigger_condition: str
    context: str
    backtest: Optional[BacktestResult] = None

class HistoricalTradeLog(BaseModel):
    date: str
    signal_type: str
    trigger_price: float
    entry_price: float
    exit_price: float
    status: str
    pnl_pct: float

class BacktestSummary(BaseModel):
    timeframe: str
    total_trades: int
    win_count: int
    loss_count: int
    expired_count: int
    win_rate_pct: float
    total_pnl_pct: float
    trade_logs: List[HistoricalTradeLog]

class TechnicalDetail(BaseModel):
    trend: TrendDetail
    momentum: MomentumDetail
    volatility: VolatilityDetail
    levels: List[PriceLevel]
    strategies: List[StrategyDetail]
    historical_backtest: Optional[List[BacktestSummary]] = []

class CompanyProfile(BaseModel):
    name: str
    sector: str
    industry: Optional[str] = "Unknown"
    description: Optional[str] = ""
    website: Optional[str] = ""
    employees: Optional[int] = None
    city: Optional[str] = None
    address: Optional[str] = None
    shares_outstanding: Optional[float] = None
    float_shares: Optional[float] = None

class SessionInfo(BaseModel):
    mode: str                            # 'live', 'session_1', 'close_market'
    mode_label: str                      # 'Live', 'Session 1 (16/07/26)', etc.
    market_phase: str                    # 'pre_market', 'session_1', 'break', 'session_2', 'post_market'
    available_modes: List[str]           # Modes valid at current time
    reference_ohlcv: Optional[dict] = None  # { open, high, low, close, volume }

class ValuationModelResult(BaseModel):
    model_id: str
    name: str
    fair_value: float
    upside_pct: float
    status: str
    description: str
    formula_inputs: Optional[dict] = None

class FairValueAnalysis(BaseModel):
    consolidated_fair_value: float
    fair_value_min: Optional[float] = None
    fair_value_max: Optional[float] = None
    margin_of_safety_pct: float
    overall_status: str
    valuation_badge: str
    models: List[ValuationModelResult] = []

class GrowthAnalysis(BaseModel):
    revenue_cagr_3y_pct: Optional[float] = None
    net_income_cagr_3y_pct: Optional[float] = None
    growth_status: str
    growth_summary: str
    is_expanding: bool
    revenue_trend: Optional[List[float]] = None
    net_income_trend: Optional[List[float]] = None

class AnalystTargetInfo(BaseModel):
    target_price_high: Optional[float] = None
    target_price_median: Optional[float] = None
    target_price_low: Optional[float] = None
    analyst_rating: Optional[str] = "Consensus Buy/Hold"
    buy_pct: Optional[int] = None
    hold_pct: Optional[int] = None
    sell_pct: Optional[int] = None
    upside_potential_pct: Optional[float] = None
    source: str = "Google Finance"

class FinancialHealthMetrics(BaseModel):
    roe: Optional[float] = None
    roa: Optional[float] = None
    der: Optional[float] = None
    current_ratio: Optional[float] = None
    cash_flow_quality_ratio: Optional[float] = None
    health_status: str = "Kategori Sehat"
    health_summary: str = ""

class HistoryTabData(BaseModel):
    score_overall: int = 75
    score_status: str = "Healthy"
    ai_summary: str
    cash_flow_score: int = 4
    f_score: int = 7
    beneish_status: str = "SAFE"
    pe_ttm: Optional[float] = None
    eps_qoq_pct: Optional[float] = None
    eps_yoy_pct: Optional[float] = None
    rev_qoq_pct: Optional[float] = None
    narrative_3y: str
    rev_ttm: str = "-"
    net_profit_ttm: str = "-"

class ValuationBandsData(BaseModel):
    pe_bands: dict
    pbv_bands: dict
    history_points: List[dict] = []
    summary_text: str

class HealthTabData(BaseModel):
    summary_text: str
    roe: Optional[float] = None
    cash_score: int = 4
    der: Optional[float] = None
    quality_score: int = 4
    cash_balance: str = "Rp15.2T"
    interest_coverage: str = "8.4x"
    net_debt_ebitda: str = "0.6x"
    roic: str = "14.2%"

class QualityTabData(BaseModel):
    summary_text: str
    piotroski_f_score: int = 7
    cash_flow_quality_score: int = 4
    beneish_m_score: float = -2.45
    beneish_status: str = "SAFE (Risiko Rendah)"
    alert_warning_box: dict

class OutlookTabData(BaseModel):
    summary_text: str
    forecast_rev_2026f: str = "Rp142.5T"
    forecast_rev_2027f: str = "Rp158.0T"
    eps_estimate: str = "Rp620"
    net_income_estimate: str = "Rp28.4T"
    growth_pct: float = 12.5
    disclaimer: str = "Berdasarkan konsensus estimasi analis sell-side."

class PeersTabData(BaseModel):
    summary_text: str
    selected_metric: str = "pe"
    peer_list: List[dict] = []

class RiskTabData(BaseModel):
    biggest_worry_text: str
    risk_grid: List[dict] = []

class FinancialsAnalyticsResponse(BaseModel):
    history: HistoryTabData
    valuation_bands: ValuationBandsData
    health: HealthTabData
    quality: QualityTabData
    outlook: OutlookTabData
    peers: PeersTabData
    risk: RiskTabData

class AnalyzeResponse(BaseModel):
    ticker: str
    company_name: str
    sector: str
    date: str
    last_price: float
    company_profile: Optional[CompanyProfile] = None
    
    # OHLCV data for chart rendering
    ohlcv_daily: List[OHLCVBar]
    ohlcv_1h: Optional[List[OHLCVBar]] = None
    ohlcv_15m: Optional[List[OHLCVBar]] = None
    
    # Analysis results
    indicators: IndicatorSet
    trend_analysis: TrendAnalysis
    market_structure: MarketStructure
    support_resistance: SupportResistanceResult
    multi_timeframe: MultiTimeframeResult
    momentum: MomentumResult
    entry_analysis: EntryAnalysis
    risk_management: RiskManagement
    order_flow: OrderFlowResult
    scenarios: ScenarioSet
    
    setup_score: SetupScore
    recommendation: str
    recommendation_reason: str
    
    valuation: Optional[ValuationMetrics] = None
    financials: Optional[List[FinancialYear]] = None
    fair_value_analysis: Optional[FairValueAnalysis] = None
    growth_analysis: Optional[GrowthAnalysis] = None
    analyst_targets: Optional[AnalystTargetInfo] = None
    financial_health: Optional[FinancialHealthMetrics] = None
    financials_analytics: Optional[FinancialsAnalyticsResponse] = None
    warnings: List[str] = []
    technical_detail: Optional[TechnicalDetail] = None
    session_info: Optional[SessionInfo] = None
    detected_patterns: List[DetectedPattern] = []

class ScreenerResult(BaseModel):
    ticker: str
    company_name: str
    last_price: float
    change_pct: float
    volume: int
    avg_volume: float
    trend: str
    recommendation: str
    score: int
    score_display: str
    risk_status: str

class ScreenerResponse(BaseModel):
    data: List[ScreenerResult]
    session_info: SessionInfo
