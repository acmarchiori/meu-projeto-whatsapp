// Mensagens do menu
const submenuPedidos = `Selecione uma opção:\n\n` +
    `1 - Fazer Pedido\n` +
    `2 - Falar com um atendente`;

// Função para enviar o menu principal personalizado
const sendMenu = async (client, message, notifyName) => {
    const menu = `Olá ${notifyName.replace(/\p{Emoji}/gu, '')}! Bem-vindo à Almeida Tintas Praia Grande. Como posso ajudar você hoje?\n\n` +
        `1 - Pedidos\n` +
        `2 - Status de entrega\n` +
        `3 - Dúvidas ou problemas\n` +
        `4 - Catálogo\n`+
        `5 - Financeiro\n\n` +
        `Nosso endereço: Av Presidente Kennedy, 6145 - Vila Tupi`;
    await client.sendMessage(message.from, menu);
};

// Exportar as mensagens e a função para enviar o menu
module.exports = { submenuPedidos, sendMenu };