# Feature Specification: Better-Auth + Personalize + Urdu Translation

**Feature Branch**: `003-auth-personalize-urdu`
**Created**: 2026-03-01
**Status**: Draft
**Input**: User description: "Step 3: Better-Auth signup/signin with background profiling, per-chapter Personalize and Urdu Translate buttons for logged-in users"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Signup with Background Profile (Priority: P1)

A new student visits the textbook site and clicks "Sign Up." They fill in their name, email, and password. They then complete a mandatory background questionnaire: selecting their software skills (multi-select from Python, ROS 2, CUDA, PyTorch, Isaac Sim, Unity, Gazebo, etc.) and hardware setup (GPU tier, RAM tier, Jetson ownership, robot platform). After signup, they are automatically signed in and their profile is stored.

**Why this priority**: Without authentication and profiles, neither personalization nor translation can function — this is the foundation for all other stories.

**Independent Test**: Can be fully tested by signing up, verifying the account exists in the database with the correct background fields, and confirming the user is logged in.

**Acceptance Scenarios**:

1. **Given** the user is on the homepage (not logged in), **When** they click "Sign Up" and fill all fields (name, email, password, software background, hardware background), **Then** an account is created, their background profile is stored, and they are redirected to the homepage as a logged-in user.
2. **Given** a user tries to sign up with an email that already exists, **When** they submit the form, **Then** the system shows a clear error message: "An account with this email already exists."
3. **Given** a user skips the background questionnaire, **When** they try to submit, **Then** the system prevents submission and highlights the missing fields.

---

### User Story 2 — Sign In / Sign Out (Priority: P1)

A returning student clicks "Sign In", enters their email and password, and is authenticated. They can also sign out. The navbar shows their name when logged in and "Sign In / Sign Up" links when logged out.

**Why this priority**: Authentication flow is required before any protected feature can work.

**Independent Test**: Sign in with valid credentials → navbar shows user name. Sign out → navbar shows guest links.

**Acceptance Scenarios**:

1. **Given** a registered user, **When** they enter valid email and password, **Then** they are signed in, the navbar updates to show their name and a "Sign Out" option.
2. **Given** a signed-in user, **When** they click "Sign Out", **Then** their session ends and the navbar reverts to guest state.
3. **Given** a user enters wrong credentials, **When** they submit, **Then** the system shows "Invalid email or password."

---

### User Story 3 — Personalize Chapter Content (Priority: P2)

A logged-in student opens any chapter and sees a "Personalize for Me" button at the top. Clicking it sends the chapter content plus their background profile to an AI model, which rewrites the content tailored to their skill level and hardware. For example, if a student has no CUDA experience, the rewritten content explains GPU concepts from scratch. The personalized content replaces the original on-screen (with a "Show Original" toggle to switch back).

**Why this priority**: Personalization is the core differentiator of this feature and directly impacts learning outcomes.

**Independent Test**: Log in as a user with "Python only, no GPU" profile → open the NVIDIA Isaac chapter → click "Personalize for Me" → verify the content is rewritten at beginner level with Python-centric examples.

**Acceptance Scenarios**:

1. **Given** a logged-in user on any chapter page, **When** they click "Personalize for Me", **Then** the chapter content is rewritten based on their software/hardware background and displayed in place of the original.
2. **Given** personalized content is displayed, **When** the user clicks "Show Original", **Then** the original chapter content is restored.
3. **Given** personalization is in progress, **When** the user waits, **Then** a loading indicator shows "Personalizing for your background..." and the button is disabled.
4. **Given** a user who is NOT logged in, **When** they view any chapter, **Then** the "Personalize for Me" button is NOT visible.

---

### User Story 4 — Translate Chapter to Urdu (Priority: P2)

A logged-in student opens any chapter and sees a "Translate to Urdu" button at the top. Clicking it translates the entire chapter to Urdu while preserving technical terms (e.g., ROS 2, CUDA, PyTorch remain in English). The translated content replaces the original on-screen. A "Back to English" button appears to toggle back. The user's language preference is remembered in the browser for future visits.

**Why this priority**: Urdu translation enables accessibility for Urdu-speaking students, a key bonus deliverable.

**Independent Test**: Log in → open any chapter → click "Translate to Urdu" → verify Urdu text appears with technical terms preserved → click "Back to English" → verify English returns.

**Acceptance Scenarios**:

1. **Given** a logged-in user on any chapter page, **When** they click "Translate to Urdu", **Then** the chapter content is translated to Urdu (technical terms preserved in English) and displayed in place of the original.
2. **Given** Urdu content is displayed, **When** the user clicks "Back to English", **Then** the original English content is restored.
3. **Given** a user has previously selected Urdu on a chapter, **When** they revisit that chapter, **Then** the Urdu version loads automatically (preference stored in browser).
4. **Given** a user who is NOT logged in, **When** they view any chapter, **Then** the "Translate to Urdu" button is NOT visible.
5. **Given** translation is in progress, **When** the user waits, **Then** a loading indicator shows "Translating to Urdu..." and the button is disabled.

