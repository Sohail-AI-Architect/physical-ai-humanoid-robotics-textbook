# Tasks: Docusaurus Initialization + Book Skeleton

**Input**: Design documents from `/specs/001-docusaurus-book-skeleton/`
**Prerequisites**: spec.md ✓, user input task list ✓

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story from spec.md.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Docusaurus and install all dependencies before any content work.

- [x] T001 Initialize Docusaurus v3 classic TypeScript template via `npx create-docusaurus@latest . classic --typescript` in repo root
- [x] T002 Run `npm install` to install all Docusaurus base dependencies
- [x] T003 Install Tailwind CSS toolchain: `npm install -D tailwindcss postcss autoprefixer`
- [x] T004 Initialize Tailwind config: `npx tailwindcss init -p` (creates `tailwind.config.js` and `postcss.config.js`)
- [x] T005 Create/verify `.gitignore` with Node.js patterns: `node_modules/`, `.docusaurus/`, `build/`, `.env*`, `*.log`

**Checkpoint**: `node_modules/` exists and `tailwind.config.js` is present.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Configuration that ALL three user stories depend on — must complete before any content.

- [x] T006 Update `tailwind.config.js` content array to `["./src/**/*.{js,jsx,ts,tsx}", "./docs/**/*.md*"]`
- [x] T007 Add Tailwind directives to `src/css/custom.css`: `@tailwind base; @tailwind components; @tailwind utilities;` (prepend before existing Infima variables)
- [x] T008 Replace `docusaurus.config.ts` with full configuration: title "Physical AI & Humanoid Robotics", tagline "From Digital Brain to Embodied Humanoid Intelligence", baseUrl "/physical-ai-humanoid-robotics-textbook/", url "https://yourusername.github.io", colorMode defaultMode "dark", navbar with Home/Modules/Hardware/Capstone links, footer with Panaversity copyright and GitHub link
- [x] T009 Replace `sidebars.ts` with explicit ordered sidebar: Introduction (intro-physical-ai), Module 1 ROS 2, Module 2 Gazebo & Unity, Module 3 NVIDIA Isaac, Module 4 VLA & Capstone, Hardware Requirements, Assessments & Capstone
- [x] T010 Delete all default Docusaurus sample docs content (docs/tutorial-basics/, docs/tutorial-extras/, blog/) to start clean
- [x] T011 Create `public/images/` directory with a `README.md` placeholder noting images are added in later spec

**Checkpoint**: `npm run build` or `npm run start` compiles without config errors.

---

## Phase 3: User Story 1 – Browse the Book Online (Priority: P1) 🎯 MVP

**Goal**: A student can land on the home page and navigate all 13-week curriculum via the sidebar.

**Independent Test**: Start dev server, click through all sidebar entries, verify each page renders with content and a "Next Module" link.

### Implementation for User Story 1

- [x] T012 [US1] Create `docs/index.md` — home page: H1 "Physical AI & Humanoid Robotics", intro paragraph (300 words), course overview table (13 weeks), "Start Learning →" link to intro-physical-ai
- [x] T013 [P] [US1] Create `docs/intro-physical-ai/index.md` — section index: H1 "Introduction to Physical AI", overview of Weeks 1–2, links to sub-pages
- [x] T014 [P] [US1] Create `docs/intro-physical-ai/week-1-2-foundations.md` — H1 "Foundations of Physical AI & Embodied Intelligence", learning objectives, 400-word body on Physical AI definition/sensor systems/why humanoids, Python ROS 2 hello-world code block, "Next Module →" link to Module 1
- [x] T015 [P] [US1] Create `docs/module-1-ros2/index.md` — H1 "Module 1: The Robotic Nervous System (ROS 2)", weeks 3–5 overview, rclpy intro paragraph, link to fundamentals page
- [x] T016 [P] [US1] Create `docs/module-1-ros2/week-3-5-ros2-fundamentals.md` — H1 "ROS 2 Architecture & Nodes", learning objectives, 400-word body on nodes/topics/services/actions, rclpy Python node code block, "Next Module →" link to Module 2
- [x] T017 [P] [US1] Create `docs/module-2-gazebo-unity/index.md` — H1 "Module 2: The Digital Twin (Gazebo & Unity)", weeks 6–7 overview, 350-word body on Gazebo physics/URDF/SDF intro, URDF snippet code block, "Next Module →" link to Module 3
- [x] T018 [P] [US1] Create `docs/module-3-nvidia-isaac/index.md` — H1 "Module 3: The AI-Robot Brain (NVIDIA Isaac)", weeks 8–10 overview, 350-word body on Isaac Sim/Isaac ROS/VSLAM/Nav2 intro, Isaac ROS launch file code block, "Next Module →" link to Module 4
- [x] T019 [P] [US1] Create `docs/module-4-vla-capstone/index.md` — H1 "Module 4: Vision-Language-Action (VLA) & Capstone", weeks 11–13 overview, 350-word body on Whisper+GPT voice-to-action pipeline, Python VLA pipeline code block, "Next Module →" link to Hardware Requirements
- [x] T020 [P] [US1] Create `docs/hardware-requirements.md` — H1 "Hardware Requirements", 400-word body covering workstation spec (RTX 4070 Ti+, 64GB RAM, Ubuntu 22.04), Jetson student kit (~$700), robot options (Unitree Go2/G1, Hiwonder), cloud vs on-premise comparison table, "Next Module →" link to Assessments
- [x] T021 [P] [US1] Create `docs/assessments-capstone.md` — H1 "Assessments & Capstone Project", 350-word body on weekly quizzes structure, lab assignments, final capstone (voice-command → navigate → grasp), grading rubric outline, no "Next" link (final page)

