# Explaining Chalkroom in an interview

## One-minute overview

Chalkroom turns a topic into a short visual lesson. Gemini returns a JSON lesson plan containing scenes, narration cues, drawing primitives, and a quiz. The backend validates that plan. The browser draws SVG shapes and speaks each cue. A follow-up question includes the lesson and active chapter so the tutor can answer in context.

## Where to look

- `worker/index.js`: routes, model request, input checks, timeouts, retry, rate limiting.
- `src/core.mjs`: schema, validation, timeline, deterministic board reconstruction.
- `public/app.js`: playback state, speech callbacks, SVG renderer, drawing, chat, quiz.
- `src/sample.mjs`: explicitly labeled hand-authored binary-search lesson.
- `scripts/build.mjs`: embeds browser assets and source into a single Worker module.

## Why synchronization works

Each scene starts empty. Cues add drawing primitives in order. Speech completion advances to the next cue. Seeking determines the cue from an estimated word-count timeline and reconstructs the scene from the earlier cues. An epoch counter invalidates canceled speech callbacks, preventing an old utterance from advancing the new playback position.

## Tradeoffs to explain honestly

Browser speech is convenient and needs no separate audio service, but timing varies across devices. Resume restarts near the estimated word; it is not sample-accurate audio seeking. Server-generated audio and explicit timestamps would improve this.

JSON drawing primitives are safer and easier to validate than executing model-generated SVG or JavaScript. They constrain visual expressiveness and do not guarantee an optimal layout. A layout engine would be the next improvement.

The app uses in-memory sessions to keep the prototype simple. A database, durable rate limiter, and project budget controls would be appropriate before broader production use.

## How it was tested

Eight deterministic Node tests cover schema checks, scene reconstruction, API behavior, origin checks, and provider parsing/retries. Separate live requests verify that Gemini can generate a lesson and answer a contextual question. Browser checks verify that the rendered flow is usable. See `VALIDATION.md` for the final evidence and remaining limits.

## AI assistance disclosure

Codex assisted with implementation, documentation, and testing. Gemini powers the application's live lessons and chat. Review the source and run the demo before discussing implementation details in an interview.
