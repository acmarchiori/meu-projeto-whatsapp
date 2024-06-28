// Links de localização
const googleMapsLink = 'https://www.google.com/maps?q=-23.967,-46.390';
const wazeLink = 'https://waze.com/ul?ll=-23.967,-46.390&navigate=yes';
const endereco = 'Av Presidente Kennedy, 6145 - Vila Tupi';
const enderecoComLink = `Nosso endereço: ${endereco}\n\n` +
                        `Google Maps: ${googleMapsLink}\n` +
                        `Waze: ${wazeLink}`;

// Mensagens do menu
const submenuPedidos = `Selecione uma opção:\n\n` +
    `1️⃣ - Fazer Pedido\n` +
    `2️⃣ - Falar com um atendente\n\n` +
    `Digite *#voltar* para voltar ao menu principal ou *#sair* para encerrar o atendimento.`;

const mainMenuMessage = `Para encerrar o atendimento a qualquer momento, digite *#sair*.`;

// Função para enviar o menu principal personalizado
const sendMenu = async (client, message, notifyName) => {
    const menu = `Olá *${notifyName.replace(/\p{Emoji}/gu, '')}!* Bem-vindo à *Almeida Tintas Praia Grande*. Como posso ajudar você hoje?\n\n` +
        `1️⃣ - Pedidos\n` +
        `2️⃣ - Status de entrega\n` +
        `3️⃣ - Dúvidas ou problemas\n` +
        `4️⃣ - Catálogo\n` +
        `5️⃣ - Financeiro\n` +
        `6️⃣ - Acerto de cor\n\n` +
        `${enderecoComLink}\n\n` +
        `${mainMenuMessage}`;
    await client.sendMessage(message.from, menu);
};

// Exportar as mensagens e a função para enviar o menu
module.exports = { submenuPedidos, sendMenu };
