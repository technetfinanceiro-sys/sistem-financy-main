import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

const fmtBRL = (v: number) =>
    `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtCompact = (v: number) =>
    v >= 1000 ? `R$ ${(v / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k`
        : `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtPct = (v: number) => `${v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#a3e635'];

interface Props {
    porSetor: { setor: string; qtd: number; liquido: number; proventos: number; descontos: number }[];
}

export const FolhaCharts: React.FC<Props> = ({ porSetor }) => {
    const barData = porSetor.slice(0, 15);
    const total = porSetor.reduce((s, p) => s + p.liquido, 0);
    const pie = porSetor.slice(0, 10).map(p => ({
        name: p.setor, value: p.liquido, pct: total > 0 ? (p.liquido / total) * 100 : 0,
    }));

    return (
        <div className="space-y-8">
            <div className="card">
                <h4 className="mb-6 flex items-center gap-2 text-lg font-bold">
                    <BarChart3 className="w-5 h-5 text-accent" /> Proventos x Descontos por Setor
                </h4>
                {barData.length > 0 ? (
                    <div style={{ height: Math.max(400, barData.length * 40 + 100) }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <XAxis dataKey="setor" tick={{ fill: 'hsl(223 16% 70%)', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                                <YAxis tick={{ fill: 'hsl(223 16% 70%)', fontSize: 11 }} tickFormatter={fmtCompact} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(231 45% 11%)', border: '1px solid hsl(232 32% 22%)', borderRadius: 8, color: 'white' }}
                                    formatter={(v: number) => fmtBRL(v)}
                                />
                                <Legend wrapperStyle={{ color: 'hsl(223 16% 70%)', fontSize: 12 }} />
                                <Bar dataKey="proventos" name="Proventos" fill="#22c55e" radius={[4, 4, 0, 0]}>
                                    <LabelList dataKey="proventos" position="top" fill="hsl(223 16% 70%)" fontSize={10} formatter={(v: number) => v > 0 ? fmtCompact(v) : ''} />
                                </Bar>
                                <Bar dataKey="descontos" name="Descontos" fill="#ef4444" radius={[4, 4, 0, 0]}>
                                    <LabelList dataKey="descontos" position="top" fill="hsl(223 16% 70%)" fontSize={10} formatter={(v: number) => v > 0 ? fmtCompact(v) : ''} />
                                </Bar>
                                <Bar dataKey="liquido" name="Líquido" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                    <LabelList dataKey="liquido" position="top" fill="hsl(223 16% 70%)" fontSize={10} formatter={(v: number) => v > 0 ? fmtCompact(v) : ''} />
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
                    <PieIcon className="w-5 h-5 text-accent" /> Composição do Líquido por Setor
                </h4>
                {pie.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                        <div style={{ height: 360 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={130} innerRadius={60} paddingAngle={2} label={(e: any) => fmtPct(e.pct)} labelLine={false}>
                                        {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(231 45% 11%)', border: '1px solid hsl(232 32% 22%)', borderRadius: 8, color: 'white' }}
                                        formatter={(v: number) => fmtBRL(v)}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2">
                            {pie.map((p, i) => (
                                <div key={p.name} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                        <span className="text-sm text-foreground truncate" title={p.name}>{p.name}</span>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-sm font-bold text-foreground">{fmtBRL(p.value)}</div>
                                        <div className="text-xs text-muted-foreground">{fmtPct(p.pct)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">Nenhum dado para exibir</p>
                )}
            </div>
        </div>
    );
};