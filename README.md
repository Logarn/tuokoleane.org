# Tuokoleane Catalogue of Kindness

An interactive MVP for Tuokoleane Initiative’s “Amazon of Charity” idea: people browse practical kindness packages, combine money and time commitments, and complete a transparent demo pledge flow.

## What works

- Searchable, filterable kindness marketplace
- Individual, shareable listing routes under `/listing/:id`
- Four-image listing galleries with representative prototype photography
- Fixed-price, custom-amount and time-based packages
- Persistent local basket with quantity controls
- Responsive listing, gallery, checkout and confirmation flows
- Honest preview boundary: no payment, email, allocation or volunteer placement is created
- Accessible labels and reduced-motion support

## Image and brand boundary

The blue Tuokoleane logo is rendered from the organization-supplied PDF. Listing photographs are AI-generated representative imagery for the prototype; they are not beneficiary records or evidence of completed Tuokoleane activities. That disclosure also appears on every listing page.

## Run locally

```bash
bun install
bun run dev
```

## Verify

```bash
bun run test
bun run build
```

## Production work still required

Before this can accept real donations at `tuokoleane.org`, Tuokoleane Initiative needs to confirm the receiving entity and account, payment provider, refund policy, safeguarding rules, beneficiary verification, allocation workflow, receipts, privacy terms and donor-update process.
