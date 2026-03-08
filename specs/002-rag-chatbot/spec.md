# Feature Specification: Integrated RAG Chatbot for Physical AI Textbook

**Feature Branch**: `002-rag-chatbot`
**Created**: 2026-02-26
**Status**: Ready for Planning
**Feature Number**: 002

---

## Overview

Students and instructors reading the Physical AI & Humanoid Robotics textbook need immediate,
contextually accurate answers to their questions — without leaving the page they are reading.
This feature embeds an AI-powered question-answering assistant into every page of the Docusaurus
book. The assistant can answer questions across the full book (Global mode) or focus exclusively
on the text the user has highlighted (Selected Text mode). All answers include citations back to
the source chapters so readers can verify and explore further.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask a Question About the Book (Priority: P1)

A student is reading Chapter 4 on Kinematics and does not understand the difference between
forward and inverse kinematics. They open the chat assistant, type their question in plain
English, and receive a clear answer with a reference to the exact chapter and section that
contains the explanation.

**Why this priority**: This is the core value proposition of the entire feature. Without the
ability to ask a question and receive a cited, book-grounded answer, no other stories are
meaningful. It must work end-to-end before anything else ships.

**Independent Test**: Open any book page, open the chat panel, type "What is the difference
between forward and inverse kinematics?" and confirm a relevant, cited answer is returned
within 10 seconds.

**Acceptance Scenarios**:

1. **Given** a student is on any book page, **When** they open the chat assistant and submit a
   question about any topic covered in the textbook, **Then** the assistant returns an answer
   grounded in the book's content with at least one citation (chapter + section title) within
   10 seconds.
2. **Given** a student asks a question whose answer is not present anywhere in the textbook,
   **When** the assistant processes the query, **Then** it responds with a clear message that
   the topic is not covered in this book, rather than fabricating an answer.
3. **Given** a student submits an empty or whitespace-only message, **When** they press send,
   **Then** the input is rejected with a helpful prompt to enter a question.

---

### User Story 2 - Ask About Highlighted / Selected Text (Priority: P1)

A student highlights a dense paragraph describing Denavit-Hartenberg parameters. A contextual
button appears near the selection. They click it and the chat assistant pre-fills with "Ask
about selected text" context, allowing them to ask a targeted question about only the
highlighted passage.

**Why this priority**: Selected-text mode dramatically reduces cognitive load — students do not
need to rephrase or copy content. It is a distinct, high-value interaction that makes the
assistant feel native to the reading experience. Ranked P1 alongside global mode because both
are required for the base release.

**Independent Test**: Highlight any paragraph on a book page, click the contextual action
button, submit a question, and confirm the response references only the selected content.

**Acceptance Scenarios**:

1. **Given** a student selects text on a book page, **When** the selection is at least one
   word long, **Then** a contextual "Ask about this" action button appears adjacent to or near
   the selection within 500ms.
2. **Given** the student clicks "Ask about this", **When** the chat panel opens, **Then** the
   selected text is displayed as context in the input area and the query scope is automatically
   set to "Selected Text Only" mode.
3. **Given** the assistant is in Selected Text mode, **When** the student submits a question,
   **Then** the answer is grounded specifically in the selected passage and the response
   indicates this scoped context.

---

### User Story 3 - Review and Continue a Previous Conversation (Priority: P2)

A student had a productive chat session yesterday about Chapter 7 on locomotion controllers.
Today they return and want to continue the conversation without losing context. They see their
previous sessions listed in the chat history panel and can click to resume or review past
exchanges.

**Why this priority**: Session persistence dramatically improves learning continuity. It is P2
because the core Q&A loop (P1) must be solid first, and history is a meaningful enhancement
rather than a blocker.

**Independent Test**: Complete a chat session, close the browser, reopen the book, open the
chat assistant, and verify the previous session appears in history and is fully readable.

**Acceptance Scenarios**:

1. **Given** a student has completed at least one chat session, **When** they reopen the chat
   assistant on any subsequent visit (same browser), **Then** a history panel lists previous
   sessions with a title and timestamp.
2. **Given** a student clicks a previous session in the history panel, **When** the session
   loads, **Then** the full conversation (questions and answers) is displayed in the correct
   order.
3. **Given** a student wants to start fresh, **When** they initiate a new chat, **Then** a
   new session is created without overwriting or deleting previous sessions.

---

### User Story 4 - Read Answers with Formatted Code and Citations (Priority: P2)

An instructor is using the chatbot to explore a code example from Chapter 10. The assistant's
answer contains a Python code snippet and two citations linking back to specific book sections.
The code is syntax-highlighted and the citations are clickable links.

