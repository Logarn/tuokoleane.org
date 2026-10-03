# Tuokoleane Catalogue of Kindness

An interactive MVP for Tuokoleane Initiative’s “Amazon of Charity” idea: people browse practical kindness packages, combine money and time commitments, and complete a transparent demo pledge flow.

## What works

- Searchable, filterable kindness marketplace
- Twelve cause listings across food, education, wellness, community care and the environment
- Individual, shareable listing routes under `/listing/:id`
- Four-image listing galleries with representative prototype photography
- Seven photo-led initiative pages under `/program/:id`
- A reduced-motion-friendly reach marquee for campuses and counties
- Fixed-price, custom-amount and time-based packages
- Persistent local basket with quantity controls
- Responsive listing, gallery, checkout and confirmation flows
- Honest preview boundary: no payment, email, allocation or volunteer placement is created
- Accessible labels and reduced-motion support

## Image and brand boundary

The blue Tuokoleane logo is rendered from the organization-supplied PDF. Listing photographs are AI-generated representative imagery for the prototype; they are not beneficiary records or evidence of completed Tuokoleane activities. Selected initiative cards use real photographs supplied through Tuokoleane Initiative’s public Instagram archive and are labelled as archive photography in the interface.

The campus and county reach strip currently uses typographic name marks rather than third-party logos. This avoids implying endorsement or exceeding a named institution’s brand-use permission until Tuokoleane confirms written authorization.

## Importing organization archive photography

The importer uses the InstaSave endpoint requested by the organization and records the original Instagram post beside each imported set.

```bash
node scripts/import-instagram.mjs "https://www.instagram.com/tuokoleaneinitiative/p/POST_ID/" public/images/authentic/collection-name
```

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
