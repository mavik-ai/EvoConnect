'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Plus, RefreshCw, Settings, AlertCircle } from 'lucide-react';
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
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
