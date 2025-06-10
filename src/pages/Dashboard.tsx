
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, BarChart3, Share } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { supabase, Quiz } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchQuizzes(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchQuizzes(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchQuizzes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
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

  const copyQuizLink = async (quizId: string) => {
    const url = `${window.location.origin}/quiz/${quizId}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Quiz link has been copied to your clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onAuthClick={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your quizzes and view analytics</p>
          </div>
          <Link to="/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">No quizzes yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first quiz to get started
              </p>
              <Link to="/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {quiz.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    <Link to={`/quiz/${quiz.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link to={`/quiz/${quiz.id}/responses`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="mr-1 h-4 w-4" />
                        Responses
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyQuizLink(quiz.id)}
                    >
                      <Share className="mr-1 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created {new Date(quiz.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
