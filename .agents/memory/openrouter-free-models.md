---
name: OpenRouter free models
description: Which :free model slugs have live endpoints vs return 404; retry/fallback strategy
---

## Working free models (as of June 2026)
Query `/api/v1/models` and filter `pricing.prompt === 0 && pricing.completion === 0` to get the current list.
Confirmed working:
- `google/gemma-4-31b-it:free`
- `moonshotai/kimi-k2.6:free`
- `google/gemma-4-26b-a4b-it:free`
- `nvidia/nemotron-3-super-120b-a12b:free`
- `qwen/qwen3-next-80b-a3b-instruct:free`
- `meta-llama/llama-3.3-70b-instruct:free` (may be rate-limited 429 on Venice provider)

## Models that return 404 (no endpoints)
- `mistralai/mistral-7b-instruct:free`
- `meta-llama/llama-3.1-8b-instruct:free`
- `qwen/qwen-2.5-7b-instruct:free`
- `openchat/openchat-7b:free`
- `google/gemma-3-27b-it:free` (paid only)

## Retry strategy
- Try each model in order; skip to next on 404, 429, 503
- Only stop retrying on 401/402 (auth error)
- Do NOT break on 404 — just continue to next model

**Why:** Free tier models come and go; :free suffix doesn't guarantee an active endpoint. The Venice provider that serves llama-3.3-70b rate-limits aggressively.

**How to apply:** Always maintain a list of 4-6 free models and iterate with the fallback pattern in `server/routes.ts`.
