'use client';

import useSWR from 'swr';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, ShieldCheck, HelpCircle, ChevronDown } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/Toast';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ConnectPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get('t') ?? '';
  const { toasts, removeToast } = useToast();

  const { data: statusData } = useSWR(
    slug && token ? `/api/connect/status?name=${slug}&t=${token}` : null,
    fetcher,
    { refreshInterval: 4000 }
  );

  const { data: connectData } = useSWR(
    slug && token && !statusData?.isConnected
      ? `/api/connect/data?name=${slug}&type=qrcode&t=${token}`
      : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  if (!token) {
    return (
      <main className="connect-shell">
        <div className="success-card" style={{ borderColor: 'rgba(255,69,58,0.25)', background: 'linear-gradient(180deg, rgba(255,69,58,0.08), rgba(255,255,255,0.01))', boxShadow: '0 30px 80px -20px rgba(255,69,58,0.25)' }}>
          <h2>Link inválido</h2>
          <p className="success-sub">Este link está incompleto ou expirado. Solicite um novo link ao administrador.</p>
        </div>
        <ConnectStyles />
      </main>
    );
  }

  if (statusData?.isConnected) {
    return (
      <main className="connect-shell">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="success-card">
          <div className="success-ring">
            <div className="success-ic">
              <CheckCircle2 size={56} strokeWidth={1.5} />
            </div>
          </div>
          <h2>WhatsApp conectado!</h2>
          <p className="success-sub">
            A instância <strong>{String(slug)}</strong> está ativa e sincronizada.
          </p>
          <div className="success-divider" />
          <p className="success-hint">Você já pode fechar esta aba com tranquilidade.</p>
        </div>
        <ConnectStyles />
      </main>
    );
  }

  const qrBase64: string | undefined = connectData?.base64 ?? connectData?.qrcode?.base64;
  const isLoadingQr = !qrBase64;

  return (
    <main className="connect-shell">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <header className="connect-header-compact">
        <h1>Conecte seu <span className="grad">WhatsApp</span></h1>
        <p className="sub">Instância <strong>{String(slug)}</strong></p>
      </header>

      <section className="qr-card">
        <div className="qr-frame">
          {isLoadingQr ? (
            <div className="qr-loading">
              <Loader2 className="spin" size={48} />
              <span>Gerando QR Code…</span>
            </div>
          ) : (
            <>
              <span className="corner tl" />
              <span className="corner tr" />
              <span className="corner bl" />
              <span className="corner br" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrBase64} alt="QR Code" />
            </>
          )}
        </div>

        <div className="status-pill">
          <span className="dot" />
          Aguardando leitura
        </div>
      </section>

      <details className="help-accordion">
        <summary>
          <HelpCircle size={16} />
          <span>Como escanear?</span>
          <ChevronDown size={16} className="chev" />
        </summary>
        <div className="help-body">
          <Step n={1} title="Abra o WhatsApp" desc="No seu celular, acesse o app do WhatsApp." />
          <Step n={2} title="Aparelhos Conectados" desc="Toque em Configurações → Aparelhos Conectados." />
          <Step n={3} title="Escaneie o código" desc="Selecione “Conectar um Aparelho” e aponte para esta tela." />
        </div>
      </details>

      <footer className="footer">
        <div className="badge">
          <ShieldCheck size={14} />
          Conexão segura · seus dados não são armazenados
        </div>
      </footer>

      <ConnectStyles />
    </main>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="step">
      <div className="step-n">{n}</div>
      <div>
        <div className="step-title">{title}</div>
        <div className="step-desc">{desc}</div>
      </div>
    </div>
  );
}

