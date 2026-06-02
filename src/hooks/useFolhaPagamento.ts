import { useCallback, useEffect, useMemo, useState } from 'react';
import { externalSupabase } from '@/integrations/supabase/externalClient';

export interface DadoFinanceiro {
    id: string;
    data: string;
    nome: string;
    cpf: string;
    registro_id: string | null;
    setor: string | null;
    nome_registro: string | null;
    sal_folha: number;
    desc_inss: number;
    irrf: number;
    ferias: number;
    decimo_terceiro: number;
    periculosidade: number;
    hora_extra_60: number;
    hora_extra_100: number;
    dsr: number;
    desc_plano_saude: number;
    desc_odonto: number;
    desc_faltas: number;
    desc_adiantamento: number;
    contribuicao: number;
    desc_pensao: number;
    dif_salario: number;
    total_proventos: number;
    total_descontos: number;
    salario_liquido: number;
}

export interface FolhaFilters {
    dataInicio: string;
    dataFim: string;
    categoria: string[]; // setor
    cnpj: string[];      // placeholder
    unidade: string[];   // placeholder
    nome: string[];      // placeholder
}

const EMPTY_FILTERS: FolhaFilters = {
    dataInicio: '', dataFim: '', categoria: [], cnpj: [], unidade: [], nome: [],
};

export function useFolhaPagamento() {
    const [data, setData] = useState<DadoFinanceiro[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<FolhaFilters>(EMPTY_FILTERS);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            let all: DadoFinanceiro[] = [];
            let page = 0;
            const size = 1000;
            while (true) {
                const { data: rows, error: err } = await externalSupabase
                    .from('vw_dados_financeiro')
                    .select('*')
                    .range(page * size, (page + 1) * size - 1)
                    .order('data', { ascending: false });
                if (err) throw err;
                if (!rows || rows.length === 0) break;
                all = all.concat(rows as DadoFinanceiro[]);
                if (rows.length < size) break;
                page++;
            }
            setData(all);
        } catch (e: any) {
            console.error('Erro Folha:', e);
            setError(e.message || 'Erro ao carregar');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = useMemo(() => {
        let r = [...data];
        if (filters.dataInicio) r = r.filter(x => x.data && x.data >= filters.dataInicio);
        if (filters.dataFim) r = r.filter(x => x.data && x.data <= filters.dataFim);
        if (filters.categoria.length) r = r.filter(x => filters.categoria.includes(x.setor || ''));
        if (filters.nome.length) r = r.filter(x => filters.nome.includes(x.nome || ''));
        return r;
    }, [data, filters]);

    const opcoesCategoria = useMemo(
        () => [...new Set(data.map(d => d.setor).filter(Boolean))].sort((a, b) => a!.localeCompare(b!, 'pt-BR')) as string[],
        [data]
    );

    const opcoesNomes = useMemo(
        () => [...new Set(data.map(d => d.nome).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
        [data]
    );

    const kpis = useMemo(() => {
        const acc = { total: filtered.length, proventos: 0, descontos: 0, liquido: 0 };
        const map = new Map<string, { qtd: number; liquido: number; proventos: number; descontos: number }>();
        filtered.forEach(r => {
            acc.proventos += Number(r.total_proventos) || 0;
            acc.descontos += Number(r.total_descontos) || 0;
            acc.liquido += Number(r.salario_liquido) || 0;
            const k = r.setor || 'Sem Setor';
            if (!map.has(k)) map.set(k, { qtd: 0, liquido: 0, proventos: 0, descontos: 0 });
            const it = map.get(k)!;
            it.qtd += 1;
            it.liquido += Number(r.salario_liquido) || 0;
            it.proventos += Number(r.total_proventos) || 0;
            it.descontos += Number(r.total_descontos) || 0;
        });
        const porSetor = Array.from(map.entries())
            .map(([setor, v]) => ({ setor, ...v }))
            .sort((a, b) => b.liquido - a.liquido);
        return { ...acc, porSetor };
    }, [filtered]);

    const importExcel = useCallback(async (rows: Record<string, any>[]) => {
        const errors: string[] = [];
        let inserted = 0;
        let skipped = 0;
        const records = rows.filter(r => {
            if (!r.data || !r.cpf || !r.nome) { skipped++; return false; }
            return true;
        });
        for (let i = 0; i < records.length; i += 200) {
            const chunk = records.slice(i, i + 200);
            const { error: err } = await externalSupabase.from('dados_financeiro').insert(chunk);
            if (err) errors.push(err.message);
            else inserted += chunk.length;
        }
        await fetchData();
        return { inserted, skipped, errors };
    }, [fetchData]);

    return {
        data: filtered,
        allData: data,
        isLoading,
        error,
        filters,
        setFilters: (p: Partial<FolhaFilters>) => setFilters(prev => ({ ...prev, ...p })),
        clearFilters: () => setFilters(EMPTY_FILTERS),
        fetchData,
        importExcel,
        opcoesCategoria,
        opcoesNomes,
        kpis,
    };
}