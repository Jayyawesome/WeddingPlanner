# Adorereve

Soft Y2K Wedding Planner landing page. Price: RM30.

Run `npm start`, then open http://127.0.0.1:4173. Static public files are in `dist/`. Run `npm run check` to check JavaScript syntax.

## Connect checkout

Set `checkoutUrl` in `dist/config.js` to the full HTTPS purchase URL. The purchase button will navigate there, and the coming-soon message will update automatically. An empty or invalid URL retains the honest coming-soon dialog. Payment and digital delivery must be configured with the checkout provider; this static site does not collect payments or store customer data.

The workbook itself is intentionally not in the public assets. Previews are images of the actual workbook. No testimonials, discounts, stock counters, or unverified compatibility claims are used.

## Before opening sales

The supplied workbook contained existing formula errors that were not part of the visual restyle. Verify and resolve those before delivery to customers. Confirm the original template's resale terms before distributing it. Set up the checkout provider's delivery, contact, and refund details before linking it.
