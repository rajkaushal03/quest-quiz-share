# Quest Quiz Share

## Project Info

A web application for creating, sharing, and responding to quizzes. Built with React, TypeScript, Vite, Supabase, shadcn-ui, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js & npm (recommended: use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Running the Development Server

```sh
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

## Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## Deployment

You can deploy this project to any static hosting provider (e.g., Vercel, Netlify). For Vercel:

1. Push your code to a GitHub repository.
2. Import the repo into Vercel.
3. Set the environment variables in the Vercel dashboard (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
4. Add a `vercel.json` file with the following content to enable SPA routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

5. Deploy!

## Custom Domain

To use a custom domain, follow your hosting provider's instructions for domain setup.

## License

MIT
