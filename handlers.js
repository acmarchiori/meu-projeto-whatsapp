const {
  getFormattedAtendentes,
  getFormattedFinanceiro,
  getFormattedMotoboys,
  getFormattedColoristas
} = require('./fileUtils');
const { submenuPedidos, sendPedidosMenu, sendMenu } = require('./menus');
const { setInactivityTimeout } = require('./utils');

const endereco = 'Av Presidente Kennedy, 6145 - Vila Tupi';
const mainMenuMessage = `Digite *#sair* para encerrar o atendimento.`;
const subMenuMessage = `Digite *#voltar* para voltar ao menu anterior.`;

let ultimaMensagemInvalida = {};
const tempoEsperaOpcaoInvalida = 5 * 60 * 1000;

const formatClientInfo = (notifyName, from) => {
  return `Cliente ${notifyName.replace(/\p{Emoji}/gu, '')} ${from.replace('@c.us', '').replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, '+$1 $2 $3-$4')}`;
};

const handleMainMenuSelection = async (client, message, state, body, notifyName) => {
  const clientInfo = formatClientInfo(notifyName, message.from);
  const from = message.from;

  if (body.toLowerCase() === '#sair') {
      await client.sendMessage(from, 'Atendimento encerrado. Obrigado por entrar em contato conosco!');
      state.step = 0;
      return;
  }

  setInactivityTimeout(client, from, state);

  switch (body) {
      case '1':
          await client.sendMessage(message.from, submenuPedidos);
          state.step = 2;
          break;
      case '2':
          {
              const statusEntrega = `*${clientInfo}* quer uma posição sobre a entrega do seu produto.`;
              const atendentes = await getFormattedAtendentes();
              const motoboys = await getFormattedMotoboys();

              for (const atendente of atendentes) {
                  await client.sendMessage(atendente, statusEntrega);
              }
              for (const motoboy of motoboys) {
                  await client.sendMessage(motoboy, statusEntrega);
              }

              await client.sendMessage(message.from, `Um atendente entrará em contato com você em breve para informar sobre a entrega.\n\n${endereco}`);
              state.step = 0;
              break;
          }
      case '3':
          await client.sendMessage(message.from, `Por favor, descreva em texto sua dúvida ou problema:\n\n${subMenuMessage}\n\n${mainMenuMessage}`);
          state.step = 4;
          break;
      case '4':
          {
              const catalogoLink = 'https://wa.me/c/551334728623';
              await client.sendMessage(message.from, `Confira nosso catálogo completo aqui: ${catalogoLink}\n` +
                  `Você pode visualizar os produtos e retornar ao WhatsApp para fazer pedidos.\n\n${subMenuMessage}\n\n${mainMenuMessage}`);
              state.step = 0;
              break;
          }
      case '5':
          {
              const clientMessage = `*${clientInfo}* quer falar com alguém do setor financeiro.`;
              const financeiroContacts = await getFormattedFinanceiro();
              for (const financeiroContact of financeiroContacts) {
                  await client.sendMessage(financeiroContact, clientMessage);
              }
              await client.sendMessage(message.from, `Alguém do setor financeiro entrará em contato com você em breve.\n\n${endereco}`);
              state.step = 0;
              break;
          }
      case '6':
          {
              const clientMessageColorista = `*${clientInfo}* quer falar com um colorista para acerto de cor.`;
              const coloristas = await getFormattedColoristas();
              for (const colorista of coloristas) {
                  await client.sendMessage(colorista, clientMessageColorista);
              }
              await client.sendMessage(message.from, `Um colorista entrará em contato com você em breve.\n\n${endereco}`);
              state.step = 0;
              break;
          }
      default:
          if (!ultimaMensagemInvalida[from] || (Date.now() - ultimaMensagemInvalida[from] > tempoEsperaOpcaoInvalida)) {
              await client.sendMessage(message.from, 'Opção inválida. Por favor, selecione uma opção válida do menu.');
              ultimaMensagemInvalida[from] = Date.now();
          }
  }
};