**Checkpoint**: All 10 docs files exist. `npm run start` shows sidebar with all 7 sections and every page renders.

---

## Phase 4: User Story 2 – Instructor Reviews Course Outline (Priority: P2)

**Goal**: Instructor can verify all 13 weeks are covered with learning objectives and code blocks.

**Independent Test**: Open each doc page and confirm heading, learning objectives section, ≥300 words body, and at least one fenced code block are present.

### Implementation for User Story 2

- [x] T022 [US2] Add explicit `sidebar_position` frontmatter to each of the 10 docs files ensuring sidebar order matches spec: index.md=1, intro-physical-ai=2, module-1=3, module-2=4, module-3=5, module-4=6, hardware=7, assessments=8
- [x] T023 [P] [US2] Add "## Learning Objectives" section to `docs/intro-physical-ai/week-1-2-foundations.md` with 4–5 bullet learning outcomes
- [x] T024 [P] [US2] Add "## Learning Objectives" section to `docs/module-1-ros2/week-3-5-ros2-fundamentals.md` with 4–5 bullet learning outcomes
- [x] T025 [P] [US2] Add "## Learning Objectives" section to each of: `docs/module-2-gazebo-unity/index.md`, `docs/module-3-nvidia-isaac/index.md`, `docs/module-4-vla-capstone/index.md`, `docs/hardware-requirements.md`, `docs/assessments-capstone.md`

**Checkpoint**: Every page has a "## Learning Objectives" section visible in browser.

---

## Phase 5: User Story 3 – Developer Runs Site Locally (Priority: P3)

**Goal**: `npm install && npm run start` succeeds with 0 errors from a clean clone.

**Independent Test**: Run `npm run build` — must exit with code 0, no TypeScript errors.

### Implementation for User Story 3

- [x] T026 [US3] Verify `tsconfig.json` has `"strict": false` to prevent TS errors on Docusaurus internals
- [x] T027 [US3] Run `npm run build` and fix any reported errors (broken links, missing files, TS issues)
- [x] T028 [P] [US3] Verify `postcss.config.js` exists and exports Tailwind + autoprefixer plugins correctly
- [x] T029 [P] [US3] Add `README.md` at repo root with: project title, `npm install && npm run start` quickstart, link to live deployment (placeholder URL), tech stack table

**Checkpoint**: `npm run build` exits 0. `npm run start` opens browser to home page.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Styling, mobile responsiveness, dark mode verification.

- [x] T030 Add custom CSS callout styles to `src/css/custom.css`: `.callout` card class with border-left accent, padding, and background — used for "💡 Key Concept" boxes in chapter pages
- [x] T031 Add at least one `.callout` block to `docs/intro-physical-ai/week-1-2-foundations.md` as a styled example
- [x] T032 Verify dark mode default renders correctly: open browser DevTools, confirm `html[data-theme='dark']` is set on page load
- [x] T033 Verify mobile viewport: using browser DevTools responsive mode at 320px width, confirm sidebar hamburger appears, no horizontal overflow

---

## Dependencies

```text
T001 → T002 → T003 → T004 → T005  (sequential setup)
T005 → T006 → T007 → T008 → T009 → T010 → T011  (sequential foundation)
T011 → T012 → T013–T021 [parallel]  (US1 content, parallel once T012 exists)
T021 → T022 → T023–T025 [parallel]  (US2 frontmatter/objectives)
T025 → T026 → T027 → T028–T029 [parallel]  (US3 build verification)
T029 → T030 → T031 → T032 → T033  (polish, sequential)
```

## Parallel Execution Groups

- **T013–T021**: All 9 chapter/section pages are independent files — can write all simultaneously.
- **T023–T025**: Adding Learning Objectives to different files — fully parallel.
- **T028–T029**: `postcss.config.js` check and `README.md` write — different files, parallel.

## Implementation Strategy

1. **MVP** (T001–T021): Get the site running with all pages. This satisfies User Story 1 completely.
2. **Content polish** (T022–T025): Add sidebar ordering and learning objectives for US2.
3. **Build validation** (T026–T029): Ensure clean build for US3/developer experience.
4. **Final polish** (T030–T033): Styling and responsive checks.

Total tasks: **33** | US1: 12 | US2: 4 | US3: 4 | Polish: 4 | Setup+Foundation: 11
