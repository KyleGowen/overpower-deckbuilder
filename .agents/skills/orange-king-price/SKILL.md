---
name: orange-king-price
description: Look up current USD card prices on The Orange King Shopify store from a card name. Use when Kyle asks for The Orange King, theOrangeKing, Orange King, TOK, or OverPower retail baseline pricing and wants a single card price or a small batch of card price lookups.
---

# Orange King Price

Use the bundled scraper first. This is deterministic web scraping, so use the lowest available tool-capable model tier for the task; escalate model strength only if the site markup changes, the product match is ambiguous, or the user asks for broader price analysis.

## Quick Start

Run:

```bash
python3 .agents/skills/orange-king-price/scripts/orange_king_price.py "Spider-Man - Web"
```

For set-specific pricing, pass the The Orange King collection alias:

```bash
python3 .agents/skills/orange-king-price/scripts/orange_king_price.py "Daredevil" --collection powersurge
```

Default output is only the USD amount, for example:

```text
$2.50
```

## Workflow

1. Accept the user input as the card name.
2. Run `scripts/orange_king_price.py "<card name>"`. When the user names a set, include `--collection <set-or-handle>`.
3. Return exactly the USD amount when the script succeeds.
4. If the script exits nonzero because the match is ambiguous, ask for a more specific card name and include the candidate titles only if useful.
5. If the site is unavailable or changes shape, do a fresh logged-out read of `https://theorangeking.com/` or the relevant Shopify product page, then patch the script before trusting the result.

## Accuracy Rules

- Prefer exact or leading-segment product title matches over broad search order.
- Treat the displayed Shopify product price as the retail baseline, regardless of inventory status, unless the user asks for in-stock-only pricing.
- Do not use The Orange King's eBay account/listings for this skill.
- Do not add shipping, tax, discounts, or cart behavior. The output is the listed product price only.
- For ambiguous inputs like a character-only name with many specials, fail closed instead of guessing.
