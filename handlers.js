const { 
    getFormattedAtendentes, 
    getFormattedFinanceiro, 
    getFormattedMotoboys, 
    getFormattedColoristas 
} = require('./fileUtils');
const { submenuPedidos } = require('./menus');
const { setInactivityTimeout } = require('./utils');

let ultimaMensagemInvalida = {}; // Armazenar o timestamp da última mensagem inválida por cliente
const tempoEsperaOpcaoInvalida = 5 * 60 * 1000; // 5 minutos em milissegundos

// Função para formatar as informações do cliente
const formatClientInfo = (notifyName, from) => {
    return `Cliente ${notifyName.replace(/\p{Emoji}/gu, '')} ${from.replace('@c.us', '').replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, '+$1 $2 $3-$4')}`;
};

const handleMainMenuSelection = async (client, message, state, body, notifyName) => {
    const clientInfo = formatClientInfo(notifyName, message.from);
    const from = message.from;

    setInactivityTimeout(client, from, state); // Redefine o timeout de inatividade

    switch (body) {
        case '1':
            await client.sendMessage(message.from, submenuPedidos);
            state.step = 2;
            break;
        case '2':
            {
                const statusEntrega = `${clientInfo} quer uma posição sobre a entrega do seu produto.`;
                const atendentes = await getFormattedAtendentes();
                const motoboys = await getFormattedMotoboys();

                for (const atendente of atendentes) {
                    await client.sendMessage(atendente, statusEntrega);
                }
                for (const motoboy of motoboys) {
                    await client.sendMessage(motoboy, statusEntrega);
                }

                await client.sendMessage(message.from, 'Um atendente entrará em contato com você em breve para informar sobre a entrega.\n\n' +
                    'Nosso endereço: Av Presidente Kennedy, 6145 - Vila Tupi');
                state.step = 0;
                break;
            }
        case '3':
            await client.sendMessage(message.from, 'Por favor, descreva em texto sua dúvida ou problema:');
            state.step = 4;
            break;
        case '4':
            {
                const catalogoLink = 'https://wa.me/c/551334728623'; // Link direto para o catálogo do WhatsApp Business
                await client.sendMessage(message.from, `Confira nosso catálogo completo aqui: ${catalogoLink}\n` +
                    `Você pode visualizar os produtos e retornar ao WhatsApp para fazer pedidos.`);
                state.step = 0;
                break;
            }
        case '5':
            {
                const clientMessage = `${clientInfo} quer falar com alguém do setor financeiro.`;
                const financeiroContacts = await getFormattedFinanceiro();
                for (const financeiroContact of financeiroContacts) {
                    await client.sendMessage(financeiroContact, clientMessage);
                }
                await client.sendMessage(message.from, 'Alguém do setor financeiro entrará em contato com você em breve.\n\n' +
                    'Nosso endereço: Av Presidente Kennedy, 6145 - Vila Tupi');
                state.step = 0;
                break;
            }
        case '6':
            {
                const clientMessageColorista = `${clientInfo} quer falar com um colorista para acerto de cor.`;
                const coloristas = await getFormattedColoristas();
                for (const colorista of coloristas) {
                    await client.sendMessage(colorista, clientMessageColorista);
                }
                await client.sendMessage(message.from, 'Um colorista entrará em contato com você em breve.\n\n' +
                    'Nosso endereço: Av Presidente Kennedy, 6145 - Vila Tupi');
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

    setInactivityTimeout(client, from, state); // Redefine o timeout de inatividade

    switch (body) {
        case '1':
            await client.sendMessage(message.from, 'Por favor, digite o seu pedido:');
            state.step = 3;
            break;
        case '2':
            {
                const clientMessage = `${clientInfo} quer falar com um atendente para fazer um pedido.`;
                const atendentes = await getFormattedAtendentes();
                for (const atendente of atendentes) {
                    if (!state.pedidosEnviados) {
                        await client.sendMessage(atendente, clientMessage);
                    }
                }
                if (!state.pedidosEnviados) {
                    await client.sendMessage(message.from, 'Um atendente entrará em contato com você em breve.\n\n' +
                        'Nosso endereço: Av Presidente Kennedy, 6145 - Vila Tupi');
                    state.pedidosEnviados = true;
                }
                state.step = 0;
                break;
            }
        default:
            if (!ultimaMensagemInvalida[from] || (Date.now() - ultimaMensagemInvalida[from] > tempoEsperaOpcaoInvalida)) {
                await client.sendMessage(message.from, 'Opção inválida. Por favor, selecione uma opção válida.');
                ultimaMensagemInvalida[from] = Date.now();
            }
    }
};

const handlePedido = async (client, message, state, body, notifyName) => {
    const from = message.from;

    setInactivityTimeout(client, from, state); // Redefine o timeout de inatividade

    const clientInfo = formatClientInfo(notifyName, from);
    const pedido = `Pedido de ${clientInfo}: \n${body}`;
    const atendentes = await getFormattedAtendentes();
    for (const atendente of atendentes) {
        if (!state.pedidosEnviados) {
            await client.sendMessage(atendente, pedido);
        }
    }
    if (!state.pedidosEnviados) {
        await message.reply('Seu pedido foi enviado para nossos atendentes. Você será contatado em breve.\n\n' +
            'Nosso endereço: Av Presidente Kennedy, 6145 - Vila Tupi');
        state.pedidosEnviados = true;
    }
    state.step = 0;
};

const handleDuvidasOuProblemas = async (client, message, state, body, notifyName) => {
    const from = message.from;

    setInactivityTimeout(client, from, state); // Redefine o timeout de inatividade

    const clientInfo = formatClientInfo(notifyName, message.from);
    const duvidaProblema = `Dúvida ou Problema de ${clientInfo}: \n${body}`;
    const atendentes = await getFormattedAtendentes();
    for (const atendente of atendentes) {
        await client.sendMessage(atendente, duvidaProblema);
    }
    await message.reply('Sua dúvida ou problema foi enviado para nossos atendentes. Você será contatado em breve.\n\n' +
        'Nosso endereço: Av Presidente Kennedy, 6145 - Vila Tupi');
    state.step = 0;
};

module.exports = { 
    handleMainMenuSelection, 
    handlePedidosSubMenu, 
    handlePedido, 
    handleDuvidasOuProblemas 
};
