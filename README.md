# Pristine Laundry Admin — React + Supabase

Pristine is now packaged as a React application using Vite. The project preserves the dashboard's four views, quick actions, customer/order table, CSV export, new-order modal, revenue graph, AI insight panel, and Supabase authentication/data integration.

## Requirements

- Node.js 22.12+ (Node 22 LTS is recommended)
- npm
- A Supabase project for shared records (optional for local preview mode)

## Run the application

1. Extract the project folder and open it in VS Code.
2. Open a terminal in the project folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create your local environment file:

   **Windows PowerShell**

   ```powershell
   Copy-Item .env.example .env
   ```

   **macOS / Linux**

   ```bash
   cp .env.example .env
   ```

5. If using Supabase, edit `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` using values from your Supabase project. Use the publishable key or legacy anon key only; do not use a secret or `service_role` key in a browser application.
6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open the local URL printed by Vite (usually `http://localhost:5173`). Restart the server after changing `.env`.

## Connect Supabase

1. Open your Supabase project and go to **SQL Editor → New query**.
2. Run `supabase/pristine_supabase_setup.sql`.
3. In **Authentication → Users**, create or invite a staff user. Keep public sign-ups disabled.
4. Copy the Project URL and publishable key to `.env`.
5. Ensure the local development URL and production domain are listed under Supabase Auth's allowed redirect/site URL settings as required by your setup.
6. Run `npm run dev` and sign in with the staff user you created.

The current SQL grants every authenticated staff user access to all Pristine records. It is a basic shared-staff policy, not a per-role permission model. Configure staff permissions more narrowly before expanding access.

## Build for deployment

```bash
npm run build
npm run preview
```

Vite outputs the production site to `dist/`. Deploy that folder to a static hosting service that supports single-page frontend assets, and set the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` environment values in the hosting project before building.

## Notes about records

- Without Supabase credentials, the dashboard runs in browser-only preview mode with sample/local records.
- With Supabase configured, users must sign in to access shared records.
- Customer profiles are upserted using a normalized phone number, and new orders are connected to the matching customer.
- Existing `localStorage` records are not automatically moved to Supabase. Export your CSV backup and check/import it separately before using this as a live production system.
- The dashboard's UI actions and data rendering currently use a compatibility module (`src/legacy-dashboard.js`) adapted from the previous HTML prototype. UI structure and layout are rendered with React components. This keeps the existing behavior intact while providing a runnable React/Vite project; business logic can be progressively refactored into React hooks and services later.

## Environment safety

The `.env` file is ignored by Git. Any variable prefixed with `VITE_` is exposed to the browser at build time, so values must be suitable for public frontend use. Never expose Supabase secret or `service_role` keys.
