import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';
import logo from '@/assets/logo.png';

const Login = () => {
  const [accessCode, setAccessCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(accessCode, password);
      if (success) {
        toast.success('Login realizado com sucesso!');
        
        // Fetch role from the login response (stored in context)
        // The navigation will happen after the context updates
        const { user } = await import('@/contexts/AuthContext').then(async m => {
          // Small delay to ensure context is updated
          await new Promise(resolve => setTimeout(resolve, 100));
          return { user: null }; // Will be handled by useEffect in protected routes
        });
        
        // Use stored session to determine navigation
        const session = localStorage.getItem('cezar_session');
        if (session) {
          const sessionData = JSON.parse(session);
          const { supabase } = await import('@/integrations/supabase/client');
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', sessionData.id)
            .single();
          
          const role = roleData?.role;
          if (role === 'motorista') {
            navigate('/motorista');
          } else if (role === 'operador') {
            navigate('/operador');
          } else {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      } else {
        toast.error('Código de acesso ou senha inválidos');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-primary">Sistema Cezar</CardTitle>
          <CardDescription>Acesse sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode">Código de Acesso</Label>
              <Input
                id="accessCode"
                type="text"
                placeholder="Ex: 001"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="h-4 w-4 mr-2" />
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
