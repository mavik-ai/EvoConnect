'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Plus, RefreshCw, Settings, AlertCircle, Terminal, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { InstanceCard } from '@/components/ui/InstanceCard';
import { useToast, ToastContainer, ToastType } from '@/components/ui/Toast';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ShowToast = (message: string, type?: ToastType) => void;
type ToastItem = { id: string; message: string; type: ToastType };

interface RawInstance {
  instance?: { instanceName?: string; status?: string };
  instanceName?: string;
  status?: string;
}

interface LogItem {
  id?: string;
  timestamp?: string;
  type?: 'error' | 'success' | 'warn' | 'info';
  message?: string;
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Erro desconhecido';
}

export default function AdminPage() {
  const { toasts, showToast, removeToast } = useToast();

  const [newInstanceName, setNewInstanceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: authData, mutate: mutateAuth } = useSWR('/api/auth', fetcher);
  const { data: settingsData, mutate: mutateSettings } = useSWR(authData?.isAuthenticated ? '/api/settings' : null, fetcher);

  const { data, mutate, isLoading } = useSWR(settingsData?.isConfigured && authData?.isAuthenticated ? '/api/instances' : null, fetcher, {
    refreshInterval: 10000,
  });

  if (!authData) {
    return <div className="spin" style={{ margin: 'auto', marginTop: '100px', width: '30px', height: '30px', border: '3px solid var(--primary)', borderRadius: '50%', borderTopColor: 'transparent' }} />
  }

  if (!authData.isAuthenticated) {
    return <AuthScreen onLogin={() => mutateAuth()} />
  }

  if (!settingsData) {
    return <div className="spin" style={{ margin: 'auto', marginTop: '100px', width: '30px', height: '30px', border: '3px solid var(--primary)', borderRadius: '50%', borderTopColor: 'transparent' }} />
  }

  if (!settingsData.isConfigured) {
    return <SetupScreen onComplete={() => mutateSettings()} showToast={showToast} toasts={toasts} removeToast={removeToast} />
  }

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
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error');
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
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error');
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
            {Array.isArray(data?.instances) && data.instances.map((rawInst: RawInstance, i: number) => {
              const inner = rawInst.instance ?? rawInst;
              if (!inner?.instanceName) return null;
              const inst = {
                instanceName: inner.instanceName,
                status: (inner.status ?? 'close') as 'open' | 'close' | 'connecting',
              };
              return (
                <InstanceCard
                  key={inst.instanceName || `inst-${i}`}
                  instance={inst}
                  onDelete={handleDelete}
                />
              );
            })}

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
  const logs: LogItem[] = data?.logs || [];

  return (
    <div style={{ overflowY: 'auto', flex: 1, fontFamily: 'monospace', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px' }}>
      {!Array.isArray(logs) || logs.length === 0 ? (
        <span style={{ color: '#555' }}>Aguardando eventos...</span>
      ) : (
        logs.map((log, idx) => (
          <div key={log?.id ?? `log-${idx}`} style={{ display: 'flex', gap: '8px' }}>
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

interface SetupScreenProps {
  onComplete: () => void;
  showToast: ShowToast;
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

function SetupScreen({ onComplete, showToast, toasts, removeToast }: SetupScreenProps) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, globalKey: key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao conectar');

      showToast('Credenciais conectadas e salvas com sucesso!', 'success');
      onComplete();
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <GlassCard title="Configuração Inicial">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Conecte sua Evolution API para gerenciar as instâncias.
        </p>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Evolution API URL</label>
            <input
              type="url"
              className="glass-input"
              placeholder="https://sua-evolution.com"
              value={url} onChange={e => setUrl(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Global API Key</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? "text" : "password"}
                className="glass-input"
                placeholder="Sua chave global..."
                value={key} onChange={e => setKey(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-whatsapp" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Validando...' : 'Conectar e Salvar'}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}

function AuthScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error('Senha incorreta');
      onLogin();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '150px auto' }}>
      <GlassCard title="Acesso Restrito">
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Senha Administrativa</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="glass-input"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Entrando...' : 'Acessar Painel'}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
