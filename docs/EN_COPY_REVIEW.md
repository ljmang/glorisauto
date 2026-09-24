# English Copy Review — First-Pass Findings

Scope: representative live English pages plus the current generated English page set. This is a first-pass review, not a line-by-line approval of every CMS article, FAQ, product specification, or legal statement. The findings below are content-managed in Strapi; do not treat this document as authorization to change technical values or unverified claims.

## Safe editorial corrections

### Distributor page

Page: <https://www.glorisauto.com/en/about/dealer/>

- Form label: `Country/Regionl` → `Country/Region`.
- Step 4 body: `Start the Partnership Launch your distribution plan and grow the market together.` → `Launch your distribution plan and grow your market with us.`
- Product-family bullets need sentence-case labels and complete parallel phrasing. Suggested draft:
  - `Abrasive products: film sanding discs, wet/dry sandpaper, fine sanding sponges, and mesh sanding discs for automotive refinishing.`
  - `Body fillers: fast-drying and lightweight fillers, plus hardeners for automotive repair.`
  - `Automotive clear coats: high-hardness 2K clear coats and matching hardeners for vehicle refinishing.`
  - `Polishing products: high-gloss finishing polish and polishing compounds for automotive paint correction.`
  - `Automotive window films: clear windshield and rear-window films designed to reduce solar heat.`

Confirm that these descriptions accurately reflect the range before publishing, especially the intended use of hardeners and window-film performance claims.

### Insights listing

Page: <https://www.glorisauto.com/en/about/insights/>

- Replace Chinese brand text and translator notes in English titles and summaries with the approved English brand form, `Parrot® Gloris`.
- Example: `This article compares,鹦鹉®(In English “Parrot”) 2K Alloy Putty...` → `This article compares Parrot® Gloris 2K Alloy Putty with imported body filler...`
- Replace Chinese punctuation in English copy (for example, `Lited Group，one` → `Lited Group, one`).

## Product details requiring owner confirmation

### 2K Medium Solid Clear Coat 1100 — 1 L Kit

Page: <https://www.glorisauto.com/en/products/clear-coat/2k-ms-clear-coat-1l/>

- The page title says `1L Kit`, while the overview says `5L kit`.
- The packaging field says `Hardener: 0..5 L`. Confirm whether the intended amount is `0.5 L` before changing the decimal.
- The product-type field contains Chinese characters and lacks spacing: `1L Set 鹦鹉®Gloris...`. Suggested English format after confirmation: `1 L kit — Parrot® Gloris 2K MS Clear Coat 1100`.
- Confirm the basis and exact notation for `Clear Coat: Hardener: Thinner = 2: 1:10%-30%` against the approved technical data sheet before reformatting.
- Confirm support for absolute/comparative claims such as compatibility with named coating systems and any performance promises before editing them.

## Remaining site-wide editorial work

- Apply the working glossary in `EN_COPY_STYLE_GUIDE.md` to CMS-managed product names, page titles, article titles, form labels, and footer category labels.
- Review all English product descriptions and technical-resource pages against their approved source data; prioritize sizes, package contents, ratios, drying times, coverage, MOQ, and units.
- Review the remaining insight articles, FAQs, help-center articles, and dealer-support copy for untranslated text, duplicated content, unnatural phrasing, and unsupported claims.
- The English privacy-policy strings are dated February 2025. Have the policy owner confirm whether the policy has changed and update the date only after that review; do not advance the date automatically.
