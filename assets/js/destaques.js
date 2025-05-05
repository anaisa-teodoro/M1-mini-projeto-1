// assets/js/destaques.js
document.addEventListener('DOMContentLoaded', function() {
    // --- Chaves do localStorage (DEVEM ser as mesmas usadas em script.js) ---
    const userStorageKey = 'usuarioReflorestamento';
    const actionsStorageKey = 'acoesReflorestamento';
    const destaquesContainer = document.getElementById('destaques-container');

    if (!destaquesContainer) {
        console.error("Elemento #destaques-container não encontrado!");
        return;
    }

    // Constantes para estágios (nomes para exibição e para arquivos de imagem)
    const ESTAGIOS_AVATAR = {
        PLANTADA: { min: 0, arquivo: 'plantada', nome: 'Plantada' },
        BROTO: { min: 100, arquivo: 'broto', nome: 'Broto' },
        JOVEM: { min: 300, arquivo: 'jovem', nome: 'Jovem' },
        MADURA: { min: 700, arquivo: 'madura', nome: 'Madura' }
        // Nome 'Madura+' será tratado na exibição para contagens >= 1500
    };

    // --- Funções de Cálculo e Determinação de Estágio ---
    function determinarEstagio(arvoresPlantadas) {
        let currentStage = ESTAGIOS_AVATAR.PLANTADA; // Default
        for (const stageKey in ESTAGIOS_AVATAR) {
            if (arvoresPlantadas >= ESTAGIOS_AVATAR[stageKey].min) {
                currentStage = ESTAGIOS_AVATAR[stageKey];
            }
        }
        // Nome especial para o nível mais alto, se necessário
        const stageDisplayName = arvoresPlantadas >= 1500 ? "Madura+" : currentStage.nome;
        return {
            arquivo: currentStage.arquivo, // Para nome do arquivo de imagem
            nome: stageDisplayName        // Para exibição no badge/texto
        };
    }

    // --- Carregamento e Processamento de Dados ---
    async function carregarEProcessarDados() {
        try {
            destaquesContainer.innerHTML = '<p>Carregando dados...</p>'; // Feedback inicial

            // 1. Carrega dados base do JSON
            let dadosBase = { usuarios: [], acoes: [] };
            try {
                const response = await fetch('data/usuarios.json'); // Caminho relativo à raiz
                if (response.ok) {
                    dadosBase = await response.json();
                } else {
                    console.warn(`Não foi possível carregar data/usuarios.json: ${response.statusText}`);
                }
            } catch (fetchError) {
                console.warn(`Erro ao buscar data/usuarios.json: ${fetchError}`);
            }

            // 2. Inicializa mapa de usuários com base do JSON
            let usuariosMap = new Map();
            (dadosBase.usuarios || []).forEach(u => {
                 if(u && u.id) { // Garante que usuário base tem ID
                     // Armazena usuário base, garantindo 'arvoresPlantadas' inicial
                      usuariosMap.set(u.id, { ...u, arvoresBase: u.arvoresPlantadas || 0 });
                 }
             });


            // 3. Carrega usuário logado do localStorage (se existir) e atualiza/adiciona no mapa
            const usuarioLogadoJSON = localStorage.getItem(userStorageKey);
            let usuarioLogado = null;
            if (usuarioLogadoJSON) {
                try {
                    usuarioLogado = JSON.parse(usuarioLogadoJSON);
                     if (usuarioLogado && usuarioLogado.id) {
                         const baseUser = usuariosMap.get(usuarioLogado.id) || {};
                         // Combina dados: prioriza localStorage para bio, nome, avatar, mas mantém arvoresBase do JSON
                         usuariosMap.set(usuarioLogado.id, {
                             ...baseUser,           // Dados base (id, dataCadastro, arvoresBase)
                             ...usuarioLogado,      // Sobrescreve com dados do usuário (nome, avatar, bio)
                             arvoresBase: baseUser.arvoresBase || 0 // Garante que arvoresBase exista
                         });
                     }
                } catch (e) { console.error("Erro ao parsear dados do usuário logado:", e); }
            }

            // 4. Consolida todas as ações (JSON base + localStorage)
            const acoesBase = dadosBase.acoes || [];
            let acoesSalvas = [];
             try { acoesSalvas = JSON.parse(localStorage.getItem(actionsStorageKey)) || []; }
             catch (e) { console.error("Erro ao parsear ações salvas:", e); }

            // Simples concatenação por enquanto. Poderia ter lógica anti-duplicidade se necessário.
            const todasAcoes = [...acoesBase, ...acoesSalvas];

            // 5. Calcula árvores totais para CADA usuário no Map
            usuariosMap.forEach((usuario, id) => {
                const countFromActions = todasAcoes
                    .filter(acao => acao && acao.idUsuario === id && typeof acao.quantidade === 'number') // Filtra ações válidas para o usuário
                    .reduce((sum, acao) => sum + acao.quantidade, 0);

                // Soma contagem base (do JSON) + contagem das ações
                usuario.arvoresPlantadas = (usuario.arvoresBase || 0) + countFromActions;
            });

            // 6. Converte o Map de volta para um Array e filtra inválidos
            let todosUsuarios = Array.from(usuariosMap.values())
                                     .filter(u => u && u.id && u.nome && typeof u.arvoresPlantadas === 'number'); // Filtra usuários válidos

            // 7. Ordena por árvores plantadas (descendente)
            todosUsuarios.sort((a, b) => b.arvoresPlantadas - a.arvoresPlantadas);

            // 8. Pega os top 3 (ou menos, se não houver 3)
            const destaques = todosUsuarios.slice(0, 3);

            // 9. Exibe os destaques
            renderDestaques(destaques);

        } catch (error) {
            console.error('Erro geral ao inicializar destaques:', error);
            destaquesContainer.innerHTML = '<p class="error-message">Ocorreu um erro ao carregar os destaques.</p>';
        }
    }

    // --- Função para Renderizar os Cards ---
    function renderDestaques(destaques) {
        destaquesContainer.innerHTML = ''; // Limpa container

        if (destaques.length === 0) {
            destaquesContainer.innerHTML = '<p class="no-results">Ainda não há usuários em destaque. Seja o primeiro!</p>';
            return;
        }

        destaques.forEach(usuario => {
            const estagio = determinarEstagio(usuario.arvoresPlantadas);
            const avatarBase = usuario.avatarTree || 'pau-brasil'; // Garante um fallback

            const card = document.createElement('div');
            card.className = `destaque-card theme-${avatarBase}`; // Adiciona classe de tema baseada no avatar

            let dataFormatada = 'Data indisponível';
            if (usuario.dataCadastro) {
                try {
                    const dataInicio = new Date(usuario.dataCadastro);
                    if (!isNaN(dataInicio.getTime())) {
                        dataFormatada = dataInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    }
                } catch (e) { /* Ignora erro de data inválida */ }
            }

            const avatarSrc = `assets/images/${avatarBase}-${estagio.arquivo}.png`;

            card.innerHTML = `
                <div class="avatar-container">
                    <img src="${avatarSrc}" alt="Avatar de ${usuario.nome}" class="avatar-img" onerror="this.src='assets/images/placeholder-avatar.png'; this.onerror=null;">
                </div>
                <h3 class="destaque-nome">${usuario.nome || 'Usuário Anônimo'}</h3>
                <div class="destaque-info">
                    <div class="arvores-plantadas"><strong>${usuario.arvoresPlantadas}</strong> árvores plantadas</div>
                    <div class="membro-desde">Membro desde ${dataFormatada}</div>
                    <div class="badge">${estagio.nome}</div>
                </div>
            `;
            destaquesContainer.appendChild(card);
        });
    }

    // --- Inicia o processo ---
    carregarEProcessarDados();

}); // Fim do DOMContentLoaded