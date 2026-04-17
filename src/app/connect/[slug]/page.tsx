'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { QrCode, Smartphone, Loader2, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ConnectPage() {
  const { slug } = useParams();
  const [method, setMethod] = useState<'qrcode' | 'pairing'>('qrcode');
  const [phone, setPhone] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Poll status a cada 5 segundos
  const { data: statusData } = useSWR(
    slug ? `/api/connect/status?name=${slug}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  // Poll QR Code data a cada 30 segundos (se não estiver conectado)
  const { data: connectData, mutate: refreshConnect } = useSWR(
    slug && !statusData?.isConnected && method === 'qrcode' 
      ? `/api/connect/data?name=${slug}&type=qrcode` 
      : null,
    fetcher,
    { refreshInterval: 40000 }
  );

  const handleGetPairingCode = async () => {
    if (!phone) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/connect/data?name=${slug}&type=pairing&phone=${phone}`);
      const data = await res.json();
      if (data.code) {
        setPairingCode(data.code);
      } else {
        throw new Error(data.message || 'Falha ao gerar código');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (statusData?.isConnected) {
    return (
      <main className="connect-container">
        <GlassCard className="status-card success">
          <CheckCircle2 size={64} color="var(--success)" />
          <h2>WhatsApp Conectado!</h2>
          <p>Sua instância <strong>{slug}</strong> está ativa e sincronizada.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '20px', color: 'var(--text-secondary)' }}>
            Você já pode fechar esta aba.
          </p>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="connect-container">
      <div className="connect-header">
        <h1>Conectar WhatsApp</h1>
        <p>Instância: <strong>{slug}</strong></p>
      </div>

      <div className="method-tabs">
        <button 
          className={method === 'qrcode' ? 'active' : ''} 
          onClick={() => setMethod('qrcode')}
        >
          <QrCode size={18} /> QR Code
        </button>
        <button 
          className={method === 'pairing' ? 'active' : ''} 
          onClick={() => setMethod('pairing')}
        >
          <Smartphone size={18} /> Código de Pareamento
        </button>
      </div>

      <GlassCard className="main-connect-card">
        {method === 'qrcode' ? (
          <div className="qrcode-section">
            {connectData?.base64 ? (
              <div className="qr-wrapper">
                <img src={connectData.base64} alt="QR Code" />
              </div>
            ) : (
              <div className="loading-wrapper">
                <Loader2 className="spin" size={48} />
                <p>Gerando QR Code...</p>
              </div>
            )}
            <div className="instructions">
              <ol>
                <li>Abra o WhatsApp no seu celular</li>
                <li>Toque em <strong>Configurações</strong> ou <strong>Menu</strong></li>
                <li>Selecione <strong>Aparelhos Conectados</strong></li>
                <li>Toque em <strong>Conectar um Aparelho</strong> e aponte para a tela</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="pairing-section">
            {!pairingCode ? (
              <div className="pairing-form">
                <p>Digite seu número de telefone com o código do país (DDI e DDD).</p>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="ex: 5511999999999" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                />
                <button 
                  className="btn-primary" 
                  onClick={handleGetPairingCode}
                  disabled={isGenerating || phone.length < 10}
                  style={{ width: '100%', marginTop: '16px' }}
                >
                  {isGenerating ? 'Solicitando...' : 'Gerar Código'}
                </button>
              </div>
            ) : (
              <div className="pairing-display">
                <div className="code-display">
                  {pairingCode.split('').map((char, i) => (
                    <span key={i} className="code-char">{char}</span>
                  ))}
                </div>
                <p className="experimental-warning">
                  ⚠️ O método de Pairing Code é experimental na v2.3.7. Se apresentar erros, use o QR Code.
                </p>
                <button className="btn-secondary" onClick={() => setPairingCode('')} style={{ marginTop: '20px' }}>
                  Usar outro número
                </button>
              </div>
            )}
            <div className="instructions">
               <ol>
                <li>No WhatsApp, vá em <strong>Aparelhos Conectados</strong></li>
                <li>Toque em <strong>Conectar com número de telefone</strong></li>
                <li>Insira o código acima no seu celular</li>
              </ol>
            </div>
          </div>
        )}
      </GlassCard>

      <div className="footer-badges">
        <div className="badge">
          <ShieldCheck size={16} /> Conexão Criptografada
        </div>
        <div className="badge">
          <RefreshCw size={16} /> Sincronização em Tempo Real
        </div>
      </div>

      <style jsx>{`
        .connect-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          max-width: 500px;
          margin: 0 auto;
        }
        .connect-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .connect-header h1 {
          font-size: 2rem;
          margin-bottom: 8px;
        }
        .method-tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 12px;
          margin-bottom: 20px;
          width: 100%;
        }
        .method-tabs button {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .method-tabs button.active {
          background: var(--bg-card);
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .main-connect-card {
          width: 100%;
          text-align: center;
        }
        .qr-wrapper img {
          width: 260px;
          height: 260px;
          background: white;
          padding: 10px;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        .loading-wrapper {
          padding: 60px 0;
          color: var(--text-secondary);
        }
        .instructions {
          text-align: left;
          background: rgba(255,255,255,0.03);
          padding: 20px;
          border-radius: 12px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .instructions ol {
          padding-left: 20px;
        }
        .instructions li {
          margin-bottom: 8px;
        }
        .pairing-display {
          padding: 20px 0;
        }
        .code-display {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 24px;
        }
        .code-char {
          font-size: 2rem;
          font-weight: 700;
          background: rgba(255,255,255,0.1);
          width: 45px;
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid var(--border-glass);
          color: var(--primary);
        }
        .experimental-warning {
          font-size: 0.8rem;
          color: rgba(255, 165, 0, 0.8);
          margin-bottom: 16px;
        }
        .status-card.success {
          text-align: center;
          padding: 60px 40px;
        }
        .footer-badges {
          display: flex;
          gap: 20px;
          margin-top: 40px;
        }
        .badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: var(--text-secondary);
          opacity: 0.7;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