function ConnectStyles() {
  return (
    <style jsx global>{`
      .connect-shell {
        min-height: 100vh;
        max-width: 560px;
        margin: 0 auto;
        padding: 40px 20px 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
      }
      .connect-shell::before {
        content: '';
        position: absolute;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(37,211,102,0.25), transparent 60%);
        filter: blur(50px);
        z-index: -1;
        pointer-events: none;
      }

      .connect-header-compact {
        text-align: center;
        margin-bottom: 20px;
      }
      .connect-header-compact h1 {
        font-size: clamp(1.4rem, 5vw, 1.75rem);
        font-weight: 600;
        letter-spacing: -0.02em;
        line-height: 1.15;
      }
      .grad {
        background: linear-gradient(135deg, #25D366 0%, #7cf7af 60%, #ffffff 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .connect-header-compact .sub {
        margin-top: 6px;
        color: var(--text-secondary);
        font-size: 0.85rem;
      }

      .qr-card {
        width: 100%;
        padding: 28px;
        border-radius: 28px;
        background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
        border: 1px solid var(--border-glass);
        backdrop-filter: blur(20px);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        box-shadow: 0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02) inset;
      }
      .qr-frame {
        position: relative;
        width: min(400px, 70vw);
        aspect-ratio: 1 / 1;
        padding: 18px;
        border-radius: 24px;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .qr-frame img {
        width: 100%;
        height: 100%;
        display: block;
      }
      .qr-loading {
        color: #3a3a3a;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        font-size: 0.85rem;
      }
      .corner {
        position: absolute;
        width: 22px;
        height: 22px;
        border-color: var(--primary);
        border-style: solid;
        border-width: 0;
      }
      .corner.tl { top: -2px; left: -2px; border-top-width: 3px; border-left-width: 3px; border-top-left-radius: 12px; }
      .corner.tr { top: -2px; right: -2px; border-top-width: 3px; border-right-width: 3px; border-top-right-radius: 12px; }
      .corner.bl { bottom: -2px; left: -2px; border-bottom-width: 3px; border-left-width: 3px; border-bottom-left-radius: 12px; }
      .corner.br { bottom: -2px; right: -2px; border-bottom-width: 3px; border-right-width: 3px; border-bottom-right-radius: 12px; }

      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 0.8rem;
        color: var(--text-secondary);
        background: rgba(255,255,255,0.04);
        border: 1px solid var(--border-glass);
      }
      .status-pill .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--primary);
        box-shadow: 0 0 10px var(--primary);
        animation: pulse 1.6s ease-in-out infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(0.7); }
      }

      .help-accordion {
        margin-top: 20px;
        width: 100%;
        border-radius: 14px;
        border: 1px solid var(--border-glass);
        background: rgba(255,255,255,0.02);
        overflow: hidden;
      }
      .help-accordion summary {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 18px;
        cursor: pointer;
        color: var(--text-secondary);
        font-size: 0.88rem;
        list-style: none;
        user-select: none;
      }
      .help-accordion summary::-webkit-details-marker { display: none; }
      .help-accordion summary span { flex: 1; }
      .help-accordion .chev { transition: transform 0.2s ease; }
      .help-accordion[open] .chev { transform: rotate(180deg); }
      .help-accordion[open] summary { border-bottom: 1px solid var(--border-glass); color: var(--text-primary); }
      .help-body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .step {
        display: flex;
        gap: 14px;
        padding: 14px 16px;
        border-radius: 14px;
        background: rgba(255,255,255,0.025);
        border: 1px solid var(--border-glass);
        align-items: flex-start;
      }
      .step-n {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(37,211,102,0.1);
        border: 1px solid rgba(37,211,102,0.25);
        color: var(--primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        font-weight: 600;
        flex-shrink: 0;
      }
      .step-title { font-size: 0.92rem; font-weight: 500; }
      .step-desc { font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px; }

      .footer {
        margin-top: 32px;
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.72rem;
        color: var(--text-secondary);
        opacity: 0.8;
      }

      .success-card {
        text-align: center;
        padding: 60px 32px;
        width: 100%;
        border-radius: 28px;
        background: linear-gradient(180deg, rgba(37,211,102,0.08), rgba(255,255,255,0.01));
        border: 1px solid rgba(37,211,102,0.25);
        box-shadow: 0 30px 80px -20px rgba(37,211,102,0.25);
        animation: popIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      @keyframes popIn {
        0% { transform: scale(0.94); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      .success-ring {
        width: 120px;
        height: 120px;
        margin: 0 auto 24px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(37,211,102,0.25), transparent 70%);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      .success-ring::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 1px solid rgba(37,211,102,0.35);
        animation: ring 2s ease-out infinite;
      }
      @keyframes ring {
        0% { transform: scale(0.85); opacity: 0.9; }
        100% { transform: scale(1.25); opacity: 0; }
      }
      .success-ic {
        color: var(--success);
        background: rgba(37,211,102,0.15);
        border-radius: 50%;
        width: 88px;
        height: 88px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .success-card h2 {
        font-size: 1.6rem;
        letter-spacing: -0.02em;
        font-weight: 600;
      }
      .success-sub { color: var(--text-secondary); margin-top: 8px; font-size: 0.95rem; }
      .success-divider {
        margin: 28px auto 20px;
        width: 60px;
        height: 1px;
        background: rgba(255,255,255,0.08);
      }
      .success-hint { font-size: 0.85rem; color: var(--text-secondary); }

      .spin { animation: spin 1s linear infinite; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `}</style>
  );
}
