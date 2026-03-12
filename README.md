# HireDesk

HireDesk is an AI-assisted recruitment platform for modern hiring teams. It helps recruiters publish jobs, manage candidate pipelines, schedule interviews, and review applications from a fast, polished frontend experience.

[Watch the product demo](https://youtu.be/nMn61d0CL9M?si=UHnCBwC23nRiR8pK)

## What HireDesk Covers

- Recruiter-facing job creation and application management
- Candidate job discovery and application tracking
- Email verification and authentication flows
- Resume analysis and AI-assisted guidance
- Interview scheduling and browser-based interview experiences
- Pricing, legal, and onboarding flows for production deployment

## Product Highlights

- Clean recruiter dashboard for posting and managing roles
- Candidate dashboard with application visibility and status tracking
- Frontend-first UX built for speed on desktop and mobile
- AI-powered resume and assistant experiences
- Interview room components, video-call UI, and proctoring-related flows
- Vercel-compatible serverless endpoints for Gemini-backed features

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Axios
- Firebase Auth
- Framer Motion
- PeerJS
- Google Generative AI SDK

## Demo

The latest demo is available here:

- `https://youtu.be/nMn61d0CL9M?si=UHnCBwC23nRiR8pK`

## Local Development

```bash
git clone https://github.com/darshankerkar/HireDesk.git
cd HireDesk
npm install
npm run dev
```

The app starts locally on `http://localhost:5173` by default.

## Environment

Create a local `.env` file for frontend-only configuration. Typical variables include:

```bash
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Server-side Gemini routes should use server environment variables rather than exposing model keys in the browser bundle.

## Deployment

This public repository is the frontend-facing codebase. Backend and ML services are maintained separately.

Typical deployment flow:

1. Configure frontend environment variables.
2. Point `VITE_API_URL` at the deployed backend.
3. Deploy the app to Vercel or another static/frontend hosting platform.
4. Configure server-side Gemini environment variables for API routes.

## Repository Scope

This repository contains the public frontend application only.

Private services are managed separately:

- Backend service
- ML service

## Contributing

If you want to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes with clear commit messages.
4. Open a pull request with context, screenshots, and testing notes when relevant.

## License

See [LICENSE](LICENSE).
