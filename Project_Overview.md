# Quest Quiz Share - Project Overview

## Project Description

Quest Quiz Share is a web application that allows users to create, share, and respond to quizzes. It features user authentication, quiz creation, public sharing via links, and response analytics. The project is built with React, TypeScript, Vite, Supabase, shadcn-ui, and Tailwind CSS.

---

## Folder & File Structure Overview

### Root Files

- **index.html**: The main HTML file loaded by Vite.
- **package.json**: Project dependencies and scripts.
- **vite.config.ts**: Vite configuration.
- **tailwind.config.ts**: Tailwind CSS configuration.
- **vercel.json**: Vercel rewrite rules for SPA routing.
- **README.md**: Project documentation.

### public/

- **favicon.ico, robots.txt, placeholder.svg**: Static assets served directly.

### src/

Main source code folder.

#### App.tsx, App.css, index.css, main.tsx

- **App.tsx**: Root React component, sets up routing and layout.
- **App.css, index.css**: Global styles.
- **main.tsx**: Entry point, renders the React app.

#### components/

Reusable UI and layout components.

- **Navbar.tsx**: Top navigation bar, handles user info and auth actions.
- **AuthModal.tsx**: Modal for user authentication.
- **ui/**: Collection of UI primitives (buttons, cards, forms, etc.) from shadcn-ui, used throughout the app.

#### hooks/

Custom React hooks.

- **use-toast.ts**: Toast notification logic.
- **use-mobile.tsx**: Utility for mobile device detection.

#### integrations/supabase/

Supabase integration and types.

- **client.ts**: Initializes the Supabase client using environment variables.
- **types.ts**: TypeScript types for Supabase tables and responses.

#### lib/

Helper utilities and API logic.

- **supabase.ts**: Additional Supabase-related helpers.
- **utils.ts**: General utility functions.

#### pages/

Main application pages (routed via React Router).

- **Index.tsx**: Landing page.
- **Dashboard.tsx**: User dashboard, shows quizzes and analytics.
- **CreateQuiz.tsx**: Page for creating new quizzes.
- **QuizView.tsx**: Public quiz view and response submission.
- **QuizResponses.tsx**: View responses and analytics for a quiz.
- **NotFound.tsx**: 404 page for unmatched routes.

#### supabase/

Database configuration and migrations.

- **config.toml**: Supabase project config.
- **migrations/**: SQL migration files for database schema.

---

## How the App Works

1. **Authentication**: Users sign up/sign in via Supabase Auth.
2. **Quiz Creation**: Authenticated users create quizzes from the dashboard.
3. **Sharing**: Each quiz has a unique public link that can be shared.
4. **Quiz Taking**: Anyone with the link can view and submit responses (if RLS policies allow public read).
5. **Analytics**: Quiz owners can view responses and analytics in their dashboard.

---

## Deployment

- Deployable to Vercel or any static host.
- Requires environment variables for Supabase URL and key.
- `vercel.json` ensures SPA routing works on Vercel.

---

## Contact

For questions or contributions, see the repository or contact the maintainer.
