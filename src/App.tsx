
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CreateQuiz from "./pages/CreateQuiz";
import EditQuiz from "./pages/EditQuiz";
import QuizView from "./pages/QuizView";
import QuizResponses from "./pages/QuizResponses";
import NotFound from "./pages/NotFound";

const App = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/create" element={<CreateQuiz />} />
    <Route path="/edit/:id" element={<EditQuiz />} />
    <Route path="/quiz/:id" element={<QuizView />} />
    <Route path="/quiz/:id/responses" element={<QuizResponses />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
