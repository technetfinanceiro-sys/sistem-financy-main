import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { BarChart3, Trophy } from 'lucide-react';
import { TechnicianChartData, RankingData } from '@/types/comissionamento';

interface Props {
  chartData: TechnicianChartData[]; // por unidade
  ranking: RankingData[];           // por favorecido
}

const fmtBRL = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const ComissionamentoCharts: React.FC<Props> = ({ chartData, ranking }) => {
  const barData = chartData.map(d => ({
    unidade: d.nome,
    qtd: d.confirmada,
    valor: d.valor || 0,
  }));

  const top5 = ranking.slice(0, 5);
  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32', 'hsl(14, 41%, 35%)', 'hsl(0, 50%, 47%)'];

  return (
    <div className="space-y-8">
      <div className="card">
        <h4 className="mb-6 flex items-center gap-2 text-lg font-bold">
          <BarChart3 className="w-5 h-5 text-accent" />
          Lançamentos por Unidade
        </h4>
        {barData.length > 0 ? (
          <div style={{ height: Math.max(400, barData.length * 40 + 100) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <XAxis dataKey="unidade" tick={{ fill: 'hsl(223 16% 70%)', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis yAxisId="left" tick={{ fill: 'hsl(223 16% 70%)', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(223 16% 70%)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(231 45% 11%)',
                    border: '1px solid hsl(232 32% 22%)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'valor') return [fmtBRL(value), 'Total R$'];
                    if (name === 'qtd') return [value, 'Lançamentos'];
                    return [value, name];
                  }}
                />
                <Legend wrapperStyle={{ color: 'hsl(223 16% 70%)', fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="qtd" name="Lançamentos" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="qtd" position="top" fill="hsl(223 16% 70%)" fontSize={10} formatter={(v: number) => v > 0 ? v : ''} />
                </Bar>
                <Bar yAxisId="right" dataKey="valor" name="Total R$" fill="#22c55e" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="valor" position="top" fill="hsl(223 16% 70%)" fontSize={10} formatter={(v: number) => v > 0 ? `R$ ${(v / 1000).toFixed(1)}k` : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhum dado para exibir</p>
        )}
      </div>

      <div className="card">
        <h4 className="mb-6 flex items-center gap-2 text-lg font-bold">
          <Trophy className="w-5 h-5 text-warning" />
          Top 5 Favorecidos por Valor
        </h4>
        {top5.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {top5.map((t, i) => (
              <div
                key={t.nome}
                className="relative rounded-xl p-5 text-center border border-border transition-all hover:scale-105"
                style={{
                  background: i < 3
                    ? `linear-gradient(135deg, ${medalColors[i]}22, ${medalColors[i]}08)`
                    : 'hsl(0, 1%, 70%)',
                  borderColor: i < 3 ? medalColors[i] : undefined
                }}
              >
                <div className="text-3xl font-black mb-2" style={{ color: medalColors[i] }}>
                  {i + 1}º
                </div>
                <div className="text-sm font-bold text-foreground mb-1 truncate" title={t.nome}>
                  {t.nome}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  <span className="text-xs font-black text-foreground">{t.totalContratos} lançamento(s)</span>
                </div>
                {t.totalValor > 0 && (
                  <div className="text-xs font-bold" style={{ color: medalColors[i] }}>
                    <span className="text-xs font-black text-foreground">{fmtBRL(t.totalValor)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhum dado para ranking</p>
        )}
      </div>
    </div>
  );
};
