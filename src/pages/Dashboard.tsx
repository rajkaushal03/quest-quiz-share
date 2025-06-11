/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, BarChart3, Share, Edit, X, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteQuiz = async (quizId: string) => {
    setDeleting(true);
    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', quizId);
      if (error) throw error;
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      toast({ title: 'Quiz deleted', description: 'The quiz and its related data have been deleted.' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onAuthClick={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="sm:text-3xl text-2xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground sm:inline hidden">Manage your quizzes and view analytics</p>
          </div>
          <Link to="/create">
            <Button className="transition-colors duration-200 hover:bg-black hover:text-white">
              <Plus className="mr-2 h-4 w-4" />
              <span className='hidden sm:inline'>Create Quiz</span>
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
                <Button className="transition-colors duration-200 hover:bg-black hover:text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className='w-full border-2 border-black shadow-lg shadow-black relative'>
                <button
                  className="absolute top-2 right-2 p-1 rounded-full text-red-500  transition-colors duration-200 z-10"
                  title="Delete Quiz"
                  onClick={() => setPendingDelete(quiz.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {quiz.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 grid-cols-2 gap-2 mb-3">
                    <Link to={`/edit/${quiz.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Link to={`/quiz/${quiz.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link to={`/quiz/${quiz.id}/responses`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <BarChart3 className="mr-1 h-4 w-4" />
                        Responses
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={() => copyQuizLink(quiz.id)}
                    >
                      <Share className="mr-1 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(quiz.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <div className={pendingDelete ? 'blur-sm pointer-events-none select-none' : ''}>
        {/* Dashboard content here */}
      </div>
      <Dialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" /> Delete Quiz?
            </DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this quiz and all its related data?</p>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => handleDeleteQuiz(pendingDelete!)}
            >
              Yes, Delete
            </Button>
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => setPendingDelete(null)}
            >
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
