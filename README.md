# iSolve Coding Club

A responsive, bilingual website for **iSolve Coding Club**, an iTeam initiative at Al-Zaytoonah University of Jordan. The club brings students together every Thursday to learn programming techniques, practise problem-solving, and grow through teamwork.

**[Explore the live website → isolve.live](https://isolve.live/)**

## Features

- Arabic and English support, including right-to-left layouts.
- Single-page navigation through the club overview, team, moments, registration, and FAQs.
- Photo gallery with category filters and a full-screen viewer, plus session videos that load on demand.
- Direct registration through Google Forms and a responsive layout for desktop and mobile.

## Technologies

| Area | Technologies |
| --- | --- |
| Frontend | React 19, JavaScript, HTML, CSS |
| Development tooling | Vite, Node.js, npm |
| Localization | i18next, react-i18next |
| Icons | Lucide React |
| Media optimization | Sharp, FFmpeg |
| Code quality and testing | ESLint, Node.js Test Runner, Playwright |

## Run locally

Use the Node.js version specified in [`.node-version`](.node-version), then run:

```sh
npm ci --include=dev
npm run dev
```

Build for production with `npm run build`. The website is fully static and requires no backend, database, or environment variables.

## Deployment

Hosted on **Render**, with the custom domain **isolve.live** registered through **Hostinger** and connected to Render using DNS.

> Once you're iTeam, You're always iTeam
