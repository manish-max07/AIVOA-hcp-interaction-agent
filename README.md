# AI-First CRM — HCP Log Interaction Module

An AI-first "Log Interaction" screen for a Healthcare Professional (HCP) CRM.
Instead of filling out a form manually, field reps describe their interaction
in natural language to an AI assistant, which uses a **LangGraph agent**
(powered by Groq) to extract structured data, look up or create HCP profiles,
and populate the form via tool calls.

## Architecture

```
React (Redux) — split screen
 ├─ Left: read-only Interaction Form (driven entirely by AI)
 └─ Right: Chat panel
        │
        ▼  POST /chat
FastAPI backend
        │
        ▼
LangGraph agent (Groq openai/gpt-oss-20b)
        │
        ▼ (routes to one of 7 tools based on intent)
  1. log_interaction         — extract + create a new interaction record
  2. edit_interaction        — correct specific fields on an existing record
  3. schedule_followup       — parse and set a follow-up date/note
  4. compliance_flag         — detect compliance-risk language
  5. suggest_next_best_action — recommend what to discuss next visit
  6. search_hcp              — look up an existing HCP profile, or create one
  7. get_interaction_history — summarize past interactions with an HCP
        │
        ▼
Postgres/MySQL (via SQLAlchemy) — falls back to local SQLite if no DATABASE_URL is set
```

Routing (which tool fires) and extraction (what values go in the form) are
both decided by the LLM at runtime — nothing is hard-coded with regex/if-else.

## Data model

HCPs are first-class entities, not just a name string on an interaction:

- **`HCP`** — `name`, `specialty`, `hospital`, `phone`, `email`
- **`Interaction`** — linked to an HCP via `hcp_id` (foreign key), plus a
  denormalized `hcp_name` copy for quick display without a join

This lets `get_interaction_history` and `suggest_next_best_action` reason
over an HCP's *entire* interaction history, not just the current form.

## A note on the model

The assignment specifies Groq's `gemma2-9b-it`. Groq decommissioned this
model (announced Aug 2025), and its direct successor `llama-3.1-8b-instant`
was also deprecated as of June 2026. Per [Groq's official deprecation
guidance](https://console.groq.com/docs/deprecations), this project uses
`openai/gpt-oss-20b`, the current recommended replacement — all model usage
still goes through Groq exactly as required, only the specific model ID
changed due to platform-side deprecation, not a design choice.

## Project structure

```
backend/
  app/
    main.py       # FastAPI app + /chat and /interactions endpoints
    agent.py      # LangGraph graph: system prompt, tool binding, routing
    tools.py      # the 7 tools (extraction logic + DB writes)
    models.py     # SQLAlchemy HCP + Interaction models (with FK relationship)
    schemas.py    # Pydantic request/response schemas
    database.py   # DB engine/session setup
  requirements.txt
  .env.example
frontend/
  src/
    App.jsx                    # split-screen layout
    components/InteractionForm.jsx  # left panel (read-only)
    components/ChatPanel.jsx        # right panel (chat + calls backend)
    redux/                     # Redux Toolkit store + slice
  package.json
```

## Running it locally

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your GROQ_API_KEY (get one at console.groq.com)
                        # DATABASE_URL is optional -- omit it to use local SQLite
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```
Visit `http://localhost:3000`. Set `REACT_APP_API_URL` if your backend isn't
on `localhost:8000`.

## Example flow

1. Type: *"Look up Dr. Sharma, she's a cardiologist at Apollo Hospital"*
   → `search_hcp` fires → creates or finds her profile.
2. Type: *"Today I met her and discussed CardioPlus, she seemed positive, shared brochures"*
   → `log_interaction` fires → form fills in date, product, sentiment, materials, notes, linked to her profile.
3. Type: *"Actually change the sentiment to neutral"*
   → `edit_interaction` fires → only the sentiment field updates.
4. Type: *"Remind me to follow up with her next month about trial data"*
   → `schedule_followup` fires → follow-up date/notes fill in.
5. Type: *"I told her the drug cures everything with zero side effects"*
   → `compliance_flag` fires → flags the interaction and shows a warning on the form.
6. Type: *"What should I bring up next time?"*
   → `suggest_next_best_action` fires → assistant suggests a talking point.
7. Type: *"What have I discussed with Dr. Sharma before?"*
   → `get_interaction_history` fires → summarizes her past logged interactions.

## Notes / assumptions

- The form is intentionally **read-only** — it's only ever updated through
  the AI assistant, per the task's video instructions.
- `compliance_flag` can be triggered explicitly or the agent can be prompted
  to run it proactively after logging a claim-heavy message.
- SQLite is used as a zero-config fallback for local development; set
  `DATABASE_URL` to point at Postgres or MySQL for the "real" deployment.
- `materials_shared` (brochures, samples, etc.) is extracted alongside the
  other fields per the task's example ("shared the brochures").
- `log_interaction` preserves an HCP name already set earlier in the
  conversation (e.g. via `search_hcp`) rather than overwriting it with null
  if a later message doesn't repeat the name.