import React, { useState, useMemo } from 'react';
import { LancamentoPix, OpcaoSelect } from '@/types/comissionamento';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComissionamentoEditDialog } from './ComissionamentoEditDialog';

interface OpcoesData {
  cnpj: OpcaoSelect[];
  unidade: OpcaoSelect[];
  centro_de_custo: OpcaoSelect[];
  categoria: OpcaoSelect[];
  secao_custeio: OpcaoSelect[];
  centro_custeio: OpcaoSelect[];
}

interface Props {
  data: LancamentoPix[];
  onUpdate: (id: string, updates: Record<string, any>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  opcoes: OpcoesData;
}

const PAGE_SIZE = 50;

const formatDate = (val: string | null) => {
  if (!val) return '-';
  const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return val;
};

const fmtBRL = (v: number | null) =>
  v != null ? `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-';

export const ComissionamentoTable: React.FC<Props> = ({ data, onUpdate, onDelete, opcoes }) => {
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<keyof LancamentoPix>('data_lancamento');
  const [sortAsc, setSortAsc] = useState(false);
  const [editRecord, setEditRecord] = useState<LancamentoPix | null>(null);

  const sorted = useMemo(() => {
    const arr = [...data];
    arr.sort((a, b) => {
      const va = (a as any)[sortField];
      const vb = (b as any)[sortField];
      if (va == null && vb == null) return 0;
      if (va == null) return sortAsc ? -1 : 1;
      if (vb == null) return sortAsc ? 1 : -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortAsc ? va - vb : vb - va;
      }
      return sortAsc
        ? String(va).localeCompare(String(vb), 'pt-BR')
        : String(vb).localeCompare(String(va), 'pt-BR');
    });
    return arr;
  }, [data, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (field: keyof LancamentoPix) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const columns: { key: keyof LancamentoPix | 'actions'; label: string }[] = [
    { key: 'actions', label: '' },
    { key: 'data_lancamento', label: 'Data' },
    { key: 'unidade', label: 'Cidade/Unidade' },
    { key: 'favorecido', label: 'Favorecido' },
    { key: 'centro_custeio', label: 'Centro de Custeio' },
    { key: 'centro_de_custo', label: 'Centro de Custo' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'valor', label: 'Valor' },
  ];

  return (
    <>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key as string}
                    onClick={col.key !== 'actions' ? () => handleSort(col.key as keyof LancamentoPix) : undefined}
                    className={`whitespace-nowrap ${col.key !== 'actions' ? 'cursor-pointer hover:text-primary transition-colors' : 'w-10'}`}
                  >
                    {col.label} {sortField === col.key ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row, i) => (
                <tr key={row.id || i}>
                  <td className="w-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setEditRecord(row)}
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                    </Button>
                  </td>
                  <td>{formatDate(row.data_lancamento)}</td>
                  <td>{row.unidade || '-'}</td>
                  <td className="font-medium">{row.favorecido || '-'}</td>
                  <td>{row.centro_custeio || '-'}</td>
                  <td>{row.centro_de_custo || '-'}</td>
                  <td>{row.categoria || '-'}</td>
                  <td className="font-semibold">{fmtBRL(row.valor)}</td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="text-center py-6 text-muted-foreground">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Página {page + 1} de {totalPages} ({sorted.length} registros)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ComissionamentoEditDialog
        open={!!editRecord}
        onClose={() => setEditRecord(null)}
        onSave={onUpdate}
        onDelete={onDelete}
        record={editRecord}
        opcoes={opcoes}
      />
    </>
  );
};
