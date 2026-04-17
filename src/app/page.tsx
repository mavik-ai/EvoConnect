import { QrCode, ShieldCheck, Zap } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Evo<span>Connect</span>
        </h1>
        <p className={styles.subtitle}>
          Conecte seu WhatsApp de forma autônoma e segura à Evolution API.
        </p>
      </div>

      <div className={styles.grid}>
        <div className="glass-card">
          <Zap className={styles.icon} />
          <h3>Rápido</h3>
          <p>Conexão instantânea via QR Code ou Pairing Code.</p>
        </div>

        <div className="glass-card">
          <ShieldCheck className={styles.icon} />
          <h3>Seguro</h3>
          <p>Suas credenciais nunca são expostas ao navegador.</p>
        </div>

        <div className="glass-card">
          <QrCode className={styles.icon} />
          <h3>Autônomo</h3>
          <p>Gere e escaneie o código sem depender de suporte técnico.</p>
        </div>
      </div>

      <div className={styles.actions}>
        <a href="/admin" className="btn-primary">
          Acessar Painel Admin
        </a>
      </div>
    </main>
  );
}
