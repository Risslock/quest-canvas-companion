"""Roleplaying Companion -- Gradio MVP (Earthdawn 4e).

Run:
    pip install -r requirements.txt
    python app.py

Features (all on swappable mock providers, no API keys needed):
  * Auth (mock sign-in/up, GM vs Player role)
  * Campaign hub
  * Digital twins: threaded, streaming in-character chat per character + topic
  * Forge of Visions: image generation for characters / NPCs / scenes
  * Sessions: planning, live notes, one-click auto-summary
"""
from __future__ import annotations

import gradio as gr

from services import build_services
from services.interfaces import Session
from theme import CUSTOM_CSS, enchanted_theme

S = build_services()


# --------------------------------------------------------------------------- #
# Helpers                                                                      #
# --------------------------------------------------------------------------- #
def campaign_choices():
    return [(c.name, c.id) for c in S.repo.campaigns()]


def character_choices(campaign_id):
    if not campaign_id:
        return []
    return [
        (f"{c.name}  ({'PC' if c.kind == 'pc' else 'NPC'})", c.id)
        for c in S.repo.characters(campaign_id)
    ]


def thread_choices(character_id):
    if not character_id:
        return []
    return [(t.topic, t.id) for t in S.repo.threads(character_id)]


def session_choices(campaign_id):
    if not campaign_id:
        return []
    return [(f"{s.title}  [{s.status}]", s.id) for s in S.repo.sessions(campaign_id)]


def history_to_pairs(thread_id):
    """Convert stored messages to Gradio 'messages' chatbot format."""
    msgs = S.repo.messages(thread_id)
    return [{"role": m.role, "content": m.content} for m in msgs]


