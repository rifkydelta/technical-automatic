"""Disclaimer renderer matching Disclaimer.js."""
from rich.text import Text

def render_disclaimer() -> Text:
    t = Text()
    t.append("\n⚠ Disclaimer: ", style="bold yellow")
    t.append("Analisa ini bersifat edukasi dan bukan rekomendasi jual/beli. Lakukan riset mandiri sebelum mengambil keputusan.\n", style="italic grey50")
    return t
