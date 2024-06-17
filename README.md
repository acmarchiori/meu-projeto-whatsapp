# Projeto WhatsApp Business Automation

Este é um projeto para automatizar interações com clientes através do WhatsApp Business usando a biblioteca `whatsapp-web.js`. O projeto oferece funcionalidades para envio de mensagens automáticas, gerenciamento de pedidos, atendimento ao cliente e muito mais.

## Funcionalidades

- **Envio de Mensagens Automáticas**: Envio de mensagens programadas, como mensagens de bom dia.
- **Atendimento ao Cliente**: Respostas automáticas para pedidos, dúvidas ou problemas dos clientes.
- **Integração com Diferentes Setores**: Encaminhamento de mensagens para diferentes setores como atendimento, financeiro, coloristas, etc.
- **Atualizações Automáticas**: Notificação automática de status de pedidos ou informações relevantes para os clientes.

## Pré-requisitos

- Node.js
- npm (gerenciador de pacotes do Node.js)

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/acmarchiori/seu-projeto-whatsapp.git
   cd seu-projeto-whatsapp
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

## Configuração

Antes de iniciar o projeto, configure as seguintes variáveis de ambiente ou arquivos de configuração necessários:

- `Clientes.txt`: Lista de números de clientes para enviar mensagens automáticas.
- `Motoboys.txt`: Lista de números de motoboys para encaminhar mensagens relacionadas a entregas.
- `Coloristas.txt`: Lista de números de coloristas para encaminhar mensagens relacionadas a acerto de cor.
- `Atendentes.txt`: Lista de números de atendentes para encaminhar mensagens relacionadas ao atendimento ao cliente.
- `Financeiro.txt`: Lista de números de funcionários do setor financeiro para encaminhar mensagens relacionadas a questões financeiras.

## Uso

Para iniciar o projeto, execute o seguinte comando:

```bash
node index.js
```

Este comando inicializa o cliente WhatsApp e configura os handlers para lidar com as interações dos clientes.

## Bibliotecas Utilizadas

### node-cron

O `node-cron` é um agendador de tarefas para Node.js baseado no cron. Ele permite que você agende funções para serem executadas em momentos específicos ou em intervalos regulares. Para mais detalhes, consulte a [documentação do node-cron](https://github.com/node-cron/node-cron).

### qrcode-terminal

O `qrcode-terminal` é uma biblioteca para Node.js que gera QR codes no terminal. É comumente utilizado para autenticação e login em sistemas que usam QR codes, como é o caso da autenticação no WhatsApp Web neste projeto. Para mais detalhes, consulte a [documentação do qrcode-terminal](https://github.com/gtanner/qrcode-terminal).

### whatsapp-web.js

O `whatsapp-web.js` é uma biblioteca que fornece uma API para interagir com o WhatsApp Web usando Node.js. Ela permite automatizar o envio e recebimento de mensagens, gerenciamento de contatos, grupos, entre outras funcionalidades disponíveis no WhatsApp Web. Para mais detalhes, consulte a [documentação do whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).

## Autor

Antonio Marchiori - [GitHub](https://github.com/acmarchiori)
