# Quest Quiz Share - Interview Questions and Answers

---

## 1. What is the main purpose of the Quest Quiz Share application?

**Answer:**
It allows users to create, share, and respond to quizzes online, with analytics for quiz owners.

---

### 2. Which technologies and frameworks are used in this project?

**Answer:**
React, TypeScript, Vite, Supabase, shadcn-ui, Tailwind CSS, React Query, React Router, and Vercel for deployment.

---

### 3. How does SPA (Single Page Application) routing work in this project, and why is the vercel.json file important?

**Answer:**
SPA routing is handled by React Router. The vercel.json file rewrites all routes to index.html so the client-side router can handle navigation, preventing 404 errors on refresh or direct links.

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

### 4. Describe the role of Supabase in this application. What features of Supabase are used?

**Answer:**
Supabase provides authentication, a Postgres database, and Row Level Security (RLS) for data access control. It is used for storing users, quizzes, questions, and responses.

```ts
// src/integrations/supabase/client.ts
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

---

### 5. How is user authentication handled in the app?

**Answer:**
User authentication is managed by Supabase Auth, with sign-in/sign-up modals and session management in the frontend.

```ts
// src/pages/Dashboard.tsx
supabase.auth.getSession().then(({ data: { session } }) => {
  setUser(session?.user ?? null);
  // ...
});
```

---

### 6. Explain the database schema for quizzes, questions, and responses. How are they related?

**Answer:**
A quiz has many questions. Each question belongs to a quiz. Responses are linked to both a quiz and a question, and store user answers.

```sql
-- SQL (see supabase/migrations/*.sql)
CREATE TABLE public.quizzes (...);
CREATE TABLE public.questions (
  quiz_id UUID REFERENCES public.quizzes(id) ...
);
CREATE TABLE public.responses (
  quiz_id UUID REFERENCES public.quizzes(id),
  question_id UUID REFERENCES public.questions(id),
  ...
);
```

---

### 7. What is Row Level Security (RLS) in Supabase, and how is it used in this project?

**Answer:**
RLS restricts which rows users can access. In this project, it ensures users can only manage their own quizzes/questions, but anyone can view questions and submit responses. Only quiz owners can view all responses.

```sql
-- SQL Policy Example
CREATE POLICY "Anyone can view questions to answer them" ON public.questions
  FOR SELECT USING (true);
```

---

### 8. How does the sharing functionality work for quizzes? What happens when a user clicks the Share button?

**Answer:**
Clicking Share copies a public quiz link to the clipboard. Anyone with the link can access the quiz if RLS allows public read access.

```ts
// src/pages/Dashboard.tsx
const copyQuizLink = async (quizId: string) => {
  const url = `${window.location.origin}/quiz/${quizId}`;
  await navigator.clipboard.writeText(url);
  toast({ title: "Link copied!" });
};
```

---

### 9. What is the purpose of the cn utility function in src/lib/utils.ts?

**Answer:**
It combines and merges Tailwind CSS class names, removing duplicates and resolving conflicts, for cleaner dynamic className logic in React components.

```ts
// src/lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

### 10. How are context providers (like QueryClientProvider, TooltipProvider, Toaster) organized in the app, and why?

**Answer:**
They are wrapped around the App component in main.tsx to provide global state, tooltips, and notifications throughout the app.

```tsx
// src/main.tsx
<QueryClientProvider client={queryClient}>
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </TooltipProvider>
</QueryClientProvider>
```

---

### 11. What is the function of the types.ts file in the Supabase integration?

**Answer:**
It defines TypeScript types for the database schema, enabling type-safe queries and autocompletion when using Supabase in the app.

```ts
// src/integrations/supabase/types.ts
export type Database = {
  public: {
    Tables: {
      quizzes: { ... },
      questions: { ... },
      responses: { ... }
    }
  }
}
```

---

### 12. How does the app ensure that quiz links are accessible to non-authenticated users?

**Answer:**
By setting RLS policies to allow public SELECT access on the questions table, so anyone can view and answer quizzes via shared links.

```sql
-- SQL
CREATE POLICY "Anyone can view questions to answer them" ON public.questions
  FOR SELECT USING (true);
```

---

### 13. What would happen if the vercel.json rewrite rule was missing or misconfigured?

**Answer:**
Direct navigation or refresh on non-root routes would result in a 404 error, because Vercel would not serve index.html for those routes.

```json
// vercel.json (required for SPA)
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

### 14. How are responses to quizzes stored and linked to specific quizzes and questions?

**Answer:**
Each response record includes quiz_id and question_id fields, linking it to the relevant quiz and question in the database.

```sql
-- SQL
CREATE TABLE public.responses (
  quiz_id UUID REFERENCES public.quizzes(id),
  question_id UUID REFERENCES public.questions(id),
  ...
);
```

---

### 15. How would you add a new feature, such as quiz expiration or time limits, to this project?

**Answer:**
Add new fields (e.g., expires_at) to the quizzes table, update the frontend to handle expiration logic, and adjust RLS or UI to prevent access to expired quizzes.

```sql
-- SQL Example
ALTER TABLE public.quizzes ADD COLUMN expires_at TIMESTAMP;
```
