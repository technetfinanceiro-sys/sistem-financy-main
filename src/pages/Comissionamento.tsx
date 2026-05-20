import React, { useState, useEffect } from 'react';
import { useComissionamento } from '@/hooks/useComissionamento';
import { ComissionamentoHeader } from '@/components/comissionamento/ComissionamentoHelder';
import { ComissionamentoFilters } from '@/components/comissionamento/ComissionamentoFilters';
import { ComissionamentoKPIs } from '@/components/comissionamento/ComissionamentoKPIs';
import { ComissionamentoCharts } from '@/components/comissionamento/ComissionamentoCharts';
import { ComissionamentoTable } from '@/components/comissionamento/ComissionamentoTable';
import { ComissionamentoFrentes } from '@/components/comissionamento/ComissionamentoFrentes';
import { ComissionamentoValores } from '@/components/comissionamento/ComissionamentoValores';
import { TabNavigation } from '@/components/comissionamento/TabNavigation';
import { LoadingSpinner } from '@/components/comissionamento/LoadingSpinner';

const TABS = [
  { id: 'kpis', label: 'KPIs' },
  { id: 'charts', label: 'Gráficos' },
  // { id: 'frentes', label: 'Frentes' },
  { id: 'table', label: 'Dados Detalhados' },
  { id: 'valores', label: 'Valores' },
];

const Comissionamento: React.FC = () => {
  const hook = useComissionamento();
  const [activeTab, setActiveTab] = useState('kpis');

  useEffect(() => {
    hook.fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasData = hook.allData.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <ComissionamentoHeader />

      <main className="max-w-[1400px] mx-auto p-8 space-y-8">
        {hook.error && (
          <div className="alert alert-error">
            <span>⚠️ {hook.error}</span>
          </div>
        )}

        <ComissionamentoFilters
          filters={hook.filters}
          setFilters={hook.setFilters}
          clearFilters={hook.clearFilters}
          uniqueCidades={hook.uniqueCidades}
          uniqueNomes={hook.uniqueNomes}
          uniqueFrente={hook.uniqueFrente}
          totalFiltered={hook.data.length}
          onManualSubmit={hook.submitManualEntry}
          filteredData={hook.data}
          opcoes={hook.opcoes}
          onImportExcel={hook.importExcel}
        />

        {hook.isLoading && !hasData && (
          <LoadingSpinner message="Carregando lançamentos PIX..." />
        )}

        {hasData && (
          <>
            <TabNavigation tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="tab-content">
              {activeTab === 'kpis' && <ComissionamentoKPIs kpis={hook.kpis} />}
              {activeTab === 'charts' && (
                <ComissionamentoCharts chartData={hook.chartData} ranking={hook.ranking} frentesData={hook.frentesData} />
              )}
              {activeTab === 'frentes' && (
                <ComissionamentoFrentes
                  frentesData={hook.frentesData}
                  selectedFrente={hook.filters.frente[0] || ''}
                />
              )}
              {activeTab === 'table' && (
                <ComissionamentoTable
                  data={hook.data}
                  onUpdate={hook.updateRecord}
                  onDelete={hook.deleteRecord}
                  opcoes={hook.opcoes}
                />
              )}
              {activeTab === 'valores' && <ComissionamentoValores data={hook.data} />}
            </div>
          </>
        )}

        {!hook.isLoading && !hasData && !hook.error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Clique em "Novo Lançamento" para começar.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Comissionamento;