const handlePedidosSubMenu = async (client, message, state, body, notifyName) => {
  const clientInfo = formatClientInfo(notifyName, message.from);
  const from = message.from;

  if (body.toLowerCase() === '#voltar') {
      await sendMenu(client, message, notifyName); // Aqui usamos sendMenu para voltar ao menu principal
      state.step = 1; // Reiniciamos state.step para o menu principal
      return;
  }
  if (body.toLowerCase() === '#sair') {
      await client.sendMessage(from, 'Atendimento encerrado. Obrigado por entrar em contato conosco!');
      state.step = 0;
      return;
  }

  setInactivityTimeout(client, from, state);

  switch (body) {
      case '1':
          await client.sendMessage(message.from, `Por favor, digite o seu pedido:\n\n${subMenuMessage}\n\n${mainMenuMessage}`);
          state.step = 3;
          break;
      case '2':
          {
              const clientMessage = `*${clientInfo}* quer falar com um atendente para fazer um pedido.`;
              const atendentes = await getFormattedAtendentes();
              for (const atendente of atendentes) {
                  if (!state.pedidosEnviados) {
                      await client.sendMessage(atendente, clientMessage);
                  }
              }
              if (!state.pedidosEnviados) {
                  await client.sendMessage(message.from, `Um atendente entrará em contato com você em breve.\n\n${endereco}`);
                  state.pedidosEnviados = true;
              }
              state.step = 0;
              break;
          }
      default:
          if (!ultimaMensagemInvalida[from] || (Date.now() - ultimaMensagemInvalida[from] > tempoEsperaOpcaoInvalida)) {
              await client.sendMessage(message.from, '*Opção inválida.* Por favor, selecione uma opção válida.');
              ultimaMensagemInvalida[from] = Date.now();
          }
  }
};

const handlePedido = async (client, message, state, body, notifyName) => {
  const from = message.from;

  if (body.toLowerCase() === '#voltar') {
      await sendPedidosMenu(client, message, notifyName); // Utilizando sendPedidosMenu para voltar ao submenu
      state.step = 2; // Atualizando state.step para o submenu de pedidos
      return;
  }
  if (body.toLowerCase() === '#sair') {
      await client.sendMessage(from, 'Atendimento encerrado. Obrigado por entrar em contato conosco!');
      state.step = 0;
      return;
  }

  setInactivityTimeout(client, from, state);

  const clientInfo = formatClientInfo(notifyName, from);
  const pedido = `Pedido de *${clientInfo}*: \n${body}`;
  const atendentes = await getFormattedAtendentes();
  for (const atendente of atendentes) {
      if (!state.pedidosEnviados) {
          await client.sendMessage(atendente, pedido);
      }
  }
  if (!state.pedidosEnviados) {
      await message.reply(`Seu pedido foi enviado para nossos atendentes. Você será contatado em breve.\n\n${endereco}`);
      state.pedidosEnviados = true;
  }
  state.step = 0;
};

const handleDuvidasOuProblemas = async (client, message, state, body, notifyName) => {
  const from = message.from;

  if (body.toLowerCase() === '#voltar') {
      await sendMenu(client, message, notifyName);
      state.step = 1; // Reiniciamos state.step para o menu principal
      return;
  }
  if (body.toLowerCase() === '#sair') {
      await client.sendMessage(from, 'Atendimento encerrado. Obrigado por entrar em contato conosco!');
      state.step = 0;
      return;
  }

  setInactivityTimeout(client, from, state);

  const clientInfo = formatClientInfo(notifyName, message.from);
  const duvidaProblema = `Dúvida ou Problema de *${clientInfo}*: \n${body}`;
  const atendentes = await getFormattedAtendentes();
  for (const atendente of atendentes) {
      await client.sendMessage(atendente, duvidaProblema);
  }
  await message.reply(`Sua dúvida ou problema foi enviado para nossos atendentes. Você será contatado em breve.\n\n${endereco}`);
  state.step = 0;
};

module.exports = {
  handleMainMenuSelection,
  handlePedidosSubMenu,
  handlePedido,
  handleDuvidasOuProblemas
};
