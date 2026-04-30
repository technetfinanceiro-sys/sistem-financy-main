import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';
import { OpcaoSelect } from '@/types/comissionamento';
import { useAuth } from '@/contexts/useAuth';

interface OpcoesData {
  cnpj: OpcaoSelect[];
  unidade: OpcaoSelect[];
  centro_de_custo: OpcaoSelect[];
  categoria: OpcaoSelect[];
  secao_custeio: OpcaoSelect[];
  centro_custeio: OpcaoSelect[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    data_lancamento: string;
    nome: string;
    chave_pix: string;
    favorecido: string;
    descricao: string | null;
    valor: number;
    cnpj_id: string;
    unidade_id: string;
    centro_de_custo_id: string;
    categoria_id: string;
    secao_custeio_id: string;
    centro_custeio_id: string;
  }) => Promise<void>;
  opcoes: OpcoesData;
}

const emptyForm = {
  data_lancamento: '',
  nome: '',
  chave_pix: '',
  favorecido: '',
  descricao: '',
  valor: '',
  cnpj_id: '',
  unidade_id: '',
  centro_de_custo_id: '',
  categoria_id: '',
  secao_custeio_id: '',
  centro_custeio_id: '',
};

const requiredFields = [
  'data_lancamento', 'nome', 'chave_pix', 'favorecido', 'valor',
  'cnpj_id', 'unidade_id', 'centro_de_custo_id', 'categoria_id',
  'secao_custeio_id', 'centro_custeio_id'
];

const DRAFT_KEY = 'technet-pix-form-draft';
type FormState = typeof emptyForm;

const getErrorMessage = (err: unknown) => err instanceof Error ? err.message : 'Erro ao enviar';

export const ComissionamentoFormDialog: React.FC<Props> = ({ open, onClose, onSubmit, opcoes }) => {
  const { profile } = useAuth();
  const userName = profile?.display_name || '';

  const [form, setForm] = useState(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      const base = saved ? { ...emptyForm, ...JSON.parse(saved) } : { ...emptyForm };
      return { ...base, nome: userName || base.nome };
    } catch {
      return { ...emptyForm, nome: userName };
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  // Keep nome field synced with logged-in user
  useEffect(() => {
    if (userName && form.nome !== userName) {
      setForm(prev => ({ ...prev, nome: userName }));
    }
  }, [userName]);

  useEffect(() => {
    const hasDraft = Object.values(form).some(value => value?.toString().trim());
    if (hasDraft) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    else window.localStorage.removeItem(DRAFT_KEY);
  }, [form]);

  const isValid = requiredFields.every(f => form[f as keyof FormState]?.toString().trim());

  const handleSubmit = async () => {
    if (!isValid) { setError('Preencha todos os campos obrigatórios.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        data_lancamento: form.data_lancamento,
        nome: form.nome.trim(),
        chave_pix: form.chave_pix.trim(),
        favorecido: form.favorecido.trim(),
        descricao: form.descricao?.trim() || null,
        valor: parseFloat(form.valor.replace(/[^\d.,-]/g, '').replace(',', '.')),
        cnpj_id: form.cnpj_id,
        unidade_id: form.unidade_id,
        centro_de_custo_id: form.centro_de_custo_id,
        categoria_id: form.categoria_id,
        secao_custeio_id: form.secao_custeio_id,
        centro_custeio_id: form.centro_custeio_id,
      };
      await onSubmit(payload);
      window.localStorage.removeItem(DRAFT_KEY);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm({ ...emptyForm, nome: userName });
        onClose();
      }, 1300);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => { window.localStorage.removeItem(DRAFT_KEY); setForm({ ...emptyForm, nome: userName }); setError(''); };

  const selectClass = "w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground text-sm";

  const renderSelect = (
    field: keyof typeof emptyForm,
    label: string,
    options: OpcaoSelect[],
    required = true
  ) => (
    <div className="space-y-1">
      <Label className="text-sm font-medium">{label} {required && '*'}</Label>
      <select
        className={selectClass}
        value={form[field]}
        onChange={e => set(field, e.target.value)}
      >
        <option value="">Selecione...</option>
        {options.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
      </select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Lançamento PIX</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle className="w-12 h-12 text-primary" />
            <p className="text-lg font-semibold text-foreground">Lançamento registrado com sucesso!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Data *</Label>
                <Input type="date" value={form.data_lancamento} onChange={e => set('data_lancamento', e.target.value)} />
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium">Nome *</Label>
                <Input
                  placeholder="Nome do lançamento"
                  value={form.nome}
                  readOnly
                  className="bg-muted/50 cursor-not-allowed"
                  title="Preenchido automaticamente com o usuário logado"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium">Chave PIX *</Label>
                <Input placeholder="CPF/CNPJ/E-mail/Telefone/Aleatória" value={form.chave_pix} onChange={e => set('chave_pix', e.target.value)} />
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium">Favorecido *</Label>
                <Input placeholder="Nome do favorecido" value={form.favorecido} onChange={e => set('favorecido', e.target.value)} />
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium">Valor *</Label>
                <Input placeholder="R$ 0,00" inputMode="decimal" value={form.valor} onChange={e => set('valor', e.target.value)} />
              </div>

              {renderSelect('cnpj_id', 'CNPJ', opcoes.cnpj)}
              {renderSelect('unidade_id', 'Unidade', opcoes.unidade)}
              {renderSelect('centro_de_custo_id', 'Centro de Custo', opcoes.centro_de_custo)}
              {renderSelect('categoria_id', 'Categoria', opcoes.categoria)}
              {renderSelect('secao_custeio_id', 'Seção de Custeio', opcoes.secao_custeio)}
              {renderSelect('centro_custeio_id', 'Centro de Custeio', opcoes.centro_custeio)}

              <div className="space-y-1 md:col-span-2">
                <Label className="text-sm text-muted-foreground">Descrição</Label>
                <Input placeholder="Descrição (opcional)" value={form.descricao} onChange={e => set('descricao', e.target.value)} />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button variant="ghost" onClick={onClose} disabled={submitting}>Fechar</Button>
              <Button variant="outline" onClick={handleClear} disabled={submitting}>Limpar</Button>
              <Button onClick={handleSubmit} disabled={submitting || !isValid}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
