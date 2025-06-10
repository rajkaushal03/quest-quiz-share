
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { supabase, Quiz, Question, Response } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';

interface ResponseWithQuestion extends Response {
  question: Question;
}

interface SessionResponse {
  session_id: string;
  submitted_at: string;
  responses: ResponseWithQuestion[];
}

const QuizResponses = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionResponses, setSessionResponses] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user && id) {
        fetchQuizAndResponses(id, session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && id) {
        fetchQuizAndResponses(id, session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [id]);

  const fetchQuizAndResponses = async (quizId: string, userId: string) => {
    try {
      // Fetch quiz and verify ownership
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .eq('user_id', userId)
        .single();

      if (quizError) throw quizError;

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsError) throw questionsError;

      // Fetch responses with questions
      const { data: responsesData, error: responsesError } = await supabase
        .from('responses')
        .select(`
          *,
          questions (*)
        `)
        .eq('quiz_id', quizId)
        .order('submitted_at', { ascending: false });

      if (responsesError) throw responsesError;

      // Group responses by session
      const grouped: Record<string, SessionResponse> = {};
      responsesData.forEach((response: any) => {
        if (!grouped[response.session_id]) {
          grouped[response.session_id] = {
            session_id: response.session_id,
            submitted_at: response.submitted_at,
            responses: [],
          };
        }
        grouped[response.session_id].responses.push({
          ...response,
          question: response.questions,
        });
      });

      setQuiz(quizData);
      setQuestions(questionsData);
      setSessionResponses(Object.values(grouped));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!quiz || !questions.length || !sessionResponses.length) return;

    const headers = ['Submission Date', ...questions.map(q => q.question_text)];
    const rows = sessionResponses.map(session => {
      const row = [new Date(session.submitted_at).toLocaleString()];
      questions.forEach(question => {
        const response = session.responses.find(r => r.question_id === question.id);
        row.push(response?.answer_text || '');
      });
      return row;
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${quiz.title}-responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} onAuthClick={() => {}} />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="text-center">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Quiz not found</h3>
              <p className="text-muted-foreground mb-4">
                The quiz doesn't exist or you don't have permission to view its responses.
              </p>
              <Link to="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onAuthClick={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-4">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{quiz.title}</h1>
              <p className="text-muted-foreground">Quiz Responses</p>
            </div>
            {sessionResponses.length > 0 && (
              <Button onClick={exportToCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </div>

        {sessionResponses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">No responses yet</h3>
              <p className="text-muted-foreground mb-4">
                Share your quiz to start collecting responses
              </p>
              <Link to={`/quiz/${quiz.id}`}>
                <Button variant="outline">View Quiz</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{sessionResponses.length}</div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{questions.length}</div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {Math.round((sessionResponses.length / Math.max(1, sessionResponses.length)) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </CardContent>
              </Card>
            </div>

            {sessionResponses.map((session) => (
              <Card key={session.session_id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Submission from {new Date(session.submitted_at).toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {session.responses
                    .sort((a, b) => a.question.order_index - b.question.order_index)
                    .map((response) => (
                      <div key={response.id} className="border-l-4 border-primary pl-4">
                        <p className="font-medium">{response.question.question_text}</p>
                        <p className="text-muted-foreground">{response.answer_text}</p>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizResponses;
