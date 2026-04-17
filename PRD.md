# PRD — EvoConnect

## Visão
Um portal de autoatendimento para conexão simplificada de instâncias da Evolution API v2.3.7, permitindo que usuários finais (clientes) vinculem seus dispositivos WhatsApp de forma autônoma e segura, sem exposição de chaves globais.

## Problema
Atualmente, a conexão à Evolution API exige acesso administrativo ou integração técnica complexa. Clientes de agências e negócios têm dificuldade em realizar o pareamento inicial (scan do QR Code) se não houver uma interface amigável e dedicada.

## Público-Alvo
- **Negócios/Agências**: Donos de instâncias da Evolution API que precisam que seus clientes conectem seus próprios WhatsApps.
- **Usuário Final**: Clientes que precisam apenas escanear um QR Code para ativar o serviço contratado.

## Módulos
| Módulo | Descrição | Prioridade |
|--------|-----------|------------|
| Admin Config | Configuração da URL da Evolution API e Global API Key. | Alta |
| Instance Manager | Criação e gestão de instâncias individuais para clientes. | Alta |
| Public Connection | Página pública de pareamento com QR Code e Pairing Code. | Alta |
| Sync Dashboard | Visualização em tempo real do status das conexões. | Média |

## Fluxos Principais
### Fluxo 1: Setup do Administrador
1. O administrador acessa o painel do EvoConnect.
2. Define `EVO_URL` e `EVO_GLOBAL_KEY`.
3. O sistema valida a conexão com a API.

### Fluxo 2: Geração de Link para Cliente
1. O administrador cria uma nova instância (ex: "cliente-mavik-01").
2. O sistema gera um "Magic Link" único para essa instância.
3. O administrador compartilha o link com o cliente.

### Fluxo 3: Autoatendimento do Cliente
1. O cliente abre o link.
2. Visualiza uma interface 'Premium' seguindo o Design System da Mavik.
3. Escolhe entre "Escanear QR Code" ou "Código de Pareamento" (v2.3.7).
4. O sistema exibe o código em tempo real via pooling/websocket.
5. Após o pareamento bem-sucedido, o sistema mostra confirmação e fecha a sessão.

## Fora do Escopo v1.0
- Gestão de mensagens (chat).
- Configurações avançadas de Webhook por instância (v1 usará webhook global).
- Multi-tenancy para múltiplos administradores (v1 é single-admin).

## Métricas de Sucesso
- Redução de chamados de suporte para "como conectar o WhatsApp".
- Tempo médio de conexão < 1 minuto.
- 100% de estabilidade na exibição do QR Code.
