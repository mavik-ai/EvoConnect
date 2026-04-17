'use client';

import React from 'react';
import { EvolutionInstance } from '@/lib/evolution';
import { GlassCard } from '@/components/ui/GlassCard';
import { Smartphone, CheckCircle, XCircle, Trash2, Link as LinkIcon } from 'lucide-react';

interface InstanceCardProps {
  instance: EvolutionInstance;
  onDelete: (name: string) => void;
}

export const InstanceCard: React.FC<InstanceCardProps> = ({ instance, onDelete }) => {
  const isConnected = instance.status === 'open';

  const copyLink = () => {
    const url = `${window.location.origin}/connect/${instance.instanceName}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado para a área de transferência!');
  };

  return (
    <GlassCard className="instance-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ 
            padding: '8px', 
            borderRadius: '8px', 
            background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: isConnected ? 'var(--success)' : 'var(--error)'
          }}>
            <Smartphone size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0 }}>{instance.instanceName}</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {isConnected ? (
             <CheckCircle size={20} color="var(--success)" />
          ) : (
            <XCircle size={20} color="var(--error)" />
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={copyLink}
          className="btn-primary" 
          style={{ flex: 1, padding: '8px', fontSize: '0.875rem' }}
        >
          <LinkIcon size={16} /> Link Cliente
        </button>
        <button 
          onClick={() => onDelete(instance.instanceName)}
          className="btn-secondary" 
          style={{ padding: '8px', color: 'var(--error)' }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </GlassCard>
  );
};
