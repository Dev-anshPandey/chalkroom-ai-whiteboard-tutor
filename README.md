# Chalkroom — See the idea click

An interactive whiteboard tutor built for Braynix Studios by Devansh Pandey.

Chalkroom helps curious adult beginners understand an unfamiliar idea through a short narrated visual lesson, then test their understanding and ask follow-up questions. The design puts a teaching canvas next to a chat-first topic prompt, keeping the lesson focused and easy to revisit.

Live demo: https://chalkroom-devansh-braynix.devanshpandey87.chatgpt.site

Source: https://github.com/Dev-anshPandey/chalkroom-ai-whiteboard-tutor

## Review the demo

1. Choose **Explore the sample lesson** to try binary search immediately.
2. Press Play. Pause, change speed, seek, or choose a chapter.
3. Turn Voice off for caption-only playback.
4. Choose Draw to annotate the board; Undo and Clear affect your annotations only.
5. Answer the lightbulb check and export your lesson as JSON.
6. With a server API key configured, enter any topic for a live AI lesson and ask contextual follow-ups.

**Current AI status:** The source integrates the OpenAI Responses API, but the initial deployed version has no API key configured. Arbitrary-topic generation and follow-up answers return a clear setup message until the owner configures a key. The binary-search lesson is a hand-authored sample, not a live AI response. Speech uses the browser's built-in speech synthesis, not prerecorded audio or an OpenAI voice model. Do not represent this initial version as fully live AI.

## Setup

Requires Node.js 18+ (Node 20 recommended). There are no third-party runtime or build dependencies.

```sh
cp .env.example .env.local
# Configure OPENAI_API_KEY securely in .env.local; never commit it.
npm run dev
# Open http://localhost:4317
```

`OPENAI_MODEL` defaults to `gpt-6-luna`; choose a model available to your API project that supports Responses structured outputs. `OPENAI_API_KEY` stays on the server and is never included in client assets. A key is not needed for the sample experience or tests.

```sh
npm run build
npm test
npm run validate
```

`dist/server/index.js` is a self-contained Cloudflare Worker ES module. The build embeds static assets and the validated sample. Deploy to a compatible Worker host, configure runtime environment variables through that host, and serve the app and API from the same origin. This checkout also includes a Sites hosting manifest for the original deployment; replace its project identity when deploying your own copy. No secrets belong in that manifest.

## Architecture and decisions

- **Browser:** plain ES modules, SVG whiteboard, Web Speech API, responsive CSS. The small dependency-free implementation makes the rendering and synchronization logic straightforward to inspect.
- **Server:** Cloudflare Worker with same-origin JSON endpoints: `GET /api/status`, `GET /api/sample`, `POST /api/lesson`, and `POST /api/chat`.
- **AI lesson:** one bounded Responses API request with a strict JSON schema. The model produces scenes, spoken cues, drawing primitives, and a three-option comprehension check. The server separately validates lengths, shape types, coordinates, and quiz values. Invalid or incomplete responses produce an error rather than a silently substituted sample.
- **Drawings:** only an allowlisted set of SVG primitives is rendered. Model text is assigned via `textContent`; no model-generated HTML or executable code is used.
- **Synchronization:** a scene contains ordered narration cues. Each cue adds shapes. Speech completion advances the cue; word-boundary events refine the estimated timeline when supported. Seeking cancels obsolete speech and rebuilds the scene by replaying its drawing data up to the selected cue. Epoch tokens prevent canceled speech callbacks from advancing a new playback session.
- **Pause/resume:** speech is canceled and restarts near the corresponding word on resume. This avoids unreliable browser speech pause implementations. Seeking uses word-count estimates, not sample-accurate audio offsets.
- **Annotations:** freehand paths are separate from AI shapes and stored per chapter. Moving between scenes preserves them. They remain in memory and can be exported; refresh clears the lesson.
- **Follow-ups:** the request includes lesson narration, active chapter, and up to six recent bounded messages. Asking a question pauses playback. Drawn annotations are not sent or interpreted.

## Security and privacy

Keys are server-only. API requests are same-origin, content-type checked, input bounded, timed out after 60 seconds, and limited to eight requests per minute per IP within a Worker isolate. AI responses use `store: false`. Request content is sent to OpenAI for live features; no database or learner account is used. The frontend uses no tracking, external fonts, or analytics. Provider error bodies and keys are not exposed to the client.

The in-memory rate limit is **best effort**, not a global billing safeguard. Before unrestricted production use, add durable edge rate limiting and provider project budget limits. There is no authentication or persistent storage in this prototype.

## Validation

Seven Node tests cover:

- Sample lesson schema and approximate duration.
- Timeline seeking and deterministic scene reconstruction.
- Rejection of malformed model drawing data.
- Honest missing-key behavior and public sample access.
- Cross-origin protection and invalid inputs.
- Mocked provider success/failure paths and strict schema requests.
- Served assets, security headers, and no embedded key prefix.

These provider tests use mocks; they do not prove live API access. The local browser review confirmed that the sample renders, chapter navigation updates the diagram and captions, and quiz feedback works. Live generation and live follow-up answers have not been tested because API setup was skipped. Audible output varies by browser/OS and has not been independently audio-recorded for verification.

## Limitations and next steps

- Live AI setup and end-to-end provider verification are still required for the full email brief.
- Estimated duration is about two minutes, not exact. Browser voices and boundary events vary. Audio-file TTS with explicit cue timestamps would provide more precise seeking.
- Long model labels or complex topics may produce imperfect layouts despite schema and bounds checks. A constraint-based layout pass would improve this.
- SVG labels shrink on narrow screens. Larger diagrams are best viewed on desktop.
- No persistence, collaboration, imported lessons, or interpretation of handwritten annotations.
- AI explanations and quiz answers can be incorrect. This is a learning aid, not a verified reference or high-stakes advice service.

## Design rationale

A two-minute explanation is a starting point, not a complete course. The sample uses binary search because each comparison changes the board in a meaningful way. Chapters reduce replay effort, captions support silent learning, and the quiz checks the learner's next decision instead of merely asking for a definition.

## Submission

The official assignment requests a GitHub repository, a public demo, and a completed submission form. Track the final links and submission status in `SUBMISSION.md`. Do not claim completion until all three are confirmed.
