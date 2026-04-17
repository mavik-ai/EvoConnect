# SPECS.md — EvoConnect

## Fase 1 — Fundação

| SPEC | Título | Status | Blocked by | Reqs |
| :--- | :--- | :--- | :--- | :--- |
| SPEC-001 | Scaffold Next.js + Design System | Todo | - | RF01 |
| SPEC-002 | Validador de Conexão Evolution | Todo | SPEC-001 | RF02 |
| SPEC-003 | Dashboard Admin - Listagem | Todo | SPEC-002 | RF03 |

---

## SPEC-001 — Scaffold Next.js + Design System
**Fase ROADMAP:** 1
**Depende de:** nenhuma
**Estimativa:** S

### Objetivo
Criar a estrutura base do projeto Next.js com o Design System da Mavik configurado (cores, tipografia e componentes base).

### Critério de Aceite
- [ ] Projeto Next.js 15 rodando sem erros.
- [ ] Arquivo `src/styles/design-system.css` com as variáveis de cor e fontes (Inter).
- [ ] Layout base dark mode implementado.

---

## SPEC-002 — Validador de Conexão Evolution
**Fase ROADMAP:** 1
**Depende de:** SPEC-001
**Estimativa:** S

### Objetivo
Implementar uma API route que valida se a URL e a Global Key fornecidas conseguem se comunicar com a Evolution API.

### Critério de Aceite
- [ ] Endpoint `/api/evolution/validate` retorna status da conexão.
- [ ] Cache da configuração em memória ou arquivo local (v1 simplicity).

---

## Fase 2 — Conectividade

| SPEC | Título | Status | Blocked by | Reqs |
| :--- | :--- | :--- | :--- | :--- |
| SPEC-004 | Gestor de Instâncias (CRUD) | Todo | SPEC-003 | RF04 |
| SPEC-005 | Página de Conexão (Magic Link) | Todo | SPEC-004 | RF05 |
| SPEC-006 | WebSocket/Polling de QR Code | Todo | SPEC-005 | RF06 |

---

## SPEC-005 — Página de Conexão (Magic Link)
**Fase ROADMAP:** 2
**Depende de:** SPEC-004
**Estimativa:** M

### Objetivo
Criar uma página pública acessível via slug `/connect/[instance]` que exibe a interface de pareamento.

### Critério de Aceite
- [ ] Página acessível sem autenticação administrativa.
- [ ] Layout 'premium' com glassmorphism.
- [ ] Botão para "Gerar QR Code".

---

## SPEC-006 — QR Code & Pairing Code Real-time
**Fase ROADMAP:** 2
**Depende de:** SPEC-005
**Estimativa:** M

### Objetivo
Implementar a lógica que busca o QR Code ou Pairing Code na Evolution API e mantém a UI atualizada.

### Critério de Aceite
- [ ] QR Code exibido na tela via Base64.
- [ ] Suporte a "Pairing Code" via INPUT de telefone.
- [ ] Detecção automática de conexão bem-sucedida.
