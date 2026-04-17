# ROADMAP — EvoConnect

## Fase 1 — Fundação [v0.1.0]
**Objetivo:** Ambiente configurado com Design System e Admin Base.
- [x] SPEC-001: Scaffold Next.js + Design System Mavik
- [x] SPEC-002: Configuração de Variáveis de Ambiente e Validação de API
- [x] SPEC-003: Dashboard Admin - Listagem de Instâncias

### Milestone Gate — Fase 1
- [x] Interface visual reflete o padrão Mavik.
- [x] Chamadas para Evolution API (Global Key) funcionando via server-side.

## Fase 2 — Conectividade [v0.2.0]
**Objetivo:** Fluxo completo de conexão (QR / Pairing) funcional.
- [x] SPEC-004: Endpoint de criação e deleção de instâncias
- [x] SPEC-005: Página Pública de Conexão (Magic Link)
- [x] SPEC-006: Componente de QR Code Real-time (SWR Polling)
- [x] SPEC-007: Suporte a Pairing Code (v2.3.7)

### Milestone Gate — Fase 2
- [x] Usuário consegue conectar WhatsApp via link externo sem ver a API Key Global.
- [x] Status da conexão é refletido imediatamente na UI.

## Fase 3 — Polimento & UX [v0.3.0]
**Objetivo:** Feedback visual e tratamento de erros.
- [x] SPEC-008: Notificações Toast e Feedback de Sucesso
- [x] SPEC-009: Dashboard de monitoramento (Status das instâncias)
- [x] SPEC-010: Deploy e Finalização de Documentação

### Milestone Gate — Fase 3
- [x] Sistema resiliente a falhas de rede.
- [x] Interface mobile-friendly de alta performance.
