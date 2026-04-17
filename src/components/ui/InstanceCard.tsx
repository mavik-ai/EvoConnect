'use client';

import React from 'react';
import { EvolutionInstance } from '@/lib/evolution';
import { GlassCard } from '@/components/ui/GlassCard';
import { Smartphone, CheckCircle, XCircle, Loader2, Trash2, Link as LinkIcon } from 'lucide-react';

interface InstanceCardProps {
  instance: EvolutionInstance & { connectToken?: string };
  onDelete: (name: string) => void;
}

const STATUS_CONFIG = {
  open: {
    label: 'Conectado',
    color: 'var(--success)',
    glow: 'rgba(16, 185, 129, 0.35)',
    bg: 'rgba(16, 185, 129, 0.1)',
    Icon: CheckCircle,
  },
  connecting: {
    label: 'Conectando…',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.35)',
    bg: 'rgba(251, 191, 36, 0.1)',
    Icon: Loader2,
  },
  close: {
    label: 'Desconectado',
    color: 'var(--error)',
    glow: 'rgba(239, 68, 68, 0.35)',
    bg: 'rgba(239, 68, 68, 0.1)',
    Icon: XCircle,
  },
} as const;

export const InstanceCard: React.FC<InstanceCardProps> = ({ instance, onDelete }) => {
  const cfg = STATUS_CONFIG[instance.status] ?? STATUS_CONFIG.close;
  const StatusIcon = cfg.Icon;
  const [copied, setCopied] = React.useState(false);

  const copyLink = () => {
    if (!instance.connectToken) return;
    const url = `${window.location.origin}/connect/${instance.instanceName}?t=${instance.connectToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard
      className="instance-card"
      style={{
        border: `1px solid ${cfg.color}`,
        boxShadow: `0 0 24px ${cfg.glow}`,
        transition: 'box-shadow 0.3s, border-color 0.3s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: cfg.bg, color: cfg.color }}>
            <Smartphone size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0 }}>{instance.instanceName}</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: cfg.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <StatusIcon size={14} className={instance.status === 'connecting' ? 'spin-ic' : ''} />
              {cfg.label}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={copyLink}
          className="btn-primary"
          style={{ flex: 1, padding: '8px', fontSize: '0.875rem', background: copied ? 'var(--success)' : '' }}
        >
          {copied ? <><CheckCircle size={16} /> Copiado!</> : <><LinkIcon size={16} /> Link do Cliente</>}
        </button>
        <button
          onClick={() => onDelete(instance.instanceName)}
          className="btn-secondary"
          style={{ padding: '8px', color: 'var(--error)' }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <style jsx>{`
        .spin-ic {
          animation: spin-ic 1s linear infinite;
        }
        @keyframes spin-ic {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </GlassCard>
  );
};
