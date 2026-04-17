# EvoConnect

**EvoConnect** é um portal de autoatendimento white-label para vincular instâncias da [Evolution API](https://evolution-api.com/). Projetado sob o padrão visual e de engenharia da **Mavik**, ele permite que clientes finais conectem seus WhatsApps de forma autônoma e segura.

## 🚀 Funcionalidades
- **Painel Admin**: Gestão simples de instâncias (Criação, Exclusão, Status).
- **Autoatendimento (Magic Link)**: Link público único por cliente para pareamento.
- **Multi-Método**: Suporte a QR Code e Pairing Code (Experimental v2.3.7).
- **Real-time Status**: Atualização automática do estado de conexão.
- **Segurança**: Credenciais globais protegidas no servidor (Next.js API Routes).

## 🛠️ Stack
- [Next.js 15](https://nextjs.org/) (App Router)
- Vanilla CSS (Mavik Design System)
- [Lucide React](https://lucide.dev/) (Ícones)
- [SWR](https://swr.vercel.app/) (Data Fetching & Polling)

## 📦 Como Instalar

### 1. Clonar Repositório
```bash
git clone https://github.com/seu-usuario/evoconnect.git
cd evoconnect
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` baseado no `.env.example`:
```bash
cp .env.example .env.local
```
Preencha os valores:
- `EVO_URL`: URL da sua Evolution API (ex: `https://api.empresa.com`).
- `EVO_GLOBAL_KEY`: Sua chave global da API.
- `ADMIN_PASSWORD`: Uma senha para acesso ao seu painel.

### 3. Instalar Dependências
```bash
npm install
```

### 4. Rodar Localmente
```bash
npm run dev
```
Acesse `http://localhost:3000`.

## 🌍 Deploy na Vercel (Importante🚨)

O deploy ideal para este projeto é na Vercel. 

**⚠️ PASSO CRÍTICO ANTES DO DEPLOY:**
Você **DEVE** configurar as variáveis de ambiente na Vercel para que o projeto funcione.

1. Suba o projeto para um repositório no GitHub.
2. No dashboard da [Vercel](https://vercel.com/), clique em "Add New..." > "Project" e importe o seu repositório.
3. Antes de clicar em Deploy, expanda a seção **Environment Variables** e adicione as seguintes chaves (exatamente como configurado no passo a passo local):
   * `NEXT_PUBLIC_SITE_URL` (Sua URL da Vercel ou domínio)
   * `EVO_URL` (Sua URL da Evolution API)
   * `EVO_GLOBAL_KEY` (Sua Global API Key)
   * `ADMIN_PASSWORD` (A senha que deseja usar no painel)
4. Clique em **Deploy**.

## 🛡️ Segurança
Este projeto foi construído para ser seguro em repositórios públicos. **Nunca remova a `.env` do `.gitignore`**. O `Global API Key` é usado exclusivamente em chamadas server-side.

---
Criado com ❤️ por **Mavik.ai**
