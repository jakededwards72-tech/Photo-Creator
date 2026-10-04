# Evera — Persistent AI Companion

Evera is a mobile-first persistent-person simulation built with Next.js.

## Current prototype
- Persistent adult companion identity
- AI conversation grounded in canonical identity and live simulation state
- Time-aware activities, mood, energy, stress, recent events, and intentions
- Long-term memory extraction from meaningful conversation details
- Editable identity, occupation, location, personality, interests, and communication style
- Shared-memory timeline
- Companion image studio using the existing image generation backend
- Browser-local persistence so a refresh does not reset the relationship
- Mobile-first interface

## Architecture
The application owns canonical person state. The language model receives relevant state and memories for each response rather than being allowed to reinvent the character on every turn.

This first milestone intentionally uses local browser storage. A production multi-device version should move state into authenticated server-side persistence and add structured episodic/semantic memory retrieval, scheduled life-event generation, relationship dynamics, and notifications.

## Local setup
1. Run `npm install`
2. Copy `.env.example` to `.env.local`
3. Add your OpenAI API key
4. Run `npm run dev`

## Environment
```
OPENAI_API_KEY=...
OPENAI_CHAT_MODEL=gpt-6-luna
OPENAI_IMAGE_MODEL=gpt-image-2
```

## Vercel
Import this repository into Vercel, add the environment variables above in Project Settings, and deploy.

Never commit API keys.
