# Continuous Discovery Engine — CONTEXT

## What This Is

Continuous Discovery Engine is a PM intelligence tool.

Input:

- Product name
- Up to 3 competitor names
- Optional email

Output:

1. A short, scannable Weekly Brief (5-minute read)
2. A full Evidence-Based Intelligence Report

Signals are sourced from:

- Reddit (public JSON endpoint, no PRAW)
- Google Play Store reviews
- Apple App Store reviews

The goal is to automatically surface:

- Emerging pain points
- Emotional intensity
- Competitive opportunity gaps
- One actionable experiment suggestion

---

## Core Design Principles

1. Public data only — no OAuth, no internal integrations
2. Deterministic structure — strict data contracts
3. Max 200 signals to LLM
4. No extra LLM calls for report generation
5. Graceful failure handling everywhere
6. Under 90 seconds end-to-end runtime
7. Clear separation of concerns per file

---

## Tech Stack

- Language: Python (single language only)
- Frontend: Streamlit
- LLM: Anthropic Claude
  - Haiku for clustering + gap analysis
  - Sonnet for final brief generation
- Database: Supabase (Postgres)
- Email: Resend
- Deployment: Railway

---

## File Responsibilities

### app.py

Streamlit UI only.
Three states:

- input
- loading
- result (two tabs: brief + report)

No business logic beyond orchestration.

---

### scrapers/reddit.py

Uses requests library.
Calls Reddit public JSON endpoint.
No PRAW.
No Reddit API keys required.
Returns standardized signal dict list.

---

### scrapers/playstore.py

Uses google-play-scraper.
Fetches newest US English reviews.
Returns standardized signal dict list.

---

### scrapers/appstore.py

Uses app-store-scraper.
Fetches newest US reviews.
Returns standardized signal dict list.

---

### synthesizer.py

Contains:

- cluster_themes()
- identify_gaps()
- generate_brief()
- run_pipeline()

Only file allowed to call Claude API.

All JSON parsing must use extract_json helper.

---

### reporter.py

Builds full report using:

- Themes
- Gap analysis
- All signals
- Brief output

NO additional LLM calls.
Pure deterministic transformation.

---

### emailer.py

Sends both brief and report via Resend.
Uses Jinja2 template.
Converts markdown → HTML.

---

### database.py

Handles Supabase interactions only.
No LLM logic.
No scraping logic.

---

### scheduler.py

Post-launch weekly automation.
Not required for V1.

---

### config.py

Stores known app IDs for Play Store and App Store.

---

## Data Contract (Strict)

ALL scrapers MUST return:

````python
{
  "source": "reddit" | "playstore" | "appstore",
  "term": "brand name searched",
  "text": "full review or post body",
  "title": "post title or empty string",
  "score": float,
  "url": "link to original",
  "date": "YYYY-MM-DD"
}

Rules:

Deduplicate by URL

Last 7 days only

Trim text to max 2000 chars

Skip entries with less than 20 characters

Brief Schema (LLM Output)

Must return exactly these sections:

Top 3 Pain Points
Opportunity Gap
Experiment to Run This Sprint
Trend Signal

Under 500 words.

Specific, evidence-based, not generic.

Report Schema (Reporter Output)

Header (product, date, signal count)

Executive Summary (embeds brief)

Methodology & Source Tables

Pain Point Deep Dive (all 8 themes)

Competitive Intelligence tables

Opportunity Analysis

Source Links (top 100 by score)

Full Quote Bank

No additional LLM calls.

Signal Limits

Max 200 signals sent to LLM

Sort by score descending before trimming

Deduplicate by URL before LLM

If competitor signals empty → gap logic must still work

Failure Handling Rules

Scraper failure returns empty list

LLM failure returns empty structure or fallback text

Email failure does not break pipeline

Database failure prints error but does not crash app

Environment Variables Required

ANTHROPIC_API_KEY
REDDIT_CLIENT_ID
REDDIT_CLIENT_SECRET
REDDIT_USER_AGENT
SUPABASE_URL
SUPABASE_KEY
RESEND_API_KEY
SENDER_EMAIL

Performance Targets

Total runtime under 90 seconds

LLM cost per run under $0.05

No blocking calls beyond necessary sleeps for rate limiting

Current Build Status

Phase 0 complete.
Starting scrapers.


---

# ✅ Now What You Do

1. Paste this into `CONTEXT.md`
2. Save
3. Commit it