**Why this priority**: The textbook is highly technical — answers without code formatting or
navigable citations are far less useful. This is P2 because it enhances the P1 answer quality
but does not block basic functionality.

**Independent Test**: Ask a question that should produce a code snippet answer (e.g., "Show
me a ROS 2 publisher example"). Verify syntax highlighting renders and citations are clickable.

**Acceptance Scenarios**:

1. **Given** the assistant returns an answer containing a code block, **When** the response
   is rendered, **Then** the code is displayed with syntax highlighting appropriate to the
   language detected.
2. **Given** the assistant cites a book section, **When** the citation is rendered, **Then**
   it appears as a clickable link that navigates to the referenced page or section.
3. **Given** any answer is rendered, **When** the content includes markdown (bold, lists,
   headers), **Then** the markdown is rendered visually rather than shown as raw symbols.

---

### User Story 5 - Switch Between Global and Selected-Text Scope (Priority: P2)

A student is in Global mode asking broad questions about robotics. They then highlight a
specific paragraph and want to narrow the scope. They toggle the mode switch to "Selected Text
Only" and the assistant immediately restricts its context accordingly. They can toggle back
to Global at any time.

**Why this priority**: The toggle is the explicit control mechanism for a core distinction.
It is P2 because the two modes already work implicitly through the selection flow (Story 2);
this story covers the explicit, persistent toggle control.

**Independent Test**: Open chat, verify toggle is in Global mode. Highlight text, click Ask,
verify mode auto-switches to Selected Text. Manually toggle back to Global and ask a question;
verify it searches the full book again.

**Acceptance Scenarios**:

1. **Given** the chat panel is open, **When** a student views the panel, **Then** a visible
   toggle control shows the current scope (Global Book or Selected Text Only).
2. **Given** no text is selected, **When** a student attempts to set mode to "Selected Text
   Only", **Then** the system prompts them to select text first and does not accept a query
   until text is selected.
3. **Given** the student toggles scope between modes, **When** they submit the same question
   in each mode, **Then** answers may differ based on the scoped context, confirming mode
   switching is functional.

---

### User Story 6 - Experience a Visually Immersive Chat Interface (Priority: P3)

A student notices the chat trigger — a gently animated icon in the corner of every page. The
chat panel opens with a rich, modern aesthetic consistent with an advanced AI-native textbook.
The experience feels premium and futuristic, not like a generic support widget.

**Why this priority**: Visual quality and polish reinforce the brand of the textbook as
cutting-edge. P3 because it does not affect functional outcomes but strongly affects
first-impression satisfaction and adoption.

**Independent Test**: Load any book page on desktop and mobile. Verify the chat trigger is
visible, animated, and opens a styled panel without layout breakage.

**Acceptance Scenarios**:

1. **Given** a student loads any page, **When** the page fully renders, **Then** the chat
   trigger button is visible, non-intrusive, and performs a subtle animation (e.g., pulse
   or glow) that draws attention without being distracting.
2. **Given** a student opens the chat panel on a desktop viewport (≥ 1024px wide), **When**
   the panel renders, **Then** it displays a history sidebar, a conversation area, and an
   input field in a visually distinct, glassmorphism-style layout with no broken elements.
3. **Given** a student opens the chat panel on a mobile viewport (< 768px wide), **When**
   the panel renders, **Then** it occupies the full screen, remains fully usable, and the
   history sidebar is accessible via a toggle rather than always visible.

---

### Edge Cases

- What happens when the backend question-answering service is unavailable or slow? The
  assistant must display a graceful error message and allow the user to retry without
  losing their typed question.
- What happens when a student highlights text that is a code block, image caption, or
  non-prose element? The system should still accept the selection but may note that the
  context is a code sample.
- What happens when the user's browser has local storage disabled? Session history must
  degrade gracefully with a notice that history will not persist, but the current session
  must still function.
- What happens when a question is submitted but the vector index has not yet been built or
  is incomplete? The assistant must return a clear status message rather than returning empty
  or hallucinated results.
- What happens when the book content is updated or new chapters are added? The operator
  triggers a manual re-index via a CLI command or admin endpoint. The system must support
  this without requiring code changes or redeployment of the application.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST embed an interactive chat assistant panel accessible from every
  page of the Docusaurus book without navigating away from the current page.
- **FR-002**: System MUST allow users to type natural-language questions and receive answers
  grounded in the textbook content.
- **FR-003**: Every answer MUST include at least one citation identifying the source chapter
  and section within the textbook.
- **FR-004**: System MUST support two query scopes: Global (search entire book) and Selected
  Text Only (restrict context to the user's current text selection).
- **FR-005**: System MUST detect when a user has selected text on the page and offer a
  contextual action to open the chat with that selection pre-loaded as context.
- **FR-006**: System MUST render answers with full Markdown support including code blocks
  with syntax highlighting, bold, italics, ordered/unordered lists, and headers.
- **FR-007**: Citations included in answers MUST be rendered as clickable links that navigate
  to the referenced book section.
- **FR-008**: System MUST persist chat session history in the user's browser so previous
  sessions can be reviewed on return visits.
- **FR-009**: System MUST display a visible, accessible history panel listing previous
  sessions with a descriptive title and timestamp.
- **FR-010**: System MUST display a clear, actionable error message when the answer service
  is unavailable, retaining the user's question so they can retry.
- **FR-011**: System MUST function on all modern browsers (Chrome 120+, Firefox 120+,
  Safari 17+, Edge 120+) without polyfills.
- **FR-012**: System MUST be fully responsive and usable on mobile devices (viewport width
  ≥ 320px).
- **FR-013**: The answer service MUST be deployable as a self-contained backend unit that
  can run independently of the Docusaurus static site.
- **FR-014**: The book content index MUST be rebuildable by an operator via a manual
  trigger (CLI command or admin endpoint) without modifying application code or
  redeploying the service.
- **FR-015**: System MUST NOT expose API credentials to end-user browsers; all calls to
  external AI or vector services MUST be proxied through the backend.

### Key Entities

- **Chat Session**: A time-bounded sequence of question-answer exchanges initiated by a
  single user visit. Has a start time, optional title, and ordered list of turns.
- **Chat Turn**: A single question submitted by the user paired with the assistant's answer.
  Each turn has a timestamp, the query text, the answer text, and a list of citations.
- **Citation**: A reference from an answer back to a specific location in the textbook.
  Has a chapter title, section title, and a navigable URL fragment.
- **Query Scope**: The context boundary for a given query — either "Global" (all indexed
  book content) or "Selected Text" (a specific passage provided by the user in the request).
- **Book Index**: The searchable representation of all textbook content used to retrieve
  relevant passages for answering questions. Must be rebuildable from source content.
- **Selected Text Context**: A user-captured passage from the current page, attached to a
  chat session turn to constrain the answer scope.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A student can submit a question and receive a cited answer in under 10 seconds
  under normal network conditions (p95 latency target).
- **SC-002**: At least 90% of questions about topics covered in the textbook receive an
  answer that includes a citation pointing to the correct chapter (measured by QA testing
  against a predefined question set of ≥ 20 questions covering all 13 chapters).
- **SC-003**: The chat assistant trigger and panel render correctly (no layout breakage, no
  console errors) on 100% of book pages in Chrome, Firefox, Safari, and Edge.
- **SC-004**: The Selected Text flow (highlight → contextual button → scoped answer) completes
  successfully in a single uninterrupted user action with zero additional configuration steps.
- **SC-005**: The chat panel is fully operable on a 375px-wide mobile viewport with no
  horizontal scroll and all interactive elements reachable by touch.
- **SC-006**: Zero API credentials appear in browser network traffic or rendered HTML source;
  all AI service calls are proxied server-side.
- **SC-007**: Session history persists across browser restarts and is recoverable for at least
  the 10 most recent sessions. A clearly visible "Clear history" button allows the student
  to delete all stored sessions at any time.

---

## Assumptions & Constraints

The following technology choices and constraints are assumed from the project brief. They are
recorded here for traceability but do not drive the requirements above.

- **AI Service**: OpenRouter API will be used for both text embedding and language model
  inference. One API key will be used for both embedding and LLM calls.
- **Vector Store**: Qdrant Cloud Free Tier will be used for storing and querying the book
  content index. One API key and one cluster URL will be used.
- **Credential Limit**: Exactly three API credentials will be used in total
  (OPENROUTER_API_KEY, QDRANT_URL, QDRANT_API_KEY). No additional third-party services
  requiring credentials may be introduced.
- **Backend Deployment**: The backend service must be fully containerised and deployable
  to both a Context7 VPS and a GitHub Actions-managed VPS using a single compose file and
  a one-command deploy script.
- **Frontend Integration**: The chat UI must integrate into the existing Docusaurus v3
  project without requiring a Docusaurus version upgrade or ejecting the theme.
- **No User Authentication**: The chatbot does not require user accounts or login. Session
  history is stored locally in the browser (e.g., localStorage or IndexedDB).

---

## Out of Scope

- User authentication, accounts, or personalised profiles.
- Multi-language (non-English) query support.
- Voice input or text-to-speech output.
- Answer generation from content outside the Physical AI & Humanoid Robotics textbook
  (e.g., external URLs, uploaded documents).
- Analytics dashboards or usage reporting.
- Automated content moderation or content filtering beyond graceful "not found" responses.
