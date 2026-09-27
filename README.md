# Adorereve

Soft Y2K Wedding Planner landing page. Price: RM30.

Run `npm start`, then open http://127.0.0.1:4173. Static public files are in `dist/`. Run `npm run check` to check JavaScript syntax.

## Pipedream Connect owner integration

Owner page: `/admin/integrations`. Uses the official `@pipedream/sdk` and hosted Connect Link.
The existing project is fixed as `proj_ddsvbz5`, environment `production`; no new project is created.
The authenticated owner always maps to external user `adorereve-owner`. This is not a customer account system.

In Hostinger's Node.js environment settings, add these server-only variables, preserving any existing variables:

- `PIPEDREAM_CLIENT_ID`: OAuth client ID from the Pipedream workspace API settings.
- `PIPEDREAM_CLIENT_SECRET`: the corresponding OAuth client secret (not a Hostinger or CHIP key).
- `CONNECT_ADMIN_PASSWORD`: unique random password, at least 24 characters. Browser login username: `admin`.
- `APP_ORIGIN`: `https://adorereve.com`.

Restart the Node.js application after setting the variables. Never put secrets in `dist/config.js`, GitHub, or chat.
The page and API deliberately return 503 until all credentials are present. A valid owner login is then required.
Enter an app slug such as `google_drive`; Pipedream handles the provider's consent flow.
After returning, verify the account in the project's production Connected Accounts dashboard.
This integration does not send emails, execute actions, or implement CHIP fulfillment.
Hostinger SMTP delivery and CHIP signature/payment verification remain separate work.

For local use, copy `.env.example` to `.env`, enter credentials locally and set `APP_ORIGIN=http://127.0.0.1:4173`.
Start with `node --env-file=.env server.cjs`. Authentication checks use local mock clients in `npm test` and do not contact Pipedream.

Docs: https://pipedream.com/docs/connect/quickstart and https://pipedream.com/docs/connect/managed-auth/quickstart

## Checkout configuration

Set `checkoutUrl` in `dist/config.js` to the full HTTPS purchase URL. The purchase button will navigate there, and the coming-soon message will update automatically. An empty or invalid URL retains the honest coming-soon dialog. Payment and digital delivery must be configured with the checkout provider; this static site does not collect payments or store customer data.

The workbook itself is intentionally not in the public assets. Previews are images of the actual workbook. No testimonials, discounts, stock counters, or unverified compatibility claims are used.

## Before opening sales

The supplied workbook contained existing formula errors that were not part of the visual restyle. Verify and resolve those before delivery to customers. Confirm the original template's resale terms before distributing it. Set up the checkout provider's delivery, contact, and refund details before linking it.
