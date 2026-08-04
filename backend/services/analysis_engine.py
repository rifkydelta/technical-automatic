import pandas as pd
from typing import Dict, Any, List
from models.response import *
from models.request import OrderFlowInput

class AnalysisEngine:
    def __init__(self):
        pass

    def step1_analyze_trend(self, price: float, ema20: float, ema50: float, ema200: float) -> TrendAnalysis:
        if price is None or price <= 0:
            return TrendAnalysis(
                trend_besar="Unknown", trend_menengah="Unknown", trend_pendek="Unknown",
                confidence=0.0, reason="Missing price data"
            )

        ref_ema200 = ema200 if ema200 is not None else (ema50 if ema50 is not None else ema20)
        ref_ema50 = ema50 if ema50 is not None else ema20
        ref_ema20 = ema20 if ema20 is not None else price

        if ref_ema200 is None:
            return TrendAnalysis(
                trend_besar="Unknown", trend_menengah="Unknown", trend_pendek="Unknown",
                confidence=0.0, reason="Missing EMA data"
            )

        if price > ref_ema20 and ref_ema20 > ref_ema50 and ref_ema50 >= ref_ema200:
            status = "Strong Bullish"
            conf = 100.0
        elif price > ref_ema200:
            status = "Bullish"
            conf = 75.0
        elif abs(price - ref_ema200) / ref_ema200 <= 0.02:
            status = "Neutral"
            conf = 50.0
        elif price < ref_ema200:
            status = "Bearish"
            conf = 100.0 if price < ref_ema50 and ref_ema50 < ref_ema200 else 75.0
        else:
            status = "Neutral"
            conf = 50.0

        # Calculate smaller trends
        trend_pendek = "Bullish" if price > ref_ema20 else "Bearish"
        trend_menengah = "Bullish" if price > ref_ema50 else "Bearish"
        trend_besar = "Bullish" if price > ref_ema200 else "Bearish"

        return TrendAnalysis(
            trend_besar=trend_besar,
            trend_menengah=trend_menengah,
            trend_pendek=trend_pendek,
            confidence=conf,
            reason=f"Overall {status} based on EMA structure"
        )

    def step2_market_structure(self, df: pd.DataFrame) -> MarketStructure:
        if df is None or df.empty or len(df) < 10:
            return MarketStructure(structure="Unknown", reason="Not enough data")
        
        # Simple HH/HL or LH/LL detection
        # We can look at the rolling max/min over the last 10 days
        recent = df.tail(10)
        start_price = recent['Close'].iloc[0]
        end_price = recent['Close'].iloc[-1]
        
        if end_price > start_price * 1.02:
            return MarketStructure(structure="Uptrend (HH/HL)", reason="Price making higher highs recently")
        elif end_price < start_price * 0.98:
            return MarketStructure(structure="Downtrend (LH/LL)", reason="Price making lower lows recently")
        else:
            return MarketStructure(structure="Sideways", reason="Price consolidating in range")

    def step3_support_resistance(self, df: pd.DataFrame) -> SupportResistanceResult:
        if df is None or df.empty or len(df) < 50:
            return SupportResistanceResult(supports=[], resistances=[])

        from services.support_engine import find_best_support, find_best_resistance

        last_price = float(df['Close'].iloc[-1])

        # ── SUPPORT: PROMPT.md algorithm ──────────────────────────────
        all_supports = find_best_support(df)
        # Filter only zones below current price
        valid_supports = [s for s in all_supports if s['zone_top'] < last_price]
        # Sort: highest score first, then closest to price
        valid_supports.sort(key=lambda x: (-x['score'], -x['zone_top']))

        supports = []
        for i, s in enumerate(valid_supports[:3]):
            strength = "Strong" if s['score'] >= 4 else ("Medium" if s['score'] >= 2 else "Weak")
            supports.append(SupportResistanceZone(
                id=f"S{i+1}",
                zone=f"{s['zone_bottom']:.0f}-{s['zone_top']:.0f}",
                strength=strength,
                reason=s['details'],
                rating=s['score'],
                details=s['details'],
                date_detected=s['date_index'],
            ))

        # ── RESISTANCE: Mirrored PROMPT.md algorithm ──────────────────
        all_resistances = find_best_resistance(df)
        # Filter only zones above current price
        valid_resistances = [r for r in all_resistances if r['zone_bottom'] > last_price]
        # Sort: highest score first, then closest to price
        valid_resistances.sort(key=lambda x: (-x['score'], x['zone_bottom']))

        resistances = []
        for i, r in enumerate(valid_resistances[:3]):
            strength = "Strong" if r['score'] >= 4 else ("Medium" if r['score'] >= 2 else "Weak")
            resistances.append(SupportResistanceZone(
                id=f"R{i+1}",
                zone=f"{r['zone_bottom']:.0f}-{r['zone_top']:.0f}",
                strength=strength,
                reason=r['details'],
                rating=r['score'],
                details=r['details'],
                date_detected=r['date_index'],
            ))

        return SupportResistanceResult(
            supports=supports,
            resistances=resistances
        )

    def step4_multi_timeframe(self, daily: pd.DataFrame, h1: pd.DataFrame, m15: pd.DataFrame) -> MultiTimeframeResult:
        def get_trend_and_desc(df):
            if df is None or len(df) < 20: 
                return "Unknown", "Insufficient data"
            
            c = float(df['Close'].iloc[-1])
            e20 = float(df['Close'].ewm(span=20, adjust=False).mean().iloc[-1])
            
            items = [("Price", c), ("EMA20", e20)]
            e50 = None
            e200 = None
            if len(df) >= 50:
                e50 = float(df['Close'].ewm(span=50, adjust=False).mean().iloc[-1])
                items.append(("EMA50", e50))
            if len(df) >= 200:
                e200 = float(df['Close'].ewm(span=200, adjust=False).mean().iloc[-1])
                items.append(("EMA200", e200))
                
            items.sort(key=lambda x: x[1], reverse=True)
            desc = " > ".join([x[0] for x in items])
            
            if e200 is not None:
                if c > e20 and e20 > e50 and e50 > e200:
                    t = "Strong Bullish"
                elif c < e20 and e20 < e50 and e50 < e200:
                    t = "Strong Bearish"
                elif c > e200:
                    t = "Bullish"
                else:
                    t = "Bearish"
            elif e50 is not None:
                if c > e20 and e20 > e50:
                    t = "Strong Bullish"
                elif c < e20 and e20 < e50:
                    t = "Strong Bearish"
                elif c > e50:
                    t = "Bullish"
                else:
                    t = "Bearish"
            else:
                t = "Bullish" if c > e20 else "Bearish"
                
            return t, desc

        d_trend, d_desc = get_trend_and_desc(daily)
        h1_trend, h1_desc = get_trend_and_desc(h1)
        m15_trend, m15_desc = get_trend_and_desc(m15)
        
        is_bullish = lambda x: "Bullish" in x
        is_bearish = lambda x: "Bearish" in x
        
        if is_bullish(d_trend) and is_bullish(h1_trend) and is_bullish(m15_trend):
            alignment = "Confirmed"
        elif is_bearish(d_trend) and is_bearish(h1_trend) and is_bearish(m15_trend):
            alignment = "Confirmed"
        else:
            alignment = "Mixed"
            
        if alignment == "Mixed" and is_bearish(h1_trend) and is_bullish(d_trend):
            h1_trend = "Pullback"
            h1_desc = "Menguji area support terdekat"
            
        return MultiTimeframeResult(
            daily=d_trend,
            daily_desc=d_desc,
            h1=h1_trend,
            h1_desc=h1_desc,
            m15=m15_trend,
            m15_desc=m15_desc,
            alignment=alignment
        )

    def step5_momentum(self, ind: IndicatorSet) -> MomentumResult:
        score = 0
        if ind.rsi and ind.rsi > 50: score += 1
        elif ind.rsi and ind.rsi < 50: score -= 1
        
        if ind.macd and ind.macd_signal and ind.macd > ind.macd_signal: score += 1
        elif ind.macd and ind.macd_signal and ind.macd < ind.macd_signal: score -= 1
        
        if score > 0:
            return MomentumResult(status="Bullish", reason="RSI and MACD show upward momentum")
        elif score < 0:
            return MomentumResult(status="Bearish", reason="RSI and MACD show downward momentum")
        return MomentumResult(status="Neutral", reason="Mixed momentum signals")

    def step6_entry_analysis(self, price: float, sr: SupportResistanceResult, atr: float) -> EntryAnalysis:
        if not atr:
            atr = price * 0.02 # fallback 2%
            
        for s in sr.supports:
            try:
                s_val = float(s.zone.split("-")[0])
                if price <= s_val + atr:
                    return EntryAnalysis(entry_zone=f"{s_val}", entry_type="Near Support", reason="Price is near support level")
            except: pass
            
        for r in sr.resistances:
            try:
                r_val = float(r.zone.split("-")[0])
                if price >= r_val - atr:
                    return EntryAnalysis(entry_zone=f"{r_val}", entry_type="Near Resistance", reason="Price is near resistance level")
            except: pass
            
        return EntryAnalysis(entry_zone="Current Price", entry_type="Pullback", reason="Middle of range")

    def step7_risk_management(self, entry: float, sr: SupportResistanceResult) -> RiskManagement:
        planned_entry = entry
        
        # Default (No Support found)
        sl = entry * 0.95 # Fallback SL 5%
        entry_zone = f"{entry*0.99:.0f} - {entry*1.01:.0f}"
        
        tp1_fallback = 1.05
        tp2_fallback = 1.10
        tp3_fallback = 1.15
        
        if sr.supports:
            try:
                s1_val = float(sr.supports[0].zone.split("-")[0])
                distance_pct = (entry - s1_val) / entry
                
                if distance_pct > 0.05:
                    # Harga sudah lari terlalu jauh dari Support 1 (>5%).
                    # Sarankan entry pada minor pullback 1-3% dari harga sekarang.
                    entry_bottom = entry * 0.97
                    entry_top = entry * 0.99
                    entry_zone = f"{entry_bottom:.0f} - {entry_top:.0f}"
                    planned_entry = entry * 0.98
                    # SL ketat di bawah minor pullback
                    sl = planned_entry * 0.96 
                elif distance_pct >= 0.02:
                    # Jarak 2-5% ke S1 (Dekat tapi tidak cukup dekat untuk Swing dengan SL wajar)
                    # Biarkan RR rejection berjalan alami agar dialihkan ke Watchlist/Intraday
                    if s1_val == entry:
                        entry_zone = f"{entry*0.99:.0f} - {entry:.0f}"
                        planned_entry = entry * 0.995
                    else:
                        entry_zone = f"{s1_val:.0f} - {entry:.0f}"
                        planned_entry = (s1_val + entry) / 2
                    sl = s1_val * 0.95
                elif distance_pct >= 0:
                    # Jarak 0-2% ke S1 (Sangat ideal untuk Swing entry)
                    if s1_val == entry:
                        entry_zone = f"{entry*0.99:.0f} - {entry:.0f}"
                        planned_entry = entry * 0.995
                    else:
                        entry_zone = f"{s1_val:.0f} - {entry:.0f}"
                        planned_entry = (s1_val + entry) / 2
                    # SL diletakkan 2% di bawah S1 sebagai buffer (Opsi B1)
                    sl = s1_val * 0.98
                    # Naikkan fallback TP1 ke 8% untuk RR yang lebih realistis (Opsi B2)
                    tp1_fallback = 1.08
                    tp2_fallback = 1.12
                    tp3_fallback = 1.18
                else:
                    # Harga breakdown di bawah S1
                    entry_zone = f"{entry*0.98:.0f} - {entry:.0f}"
                    planned_entry = entry * 0.99
                    sl = entry * 0.95
            except: pass
            
        tp1 = entry * tp1_fallback
        tp2 = entry * tp2_fallback
        tp3 = entry * tp3_fallback
        
        if sr.resistances:
            try:
                tp1 = float(sr.resistances[0].zone.split("-")[0])
                if len(sr.resistances) > 1: tp2 = float(sr.resistances[1].zone.split("-")[0])
                if len(sr.resistances) > 2: tp3 = float(sr.resistances[2].zone.split("-")[0])
            except: pass
            
        # Validasi logis agar Target selalu lebih tinggi dari Entry
        if tp1 <= planned_entry:
            tp1 = planned_entry * 1.05
        if tp2 <= tp1:
            tp2 = tp1 * 1.05
        if tp3 <= tp2:
            tp3 = tp2 * 1.05
            
        risk = planned_entry - sl
        reward = tp1 - planned_entry
        rr = reward / risk if risk > 0 else 0
        
        return RiskManagement(
            entry_zone=entry_zone,
            stop_loss=sl,
            target_1=tp1,
            target_2=tp2,
            target_3=tp3,
            risk_reward_ratio=round(rr, 2),
            is_rejected=rr < 2.0
        )

    def step8_order_flow(self, user_input: OrderFlowInput, m1_df: pd.DataFrame = None) -> OrderFlowResult:
        haka_pct = 50.0
        
        # Bandar Detector
        accum_prices = []
        distrib_prices = []

        if m1_df is not None and not m1_df.empty:
            haka_vol = 0
            haki_vol = 0
            
            avg_vol = m1_df['Volume'].mean()
            
            for idx, row in m1_df.iterrows():
                high = float(row['High'])
                low = float(row['Low'])
                open_p = float(row['Open'])
                close = float(row['Close'])
                vol = float(row['Volume'])
                
                # Detect unusual volume spikes (e.g. > 4x average volume)
                if avg_vol > 0 and vol > (avg_vol * 4):
                    if close > open_p:
                        accum_prices.append(close)
                    elif close < open_p:
                        distrib_prices.append(close)
                
                range_hl = high - low
                if range_hl > 0:
                    position = (close - low) / range_hl
                else:
                    position = 0.5
                    
                haka_vol += vol * position
                haki_vol += vol * (1 - position)
                
            total_vol = haka_vol + haki_vol
            if total_vol > 0:
                haka_pct = (haka_vol / total_vol) * 100
                
        # 1. Status
        if haka_pct > 55:
            status = "Accumulation"
            status_icon = "🔥"
            status_color = "var(--bullish)"
            status_desc = "Buyer mendominasi pasar."
            haka_condition = "HAKA Dominant"
            haka_condition_desc = "Indikasi akumulasi agresif."
        elif haka_pct < 45:
            status = "Distribution"
            status_icon = "⚠️"
            status_color = "var(--bearish)"
            status_desc = "Seller mendominasi pasar."
            haka_condition = "HAKI Dominant"
            haka_condition_desc = "Indikasi distribusi agresif."
        else:
            status = "Neutral"
            status_icon = "🟡"
            status_color = "var(--neutral)"
            status_desc = "Tekanan beli & jual seimbang."
            haka_condition = "Balanced"
            haka_condition_desc = "Belum ada indikasi dominasi kuat."
            
        buy_dominance_pct = f"{haka_pct:.1f}%"
        if haka_pct > 50:
            buy_dominance_desc = "Buyer unggul tipis." if haka_pct <= 55 else "Buyer sangat dominan."
        else:
            buy_dominance_desc = "Seller unggul tipis." if haka_pct >= 45 else "Seller sangat dominan."
            
        # Bandar Activity
        bandar_activity = "Neutral"
        bandar_activity_icon = "🟡"
        bandar_activity_color = "var(--neutral)"
        bandar_activity_desc = "Tidak ada pergerakan lot masif."
        bandar_area = "-"
        bandar_area_desc = "Belum ada anomali harga."
        
        if accum_prices or distrib_prices:
            if len(accum_prices) > len(distrib_prices):
                bandar_activity = "Accumulation"
                bandar_activity_icon = "🔥"
                bandar_activity_color = "var(--bullish)"
                bandar_activity_desc = f"Terdeteksi {len(accum_prices)}x aksi serok barang."
                prices_str = ", ".join([f"{p:,.0f}" for p in sorted(set(accum_prices))])
                bandar_area = prices_str
                bandar_area_desc = "Area akumulasi lot masif."
            elif len(distrib_prices) > len(accum_prices):
                bandar_activity = "Distribution"
                bandar_activity_icon = "⚠️"
                bandar_activity_color = "var(--bearish)"
                bandar_activity_desc = f"Terdeteksi {len(distrib_prices)}x aksi buang barang."
                prices_str = ", ".join([f"{p:,.0f}" for p in sorted(set(distrib_prices))])
                bandar_area = prices_str
                bandar_area_desc = "Area distribusi lot masif."
            else:
                bandar_activity = "Mixed"
                bandar_activity_icon = "⚔️"
                bandar_activity_color = "var(--warning)"
                bandar_activity_desc = f"Pertempuran: {len(accum_prices)}x HAKA vs {len(distrib_prices)}x HAKI."
                prices_str = ", ".join([f"{p:,.0f}" for p in sorted(set(accum_prices + distrib_prices))])
                bandar_area = prices_str
                bandar_area_desc = "Area pertempuran harga bandar."
                
        return OrderFlowResult(
            status=status,
            status_icon=status_icon,
            status_color=status_color,
            status_desc=status_desc,
            buy_dominance_pct=buy_dominance_pct,
            buy_dominance_desc=buy_dominance_desc,
            haka_condition=haka_condition,
            haka_condition_desc=haka_condition_desc,
            bandar_activity=bandar_activity,
            bandar_activity_icon=bandar_activity_icon,
            bandar_activity_color=bandar_activity_color,
            bandar_activity_desc=bandar_activity_desc,
            bandar_area=bandar_area,
            bandar_area_desc=bandar_area_desc
        )

    def step9_scenarios(self, trend: TrendAnalysis, price: float, sr: SupportResistanceResult) -> ScenarioSet:
        supp_vals = sorted([float(s.zone.split('-')[0]) for s in sr.supports], reverse=True) if sr.supports else []
        res_vals = sorted([float(r.zone.split('-')[0]) for r in sr.resistances]) if sr.resistances else []
        
        s1 = supp_vals[0] if len(supp_vals) > 0 else price * 0.95
        s2 = supp_vals[1] if len(supp_vals) > 1 else s1 * 0.95
        r1 = res_vals[0] if len(res_vals) > 0 else price * 1.05
        r2 = res_vals[1] if len(res_vals) > 1 else r1 * 1.05
        
        s1_fmt = f"{s1:,.0f}"
        s2_fmt = f"{s2:,.0f}"
        r1_fmt = f"{r1:,.0f}"
        r2_fmt = f"{r2:,.0f}"
        
        if trend.trend_besar == "Bullish":
            return ScenarioSet(
                primary=Scenario(name="Primary", probability=50, description=f"Konsolidasi {s1_fmt}-{r1_fmt} lalu naik ke {r1_fmt}-{r2_fmt} untuk sweep liquidity atas.", trigger=f"Break {r1_fmt} dengan volume", target=r2_fmt),
                alternative=Scenario(name="Alternative", probability=35, description=f"Naik ke {r1_fmt} dulu lalu reject kuat, turun kembali ke {s1_fmt}-{s2_fmt}.", trigger=f"Rejection bearish di {r1_fmt}", target=s1_fmt),
                worst_case=Scenario(name="Worst Case", probability=15, description=f"Break di bawah {s1_fmt}, turun ke {s2_fmt} atau lebih rendah.", trigger=f"Close daily di bawah {s1_fmt}", target=s2_fmt)
            )
        else:
            return ScenarioSet(
                primary=Scenario(name="Primary", probability=50, description=f"Gagal bertahan di {s1_fmt}, harga melanjutkan struktur tren turun (Break of Structure) menuju {s2_fmt}.", trigger=f"Breakdown {s1_fmt} dengan volume", target=s2_fmt),
                alternative=Scenario(name="Alternative", probability=35, description=f"Tekanan jual mereda sementara, memicu technical rebound (koreksi naik) ke arah {r1_fmt}.", trigger=f"Rebound teknikal dari {s1_fmt}", target=r1_fmt),
                worst_case=Scenario(name="Worst Case", probability=15, description=f"Breakdown drastis menembus {s2_fmt} diiringi panic selling, harga masuk fase freefall.", trigger=f"Close daily di bawah {s2_fmt}", target=f"< {s2_fmt}")
            )

    def step10_technical_detail(self, price: float, daily_df: pd.DataFrame, ext_ind: dict, sr: SupportResistanceResult, risk: RiskManagement, trend: TrendAnalysis, m15_df: pd.DataFrame = None, target_date_str: str = "", rec: str = "") -> TechnicalDetail:
        from models.response import TrendDetail, SMAItem, MomentumDetail, VolatilityDetail, PriceLevel, StrategyDetail, TechnicalDetail, BacktestResult
        from services.trade_simulator import TradeSimulator
        from services.historical_backtester import HistoricalBacktester
        
        simulator = TradeSimulator()
        hist_backtester = HistoricalBacktester()
        
        # 1. Trend Detail
        adx = ext_ind.get('adx') or 0.0
        if adx > 25:
            adx_status = "Strong Trend"
        elif adx > 20:
            adx_status = "Emerging Trend"
        else:
            adx_status = "Weak/No Trend"
            
        sma_table = []
        smas = [5, 10, 20, 50, 100, 200]
        for s in smas:
            val = ext_ind.get(f'sma{s}')
            if val:
                diff = (price - val) / val * 100
                sma_table.append(SMAItem(
                    name=f"SMA{s}",
                    value=val,
                    diff_pct=diff,
                    position="above" if price >= val else "below"
                ))
        
        # Determine Grade
        all_above = all([price > ext_ind.get(f'sma{s}', 0) for s in smas if ext_ind.get(f'sma{s}')])
        all_below = all([price < ext_ind.get(f'sma{s}', float('inf')) for s in smas if ext_ind.get(f'sma{s}')])
        
        if trend.trend_besar == "Bullish" and adx > 25 and all_above:
            grade = "A"
        elif trend.trend_besar == "Bullish" and adx > 20:
            grade = "B"
        elif trend.trend_besar == "Bearish" and adx > 25 and all_below:
            grade = "E"
        elif trend.trend_besar == "Bearish" and adx > 20:
            grade = "D"
        else:
            grade = "C"
            
        trend_detail = TrendDetail(
            grade=grade,
            main_trend=trend.trend_besar,
            short_term_trend=trend.trend_pendek,
            main_reason=f"Harga saat ini berada di {'atas' if trend.trend_besar == 'Bullish' else 'bawah'} EMA 200. Indikator ADX menunjukkan {adx_status.lower()}.",
            short_term_reason=f"Secara jangka pendek, pergerakan cenderung {'naik' if trend.trend_pendek == 'Bullish' else 'turun'} relatif terhadap MA 20.",
            adx_value=adx,
            adx_status=adx_status,
            di_plus=ext_ind.get('plus_di') or 0.0,
            di_minus=ext_ind.get('minus_di') or 0.0,
            sma_table=sma_table
        )
        
        # 2. Momentum Detail
        rsi = ext_ind.get('rsi') or 50.0
        if rsi > 70: rsi_zone = "Overbought"
        elif rsi < 30: rsi_zone = "Oversold"
        else: rsi_zone = "Neutral"
        
        stoch = ext_ind.get('stoch_rsi') or 50.0
        if stoch > 80: stoch_zone = "Overbought"
        elif stoch < 20: stoch_zone = "Oversold"
        else: stoch_zone = "Neutral"
        
        mfi = ext_ind.get('mfi') or 50.0
        if mfi > 80: mfi_zone = "Overbought"
        elif mfi < 20: mfi_zone = "Oversold"
        else: mfi_zone = "Neutral"
        
        macd = ext_ind.get('macd') or 0.0
        macd_sig = ext_ind.get('macd_signal') or 0.0
        
        if macd > macd_sig and macd < 0:
            macd_cross = "Golden Cross"
        elif macd < macd_sig and macd > 0:
            macd_cross = "Death Cross"
        elif macd > macd_sig:
            macd_cross = "Bullish"
        else:
            macd_cross = "Bearish"
            
        momentum_detail = MomentumDetail(
            rsi_value=rsi,
            rsi_zone=rsi_zone,
            stoch_rsi_value=stoch,
            stoch_rsi_zone=stoch_zone,
            mfi_value=mfi,
            mfi_zone=mfi_zone,
            macd_value=macd,
            macd_signal_value=macd_sig,
            macd_hist_value=ext_ind.get('macd_hist') or 0.0,
            macd_cross=macd_cross
        )
        
        # 3. Volatility Detail
        atr = ext_ind.get('atr') or 0.0
        atr_pct = (atr / price * 100) if price > 0 else 0.0
        
        if atr_pct < 1: atr_regime = "Low"
        elif atr_pct < 2: atr_regime = "Normal"
        elif atr_pct < 3: atr_regime = "Elevated"
        else: atr_regime = "Extreme"
        
        recent_1w = daily_df.tail(5)
        recent_1m = daily_df.tail(20)
        recent_ytd = daily_df[daily_df.index >= f"{daily_df.index.max().year}-01-01"] if not daily_df.empty else daily_df
        
        range_1w = recent_1w['High'].max() - recent_1w['Low'].min() if not recent_1w.empty else 0.0
        range_1m = recent_1m['High'].max() - recent_1m['Low'].min() if not recent_1m.empty else 0.0
        range_ytd = recent_ytd['High'].max() - recent_ytd['Low'].min() if not recent_ytd.empty else 0.0
        
        bb_u = ext_ind.get('bb_upper') or 0.0
        bb_m = ext_ind.get('bb_middle') or 0.0
        bb_l = ext_ind.get('bb_lower') or 0.0
        
        if price > bb_u: bb_pos = "Upper Band"
        elif price < bb_l: bb_pos = "Lower Band"
        else: bb_pos = "Middle Zone"
        
        volatility_detail = VolatilityDetail(
            atr_value=atr,
            atr_regime=atr_regime,
            atr_pct=atr_pct,
            range_1w=range_1w,
            range_1m=range_1m,
            range_ytd=range_ytd,
            bb_upper=bb_u,
            bb_middle=bb_m,
            bb_lower=bb_l,
            bb_width=ext_ind.get('bb_width') or 0.0,
            bb_position=bb_pos
        )
        
        # 4. Levels
        levels = []
        for i, r in enumerate(sr.resistances):
            try:
                p = float(r.zone.split('-')[0])
                levels.append(PriceLevel(label=f"R{len(sr.resistances)-i}", price=p, level_type="resistance", strength=r.strength, distance_pct=(p-price)/price*100, reason=r.reason))
            except: pass
        levels = sorted(levels, key=lambda x: x.price, reverse=True)
        
        levels.append(PriceLevel(label="Current", price=price, level_type="current", strength="-", distance_pct=0.0, reason="Last Traded Price"))
        
        supps = []
        for i, s in enumerate(sr.supports):
            try:
                p = float(s.zone.split('-')[0])
                supps.append(PriceLevel(label=f"S{i+1}", price=p, level_type="support", strength=s.strength, distance_pct=(p-price)/price*100, reason=s.reason))
            except: pass
        levels.extend(supps)
        
        # 5. Strategies (Scalping, Intraday, Swing)
        strategies = []
        
        try:
            entry_parts = risk.entry_zone.split(' - ')
            e_low = float(entry_parts[0])
            e_high = float(entry_parts[1]) if len(entry_parts) > 1 else e_low
        except:
            e_low = e_high = price
            
        if price > ext_ind.get('sma50', price):
            sig_type = "buy on weakness" if e_low < price else "buy on breakout"
        else:
            sig_type = "sell on strength" if e_low > price else "hold"
            
        def get_grade(rr):
            if rr >= 3: return "A"
            if rr >= 2: return "B"
            if rr >= 1: return "C"
            return "D"

        # --- SWING ---
        confirmation_buffer = 1.015
        t_price_swing = e_high * confirmation_buffer if sig_type == "buy on breakout" else e_high * 1.01
        swing_strat = StrategyDetail(
            timeframe="Swing",
            grade=get_grade(risk.risk_reward_ratio),
            signal_type=sig_type,
            description="Strategi ini didasarkan pada pergerakan harga relatif terhadap zona support terdekat. Target dirancang untuk ditahan selama beberapa hari hingga minggu.",
            entry_low=e_low,
            entry_high=e_high,
            stop_loss=risk.stop_loss,
            risk_pct=abs(price - risk.stop_loss) / price * 100,
            target_1=risk.target_1,
            target_2=risk.target_2,
            risk_reward=risk.risk_reward_ratio,
            trigger_price=t_price_swing,
            trigger_condition=f"Tunggu hingga harga menembus {t_price_swing:,.0f} (termasuk buffer konfirmasi) dengan lonjakan volume.",
            context=f"RR rasio saat ini adalah {risk.risk_reward_ratio}x, yang tergolong {'layak' if risk.risk_reward_ratio >= 2 else 'berisiko'} untuk diambil."
        )
        if target_date_str:
            swing_strat.backtest = simulator.simulate(swing_strat, m15_df, target_date_str)

        # --- INTRADAY ---
        intraday_sl = price - (atr * 0.6)
        intraday_tp1 = price + (atr * 0.8)
        intraday_tp2 = price + (atr * 1.2)
        
        # Ensure Intraday TP doesn't irrationally exceed Swing TP1 if it's too close
        if intraday_tp1 > risk.target_1 * 1.02:
            intraday_tp1 = price + (atr * 0.6)
            intraday_tp2 = price + (atr * 0.8)

        intraday_risk = abs(price - intraday_sl)
        intraday_reward = abs(intraday_tp1 - price)
        intraday_rr = intraday_reward / intraday_risk if intraday_risk > 0 else 0
        intraday_t_price = e_high * 1.005 if sig_type == "buy on breakout" else e_high * 1.002

        intraday_strat = StrategyDetail(
            timeframe="Intraday",
            grade=get_grade(intraday_rr),
            signal_type=sig_type,
            description="Strategi jangka pendek untuk mengunci profit dalam 1 hari perdagangan. Menggunakan ATR untuk menentukan stop loss dinamis.",
            entry_low=price - (atr * 0.5),
            entry_high=price,
            stop_loss=intraday_sl,
            risk_pct=abs(price - intraday_sl) / price * 100,
            target_1=intraday_tp1,
            target_2=intraday_tp2,
            risk_reward=intraday_rr,
            trigger_price=intraday_t_price,
            trigger_condition=f"Masuk saat momentum menguat di chart 15m, menembus {intraday_t_price:,.0f}.",
            context=f"Menggunakan 1.0x ATR sebagai stop loss untuk menghindari noise harian."
        )
        if target_date_str:
            intraday_strat.backtest = simulator.simulate(intraday_strat, m15_df, target_date_str)

        # --- SCALPING ---
        scalp_sl = price - (atr * 0.3)
        scalp_tp1 = price + (atr * 0.4)
        scalp_tp2 = price + (atr * 0.6)
        scalp_risk = abs(price - scalp_sl)
        scalp_reward = abs(scalp_tp1 - price)
        scalp_rr = scalp_reward / scalp_risk if scalp_risk > 0 else 0
        scalp_t_price = price * 1.002 if sig_type == "buy on breakout" else price * 1.001

        scalp_strat = StrategyDetail(
            timeframe="Scalping",
            grade=get_grade(scalp_rr),
            signal_type=sig_type,
            description="Strategi sangat agresif untuk scalping cepat. Fokus pada aksi harga di timeframe 5m-15m.",
            entry_low=price - (atr * 0.2),
            entry_high=price,
            stop_loss=scalp_sl,
            risk_pct=abs(price - scalp_sl) / price * 100,
            target_1=scalp_tp1,
            target_2=scalp_tp2,
            risk_reward=scalp_rr,
            trigger_price=scalp_t_price,
            trigger_condition=f"Eksekusi cepat saat breakout volume menit, target {scalp_t_price:,.0f}.",
            context=f"Risiko dijaga sangat ketat di 0.3x ATR."
        )
        if target_date_str:
            scalp_strat.backtest = simulator.simulate(scalp_strat, m15_df, target_date_str)
            
        # Strict Risk Filter: Do not recommend positions if risky or not a buy signal
        is_risky = risk.is_rejected or ("buy" not in rec.lower() and "bullish" not in rec.lower())
        if not is_risky:
            strategies.extend([scalp_strat, intraday_strat, swing_strat])
        
        historical_results = []
        if m15_df is not None and not m15_df.empty:
            historical_results = hist_backtester.run_backtest(daily_df, m15_df)

        return TechnicalDetail(
            trend=trend_detail,
            momentum=momentum_detail,
            volatility=volatility_detail,
            levels=levels,
            strategies=strategies,
            historical_backtest=historical_results
        )
