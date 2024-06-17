const fs = require('fs');

// Função para ler o arquivo e converter os números de telefone para o formato desejado
const readFileAndConvert = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.trim().split('\n');
        const formattedNumbers = lines.map(line => {
            // Remover caracteres não numéricos
            const cleanNumber = line.trim().replace(/\D/g, '');
            
            // Verificar se o número possui o prefixo do país
            let formattedNumber;
            if (cleanNumber.length === 13 && cleanNumber.startsWith('55')) {
                // Se já estiver no formato correto, não é necessário fazer nada
                formattedNumber = cleanNumber;
            } else if (cleanNumber.length === 11) {
                // Adicionar prefixo do país e do código de área
                formattedNumber = '55' + cleanNumber;
            } else {
                // Número inválido
                console.error('Número de telefone inválido:', line);
                formattedNumber = null;
            }

            // Adicionar sufixo do WhatsApp
            return formattedNumber ? formattedNumber + '@s.whatsapp.net' : null;
        }).filter(number => number !== null); // Filtrar números inválidos
        
        return formattedNumbers;
    } catch (error) {
        console.error('Erro ao ler o arquivo:', error);
        return [];
    }
};

// Função para ler o arquivo de atendentes
const readAtendentes = () => {
    return readFileAndConvert('Atendentes.txt');
};

// Função para ler o arquivo de clientes
const readClientes = () => {
    return readFileAndConvert('Clientes.txt');
};

// Função para ler o arquivo de financeiro
const readFinanceiro = () => {
    return readFileAndConvert('Financeiro.txt');
};

// Função para ler o arquivo de motoboys
const readMotoboys = () => {
    return readFileAndConvert('Motoboys.txt');
};

// Função para ler o arquivo de coloristas
const readColoristas = () => {
    return readFileAndConvert('Coloristas.txt');
};

// Função para obter uma lista de atendentes formatada para envio de mensagens
const getFormattedAtendentes = async () => {
    const atendentes = await readAtendentes();
    return atendentes;
};

// Função para obter uma lista de clientes formatada para envio de mensagens
const getFormattedClientes = async () => {
    const clientes = await readClientes();
    return clientes;
};

// Função para obter uma lista de contatos do financeiro formatada para envio de mensagens
const getFormattedFinanceiro = async () => {
    const financeiro = await readFinanceiro();
    return financeiro;
};

// Função para obter uma lista de motoboys formatada para envio de mensagens
const getFormattedMotoboys = async () => {
    const motoboys = await readMotoboys();
    return motoboys;
};

// Função para obter uma lista de coloristas formatada para envio de mensagens
const getFormattedColoristas = async () => {
    const coloristas = await readColoristas();
    return coloristas;
};

// Exportar as funções para uso em outros arquivos
module.exports = { 
    readAtendentes, 
    readClientes, 
    readFinanceiro,
    getFormattedAtendentes,
    getFormattedClientes,
    getFormattedFinanceiro,
    getFormattedMotoboys,
    getFormattedColoristas
};
