import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Wallet, LogOut, Shield, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const cards = [
    {
      id: 'comissionamento',
      title: 'SOLICITAÇÃO DE PAGAMENTO',
      desc: 'Controle de lançamentos PIX, KPIs, gráficos e dados detalhados.',
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      to: '/pagamentos',
      adminOnly: false,
    },
    {
      id: 'folha',
      title: 'FOLHA DE PAGAMENTO',
      desc: 'Importação e análise da folha de pagamento.',
      icon: Wallet,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      to: '/folha-pagamento',
      adminOnly: true,
    },
  ].filter(c => !c.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground font-medium">Selecione um módulo</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="gap-2">
                <Shield className="w-4 h-4" /> Admin
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm"
              onClick={async () => { await signOut(); navigate('/login'); }}
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map(c => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => navigate(c.to)}
                className="group text-left card hover:scale-[1.02] transition-transform p-8 flex flex-col gap-4 border border-border rounded-2xl bg-card shadow-sm hover:shadow-lg"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shadow-glow"
                  style={{ background: c.gradient }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{c.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
                </div>
                <span className="text-sm font-semibold text-primary mt-auto">
                  Acessar →
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Home;