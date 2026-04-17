'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Plus, RefreshCw, Settings, AlertCircle, Terminal } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { InstanceCard } from '@/components/ui/InstanceCard';
import { EvolutionInstance } from '@/lib/evolution';
import { useToast, ToastContainer } from '@/components/ui/Toast';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminPage() {
  const { toasts, showToast, removeToast } = useToast();
  const { data, error, mutate, isLoading } = useSWR('/api/instances', fetcher, {
    refreshInterval: 10000, // Sync a cada 10 segundos
  });

  const [newInstanceName, setNewInstanceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstanceName) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newInstanceName }),
      });
      
      if (!res.ok) throw new Error('Falha ao criar instância');
      
      setNewInstanceName('');
      mutate();
      showToast('Instância criada com sucesso!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a instância ${name}?`)) return;

    try {
      const res = await fetch(`/api/instances?name=${name}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Falha ao excluir');
      mutate();
      showToast('Instância excluída.', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Painel Administrativo</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie suas instâncias da Evolution API</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button onClick={() => mutate()} className="btn-secondary" disabled={isLoading}>
            <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
          </button>
          <button className="btn-secondary">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr', gap: '30px' }}>
        {/* Formulário de Criação */}
        <aside>
          <GlassCard title="Nova Instância">
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Nome da Instância</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="ex: cliente-xyz"
                  value={newInstanceName}
                  onChange={(e) => setNewInstanceName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%' }}
                disabled={isCreating}
              >
                {isCreating ? 'Criando...' : <><Plus size={18} /> Criar Instância</>}
              </button>
            </form>
          </GlassCard>

          <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', gap: '12px' }}>
            <AlertCircle color="var(--error)" size={20} />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              As instâncias criadas serão configuradas para gerar QR Code automaticamente.
            </p>
          </div>
        </aside>

        {/* Listagem */}
        <main>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {data?.instances?.map((inst: EvolutionInstance) => (
              <InstanceCard 
                key={inst.instanceName} 
                instance={inst} 
                onDelete={handleDelete} 
              />
            ))}
            
            {isLoading && <p>Carregando instâncias...</p>}
            {!isLoading && (!data?.instances || data.instances.length === 0) && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Nenhuma instância encontrada. Comece criando uma!
              </div>
            )}
          </div>
        </main>

        {/* Terminal Log View */}
        <aside style={{ display: 'flex', flexDirection: 'column' }}>
          <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', background: '#0a0a0c', border: '1px solid #222' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #222', paddingBottom: '12px', marginBottom: '12px' }}>
              <Terminal size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1rem', margin: 0, fontFamily: 'monospace' }}>Live Logs</h3>
            </div>
            <TerminalLogs />
          </GlassCard>
        </aside>
      </div>

      <style jsx>{`
        .spin {
          animation: rotate 1s linear infinite;
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function TerminalLogs() {
  const { data } = useSWR('/api/logs', fetcher, { refreshInterval: 2000 });
  const logs = data?.logs || [];

  return (
    <div style={{ overflowY: 'auto', flex: 1, fontFamily: 'monospace', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px' }}>
      {logs.length === 0 ? (
        <span style={{ color: '#555' }}>Aguardando eventos...</span>
      ) : (
        logs.map((log: any) => (
          <div key={log.id} style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#555' }}>[{log.timestamp}]</span>
            <span style={{ 
              color: log.type === 'error' ? 'var(--error)' : 
                     log.type === 'success' ? 'var(--success)' : 
                     log.type === 'warn' ? '#fbbf24' : '#E5E5E5' 
            }}>
              {log.message}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

