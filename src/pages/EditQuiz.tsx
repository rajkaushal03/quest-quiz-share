
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, Save } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id?: string;
  question_text: string;
  question_type: 'single_choice' | 'short_text';
  options: string[] | null;
  order_index: number;
}

const EditQuiz = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<Question[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user && id) {
        fetchQuiz(id, session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [id]);

  const fetchQuiz = async (quizId: string, userId: string) => {
    try {
      // Fetch quiz details
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .eq('user_id', userId)
        .single();

      if (quizError) throw quizError;

      setTitle(quiz.title);
      setDescription(quiz.description || '');

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsError) throw questionsError;

      const formattedQuestions = questionsData.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type as 'single_choice' | 'short_text',
        options: q.options,
        order_index: q.order_index
      }));

      setQuestions(formattedQuestions);
      setOriginalQuestions(formattedQuestions);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
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

  const addQuestion = () => {
    const newQuestion: Question = {
      question_text: '',
      question_type: 'single_choice',
      options: ['', ''],
      order_index: questions.length
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    if (field === 'question_type' && value === 'short_text') {
      updated[index] = { ...updated[index], [field]: value, options: null };
    } else if (field === 'question_type' && value === 'single_choice') {
      updated[index] = { ...updated[index], [field]: value, options: ['', ''] };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options![optionIndex] = value;
      setQuestions(updated);
    }
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options!.push('');
      setQuestions(updated);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options && updated[questionIndex].options!.length > 2) {
      updated[questionIndex].options!.splice(optionIndex, 1);
      setQuestions(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.some(q => !q.question_text.trim())) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Update quiz
      const { error: quizError } = await supabase
        .from('quizzes')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (quizError) throw quizError;

      // Delete all existing questions
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('quiz_id', id);

      if (deleteError) throw deleteError;

      // Insert updated questions
      const questionsToInsert = questions.map((q, index) => ({
        quiz_id: id,
        question_text: q.question_text.trim(),
        question_type: q.question_type,
        options: q.question_type === 'single_choice' ? q.options?.filter(opt => opt.trim()) : null,
        order_index: index,
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast({
        title: "Success!",
        description: "Quiz updated successfully.",
      });

      navigate('/dashboard');
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onAuthClick={() => {}} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Quiz</h1>
          <p className="text-muted-foreground">Update your quiz details and questions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>Update the basic information about your quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
              <CardDescription>Update your quiz questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <Label>Question {qIndex + 1} *</Label>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(qIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <Input
                    value={question.question_text}
                    onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                    placeholder="Enter your question"
                    required
                  />

                  <div>
                    <Label>Question Type</Label>
                    <RadioGroup
                      value={question.question_type}
                      onValueChange={(value) => updateQuestion(qIndex, 'question_type', value)}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single_choice" id={`single-${qIndex}`} />
                        <Label htmlFor={`single-${qIndex}`}>Single Choice</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="short_text" id={`text-${qIndex}`} />
                        <Label htmlFor={`text-${qIndex}`}>Short Text</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {question.question_type === 'single_choice' && question.options && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                          />
                          {question.options!.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(qIndex, oIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(qIndex)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting}>
              <Save className="h-4 w-4 mr-2" />
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditQuiz;
