'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Plus, RefreshCw, Settings, AlertCircle, Terminal, Eye, EyeOff, Activity, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { InstanceCard } from '@/components/ui/InstanceCard';
import { useToast, ToastContainer, ToastType } from '@/components/ui/Toast';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ShowToast = (message: string, type?: ToastType) => void;
type ToastItem = { id: string; message: string; type: ToastType };

interface RawInstanceShape {
  instanceName?: string;
  name?: string;
  status?: string;
  connectionStatus?: string;
}
interface RawInstance extends RawInstanceShape {
  instance?: RawInstanceShape;
}

function normalizeStatus(s: string | undefined): 'open' | 'close' | 'connecting' {
  if (s === 'open') return 'open';
  if (s === 'connecting') return 'connecting';
  return 'close';
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

  const rawList: RawInstance[] = Array.isArray(data?.instances) ? data.instances : [];
  const normalized = rawList
    .map((r) => {
      const inner = r.instance ?? r;
      const name = inner.instanceName ?? inner.name;
      if (!name) return null;
      return {
        instanceName: name,
        status: normalizeStatus(inner.status ?? inner.connectionStatus),
      };
    })
    .filter((x): x is { instanceName: string; status: 'open' | 'close' | 'connecting' } => x !== null);

  const stats = {
    total: normalized.length,
    connected: normalized.filter((i) => i.status === 'open').length,
    connecting: normalized.filter((i) => i.status === 'connecting').length,
    disconnected: normalized.filter((i) => i.status === 'close').length,
  };

  return (
    <div className="admin-shell">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <header className="admin-hero">
        <div className="admin-hero-text">
          <div className="admin-badge">
            <Zap size={12} /> Evolution API · v2.3.7
          </div>
          <h1>Painel <span className="grad">EvoConnect</span></h1>
          <p>Gerencie instâncias e compartilhe links de conexão sem expor sua Global Key.</p>
        </div>
        <div className="admin-hero-actions">
          <button onClick={() => mutate()} className="btn-secondary" disabled={isLoading} aria-label="Atualizar">
            <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
          </button>
          <button className="btn-secondary" aria-label="Configurações">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <section className="admin-stats">
        <StatCard label="Total" value={stats.total} icon={<Activity size={16} />} accent="#E5E5E5" />
        <StatCard label="Conectadas" value={stats.connected} icon={<CheckCircle2 size={16} />} accent="var(--success)" />
        <StatCard label="Conectando" value={stats.connecting} icon={<RefreshCw size={16} />} accent="#fbbf24" />
        <StatCard label="Desconectadas" value={stats.disconnected} icon={<XCircle size={16} />} accent="var(--error)" />
      </section>

      <div className="admin-grid">
        <aside className="admin-col-left">
          <GlassCard title="Nova Instância">
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Nome da Instância</label>
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
                className="btn-whatsapp"
                style={{ width: '100%' }}
                disabled={isCreating}
              >
                {isCreating ? 'Criando...' : <><Plus size={18} /> Criar Instância</>}
              </button>
            </form>
          </GlassCard>

          <div className="info-box">
            <AlertCircle color="var(--primary)" size={20} />
            <p>As instâncias são criadas com QR Code automático. Basta copiar o link e enviar ao cliente.</p>
          </div>
        </aside>

        <main className="admin-col-main">
          <div className="section-label">
            <span>Suas instâncias</span>
            <span className="counter">{stats.total}</span>
          </div>
          <div className="instances-grid">
            {normalized.map((inst, i) => (
              <InstanceCard
                key={inst.instanceName || `inst-${i}`}
                instance={inst}
                onDelete={handleDelete}
              />
            ))}

            {isLoading && normalized.length === 0 && (
              <div className="empty-state">Carregando instâncias...</div>
            )}
            {!isLoading && normalized.length === 0 && (
              <div className="empty-state">
                <div className="empty-ic"><Plus size={24} /></div>
                <h4>Nenhuma instância ainda</h4>
                <p>Crie a primeira ao lado para gerar o link do cliente.</p>
              </div>
            )}
          </div>
        </main>

        <aside className="admin-col-right">
          <GlassCard style={{ padding: '16px', background: '#0a0a0c', border: '1px solid #1d1d20' }}>
            <div className="term-head">
              <div className="term-dots">
                <span style={{ background: '#ff5f56' }} />
                <span style={{ background: '#ffbd2e' }} />
                <span style={{ background: '#27c93f' }} />
              </div>
              <div className="term-title">
                <Terminal size={14} color="var(--primary)" />
                <span>Live Logs</span>
              </div>
            </div>
            <TerminalLogs />
          </GlassCard>
        </aside>
      </div>

      <style jsx>{`
        .admin-shell {
          padding: 48px 24px 80px;
          max-width: 1320px;
          margin: 0 auto;
        }
        .admin-hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 28px;
        }
        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--primary);
          background: rgba(37, 211, 102, 0.08);
          border: 1px solid rgba(37, 211, 102, 0.2);
          padding: 4px 10px;
          border-radius: 999px;
          margin-bottom: 14px;
          font-weight: 500;
        }
        .admin-hero h1 {
          font-size: clamp(1.8rem, 3.2vw, 2.6rem);
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .grad {
          background: linear-gradient(135deg, #25D366 0%, #7cf7af 60%, #ffffff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .admin-hero p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          max-width: 540px;
          margin-top: 8px;
        }
        .admin-hero-actions {
          display: flex;
          gap: 10px;
        }

        .admin-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 32px;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: minmax(280px, 320px) minmax(0, 1fr) minmax(300px, 360px);
          gap: 24px;
          align-items: start;
        }

        .admin-col-left { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 24px; }
        .admin-col-right { position: sticky; top: 24px; }

        .info-box {
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid rgba(37, 211, 102, 0.15);
          background: rgba(37, 211, 102, 0.04);
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .info-box p { font-size: 0.825rem; color: var(--text-secondary); margin: 0; line-height: 1.45; }

        .section-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px 14px;
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .counter {
          font-variant-numeric: tabular-nums;
          padding: 2px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-glass);
          color: var(--text-primary);
          font-size: 0.72rem;
        }

        .instances-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 18px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 64px 20px;
          color: var(--text-secondary);
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 20px;
          background: rgba(255,255,255,0.015);
        }
        .empty-state h4 { color: var(--text-primary); margin: 10px 0 4px; font-weight: 500; }
        .empty-state p { font-size: 0.875rem; margin: 0; }
        .empty-ic {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(37, 211, 102, 0.08);
          color: var(--primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(37, 211, 102, 0.2);
        }

        .term-head {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #1d1d20;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }
        .term-dots { display: flex; gap: 6px; }
        .term-dots span { width: 10px; height: 10px; border-radius: 50%; display: inline-block; opacity: 0.9; }
        .term-title { display: flex; align-items: center; gap: 8px; font-family: monospace; font-size: 0.85rem; color: var(--text-secondary); }

        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 1100px) {
          .admin-grid { grid-template-columns: 1fr; }
          .admin-col-left, .admin-col-right { position: static; }
        }
        @media (max-width: 640px) {
          .admin-shell { padding: 28px 16px 60px; }
          .admin-stats { grid-template-columns: repeat(2, 1fr); }
          .admin-hero { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent: string }) {
  return (
    <div
      style={{
        padding: '16px 18px',
        borderRadius: '16px',
        border: '1px solid var(--border-glass)',
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: accent, fontSize: '0.78rem', letterSpacing: '0.04em' }}>
        {icon} <span style={{ textTransform: 'uppercase', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.85rem', fontWeight: 600, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 'auto -30% -60% auto',
          width: '160px',
          height: '160px',
          background: accent,
          opacity: 0.08,
          filter: 'blur(40px)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
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
