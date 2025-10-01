# Navratri Codethon — VAP AI Healthcare Suite

This repository contains a small healthcare demo web application built with Next.js (app router) that bundles multiple AI-powered utilities and telemedicine features. The project was prepared for a hackathon/codethon and includes components for symptom checking, telemedicine (chat + video), disease detection, transcription, report summarization, and a small demo `SmolVLM-webcam` static folder.

Summary
-------
- Framework: Next.js 14 (App Router), React 18
- Key areas: AI-assisted triage, telemedicine UI, health-risk prediction, disease detection, medical transcription, report summarizer, and a demo webcam/static site.
- Supabase is used for simple data storage (patients/doctors) in some components.

What is in this repository
---------------------------
- `app/` — Next.js app routes and API endpoints (telemedicine, transcribe, symptom analysis, etc.)
- `components/` — UI components and pages used inside the app (telemedicine bot, telemedicine UI, doctor assistant, sidebar, etc.)
- `lib/supabase/` — Supabase client/middleware helpers
- `public/smolvlm/` and `SmolVLM-webcam/` — small static/demo files
- `resources/` (outside the app) — dataset files, model artifacts and notebooks (large files). These are included locally but are large — see Notes below.
- `types/` — local TypeScript declaration overrides added during development

Highlights / Features
---------------------
- AI Health Assistant (chat): a simple client-side bot in `components/telemedicine-bot.tsx` (basic rule responses) and a more complete `Telemedicine` component that connects to a server-side AI chat endpoint.
- Telemedicine flow: quick actions allow users to open a WhatsApp chat with a doctor (prefilled message) and/or open a Jitsi room (telemedicine video) at `/telemedicine`.
- Doctor Assistant: create/choose doctors, schedule sessions, and save telemedicine sessions to Supabase.
- Several API endpoints (in `app/api/`) for disease detection, transcription, summarization, and symptom analysis. These are hooks to build on for model inference.

Quick start (dev) — Windows PowerShell
-------------------------------------
Prerequisites: Node.js (18+ recommended), npm or pnpm, and a Supabase project if you want to use the Supabase-backed flows.

1. Open PowerShell and change into the project folder:

```powershell
cd 'c:\Users\Aadarsh\Desktop\smolllp\navratri-codethon'
```

2. Install dependencies:

```powershell
npm install
```

3. Create a `.env.local` file (in project root) and add any needed environment variables. Example variables used in the project (if you use Supabase or AI services):

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# any other API keys your app needs
```

4. Run the dev server:

```powershell
npm run dev
```

5. Open the app in your browser at http://localhost:3000

Notes about Telemedicine flow
-----------------------------
- The `telemedicine-bot` component offers two flows:
  - Open WhatsApp chat with a prefilled message (desktop opens WhatsApp Web; mobile opens the app).
  - Open a Jitsi room (via meet.jit.si) in a new tab to quickly start a video call.
- The `/telemedicine` page contains a simple client UI to trigger Jitsi/WhatsApp. The full `Telemedicine` component contains more Supabase-backed flows (patient lookup, conversation saving, and AI chat) and is kept client-only where needed to avoid server-side import issues.

Large files / dataset & model notes
----------------------------------
- The `resources/` folder contains model files, notebooks and image datasets (for chest X-ray, etc.). Those files are large and are included locally for convenience, but they are not ideal in a Git repo:
  - If you want these files tracked in GitHub, keep in mind they will bloat the repository.
  - If you want them removed from the repository history, we can run a history-rewrite (git filter-repo or BFG) and then force-push; this is destructive to history and requires collaborators to re-clone.
  - Alternatively store large artifacts in dedicated storage (S3, GCP bucket, Hugging Face, or Git LFS) and reference them in README.

I already added a `.gitignore` to exclude build artifacts and environment files. You may want to add `resources/*.pkl`, `resources/*.h5`, and `resources/*/*.zip` to `.gitignore` if you prefer not to keep binaries in the repo.

Repository housekeeping commands (examples)
----------------------------------------
- Remove large file from history (example — only do after backup and confirmation):

```powershell
# Install git-filter-repo (recommended) and run locally
# Example command (dangerous — rewrites history):
# git filter-repo --path 'resources/xray pnemonia/person2_bacteria_4.zip' --invert-paths
# git push origin --force
```

- To remove the `resources` folder from the repo (current tip) and keep it locally:

```powershell
git rm -r --cached resources
echo "resources/" >> .gitignore
git add .gitignore
git commit -m "Remove resources from tracking; add to .gitignore"
git push origin main
```

Development notes and troubleshooting
-----------------------------------
- If you see TypeScript errors about missing module types (for example `@vercel/analytics/next`), there are local declaration files in `types/` added to silence/cover missing types.
- Some packages (Supabase realtime, etc.) use Node APIs that are not allowed in Edge runtimes; the code contains some client/server separations and dynamic imports to avoid importing Node-specific modules server-side.

Where to look in the code for core flows
---------------------------------------
- Telemedicine bot UI: `components/telemedicine-bot.tsx`
- Full telemedicine UI + Supabase flows: `components/telemedicine.tsx` and `app/telemedicine/page.tsx`
- Doctor Assistant CRUD UI: `components/doctor-assistant.tsx`
- API routes: `app/api/*` (disease-detection, telemedicine, transcribe, etc.)

SmolVLM-webcam
---------------
- I copied a small `SmolVLM-webcam` demo folder into the repo; it contains a static `index.html` and a small `.gitignore`. You can remove or move this folder if not needed.

Contributing
------------
- Feel free to open issues or PRs. If you want help splitting large datasets out of Git history, say so and I can help with a safe plan (backup, filter-repo, or use Git LFS).

License
-------
This repository currently has no explicit license. If you want to publish it, add a LICENSE file (MIT is a common choice for demo projects).

Contact / next steps
---------------------
- Tell me if you want the `resources/` datasets removed from the Git history (I can prepare a safe plan and run the rewrite with your confirmation).
- If you want the telemedicine page to mount the full `Telemedicine` client UI instead of the lightweight page I added, I can change that to a dynamic import.

Enjoy — open an issue or ask me to make additional adjustments (per-doctor WhatsApp numbers, confirmation modal before external redirects, demo data cleanup, etc.).
