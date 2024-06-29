const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { getFormattedClientes, readMensagemClientes } = require('./fileUtils'); // Importa a nova função
const { sendMenu } = require('./menus');
const { handleMainMenuSelection, handlePedidosSubMenu, handlePedido, handleDuvidasOuProblemas } = require('./handlers');
const { setInactivityTimeout } = require('./utils');
// const imageFolder = './image'; // Caminho para a pasta de imagens
const stateFilePath = path.join('./send_state.json'); // Caminho para o arquivo de estado do envio
const customerState = {}; // Estado dos clientes
const receivedMessageIds = new Set(); // Armazena os IDs das mensagens recebidas
const appStartTime = Date.now(); // Timestamp de início do aplicativo

// Configurações do cliente
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-gpu'],
        // executablePath: '../chrome-win/chrome.exe', // Só retirar comentário quando for criar o executável para o Windows
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    }
});

// Função para enviar mensagem de bom dia com imagens
const sendGoodMorningMessage = async () => {
  const message = readMensagemClientes(); // Lê a mensagem do arquivo
  const clients = await getFormattedClientes();
  const imageFolder = './image'; // Caminho para a pasta de imagens (verifique se está correto)

  let images = [];

  try {
      // Verifica se há imagens na pasta image
      images = fs.readdirSync(imageFolder).filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
      });
  } catch (error) {
      console.error('Erro ao ler imagens da pasta:', error);
  }

  console.log('Imagens encontradas na pasta:', images);

  try {
      // Envia mensagem de texto uma vez para todos os clientes
      for (const clientNumber of clients) {
          await client.sendMessage(clientNumber, message);
      }

      if (images.length > 0) {
          // Envia todas as imagens encontradas na pasta image
          const mediaArray = images.map(image => {
              const imagePath = path.join(imageFolder, image);
              return MessageMedia.fromFilePath(imagePath);
          });

          // Envia todas as imagens como uma mensagem única para todos os clientes
          await Promise.all(
              clients.map(async clientNumber => {
                  for (const media of mediaArray) {
                      await client.sendMessage(clientNumber, media);
                  }
              })
          );

          console.log(`Todas as imagens de bom dia foram enviadas para os clientes.`);
      } else {
          console.log(`Não há imagens para enviar.`);
      }
  } catch (error) {
      console.error('Erro ao enviar mensagem de bom dia com imagens:', error);
  }

  updateLastSentState();
};

// Função para atualizar o estado do envio no arquivo
const updateLastSentState = async () => {
  const state = { lastSent: new Date().toISOString().split('T')[0] };
  try {
      await fs.promises.writeFile(stateFilePath, JSON.stringify(state));
  } catch (error) {
      console.error('Erro ao atualizar estado de envio:', error);
  }
};

// Função para verificar se a mensagem de bom dia já foi enviada hoje
const checkAndSendGoodMorningMessage = async () => {
    try {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

        // Verifica se hoje é domingo
        if (dayOfWeek === 0) {
            console.log('Hoje é domingo, a mensagem de bom dia não será enviada.');
            return;
        }

        if (fs.existsSync(stateFilePath)) {
            const stateContent = fs.readFileSync(stateFilePath, 'utf8');
            const state = stateContent ? JSON.parse(stateContent) : { lastSent: null };
            const lastSent = state.lastSent;

            if (lastSent !== todayString) {
                console.log('Enviando mensagem de bom dia para os clientes...');
                await sendGoodMorningMessage();
            } else {
                console.log('A mensagem de bom dia já foi enviada hoje.');
            }
        } else {
            console.log('Enviando mensagem de bom dia para os clientes...');
            await sendGoodMorningMessage();
        }
    } catch (error) {
        console.error('Erro ao verificar o estado de envio:', error);
        console.log('Enviando mensagem de bom dia para os clientes por precaução...');
        await sendGoodMorningMessage();
    }
};

// Inicialização do cliente
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR code recebido, por favor escaneie!');
});

client.on('ready', async () => {
    console.log('Cliente está pronto!');
    await checkAndSendGoodMorningMessage();
});