```bash
git add CONTEXT.md
git commit -m "context: architecture and product contract locked"
git push
🚀 Next Step

We now start with:

Reddit scraper first.

Do you want to:

A) Open Claude Code and write the Reddit scraper with me step-by-step
B) Review the Reddit scraping logic design before writing it
C) Simplify scraper logic slightly before coding

Pick one.

give me everything i need to add in context.md file

Perfect.
Below is your complete, final, production-ready CONTEXT.md.

You can copy–paste this exactly into your CONTEXT.md file.

This is structured to:

Guide Claude Code properly

Lock architecture decisions

Prevent scope creep

Keep your system deterministic

Reflect exactly how YOU want to build

📄 CONTEXT.md — FINAL VERSION

Copy everything between the lines.

# Continuous Discovery Engine — CONTEXT

## What This Project Is

Continuous Discovery Engine is a product intelligence tool for Product Managers.

Input:
- Product name (required)
- Up to 3 competitor names (optional)
- Email (optional)

Output:
1. A short, scannable Weekly Intelligence Brief (5-minute read)
2. A full Evidence-Based Intelligence Report (deep dive with sources)

Signals are pulled from public data:
- Reddit (public JSON endpoint, no PRAW, no OAuth)
- Google Play Store reviews
- Apple App Store reviews

The system automatically:
- Identifies top pain points
- Measures emotional intensity
- Surfaces competitive opportunity gaps
- Suggests one testable experiment
- Builds a full traceable report
- Optionally emails the results

---

## Core Design Philosophy

1. Public data only
2. Zero user integrations
3. Deterministic architecture
4. Strict data contracts
5. No hidden LLM calls
6. Reporter uses ZERO additional LLM calls
7. Graceful failure handling
8. Under 90 seconds runtime
9. Clear separation of concerns
10. V1 is monolithic (no microservices)

---

## Tech Stack

Language: Python only

Frontend:
- Streamlit (app.py)

LLM:
- Anthropic Claude
  - claude-haiku-4-5 → theme clustering + gap analysis
  - claude-sonnet-4-6 → brief generation

Database:
- Supabase (Postgres)

Email:
- Resend

Deployment:
- Railway

---

## Folder Structure


discovery-engine/
│
├── app.py
├── synthesizer.py
├── reporter.py
├── emailer.py
├── database.py
├── scheduler.py
├── config.py
├── CONTEXT.md
├── requirements.txt
├── Procfile
│
├── scrapers/
│ ├── init.py
│ ├── reddit.py
│ ├── playstore.py
│ └── appstore.py
│
└── templates/
└── email_template.html


---

## File Responsibilities

### app.py
- Streamlit UI only
- Manages session_state
- Three states:
  - input
  - loading
  - result (two tabs: brief + report)
- No LLM logic here
- No scraping logic here

---

### scrapers/reddit.py
- Uses requests
- Calls Reddit public JSON endpoint
- No PRAW
- No OAuth
- Returns standardized signal list

---

### scrapers/playstore.py
- Uses google-play-scraper
- Fetches newest US English reviews
- Returns standardized signal list

---

### scrapers/appstore.py
- Uses app-store-scraper
- Fetches newest US reviews
- Returns standardized signal list

---

### synthesizer.py
Contains:

- extract_json()
- cluster_themes()
- identify_gaps()
- generate_brief()
- run_pipeline()

This is the ONLY file allowed to call Claude API.

All LLM calls must:
- Return strict JSON
- Be parsed safely
- Handle parsing failures

---

### reporter.py
- Builds full intelligence report
- Pure deterministic transformation
- Uses:
  - themes
  - gap analysis
  - signals
  - brief
- NO additional LLM calls
- Must be fully programmatic

---

### emailer.py
- Converts markdown → HTML
- Loads Jinja template
- Sends email via Resend
- Failure must not break pipeline

---

### database.py
- Supabase interactions only
- No scraping logic
- No LLM logic
- Safe batch inserts for signals

---

### scheduler.py
- Weekly automation
- Not required for V1 launch

---

### config.py
- Contains KNOWN_APPS mapping
- Maps brand → playstore ID + appstore ID

---

## Data Contract (Strict and Non-Negotiable)

ALL scrapers MUST return:

```python
{
  "source": "reddit" | "playstore" | "appstore",
  "term": "brand searched",
  "text": "full post/review body",
  "title": "post title or empty string",
  "score": float,
  "url": "original link",
  "date": "YYYY-MM-DD"
}

Rules:

Deduplicate by URL

Only last 7 days

Trim text to max 2000 characters

Skip entries under 20 characters

Always return list (never None)

Signal Limits

Max 200 signals sent to LLM

Sort by score descending before trimming

Deduplicate before sending to LLM

If competitor signals empty, gap logic must still work

Never exceed max_tokens defined in code

Brief Schema (LLM Output Must Follow Exactly)

The markdown output must contain exactly:

Top 3 Pain Points
Opportunity Gap
Experiment to Run This Sprint
Trend Signal

Rules:

Under 500 words

Specific, not generic

Must include direct quotes

Must reference frequency + intensity

No hallucinated data

Report Schema (Reporter Output)

Must contain:

Header (product, date, total signals)

Executive Summary (embeds brief)

Methodology & Source Tables

Pain Point Deep Dive (all 8 themes)

Competitive Intelligence tables

Opportunity Analysis

Source Links (top 100 sorted by score)

Appendix: Full Quote Bank

Reporter must not call LLM.

Error Handling Rules

Scraper failure → return []

LLM failure → return fallback or empty structure

Email failure → log error but continue

Database failure → print error but do not crash

App must never hard crash from one failing component

Performance Targets

Under 90 seconds end-to-end

No unnecessary API calls

Minimal sleeps for rate limiting

Environment Variables Required

ANTHROPIC_API_KEY
REDDIT_CLIENT_ID
REDDIT_CLIENT_SECRET
REDDIT_USER_AGENT
SUPABASE_URL
SUPABASE_KEY
RESEND_API_KEY
SENDER_EMAIL
````
