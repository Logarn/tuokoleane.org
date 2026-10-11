# Tuokoleane Catalogue of Kindness

[Tuokoleane Catalogue of Kindness](https://tuokoleane-marketplace.vercel.app/) is a simple way to discover practical acts of care. Visitors can browse ways to provide a meal, support education, give useful items, share time, or contribute to a wider Tuokoleane Initiative programme.

The project explores one clear idea: what if touching a life could be as easy as shopping online, while keeping dignity, clarity, and human connection at the centre?

## What people can do

- Browse and search a catalogue of practical kindness packages
- Filter opportunities by cause, including food, education, health, environment, and community care
- Swipe through a compact three-row mobile catalogue with clear next-card cues
- Save favourite listings in the browser without creating an account
- Open a dedicated page for each package and understand what it includes
- Explore the programmes behind the listings
- Combine fixed-price contributions, custom amounts, and time commitments in one basket
- Pay a monetary contribution using the published M-PESA Till details
- Send donation details, the M-PESA confirmation code, and an optional note to the TI team
- View real moments from Tuokoleane Initiative activities in a responsive gallery

Payments are made manually through M-PESA Till 9911113 under TUOKOLEANE INITIATIVE CBO. The checkout sends the donor-submitted payment reference and contribution details to `tuokoleaneinitiative@gmail.com`. Tuokoleane must match that code against its M-PESA records before confirming a donation. The site does not independently verify settlement, issue an automated receipt, or create a beneficiary match.

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

The application combines a client-side React interface with one server-side donation notification function:

- Package and programme content lives in `src/data.ts`.
- Page composition, routing, gallery behavior, basket state, and checkout live in `src/App.tsx`.
- Shared donation types and input validation live in `src/donations.ts`.
- `api/donations.ts` validates submissions and sends an internal email through Resend.
- Routes use the browser History API and are rewritten to `index.html` by `vercel.json`.
- The basket is stored under `ti-kindness-basket` in browser `localStorage`.
- Static brand, listing, programme, campaign, institution, and gallery assets live in `public/`.
- There is no donor account requirement or database. Payment is completed outside the app through M-PESA, while the server-side email is the TI team notification channel.

## Project structure

```text
src/
  App.tsx          Main application and interface flows
  App.test.tsx     Interaction and regression tests
  data.ts          Kindness packages and programme content
  donations.ts     Donation contract and validation
  styles.css       Responsive visual system
api/
  donations.ts     Server-side TI email notification
public/
  images/          Brand, listing, programme, campaign, and gallery assets
  icons/           Desktop and mobile favicons
scripts/           Asset import utilities
vercel.json        Production routing configuration
.env.example       Required email service variables
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

The test suite covers the home experience, catalogue filtering, individual routes, gallery behavior, fixed and custom contributions, time commitments, quantity controls, totals, removal, basket persistence, donation validation, and notification failures.

## Email configuration

The notification function requires these server-side environment variables on Vercel:

```text
RESEND_API_KEY
DONATION_EMAIL_FROM
DONATION_NOTIFICATION_TO
```

`DONATION_EMAIL_FROM` must use a sender address from a domain verified in Resend. `DONATION_NOTIFICATION_TO` defaults to `tuokoleaneinitiative@gmail.com` when it is omitted. Never expose the Resend key through a `VITE_` variable.

## Production path

The current manual M-PESA flow is intentionally small. A later fully integrated payment system still needs:

1. Safaricom Daraja callbacks for independent payment verification
2. A database for donation references, allocation, and fulfilment status
3. Automated donor receipts and fulfilment updates
4. An internal administration workflow for Tuokoleane coordinators
5. Confirmed safeguarding, privacy, receipt, allocation, and refund policies

Donor accounts are not required for the first production release. Guest contributions can remain the default, with optional passwordless accounts added later for history, receipts, recurring giving, and fulfilment updates.

## Image and brand notes

The Tuokoleane brand assets are based on organization-supplied material. The gallery includes real photographs supplied by Tuokoleane Initiative. Listing galleries use representative imagery and do not identify named beneficiaries or prove completed activities. Institution and county marks are stored locally, with source records in `public/images/reach/sources.json`.
