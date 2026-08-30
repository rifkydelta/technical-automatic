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

COMPANY_NAME_MAP = {
    "BBCA": "Bank Central Asia Tbk",
    "BBRI": "Bank Rakyat Indonesia Tbk",
    "BMRI": "Bank Mandiri Tbk",
    "BBNI": "Bank Negara Indonesia Tbk",
    "BRIS": "Bank Syariah Indonesia Tbk",
    "BBTN": "Bank Tabungan Negara Tbk",
    "BDMN": "Bank Danamon Indonesia Tbk",
    "NISP": "Bank OCBC NISP Tbk",
    "PNBN": "Bank Pan Indonesia Tbk",
    "ARTO": "Bank Jago Tbk",
    "BSDE": "Bumi Serpong Damai Tbk",
    "CTRA": "Ciputra Development Tbk",
    "SMRA": "Summarecon Agung Tbk",
    "PWON": "Pakuwon Jati Tbk",
    "ASRI": "Alam Sutera Realty Tbk",
    "LPKR": "Lippo Karawaci Tbk",
    "MAPI": "Mitra Adiperkasa Tbk",
    "MAPA": "MAP Aktif Adiperkasa Tbk",
    "ACES": "Aspirasi Hidup Indonesia Tbk",
    "BUMI": "Bumi Resources Tbk",
    "BRMS": "Bumi Resources Minerals Tbk",
    "ENRG": "Energi Mega Persada Tbk",
    "DEWA": "Darma Henwa Tbk",
    "VKTR": "VKTR Teknologi Mobilitas Tbk",
    "UNSP": "Bakrie Sumatra Plantations Tbk",
    "BNBR": "Bakrie & Brothers Tbk",
    "VIVA": "Visi Media Asia Tbk",
    "MDIA": "Intermedia Capital Tbk",
    "ADRO": "Alamtri Resources Indonesia Tbk",
    "PTRO": "Petrosea Tbk",
    "CUAN": "Petrindo Jaya Kreasi Tbk",
    "BREN": "Barito Renewables Energy Tbk",
    "BRPT": "Barito Pacific Tbk",
    "TPIA": "Chandra Asri Pacific Tbk",
    "CGAS": "Citra Nusantara Gemilang Tbk",
    "ANTM": "Aneka Tambang Tbk",
    "INCO": "Vale Indonesia Tbk",
    "MDKA": "Merdeka Copper Gold Tbk",
    "MBMA": "Merdeka Battery Materials Tbk",
    "NCKL": "Trimegah Bangun Persada Tbk",
    "HRUM": "Harum Energy Tbk",
    "ITMG": "Indo Tambangraya Megah Tbk",
    "PTBA": "Bukit Asam Tbk",
    "INDY": "Indika Energy Tbk",
    "MEDC": "Medco Energi Internasional Tbk",
    "AKRA": "AKR Corporindo Tbk",
    "PGAS": "Perusahaan Gas Negara Tbk",
    "ELSA": "Elnusa Tbk",
    "ABMM": "ABM Investama Tbk",
    "TOBA": "TBS Energi Utama Tbk",
    "DSSA": "Dian Swastatika Sentosa Tbk",
    "BYAN": "Bayan Resources Tbk",
    "GEMS": "Golden Energy Mines Tbk",
    "KKGI": "Resource Alam Indonesia Tbk",
    "AMMN": "Amman Mineral Internasional Tbk",
    "PSAB": "J Resources Asia Pasifik Tbk",
    "ARCI": "Archi Indonesia Tbk",
    "ASII": "Astra International Tbk",
    "AUTO": "Astra Otoparts Tbk",
    "IMAS": "Indomobil Sukses Internasional Tbk",
    "SMSM": "Selamat Sempurna Tbk",
    "DRMA": "Dharma Polimetal Tbk",
    "GJTL": "Gajah Tunggal Tbk",
    "TLKM": "Telkom Indonesia Tbk",
    "ISAT": "Indosat Ooredoo Hutchison Tbk",
    "EXCL": "XL Axiata Tbk",
    "TOWR": "Sarana Menara Nusantara Tbk",
    "TBIG": "Tower Bersama Infrastructure Tbk",
    "JSMR": "Jasa Marga Tbk",
    "WIKA": "Wijaya Karya Tbk",
    "PTPP": "PP (Persero) Tbk",
    "ADHI": "Adhi Karya Tbk",
    "SSIA": "Surya Semesta Internusa Tbk",
    "IPCC": "Indonesia Kendaraan Terminal Tbk",
    "ASSA": "Adi Sarana Armada Tbk",
    "SMDR": "Samudera Indonesia Tbk",
    "TMAS": "Temas Tbk",
    "UNVR": "Unilever Indonesia Tbk",
    "ICBP": "Indofood CBP Sukses Makmur Tbk",
    "INDF": "Indofood Sukses Makmur Tbk",
    "MYOR": "Mayora Indah Tbk",
    "AMRT": "Sumber Alfaria Trijaya Tbk",
    "MIDI": "Midi Utama Indonesia Tbk",
    "CMRY": "Cisarua Mountain Dairy Tbk",
    "CPIN": "Charoen Pokphand Indonesia Tbk",
    "JPFA": "Japfa Comfeed Indonesia Tbk",
    "CLEO": "Sariguna Primatirta Tbk",
    "ULTJ": "Ultra Jaya Milk Industry Tbk",
    "STTP": "Siantar Top Tbk",
    "ROTI": "Nippon Indosari Corpindo Tbk",
    "KAEF": "Kimia Farma Tbk",
    "KLBF": "Kalbe Farma Tbk",
    "TSPC": "Tempo Scan Pacific Tbk",
    "SIDO": "Industri Jamu Dan Farmasi Sido Muncul Tbk",
    "MIKA": "Mitra Keluarga Karyasehat Tbk",
    "HEAL": "Medikaloka Hermina Tbk",
    "SILO": "Siloam International Hospitals Tbk",
    "PRDA": "Prodia Widyahusada Tbk",
    "SAME": "Sarana Meditama Metropolitan Tbk",
    "GOTO": "GoTo Gojek Tokopedia Tbk",
    "BUKA": "Bukalapak.com Tbk",
    "BELI": "Global Digital Niaga Tbk",
    "EMTK": "Elang Mahkota Teknologi Tbk",
    "SCMA": "Surya Citra Media Tbk",
    "MLPT": "Multipolar Technology Tbk",
    "MTDL": "Metrodata Electronics Tbk",
    "WIFI": "Solusi Sinergi Digital Tbk",
    "CASH": "Cashlez Worldwide Indonesia Tbk",
    "LINK": "Link Net Tbk",
    "ASPI": "Andalan Sakti Primaindo Tbk",
    "DCII": "DCI Indonesia Tbk",
    "SMGR": "Semen Indonesia Tbk",
    "INTP": "Indocement Tunggal Prakarsa Tbk",
    "AVIA": "Avia Avian Tbk",
    "MGLV": "Panca Global Kapital Tbk",
    "ESSA": "Essar Indonesia / Essa Tbk",
    "TINS": "Timah Tbk",
    "ISSP": "Steel Pipe Industry of Indonesia Tbk",
    "KRAS": "Krakatau Steel Tbk",
    "NIKL": "Pelat Timah Nusantara Tbk",
    "TRIM": "Trimegah Sekuritas Indonesia Tbk",
    "PANS": "Panin Sekuritas Tbk",
    "BACA": "Bank Capital Indonesia Tbk",
    "DNAR": "Bank Oke Indonesia Tbk"
}

def get_ticker_company_name(ticker: str) -> str:
    """Returns official company name or default fallback."""
    t = ticker.strip().upper()
    return COMPANY_NAME_MAP.get(t, f"PT {t} Tbk")