# --------------------------------------------------------------------------- #
# UI                                                                          #
# --------------------------------------------------------------------------- #
with gr.Blocks(theme=enchanted_theme, css=CUSTOM_CSS, title="Roleplaying Companion") as demo:
    user_state = gr.State(None)

    gr.Markdown("# \u2724 Enchanted Archive", elem_id="app-title")
    gr.Markdown("A roleplaying companion for Earthdawn \u2014 digital twins, visions & session lore",
                elem_id="app-sub")

    # ----- Auth gate ------------------------------------------------------- #
    with gr.Group(visible=True) as auth_view:
        with gr.Row():
            with gr.Column(scale=1):
                pass
            with gr.Column(scale=2, elem_classes="sigil-card"):
                gr.Markdown("### Enter the Archive")
                email = gr.Textbox(label="Email", placeholder="gm@kaer.net (use 'gm' for GM role)")
                pw = gr.Textbox(label="Password", type="password", value="demo")
                name = gr.Textbox(label="Display name (sign-up)", placeholder="optional")
                role = gr.Radio(["player", "gm"], value="player", label="Role (sign-up)")
                with gr.Row():
                    signin_btn = gr.Button("Sign In", variant="primary")
                    signup_btn = gr.Button("Sign Up")
                auth_msg = gr.Markdown()
            with gr.Column(scale=1):
                pass

    # ----- Main app -------------------------------------------------------- #
    with gr.Group(visible=False) as app_view:
        with gr.Row():
            welcome = gr.Markdown()
            campaign_dd = gr.Dropdown(label="Campaign", choices=campaign_choices(),
                                      value=(campaign_choices()[0][1] if campaign_choices() else None))

        with gr.Tabs():
            # ---- Digital twins / chat ------------------------------------ #
            with gr.Tab("Digital Twins"):
                with gr.Row():
                    with gr.Column(scale=1):
                        char_dd = gr.Dropdown(label="Character / NPC", choices=[])
                        char_card = gr.Markdown(elem_classes="sigil-card")
                    with gr.Column(scale=2):
                        thread_dd = gr.Dropdown(label="Thread (topic)", choices=[])
                        with gr.Row():
                            new_topic = gr.Textbox(label="New thread topic", scale=3,
                                                   placeholder="e.g. Confronting the Horror")
                            new_thread_btn = gr.Button("+ Thread", scale=1)
                        chatbot = gr.Chatbot(label="In-character", type="messages", height=380)
                        with gr.Row():
                            msg_in = gr.Textbox(label="Speak", scale=4,
                                                placeholder="Address the twin...")
                            send_btn = gr.Button("Send", variant="primary", scale=1)

            # ---- Forge of Visions / images ------------------------------- #
            with gr.Tab("Forge of Visions"):
                gr.Markdown("### Conjure a portrait or scene")
                with gr.Row():
                    with gr.Column():
                        img_prompt = gr.Textbox(
                            label="Prompt", lines=3,
                            placeholder="A windling elementalist riding a storm over a ruined kaer")
                        img_style = gr.Dropdown(
                            ["Portrait", "Scene", "Map", "Item"], value="Portrait", label="Style")
                        gen_btn = gr.Button("Forge Vision", variant="primary")
                    out_img = gr.Image(label="Vision", height=420)

            # ---- Sessions ------------------------------------------------- #
            with gr.Tab("Sessions"):
                with gr.Row():
                    session_dd = gr.Dropdown(label="Session", choices=[])
                    session_status = gr.Markdown()
                with gr.Row():
                    with gr.Column():
                        plan_box = gr.Textbox(label="Plan", lines=6)
                        save_plan_btn = gr.Button("Save Plan")
                    with gr.Column():
                        notes_box = gr.Textbox(label="Live notes", lines=6)
                        save_notes_btn = gr.Button("Save Notes")
                with gr.Row():
                    summarize_btn = gr.Button("\u2728 Auto-Summarize", variant="primary")
                summary_box = gr.Markdown(elem_classes="sigil-card")

    # --------------------------------------------------------------------- #
    # Callbacks                                                             #
    # --------------------------------------------------------------------- #
    def do_auth(kind, email, pw, name, role):
        if not email:
            return (gr.update(), gr.update(), None, "Please enter an email.",
                    gr.update(), gr.update(), gr.update())
        user = (S.auth.sign_up(email, pw, name, role) if kind == "signup"
                else S.auth.sign_in(email, pw))
        cid = campaign_choices()[0][1] if campaign_choices() else None
        return (
            gr.update(visible=False),  # auth_view
            gr.update(visible=True),   # app_view
            user,                      # user_state
            "",                        # auth_msg
            f"Welcome, **{user.display_name}** \u00b7 _{user.role.upper()}_",  # welcome
            gr.update(choices=character_choices(cid)),  # char_dd
            gr.update(choices=session_choices(cid)),    # session_dd
        )

    signin_btn.click(
        lambda e, p, n, r: do_auth("signin", e, p, n, r),
        [email, pw, name, role],
        [auth_view, app_view, user_state, auth_msg, welcome, char_dd, session_dd],
    )
    signup_btn.click(
        lambda e, p, n, r: do_auth("signup", e, p, n, r),
        [email, pw, name, role],
        [auth_view, app_view, user_state, auth_msg, welcome, char_dd, session_dd],
    )

    def on_campaign(cid):
        return (gr.update(choices=character_choices(cid)),
                gr.update(choices=session_choices(cid)))

    campaign_dd.change(on_campaign, campaign_dd, [char_dd, session_dd])

    def on_character(cid):
        ch = S.repo.get_character(cid) if cid else None
        if not ch:
            return gr.update(choices=[]), "", []
        card = (
            f"**{ch.name}**  \n*{'Player Character' if ch.kind == 'pc' else 'Non-Player Character'}*\n\n"
            f"{ch.description}\n\n"
            f"**Personality:** {ch.personality}\n\n"
            f"**Tone:** {ch.tone}"
        )
        if ch.stats:
            card += f"\n\n**Earthdawn:** `{ch.stats}`"
        threads = thread_choices(cid)
        return gr.update(choices=threads, value=(threads[0][1] if threads else None)), card, []

    char_dd.change(on_character, char_dd, [thread_dd, char_card, chatbot])

    def on_thread(tid):
        return history_to_pairs(tid) if tid else []

    thread_dd.change(on_thread, thread_dd, chatbot)

    def make_thread(cid, topic):
        if not cid or not topic.strip():
            return gr.update(), "", []
        t = S.repo.create_thread(cid, topic.strip())
        return gr.update(choices=thread_choices(cid), value=t.id), "", []

    new_thread_btn.click(make_thread, [char_dd, new_topic], [thread_dd, new_topic, chatbot])

    def send_message(cid, tid, text):
        if not (cid and tid and text.strip()):
            yield gr.update(), ""
            return
        ch = S.repo.get_character(cid)
        S.repo.add_message(tid, "user", text.strip())
        history = history_to_pairs(tid)
        history.append({"role": "assistant", "content": ""})
        full = ""
        for chunk in S.chat.stream_reply(ch, S.repo.messages(tid), text):
            full = chunk
            history[-1]["content"] = chunk
            yield history, ""
        S.repo.add_message(tid, "assistant", full)
        yield history, ""

    send_btn.click(send_message, [char_dd, thread_dd, msg_in], [chatbot, msg_in])
    msg_in.submit(send_message, [char_dd, thread_dd, msg_in], [chatbot, msg_in])

    def forge(prompt, style):
        return S.image.generate(prompt or "", style)

    gen_btn.click(forge, [img_prompt, img_style], out_img)

    def on_session(sid):
        s = S.repo.get_session(sid) if sid else None
        if not s:
            return "", "", "", ""
        return (f"**{s.title}** \u2014 status: _{s.status}_", s.plan, s.notes,
                s.summary or "")

    session_dd.change(on_session, session_dd, [session_status, plan_box, notes_box, summary_box])

    def save_field(sid, value, field):
        s = S.repo.get_session(sid)
        if not s:
            return gr.update()
        setattr(s, field, value)
        S.repo.update_session(s)
        return value

    save_plan_btn.click(lambda sid, v: save_field(sid, v, "plan"), [session_dd, plan_box], plan_box)
    save_notes_btn.click(lambda sid, v: save_field(sid, v, "notes"), [session_dd, notes_box], notes_box)

    def summarize(sid, notes):
        s = S.repo.get_session(sid)
        if not s:
            return "_Select a session first._"
        s.notes = notes
        out = S.summary.summarize(s)
        s.summary = out
        S.repo.update_session(s)
        return out

    summarize_btn.click(summarize, [session_dd, notes_box], summary_box)


if __name__ == "__main__":
    demo.launch()
