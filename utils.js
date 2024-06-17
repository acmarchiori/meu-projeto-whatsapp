const tempoInatividade = 5 * 60 * 1000; // 5 minutos em milissegundos

const setInactivityTimeout = (client, from, state) => {
    if (state.inactivityTimeout) {
        clearTimeout(state.inactivityTimeout);
    }

    state.inactivityTimeout = setTimeout(async () => {
        await client.sendMessage(from, 'Por falta de interação, este atendimento está sendo encerrado, comece novamente.');
        state.step = 0; // Reseta o estado do cliente
    }, tempoInatividade);
};

module.exports = { setInactivityTimeout };