// Agendar tarefa para enviar mensagem de bom dia de segunda a sábado às 8:30h
cron.schedule('30 8 * * 1-6', () => {
    console.log('Enviando mensagem de bom dia para os clientes...');
    sendGoodMorningMessage();
});

// Evento de recebimento de mensagens
client.on('message_create', async (message) => {
    const from = message.from;
    const body = typeof message.body === 'string' ? message.body.trim() : ''; // Verifica se message.body é uma string antes de chamar trim()
    const notifyName = message._data.notifyName || 'Cliente';
    const messageId = message.id.id;
    const messageTimestamp = message.timestamp * 1000; // Converter o timestamp para milissegundos

    console.log('Mensagem criada:', body);
    console.log('Remetente:', from);

    // Ignora mensagens enviadas pelo próprio bot
    if (['5513974051880@c.us', '551334728623@c.us', '5513988137679@c.us'].includes(from)) {
        console.log('Mensagem ignorada: enviada pelo próprio bot');
        return;
    }

    // Ignora mensagens duplicadas, antigas, de grupos, de broadcast de status do WhatsApp e de newsletter
    if (receivedMessageIds.has(messageId) || 
        messageTimestamp < appStartTime || 
        from.endsWith('@g.us') ||
        from.endsWith('@broadcast') ||
        from.endsWith('@newsletter')) {
        console.log('Mensagem ignorada: duplicada, antiga, de grupo, de broadcast ou de newsletter');
        return;
    }

    receivedMessageIds.add(messageId);

    // Cria um estado inicial para o cliente se ainda não existir
    if (!customerState[from]) {
        customerState[from] = { step: 0, pedidosEnviados: false, notifiedClosed: false };
    }

    const state = customerState[from]; // Obtém o estado atual do cliente
    const currentHour = new Date().getHours(); // Hora atual do sistema
    const currentMinute = new Date().getMinutes(); // Minutos atuais do sistema
    const currentDay = new Date().getDay(); // Dia atual do sistema

    // Verifica se a loja está fechada
    const isStoreClosed = (currentDay === 0) || // Domingo
    (currentDay === 6 && ((currentHour === 13 && currentMinute >= 30) || currentHour > 13)) || // Sábado após as 13:30
    (currentDay !== 6 && (currentHour < 8 || currentHour >= 18)); // Dias de semana fora do horário de funcionamento

    if (isStoreClosed) {
        if (!state.notifiedClosed) {
            let returnMessage = 'Nossa loja está fechada no momento. ';
            if (currentDay === 6 || currentDay === 0) { // Se for sábado ou domingo
                returnMessage += 'Retornaremos na segunda-feira às 8:30. Obrigado pela compreensão!';
            } else {
                returnMessage += 'Retornaremos amanhã às 8:30. Obrigado pela compreensão!';
            }
            await message.reply(returnMessage);
            state.notifiedClosed = true; // Marca que o cliente foi notificado
        }
        return; // Interrompe a execução
    } else {
        state.notifiedClosed = false; // Reseta o estado quando a loja está aberta
    }
    
    // Configure ou redefina o timeout de inatividade sempre que o cliente interagir
    setInactivityTimeout(client, from, state);

    try {
        switch (state.step) {
            case 0:
                // Remove a verificação de "oi" para iniciar com qualquer mensagem
                await sendMenu(client, message, notifyName);
                state.pedidosEnviados = false;
                state.step = 1;
                break;
            case 1:
                await handleMainMenuSelection(client, message, state, body, notifyName);
                break;
            case 2:
                await handlePedidosSubMenu(client, message, state, body, notifyName);
                break;
            case 3:
                await handlePedido(client, message, state, body, notifyName);
                break;
            case 4:
                await handleDuvidasOuProblemas(client, message, state, body, notifyName);
                break;
            default:
                console.error('Estado desconhecido:', state.step);
        }
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
    }
});

client.on('auth_failure', msg => {
    console.error('Authentication failed:', msg);
});

client.on('disconnected', reason => {
    console.log('Client was logged out:', reason);
});

client.initialize();
