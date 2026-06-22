"""Enchanted Archive visual theme for Gradio.

Mirrors the React design: vellum parchment, ink text, gold + crimson
arcane accents, Cinzel headings / EB Garamond body. Self-hosted Gradio
can use Google Fonts via CSS @import (unlike the Lovable edge runtime).
"""
from __future__ import annotations

import gradio as gr

GOLD = "#c9a227"
CRIMSON = "#8b1a1a"
VELLUM = "#f4ecd8"
INK = "#2b2118"

enchanted_theme = gr.themes.Base(
    primary_hue=gr.themes.colors.amber,
    secondary_hue=gr.themes.colors.red,
    neutral_hue=gr.themes.colors.stone,
    font=("EB Garamond", "Georgia", "serif"),
    font_mono=("IBM Plex Mono", "monospace"),
).set(
    body_background_fill=VELLUM,
    body_text_color=INK,
    block_background_fill="#fbf6e9",
    block_border_color="#d9c89a",
    block_title_text_color=CRIMSON,
    button_primary_background_fill=GOLD,
    button_primary_text_color=INK,
    button_secondary_background_fill="#efe4c6",
    input_background_fill="#fffdf6",
)

CUSTOM_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=EB+Garamond:ital@0;1&display=swap');

.gradio-container { background: #f4ecd8; }
h1, h2, h3, .prose h1, .prose h2, .prose h3 { font-family: 'Cinzel', serif !important; letter-spacing: .02em; }
#app-title { text-align:center; color:#8b1a1a; margin-bottom:0; }
#app-sub { text-align:center; color:#6b5836; font-style:italic; margin-top:2px; }
.sigil-card { border:1px solid #d9c89a; border-radius:10px; padding:14px 16px;
  background:linear-gradient(180deg,#fbf6e9,#f3e9cf); box-shadow:0 1px 0 #e8dcb6; }
.gr-button-primary { font-family:'Cinzel',serif !important; }
footer { display:none !important; }
"""
