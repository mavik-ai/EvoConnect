'use client';

import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { Loader2, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useToast, ToastContainer } from '@/components/ui/Toast';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ConnectPage() {
  const { slug } = useParams();
  const { toasts, removeToast } = useToast();

  const { data: statusData } = useSWR(
    slug ? `/api/connect/status?name=${slug}` : null,
    fetcher,
    { refreshInterval: 4000 }
  );

  const { data: connectData } = useSWR(
    slug && !statusData?.isConnected
      ? `/api/connect/data?name=${slug}&type=qrcode`
      : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  if (statusData?.isConnected) {
    return (
      <main className="connect-container">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <GlassCard className="status-card success">
          <CheckCircle2 size={72} color="var(--success)" />
          <h2 style={{ marginTop: '20px' }}>WhatsApp conectado!</h2>
          <p style={{ marginTop: '8px' }}>
            Instância <strong>{slug}</strong> está ativa e sincronizada.
          </p>
          <p style={{ fontSize: '0.875rem', marginTop: '24px', color: 'var(--text-secondary)' }}>
            Você já pode fechar esta aba.
          </p>
        </GlassCard>
        <style jsx>{`
          .connect-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            max-width: 500px;
            margin: 0 auto;
          }
          .status-card.success {
            text-align: center;
            padding: 60px 40px;
          }
        `}</style>
      </main>
    );
  }

  const qrBase64: string | undefined = connectData?.base64 ?? connectData?.qrcode?.base64;

  return (
    <main className="connect-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="connect-header">
        <h1>Conectar WhatsApp</h1>
        <p>Instância: <strong>{slug}</strong></p>
      </div>

      <GlassCard className="main-connect-card">
        <div className="qrcode-section">
          {qrBase64 ? (
            <div className="qr-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrBase64} alt="QR Code" />
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
