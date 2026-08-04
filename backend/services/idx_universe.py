"""
IDX Stock Universe Registry
Daftar saham-saham aktif di Bursa Efek Indonesia (BEI / IDX) untuk pemindaian screener.
"""

IDX_TICKERS = [
    # Big Cap / LQ45 / Banking
    "BBCA", "BBRI", "BMRI", "BBNI", "BRIS", "BBTN", "BDMN", "NISP", "PNBN", "ARTO",
    "BNLI", "BSDE", "CTRA", "SMRA", "PWON", "ASRI", "LPKR", "MAPI", "MAPA", "ACES",
    
    # Energy & Commodities / Mining / Coal / Oil
    "BUMI", "BRMS", "ENRG", "DEWA", "VKTR", "UNSP", "BNBR", "VIVA", "MDIA", "ADRO",
    "PTRO", "CUAN", "BREN", "BRPT", "TPIA", "CGAS", "ANTM", "INCO", "MDKA", "MBMA",
    "NCKL", "HRUM", "ITMG", "PTBA", "INDY", "MEDC", "AKRA", "PGAS", "ELSA", "ABMM",
    "TOBA", "DSSA", "BYAN", "GEMS", "KKGI", "AMMN", "PSAB", "ARCI", "MCOL", "APEX",

    # Industrial, Automotive & Infrastructure
    "ASII", "AUTO", "IMAS", "SMSM", "DRMA", "GJTL", "TLKM", "ISAT", "EXCL",
    "TOWR", "TBIG", "CENT", "JSMR", "CMNP", "WIKA", "PTPP", "ADHI", "WEGE", "TOTL",
    "SSIA", "META", "IPCC", "IPCM", "BIRD", "ASSA", "SMDR", "HAIS", "TMAS",

    # Consumer Goods, Retail, Food & Beverage
    "UNVR", "ICBP", "INDF", "MYOR", "AMRT", "MIDI", "CMRY", "GOOD", "CPIN", "JPFA",
    "MAIN", "CLEO", "ULTJ", "STTP", "ROTI", "CEKA", "AISA", "MLBI", "DLTA", "WOOD",
    "KAEF", "KLBF", "TSPC", "SIDO", "MIKA", "HEAL", "SILO", "PRDA", "SAME", "HERO",

    # Technology & Digital
    "GOTO", "BUKA", "BELI", "EMTK", "SCMA", "MLPT", "MTDL", "DMMX", "MCAS", "WIFI",
    "AXIO", "NFCX", "KREN", "CASH", "KBLV", "LINK", "HDIT", "GLVA", "ASPI", "DCII",

    # Basic Materials, Chemical & Cement
    "SMGR", "INTP", "SMCB", "AVIA", "MGLV", "BRPT", "TPIA", "ESSA", "MDKA", "TINS",
    "ISSP", "KRAS", "NIKL", "ALDO", "SPMA", "FASW", "PBID", "KMTR", "MARK", "BAJA",

    # Multi-Finance & Investment
    "CFIN", "BFIN", "WOMF", "ADMF", "BHIT", "BCAP", "KPIG", "BABP", "PNLF",
    "PNIN", "TRIM", "APIC", "PANS", "YULE", "AGRO", "NOBU", "BACA", "DNAR", "BVIC"
]

def get_all_idx_tickers() -> list[str]:
    """Returns deduplicated list of active IDX stock tickers."""
    seen = set()
    deduped = []
    for t in IDX_TICKERS:
        t_clean = t.strip().upper()
        if t_clean and t_clean not in seen:
            seen.add(t_clean)
            deduped.append(t_clean)
    return deduped