---

### User Story 5 — Edit Background Profile (Priority: P3)

A logged-in student can access their profile page to update their software and hardware background. Changes take effect on the next personalization request.

**Why this priority**: Nice-to-have for students whose setup changes mid-course.

**Independent Test**: Log in → go to profile → change GPU from "None" to "RTX 4090" → save → personalize a chapter → verify content now references the 4090.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they navigate to their profile, **Then** they see their current background selections pre-filled.
2. **Given** a user updates their hardware background, **When** they save, **Then** the profile is updated in the database immediately.

---

### Edge Cases

- What happens when the AI model is unavailable during personalization or translation? → Show a user-friendly error: "Service temporarily unavailable. Please try again in a moment."
- What happens if a chapter is very long and translation takes more than 30 seconds? → Show progress indicator; if it times out, show partial result with a "Retry" option.
- What happens if the user's session expires while reading a personalized chapter? → The personalized content remains visible (cached in browser), but the buttons become hidden until re-login.
- What happens if the user tries to personalize AND translate simultaneously? → Only one operation at a time; the second button is disabled while the first is processing.
- What happens if the browser's localStorage is full or disabled? → Translation preference falls back to default (English); no crash.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide email/password signup using Better-Auth with mandatory fields: name, email, password, software background, and hardware background.
- **FR-002**: System MUST store user profiles in a Neon Serverless Postgres database with all background fields.
- **FR-003**: System MUST authenticate users via Better-Auth email/password sign-in and maintain sessions.
- **FR-004**: System MUST show "Personalize for Me" and "Translate to Urdu" buttons ONLY to authenticated users at the top of every chapter page.
- **FR-005**: System MUST send chapter content + user background profile to an AI model and display the rewritten personalized result in-place.
- **FR-006**: System MUST translate chapter content to Urdu via an AI model, preserving technical terms in English.
- **FR-007**: System MUST allow toggling between original/personalized content and English/Urdu content.
- **FR-008**: System MUST persist the user's Urdu language preference per chapter in browser storage.
- **FR-009**: System MUST show the user's name in the navbar when logged in, and "Sign In / Sign Up" links when logged out.
- **FR-010**: System MUST allow users to edit their background profile after signup.
- **FR-011**: System MUST NOT expose any API keys or secrets to the frontend.
- **FR-012**: Signup form software background MUST be a multi-select with options: Python, ROS 2, CUDA, PyTorch, Isaac Sim, Unity, Gazebo, C++, Docker, Linux.
- **FR-013**: Signup form hardware background MUST include: GPU (RTX 4070 Ti / RTX 4090 / Other / None), RAM (16GB / 32GB / 64GB+), Jetson (Yes / No), Robot (Unitree Go2 / Unitree G1 / Other / None).

### Key Entities

- **User**: Authenticated identity — name, email, hashed password, created timestamp.
- **UserProfile**: Background questionnaire data linked to a user — software skills (array of strings), GPU tier, RAM tier, Jetson ownership (boolean), robot platform.
- **PersonalizationCache**: Per-user, per-chapter cached personalized content — avoids re-calling the AI on every page load.
- **TranslationCache**: Per-chapter cached Urdu translation — avoids re-calling the AI on every request for the same chapter.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete signup (including background questionnaire) in under 3 minutes.
- **SC-002**: Sign-in completes in under 2 seconds after form submission.
- **SC-003**: Personalized chapter content appears within 15 seconds of clicking the button.
- **SC-004**: Urdu translation appears within 20 seconds of clicking the button.
- **SC-005**: 100% of chapter pages show the Personalize and Translate buttons for logged-in users.
- **SC-006**: 0% of chapter pages show the Personalize and Translate buttons for anonymous visitors.
- **SC-007**: Technical terms (ROS 2, CUDA, PyTorch, etc.) remain in English in Urdu translations.
- **SC-008**: Users can toggle between original and personalized/translated content without page reload.

## Assumptions

- Better-Auth is used as the authentication framework, integrated as a custom component within Docusaurus (not Next.js).
- Neon Serverless Postgres is the database for user accounts and profiles.
- OpenRouter free/cheap models (e.g., google/gemini-2.0-flash-001) are used for both personalization and Urdu translation via the existing backend API pattern.
- Personalized and translated content is cached (server-side or client-side) to avoid redundant AI calls for the same user/chapter combination.
- The existing RAG chatbot backend (FastAPI on port 8000) is extended with new endpoints for personalization and translation.
- Better-Auth user fields are stored using the `additionalFields` configuration for software/hardware background as JSON.
