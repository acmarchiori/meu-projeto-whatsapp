const endereco = 'Av Presidente Kennedy, 6145 - Vila Tupi';
const mainMenuMessage = `Digite *#sair* para encerrar o atendimento.`;   
const subMenuMessage = `Digite *#voltar* para voltar ao menu principal`;                      

// Mensagens do menu
const submenuPedidos = `Selecione uma opção:\n\n` +
    `1️⃣ - Fazer Pedido\n` +
    `2️⃣ - Falar com um atendente\n\n` +
    `${subMenuMessage}\n\n` +
    `${mainMenuMessage}`;

// Função para enviar o submenu de pedidos
const sendPedidosMenu = async (client, message) => {
    await client.sendMessage(message.from, submenuPedidos);
};

// Função para enviar o menu principal personalizado
const sendMenu = async (client, message, notifyName) => {
    const menu = `Olá *${notifyName.replace(/\p{Emoji}/gu, '')}!* Bem-vindo à *Almeida Tintas Praia Grande*. Como posso ajudar você hoje?\n\n` +
        `1️⃣ - Pedidos\n` +
        `2️⃣ - Status de entrega\n` +
        `3️⃣ - Dúvidas ou problemas\n` +
        `4️⃣ - Catálogo\n` +
        `5️⃣ - Financeiro\n` +
        `6️⃣ - Acerto de cor\n\n` +
        `${endereco}\n\n` +
        `${mainMenuMessage}`;
    await client.sendMessage(message.from, menu);
};

// Exportar as mensagens e funções necessárias
module.exports = { submenuPedidos, sendMenu, sendPedidosMenu };
