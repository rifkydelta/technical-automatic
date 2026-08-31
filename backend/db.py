import os
import sqlite3
import asyncio
import logging

logger = logging.getLogger("idx-api.db")

DB_DIR = os.path.join(os.path.dirname(__file__), "data")
DB_PATH = os.path.join(DB_DIR, "signals.db")

def _init_db_sync():
    """Synchronously create the SQLite table and indexes using built-in sqlite3 with WAL mode."""
    os.makedirs(DB_DIR, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA cache_size=10000;")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS signals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticker TEXT NOT NULL,
                company_name TEXT,
                signal_type TEXT NOT NULL,           -- 'BUY' | 'SELL'
                signal_date TEXT DEFAULT '',         -- Candle date e.g. 2026-08-30
                signal_time TEXT NOT NULL,           -- Timestamp e.g. 2026-08-30 16:00:00
                backtest_winrate REAL DEFAULT 0.0,   -- % Win rate from backtest
                backtest_total_trades INTEGER DEFAULT 0,
                backtest_total_pnl REAL DEFAULT 0.0,
                relt_score INTEGER DEFAULT 0,
                relt_rating TEXT DEFAULT '',
                relt_action TEXT DEFAULT '',
                entry_price REAL NOT NULL,           -- Recommended execution price
                stop_loss REAL DEFAULT 0.0,
                tp1 REAL DEFAULT 0.0,
                tp2 REAL DEFAULT 0.0,
                h1_entry_zone_low REAL DEFAULT 0.0,  -- 1H Entry area bottom
                h1_entry_zone_high REAL DEFAULT 0.0, -- 1H Entry area top
                h1_entry_status TEXT DEFAULT '',     -- 'ENTRY NOW' | 'WAIT FOR PULLBACK'
                h1_confirmation TEXT DEFAULT '',     -- Detail confirmation on 1H
                minute_bar_open REAL DEFAULT 0.0,    -- Open price on current minute bar
                projected_pnl_pct REAL DEFAULT 0.0,  -- Projected PnL % from open buy to estimated close
                projected_pnl_nominal REAL DEFAULT 0.0, -- Nominal PnL for 1 lot
                direction TEXT DEFAULT 'SIDEWAYS',   -- 'UP' | 'DOWN' | 'SIDEWAYS'
                status TEXT DEFAULT 'OPEN',          -- 'OPEN' | 'HIT_TP1' | 'HIT_TP2' | 'HIT_SL' | 'CLOSED'
                actual_exit_price REAL DEFAULT 0.0,
                actual_pnl_pct REAL DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Check and migrate signal_date column if existing table lacks it
        cursor = conn.execute("PRAGMA table_info(signals);")
        columns = [row[1] for row in cursor.fetchall()]
        if "signal_date" not in columns:
            conn.execute("ALTER TABLE signals ADD COLUMN signal_date TEXT DEFAULT '';")
            # Populate existing rows' signal_date from signal_time
            conn.execute("UPDATE signals SET signal_date = substr(signal_time, 1, 10) WHERE signal_date = '' OR signal_date IS NULL;")

        conn.execute("CREATE INDEX IF NOT EXISTS idx_signals_ticker ON signals(ticker);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_signals_time ON signals(signal_time);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_signals_date ON signals(signal_date);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);")

        # Clean up any duplicate legacy rows before creating unique constraint
        conn.execute("""
            DELETE FROM signals
            WHERE id NOT IN (
                SELECT MAX(id)
                FROM signals
                GROUP BY ticker, signal_date, signal_type
            );
        """)
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_signals_dedup ON signals(ticker, signal_date, signal_type);")

        # Create ai_analyses table for storing imported external AI deep dive analyses
        conn.execute("""
            CREATE TABLE IF NOT EXISTS ai_analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticker TEXT NOT NULL,
                company_name TEXT DEFAULT '',
                analysis_date TEXT DEFAULT '',
                provider_model TEXT DEFAULT '',
                master_bias TEXT DEFAULT '',
                conviction_score INTEGER DEFAULT 0,
                primary_action TEXT DEFAULT '',
                one_sentence_thesis TEXT DEFAULT '',
                raw_json TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ai_analyses_ticker ON ai_analyses(ticker);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ai_analyses_created ON ai_analyses(created_at);")

        conn.commit()
    logger.info(f"Database initialized at {DB_PATH}")

async def init_db():
    """Async wrapper for initializing the database without blocking the event loop."""
    await asyncio.to_thread(_init_db_sync)

def get_db_connection():
    """Get a synchronous SQLite connection with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

