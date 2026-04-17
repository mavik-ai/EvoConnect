# CLAUDE.md — EvoConnect
> Sistema de autoatendimento para vinculação de instâncias Evolution API v2.3.7.

## Stack
- **Frontend**: Next.js 15 (App Router)
- **Styling**: Vanilla CSS (CSS Modules) + Mavik Design System
- **API Client**: Evolution API v2.3.7
- **State/Real-time**: SWR (polling) ou Webhooks locais
- **Icons**: Lucide React

## Comandos
```bash
npm run dev          # Iniciar ambiente de desenvolvimento
npm run build        # Build de produção
npm start            # Iniciar servidor de produção
```

## Estrutura de Pastas
```text
src/
  app/               # Rotas e Páginas (Admin, Connect)
  components/        # Componentes UI (Mavik DS)
  lib/               # Clientes API e utilitários
  styles/            # CSS Global e Design Tokens
```

## Regras Fundamentais
1. **Design Mavik**: Sempre usar o `design-system` definido. Estética deve ser "Premium/Experimental" (Gradients, Glassmorphism).
2. **Segurança**: Jamais expor o `EVO_GLOBAL_KEY` no client-side. Todas as chamadas sensíveis devem passar por rotas de API do Next.js.
3. **Instâncias**: O fluxo deve suportar QR Code e Pairing Code (v2.3.7).
4. **UX**: O estado de conexão deve ser atualizado em tempo real na tela do cliente.
5. **Responsividade**: Mobile-first, já que o usuário escaneia o QR Code com o celular.
6. **Mavik Project Standard**: Seguir PRD, SPECS, ROADMAP e DEVLOG localizados na raiz.

## Variáveis de Ambiente
```text
NEXT_PUBLIC_SITE_URL
EVO_URL
EVO_GLOBAL_KEY
ADMIN_PASSWORD
```

@AGENTS.md
