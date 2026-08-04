"""ScenarioCards renderer matching ScenarioCards.js."""
from rich.panel import Panel
from rich.columns import Columns
from rich.text import Text

def render_scenarios(data: dict) -> Panel:
    scenarios = data.get("scenarios", {})
    if not scenarios:
        return Panel("Data skenario tidak tersedia.", title="MARKET SCENARIOS OUTLOOK", border_style="grey30")

    primary = scenarios.get("primary", {})
    alternative = scenarios.get("alternative", {})
    worst_case = scenarios.get("worst_case", {})

    cols = []

    # Primary
    p_text = Text()
    p_text.append(f"Probabilitas: {primary.get('probability', 0)}%\n\n", style="bold bright_blue")
    p_text.append(f"{primary.get('description', '')}\n\n", style="bright_white")
    p_text.append(f"Trigger: {primary.get('trigger', '')}\n", style="grey70")
    p_text.append(f"Target:  {primary.get('target', '')}", style="grey70")
    cols.append(Panel(p_text, title="🎯 SKENARIO UTAMA", border_style="bright_blue"))

    # Alternative
    a_text = Text()
    a_text.append(f"Probabilitas: {alternative.get('probability', 0)}%\n\n", style="bold yellow")
    a_text.append(f"{alternative.get('description', '')}\n\n", style="bright_white")
    a_text.append(f"Trigger: {alternative.get('trigger', '')}\n", style="grey70")
    a_text.append(f"Target:  {alternative.get('target', '')}", style="grey70")
    cols.append(Panel(a_text, title="🔀 SKENARIO ALTERNATIF", border_style="yellow"))

    # Worst Case
    w_text = Text()
    w_text.append(f"Probabilitas: {worst_case.get('probability', 0)}%\n\n", style="bold red")
    w_text.append(f"{worst_case.get('description', '')}\n\n", style="bright_white")
    w_text.append(f"Trigger: {worst_case.get('trigger', '')}\n", style="grey70")
    w_text.append(f"Target:  {worst_case.get('target', '')}", style="grey70")
    cols.append(Panel(w_text, title="⚠️ WORST CASE", border_style="red"))

    return Panel(Columns(cols, equal=True), title="MARKET SCENARIOS OUTLOOK", border_style="grey30")
