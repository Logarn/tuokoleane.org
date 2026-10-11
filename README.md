# Tuokoleane Catalogue of Kindness

[Tuokoleane Catalogue of Kindness](https://tuokoleane-marketplace.vercel.app/) is a simple way to discover practical acts of care. Visitors can browse ways to provide a meal, support education, give useful items, share time, or contribute to a wider Tuokoleane Initiative programme.

The project explores one clear idea: what if touching a life could be as easy as shopping online, while keeping dignity, clarity, and human connection at the centre?

## What people can do

- Browse and search a catalogue of practical kindness packages
- Filter opportunities by cause, including food, education, health, environment, and community care
- Open a dedicated page for each package and understand what it includes
- Explore the programmes behind the listings
- Combine fixed-price contributions, custom amounts, and time commitments in one basket
- View real moments from Tuokoleane Initiative activities in a responsive gallery

The current checkout is a transparent product demonstration. It does not collect money, send email, create a beneficiary match, or submit a real pledge to Tuokoleane Initiative.

## The vision

Tuokoleane Initiative is building an "Amazon of Charity": a place where anyone, anywhere, can quickly find a meaningful way to Give. Share. Care.

The long-term product can connect individual acts of kindness with verified needs, clear coordination, secure payments, and practical fulfilment updates. The experience is designed to remain guest-friendly so that helping does not begin with unnecessary account creation.

## Built with

- React 19
- TypeScript 7
- Vite 8
- Vitest and Testing Library
- Lucide React icons
- Handwritten responsive CSS
- Bun for dependency management and scripts
- Vercel for hosting and SPA routing

## How it works

The application is currently a client-side React prototype:

- Package and programme content lives in `src/data.ts`.
- Page composition, routing, gallery behavior, basket state, and the demo checkout live in `src/App.tsx`.
- Routes use the browser History API and are rewritten to `index.html` by `vercel.json`.
- The basket is stored under `ti-kindness-basket` in browser `localStorage`.
- Static brand, listing, programme, campaign, institution, and gallery assets live in `public/`.
- There is no backend, authentication service, database, payment provider, or transactional email service yet.

## Project structure

```text
src/
  App.tsx          Main application and interface flows
  App.test.tsx     Interaction and regression tests
  data.ts          Kindness packages and programme content
  styles.css       Responsive visual system
public/
  images/          Brand, listing, programme, campaign, and gallery assets
  icons/           Desktop and mobile favicons
scripts/           Asset import utilities
vercel.json        Production routing configuration
```

## Run locally

```bash
bun install
bun run dev
```

## Verify a change

```bash
bun run test
bun run build
```

The test suite covers the home experience, catalogue filtering, individual routes, gallery behavior, fixed and custom contributions, time commitments, quantity controls, totals, removal, and basket persistence.

## Production path

Before accepting real pledges or payments, the project needs:

1. A server-side API that validates packages and contribution amounts
2. A database for pledges, payment references, allocation, and fulfilment status
3. A secure M-Pesa and card payment flow
4. Transactional confirmation and update messages
5. An internal administration workflow for Tuokoleane coordinators
6. Confirmed safeguarding, privacy, receipt, allocation, and refund policies

Donor accounts are not required for the first production release. Guest contributions can remain the default, with optional passwordless accounts added later for history, receipts, recurring giving, and fulfilment updates.

## Image and brand notes

The Tuokoleane brand assets are based on organization-supplied material. The gallery includes real photographs supplied by Tuokoleane Initiative. Listing galleries use representative prototype imagery and do not identify named beneficiaries or prove completed activities. Institution and county marks are stored locally, with source records in `public/images/reach/sources.json`.
