import React, { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { ComissionamentoFilters as FiltersType, LancamentoPix, OpcaoSelect } from '@/types/comissionamento';
import { X, FileEdit, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComissionamentoFormDialog } from './ComissionamentoFormDialog';
import * as XLSX from 'xlsx';

interface OpcoesData {
  cnpj: OpcaoSelect[];
  unidade: OpcaoSelect[];
  centro_de_custo: OpcaoSelect[];
  categoria: OpcaoSelect[];
  secao_custeio: OpcaoSelect[];
  centro_custeio: OpcaoSelect[];
}

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
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) onChange(selected.filter(s => s !== option));
    else onChange([...selected, option]);
  };

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

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
            {filteredOptions.map(option => (
              <div key={option} className="multi-select-option" onClick={() => toggleOption(option)}>
                <div className={`multi-select-checkbox ${selected.includes(option) ? 'checked' : ''}`} />
                <span>{option}</span>
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum resultado</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface Props {
  filters: FiltersType;
  setFilters: (f: Partial<FiltersType>) => void;
  clearFilters: () => void;
  uniqueCidades: string[];
  uniqueNomes: string[];
  uniqueFrente: string[];
  totalFiltered: number;
  onManualSubmit: (data: Record<string, any>) => Promise<void>;
  filteredData: LancamentoPix[];
  opcoes: OpcoesData;
}

export const ComissionamentoFilters: React.FC<Props> = ({
  filters, setFilters, clearFilters, uniqueCidades, uniqueNomes, uniqueFrente, totalFiltered,
  onManualSubmit, filteredData, opcoes
}) => {
  const hasFilters = filters.cidade.length > 0 || filters.dataInicio || filters.dataFim
    || filters.nome.length > 0 || filters.frente.length > 0 || filters.contrato.length > 0
    || (filters.descricao && filters.descricao.trim().length > 0)
    || filters.cnpj.length > 0 || filters.centroCusteio.length > 0;

  const [formOpen, setFormOpen] = useState(false);

  const uniqueCentroCusto = React.useMemo(
    () => [...new Set(filteredData.map(r => r.centro_de_custo).filter(Boolean))].sort() as string[],
    [filteredData]
  );

  const uniqueCnpj = React.useMemo(
    () => [...new Set(filteredData.map(r => r.cnpj).filter(Boolean))].sort() as string[],
    [filteredData]
  );

  const uniqueCentroCusteio = React.useMemo(
    () => [...new Set(filteredData.map(r => r.centro_custeio).filter(Boolean))].sort() as string[],
    [filteredData]
  );

  const handleExportExcel = () => {
    const fmtDate = (val: string | null) => {
      if (!val) return '';
      const m = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
      return m ? `${m[3]}/${m[2]}/${m[1]}` : val;
    };
    const exportRows = filteredData.map(r => ({
      'Data': fmtDate(r.data_lancamento),
      'Nome': r.nome || '',
      'Favorecido': r.favorecido || '',
      'Chave PIX': r.chave_pix || '',
      'CNPJ': r.cnpj || '',
      'Unidade': r.unidade || '',
      'Centro de Custo': r.centro_de_custo || '',
      'Categoria': r.categoria || '',
      'Seção de Custeio': r.secao_custeio || '',
      'Centro de Custeio': r.centro_custeio || '',
      'Descrição': r.descricao || '',
      'Valor': r.valor ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lancamentos PIX');
    XLSX.writeFile(wb, 'lancamentos_pix.xlsx');
  };

  return (
    <div className="card">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <h3 className="text-lg font-bold text-foreground">Filtros</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)} className="gap-1">
            <FileEdit className="w-4 h-4" /> Novo Lançamento
          </Button>
          {/* <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={filteredData.length === 0} className="gap-1">
            <Download className="w-4 h-4" /> Exportar Excel
          </Button> */}
          <span className="text-sm text-muted-foreground">
            Total: <strong className="text-foreground">{totalFiltered}</strong> registros
          </span>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1">
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}
        </div>
      </div>

      <ComissionamentoFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={onManualSubmit}
        opcoes={opcoes}
      />

      <div className="filter-section">
        <MultiSelect
          label="Unidade"
          options={uniqueCidades}
          selected={filters.cidade}
          onChange={(val) => setFilters({ cidade: val })}
        />

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

        <MultiSelect
          label="Favorecido"
          options={uniqueNomes}
          selected={filters.nome}
          onChange={(val) => setFilters({ nome: val })}
        />

        <MultiSelect
          label="Categoria"
          options={uniqueFrente}
          selected={filters.frente}
          onChange={(val) => setFilters({ frente: val })}
        />

        <MultiSelect
          label="Centro de Custo"
          options={uniqueCentroCusto}
          selected={filters.contrato}
          onChange={(val) => setFilters({ contrato: val })}
        />

        <MultiSelect
          label="CNPJ"
          options={uniqueCnpj}
          selected={filters.cnpj}
          onChange={(val) => setFilters({ cnpj: val })}
        />

        <MultiSelect
          label="Centro de Custeio"
          options={uniqueCentroCusteio}
          selected={filters.centroCusteio}
          onChange={(val) => setFilters({ centroCusteio: val })}
        />

        <div className="form-group">
          <Label className="form-label">Descrição</Label>
          <input
            type="text"
            className="form-control bg-card border border-border rounded-lg px-3 py-2 text-foreground w-full"
            placeholder="Buscar na descrição..."
            value={filters.descricao}
            onChange={e => setFilters({ descricao: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};
