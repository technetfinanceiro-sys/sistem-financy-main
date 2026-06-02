import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wallet, Calendar, LogOut, Shield, Sun, Moon, Download, ArrowLeft, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { TabNavigation } from '@/components/comissionamento/TabNavigation';
import { LoadingSpinner } from '@/components/comissionamento/LoadingSpinner';
import { useFolhaPagamento } from '@/hooks/useFolhaPagamento';
import { FolhaImportExcel } from '@/components/folha/FolhaImportExcel';
import { FolhaKPIs } from '@/components/folha/FolhaKPIs';
import { FolhaCharts } from '@/components/folha/FolhaCharts';
import { FolhaFrentes } from '@/components/folha/FolhaFrentes';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const toggle = (opt: string) =>
    selected.includes(opt) ? onChange(selected.filter(s => s !== opt)) : onChange([...selected, opt]);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="form-group" ref={ref} style={{ zIndex: isOpen ? 50 : 1, position: 'relative' }}>
      <Label className="form-label">{label}</Label>
      <div className="multi-select">
        <div className={`multi-select-button ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
          <span className="multi-select-text">
            {selected.length === 0 ? 'Todos' : `${selected.length} selecionado(s)`}
          </span>
          {selected.length > 0 && <span className="selected-count">{selected.length}</span>}
          <span className={`multi-select-arrow ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </div>
        {isOpen && (
          <div className="multi-select-dropdown open">
            <input
              type="text"
              className="w-full px-3 py-2 text-sm border-b border-border bg-background text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {filtered.map(opt => (
              <div key={opt} className="multi-select-option" onClick={() => toggle(opt)}>
                <div className={`multi-select-checkbox ${selected.includes(opt) ? 'checked' : ''}`} />
                <span>{opt}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum resultado</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TABS = [
  { id: 'kpis', label: 'KPIs' },
  { id: 'charts', label: 'Gráficos' },
  { id: 'frentes', label: 'Frentes' },
];

const FolhaPagamento: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('kpis');

  const {
    data, isLoading, error, filters, setFilters, clearFilters,
    fetchData, importExcel, opcoesCategoria, opcoesNomes, kpis
  } = useFolhaPagamento();

  const formatDatePtBr = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };
  const handleExport = () => {
    if (data.length === 0) {
      alert('Sem dados para exportar.');
      return;
    }
    const rows = data.map(r => ({
      Data: formatDatePtBr(r.data),
      Nome: r.nome,
      CPF: r.cpf,
      Setor: r.setor || '',
      'Sal. Folha': r.sal_folha,
      'Desc INSS': r.desc_inss,
      IRRF: r.irrf,
      'Férias': r.ferias,
      '13° Salário': r.decimo_terceiro,
      Periculosidade: r.periculosidade,
      'Hora extra 60%': r.hora_extra_60,
      'Hora extra 100%': r.hora_extra_100,
      DSR: r.dsr,
      'Desc plano saúde': r.desc_plano_saude,
      'Desc odonto': r.desc_odonto,
      'Desc faltas': r.desc_faltas,
      'Desc adiantamento': r.desc_adiantamento,
      'Contribuição': r.contribuicao,
      'Desc Pensão': r.desc_pensao,
      'Dif. Salário': r.dif_salario,
      'T. Proventos': r.total_proventos,
      'T. Descontos': r.total_descontos,
      'Salário líquido': r.salario_liquido,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Folha');
    XLSX.writeFile(wb, `folha_pagamento_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} title="Voltar">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-glow"
              style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Folha de Pagamento</h1>
              <p className="text-sm text-muted-foreground font-medium">Gestão e análise da folha</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mr-2">
              <Calendar className="w-4 h-4" />
              <span className="capitalize">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="gap-2">
              <Shield className="w-4 h-4" /> Admin
            </Button>
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

      <main className="max-w-[1400px] mx-auto p-8 space-y-8">
        <div className="card" style={{ position: 'relative', zIndex: 10 }}>
          <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
            <h3 className="text-lg font-bold text-foreground">Filtros</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <FolhaImportExcel onImport={importExcel} />
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
                <Download className="w-4 h-4" /> Exportar Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => fetchData()} className="gap-1">
                <RefreshCw className="w-4 h-4" /> Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1">
                Limpar
              </Button>
            </div>
          </div>

          <div className="filter-section">
            <div className="form-group">
              <Label className="form-label">Data Inicial</Label>
              <input
                type="date"
                className="form-control bg-card border border-border rounded-lg px-3 py-2 text-foreground w-full"
                value={filters.dataInicio}
                onChange={e => setFilters({ dataInicio: e.target.value })}
              />
            </div>
            <div className="form-group">
              <Label className="form-label">Data Final</Label>
              <input
                type="date"
                className="form-control bg-card border border-border rounded-lg px-3 py-2 text-foreground w-full"
                value={filters.dataFim}
                onChange={e => setFilters({ dataFim: e.target.value })}
              />
            </div>
            <MultiSelect label="Categoria (Setor)" options={opcoesCategoria} selected={filters.categoria} onChange={v => setFilters({ categoria: v })} />
            <MultiSelect label="CNPJ" options={[]} selected={filters.cnpj} onChange={v => setFilters({ cnpj: v })} />
            <MultiSelect label="Nome" options={opcoesNomes} selected={filters.nome} onChange={v => setFilters({ nome: v })} />
          </div>
        </div>

        {error && (
          <div className="card text-destructive">Erro ao carregar dados: {error}</div>
        )}

        <TabNavigation tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="tab-content">
            {activeTab === 'kpis' && <FolhaKPIs kpis={kpis} />}
            {activeTab === 'charts' && <FolhaCharts porSetor={kpis.porSetor} />}
            {activeTab === 'frentes' && <FolhaFrentes porSetor={kpis.porSetor} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default FolhaPagamento;