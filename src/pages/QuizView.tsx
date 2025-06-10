
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useParams, Link } from 'react-router-dom';
import { supabase, Quiz, Question, Response } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const QuizView = () => {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchQuiz(id);
    }
  }, [id]);

  const fetchQuiz = async (quizId: string) => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsError) throw questionsError;

      setQuiz(quizData);
      setQuestions(questionsData);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all questions are answered
    const unanswered = questions.filter(q => !responses[q.id]?.trim());
    if (unanswered.length > 0) {
      toast({
        variant: "destructive",
        title: "Incomplete",
        description: "Please answer all questions before submitting.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const sessionId = crypto.randomUUID();
      
      const responsesToInsert = Object.entries(responses).map(([questionId, answer]) => ({
        quiz_id: id!,
        question_id: questionId,
        answer_text: answer.trim(),
        session_id: sessionId,
      }));

      const { error } = await supabase
        .from('responses')
        .insert(responsesToInsert);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Success!",
        description: "Your responses have been submitted.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Quiz not found</h3>
            <p className="text-muted-foreground mb-4">The quiz you're looking for doesn't exist.</p>
            <Link to="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center max-w-md">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
            <p className="text-muted-foreground mb-4">
              Your responses have been submitted successfully.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-4">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-muted-foreground mt-2">{quiz.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {index + 1}. {question.question_text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {question.question_type === 'single_choice' && question.options ? (
                  <RadioGroup
                    value={responses[question.id] || ''}
                    onValueChange={(value) => setResponses(prev => ({ ...prev, [question.id]: value }))}
                  >
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                        <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Input
                    value={responses[question.id] || ''}
                    onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
                    placeholder="Enter your answer"
                  />
                )}
              </CardContent>
            </Card>
          ))}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Submitting...' : 'Submit Responses'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default QuizView;
