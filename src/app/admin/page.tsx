'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Plus, RefreshCw, Settings, Terminal, Eye, EyeOff, Activity, CheckCircle2, XCircle, Zap, Search, X, AlertCircle } from 'lucide-react';
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
  const [createOpen, setCreateOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'connecting' | 'close'>('all');
  const [query, setQuery] = useState('');

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

  const filtered = normalized.filter((i) => {
    if (filter !== 'all' && i.status !== filter) return false;
    if (query && !i.instanceName.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setNewInstanceName('');
    setCreateOpen(true);
  };

  const handleCreateAndClose = async (e: React.FormEvent) => {
    await handleCreate(e);
    if (!isCreating) setCreateOpen(false);
  };

  const filterConfigs: { key: typeof filter; label: string; count: number; color?: string }[] = [
    { key: 'all', label: 'Todas', count: stats.total },
    { key: 'open', label: 'Conectadas', count: stats.connected, color: 'var(--success)' },
    { key: 'connecting', label: 'Conectando', count: stats.connecting, color: '#fbbf24' },
    { key: 'close', label: 'Desconectadas', count: stats.disconnected, color: 'var(--error)' },
  ];

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
          <button onClick={openCreate} className="btn-whatsapp hero-cta">
            <Plus size={18} /> Nova Instância
          </button>
          <button onClick={() => mutate()} className="btn-secondary icon-btn" disabled={isLoading} aria-label="Atualizar">
            <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
          </button>
          <button className="btn-secondary icon-btn" aria-label="Configurações">
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

      <section className="toolbar">
        <div className="chips" role="tablist" aria-label="Filtrar instâncias">
          {filterConfigs.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`chip ${filter === f.key ? 'chip-active' : ''}`}
              style={filter === f.key && f.color ? { borderColor: f.color, color: f.color } : undefined}
            >
              {f.label}
              <span className="chip-count">{f.count}</span>
            </button>
          ))}
        </div>
        <div className="search-box">
          <Search size={16} />
          <input
            type="search"
            placeholder="Buscar instância…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="search-clear" aria-label="Limpar busca">
              <X size={14} />
            </button>
          )}
        </div>
      </section>

      <main className="instances-main">
        <div className="instances-grid">
          {filtered.map((inst, i) => (
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
              <div className="empty-ic"><Plus size={28} /></div>
              <h4>Nenhuma instância ainda</h4>
              <p>Crie sua primeira instância para gerar o link do cliente.</p>
              <button onClick={openCreate} className="btn-whatsapp" style={{ marginTop: '20px' }}>
                <Plus size={18} /> Criar primeira instância
              </button>
            </div>
          )}
          {!isLoading && normalized.length > 0 && filtered.length === 0 && (
            <div className="empty-state">
              <h4>Nenhum resultado</h4>
              <p>Nenhuma instância corresponde ao filtro ou busca atual.</p>
              <button onClick={() => { setFilter('all'); setQuery(''); }} className="btn-secondary" style={{ marginTop: '20px' }}>
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Floating Logs Pill */}
      <button
        className="logs-pill"
        onClick={() => setLogsOpen(true)}
        aria-label="Abrir logs"
      >
        <Terminal size={16} />
        <span>Logs</span>
      </button>

      {/* Logs Drawer */}
      {logsOpen && (
        <div className="drawer-backdrop" onClick={() => setLogsOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <div className="term-dots">
                <span style={{ background: '#ff5f56' }} />
                <span style={{ background: '#ffbd2e' }} />
                <span style={{ background: '#27c93f' }} />
              </div>
              <div className="drawer-title">
                <Terminal size={14} color="var(--primary)" />
                <span>Live Logs</span>
              </div>
              <button className="drawer-close" onClick={() => setLogsOpen(false)} aria-label="Fechar">
                <X size={16} />
              </button>
            </div>
            <div className="drawer-body">
              <TerminalLogs />
            </div>
          </div>
        </div>
      )}

      {/* Create Instance Modal */}
      {createOpen && (
        <div className="modal-backdrop" onClick={() => !isCreating && setCreateOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>Nova Instância</h3>
                <p>Escolha um nome único. O link do cliente será gerado a partir dele.</p>
              </div>
              <button
                className="drawer-close"
                onClick={() => setCreateOpen(false)}
                disabled={isCreating}
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateAndClose} className="modal-body">
              <label htmlFor="inst-name">Nome da Instância</label>
              <input
                id="inst-name"
                type="text"
                className="glass-input"
                placeholder="ex: cliente-xyz"
                value={newInstanceName}
                onChange={(e) => setNewInstanceName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                autoFocus
                required
              />
              <div className="modal-hint">
                <AlertCircle size={14} color="var(--primary)" />
                <span>Use apenas letras minúsculas, números e hífens. O QR Code é gerado automaticamente.</span>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary" disabled={isCreating}>
                  Cancelar
                </button>
                <button type="submit" className="btn-whatsapp" disabled={isCreating || !newInstanceName}>
                  {isCreating ? 'Criando...' : <><Plus size={16} /> Criar Instância</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-shell {
          padding: 48px 24px 120px;
          max-width: 1280px;
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
          align-items: center;
        }
        .hero-cta { padding: 12px 18px; font-weight: 600; }
        .icon-btn { padding: 10px 14px; }

        .admin-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid var(--border-glass);
          background: rgba(255,255,255,0.025);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .chip:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); }
        .chip-active {
          background: rgba(255,255,255,0.06);
          color: var(--text-primary);
          border-color: rgba(255,255,255,0.2);
        }
        .chip-count {
          background: rgba(0,0,0,0.3);
          padding: 1px 8px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-variant-numeric: tabular-nums;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          min-width: 240px;
          transition: all 0.15s ease;
        }
        .search-box:focus-within {
          border-color: rgba(37, 211, 102, 0.4);
          background: rgba(255,255,255,0.05);
        }
        .search-box input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          flex: 1;
          font-size: 0.9rem;
        }
        .search-box input::placeholder { color: var(--text-secondary); }
        .search-clear {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          padding: 2px;
          border-radius: 4px;
        }
        .search-clear:hover { color: var(--text-primary); background: rgba(255,255,255,0.08); }

        .instances-main { min-height: 300px; }
        .instances-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 18px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
          color: var(--text-secondary);
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 20px;
          background: rgba(255,255,255,0.015);
        }
        .empty-state h4 { color: var(--text-primary); margin: 14px 0 6px; font-weight: 500; font-size: 1.05rem; }
        .empty-state p { font-size: 0.875rem; margin: 0; }
        .empty-ic {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(37, 211, 102, 0.08);
          color: var(--primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(37, 211, 102, 0.2);
        }

        /* Floating Logs pill */
        .logs-pill {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          border-radius: 999px;
          background: rgba(10,10,12,0.9);
          border: 1px solid rgba(37, 211, 102, 0.3);
          color: var(--primary);
          font-size: 0.82rem;
          font-family: monospace;
          cursor: pointer;
          backdrop-filter: blur(20px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(37, 211, 102, 0.1);
          transition: all 0.2s ease;
          z-index: 40;
        }
        .logs-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(0,0,0,0.6), 0 0 20px rgba(37, 211, 102, 0.2);
        }

        /* Drawer (logs) */
        .drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(6px);
          z-index: 90;
          display: flex;
          justify-content: flex-end;
          animation: fade-in 0.2s ease;
        }
        .drawer {
          width: min(440px, 100%);
          height: 100%;
          background: #0a0a0c;
          border-left: 1px solid #1d1d20;
          display: flex;
          flex-direction: column;
          animation: slide-in 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .drawer-head {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          border-bottom: 1px solid #1d1d20;
        }
        .drawer-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: monospace;
          font-size: 0.88rem;
          color: var(--text-secondary);
          flex: 1;
        }
        .drawer-close {
          background: transparent;
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          padding: 6px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
        }
        .drawer-close:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); }
        .drawer-body { flex: 1; padding: 16px 20px; overflow-y: auto; }

        .term-dots { display: flex; gap: 6px; }
        .term-dots span { width: 10px; height: 10px; border-radius: 50%; display: inline-block; opacity: 0.9; }

        /* Modal (new instance) */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fade-in 0.15s ease;
        }
        .modal {
          width: min(460px, 100%);
          background: linear-gradient(180deg, rgba(30,30,30,0.85), rgba(20,20,20,0.85));
          border: 1px solid var(--border-glass);
          border-radius: 20px;
          backdrop-filter: blur(24px);
          box-shadow: 0 30px 80px -20px rgba(0,0,0,0.8);
          overflow: hidden;
          animation: modal-in 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .modal-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          padding: 22px 24px 16px;
          border-bottom: 1px solid var(--border-glass);
        }
        .modal-head h3 {
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .modal-head p {
          margin-top: 4px;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .modal-body {
          padding: 20px 24px 22px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .modal-body label {
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .modal-hint {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(37, 211, 102, 0.05);
          border: 1px solid rgba(37, 211, 102, 0.15);
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
        }

        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @media (max-width: 720px) {
          .admin-shell { padding: 28px 16px 100px; }
          .admin-hero { flex-direction: column; align-items: flex-start; }
          .admin-hero-actions { width: 100%; justify-content: flex-start; }
          .admin-stats { grid-template-columns: repeat(2, 1fr); }
          .toolbar { flex-direction: column; align-items: stretch; }
          .search-box { width: 100%; }
          .logs-pill { bottom: 16px; right: 16px; }
          .drawer { width: 100%; }
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
