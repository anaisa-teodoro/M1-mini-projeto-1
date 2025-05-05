// assets/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Configuração Global e Constantes ---
    const userStorageKey = 'usuarioReflorestamento';
    const actionsStorageKey = 'acoesReflorestamento';
    const body = document.body;

    const especiesArvores = ["Ipês", "Angicos", "Aroeiras", "Jequitibás", "Peroba do campo"];
    const avataresArvores = {
        "pau-brasil": { nome: "Pau-Brasil", cor: "theme-pau-brasil" },
        "castanheira": { nome: "Castanheira", cor: "theme-castanheira" },
        "peroba-rosa": { nome: "Peroba-Rosa", cor: "theme-peroba-rosa" }
    };
    const ESTAGIOS_AVATAR = {
        PLANTADA: { min: 0, arquivo: 'plantada', nome: 'Plantada' },
        BROTO: { min: 100, arquivo: 'broto', nome: 'Broto' },
        JOVEM: { min: 300, arquivo: 'jovem', nome: 'Jovem' },
        MADURA: { min: 700, arquivo: 'madura', nome: 'Madura' }
        // 1500+ usa a imagem 'madura' também, mas pode ter nome diferente
    };

    // --- Funções Utilitárias ---
    const getUserData = () => JSON.parse(localStorage.getItem(userStorageKey));
    const setUserData = (data) => localStorage.setItem(userStorageKey, JSON.stringify(data));
    const getActionsData = () => JSON.parse(localStorage.getItem(actionsStorageKey)) || [];
    const setActionsData = (data) => localStorage.setItem(actionsStorageKey, JSON.stringify(data));
    const clearUserData = () => localStorage.removeItem(userStorageKey); // Ações podem persistir ou não, depende da regra

    // --- Aplicação de Tema e Estado de Navegação ---
    const applyThemeAndNavState = () => {
        const userData = getUserData();
        body.className = ''; // Limpa classes de tema anteriores

        // Seleciona elementos de navegação
        const navItemsLoggedIn = document.querySelectorAll('#nav-perfil, #nav-acao, #nav-relatorio, #nav-destaques');
        const logoutBtnContainer = document.getElementById('logout-btn-container');
        const loginBtnContainer = document.getElementById('login-btn-container');
        const sidebarFooter = document.querySelector('.sidebar-footer'); // Para garantir que exista

        if (userData && userData.avatarTree && avataresArvores[userData.avatarTree]) {
            // Aplica tema
            body.classList.add(avataresArvores[userData.avatarTree].cor);

            // Mostra itens de usuário logado, esconde login
            navItemsLoggedIn.forEach(item => item.style.display = 'flex');
            if (logoutBtnContainer) logoutBtnContainer.style.display = 'block';
            if (loginBtnContainer) loginBtnContainer.style.display = 'none';

            // Adiciona classe 'active' ao link da página atual
            const currentPage = window.location.pathname.split('/').pop();
            document.querySelectorAll('.sidebar-item').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('active');
                }
            });

             // Define variáveis CSS --primary-color-rgb para efeitos (ex: box-shadow em focus)
            try {
                 const rootStyle = getComputedStyle(document.documentElement);
                 const primaryColor = rootStyle.getPropertyValue('--primary-color').trim();
                 let rgb = '78, 129, 98'; // Verde padrão como fallback
                 if (primaryColor.startsWith('#')) {
                     const hex = primaryColor.substring(1);
                     if(hex.length === 3) { // Formato #RGB
                          rgb = `${parseInt(hex[0]+hex[0], 16)}, ${parseInt(hex[1]+hex[1], 16)}, ${parseInt(hex[2]+hex[2], 16)}`;
                     } else if (hex.length === 6) { // Formato #RRGGBB
                          rgb = `${parseInt(hex.substring(0,2), 16)}, ${parseInt(hex.substring(2,4), 16)}, ${parseInt(hex.substring(4,6), 16)}`;
                     }
                 } else if (primaryColor.startsWith('rgb')) {
                     const match = primaryColor.match(/rgb(a?)\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
                     if(match) rgb = `${match[2]}, ${match[3]}, ${match[4]}`;
                 }
                 document.documentElement.style.setProperty('--primary-color-rgb', rgb);
            } catch(e) {
                 console.error("Erro ao definir --primary-color-rgb:", e);
                 document.documentElement.style.setProperty('--primary-color-rgb', '78, 129, 98'); // Fallback
            }


        } else {
            // Usuário não logado: aplica tema padrão, esconde itens logados, mostra login
            body.classList.add('theme-default'); // Ou nenhuma classe se o default for :root
            navItemsLoggedIn.forEach(item => item.style.display = 'none');
            if (logoutBtnContainer) logoutBtnContainer.style.display = 'none';
            if (loginBtnContainer) loginBtnContainer.style.display = 'block';

            // Define fallback para variável RGB
             document.documentElement.style.setProperty('--primary-color-rgb', getComputedStyle(document.documentElement).getPropertyValue('--default-primary-rgb').trim() || '78, 129, 98');
        }
    };

    // --- Lógica de Logout ---
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Tem certeza que deseja sair?')) {
                clearUserData();
                // Opcional: Limpar ações também? Depende da regra.
                // localStorage.removeItem(actionsStorageKey);
                window.location.href = 'index.html'; // Redireciona para a verificação inicial
            }
        });
    }

    // --- Lógica Específica por Página ---

    // Página: cadastro_usuario.html
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
         // Preenche opções de avatar dinamicamente
         const avatarSelectionContainer = document.getElementById('avatar-selection');
         if(avatarSelectionContainer) {
             Object.keys(avataresArvores).forEach(key => {
                 const avatarInfo = avataresArvores[key];
                 const optionLabel = document.createElement('label');
                 optionLabel.className = 'avatar-option';
                 optionLabel.innerHTML = `
                     <input type="radio" name="avatar" value="${key}" required>
                     <div class="avatar-content">
                          <img src="assets/images/${key}-plantada.png" alt="${avatarInfo.nome}" onerror="this.src='assets/images/placeholder-avatar.png'; this.onerror=null;">
                          <span>${avatarInfo.nome}</span>
                     </div>
                 `;
                 avatarSelectionContainer.appendChild(optionLabel);
             });

             // Adiciona listener para feedback visual da seleção
             avatarSelectionContainer.addEventListener('change', (e) => {
                 if (e.target.type === 'radio') {
                     // Remove estilo de selecionado de todos
                     avatarSelectionContainer.querySelectorAll('.avatar-option .avatar-content').forEach(content => {
                         content.style.borderColor = 'transparent';
                         content.style.transform = 'scale(1)';
                         content.style.boxShadow = 'none';
                     });
                     // Aplica estilo ao selecionado
                     const selectedContent = e.target.nextElementSibling;
                     selectedContent.style.borderColor = 'var(--primary-color)';
                     selectedContent.style.transform = 'scale(1.03)';
                     selectedContent.style.boxShadow = 'var(--box-shadow-light)';
                 }
             });
         }


        registrationForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password'); // Senha (não armazenar em produção real)
            const selectedAvatarInput = registrationForm.querySelector('input[name="avatar"]:checked');

            if (!usernameInput.value.trim() || !passwordInput.value || !selectedAvatarInput) {
                alert('Por favor, preencha todos os campos e selecione um avatar.');
                return;
            }

            const username = usernameInput.value.trim();
            const userId = username.toLowerCase().replace(/\s+/g, '_'); // ID simples baseado no nome

            // Verifica se ID já existe (simulação simples, backend faria isso)
             // const existingUsers = getAllUsersFromSomewhere(); // Em um cenário real
             // if (existingUsers.find(u => u.id === userId)) {
             //     alert('Nome de usuário já existe. Escolha outro.');
             //     return;
             // }

            const userData = {
                id: userId,
                username: username,
                avatarTree: selectedAvatarInput.value,
                bio: `Olá! Sou ${username} e ajudo a reflorestar o planeta!`, // Bio inicial
                registeredAt: new Date().toISOString(),
                // Não armazenamos a senha no localStorage!
                // Não armazenamos 'arvoresPlantadas' aqui, será calculado.
            };

            // Salva no localStorage
            setUserData(userData);

            console.log('Usuário cadastrado (JSON):', JSON.stringify(userData, null, 2));
            alert(`Usuário ${userData.username} cadastrado com sucesso!`);

            // Redirecionar para o perfil
            window.location.href = 'perfil.html';
        });
    }

    // Página: cadastro_acao.html
    const reforestationForm = document.getElementById('reforestation-form');
    if (reforestationForm) {
        const currentUser = getUserData();
        if (!currentUser) {
            alert("Você precisa estar logado para registrar uma ação.");
            window.location.href = 'index.html'; // Redireciona para verificação
            return;
        }

         // Preenche select de espécies
         const speciesSelect = document.getElementById('species');
         if(speciesSelect) {
             especiesArvores.forEach(especie => {
                 const option = document.createElement('option');
                 option.value = especie;
                 option.textContent = especie;
                 speciesSelect.appendChild(option);
             });
         }

        reforestationForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const quantityInput = document.getElementById('quantity');
            const speciesInput = document.getElementById('species');

            if (!quantityInput.value || !speciesInput.value) {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            const quantity = parseInt(quantityInput.value, 10);
            if (isNaN(quantity) || quantity <= 0) {
                alert('A quantidade deve ser um número positivo.');
                return;
            }

            const newAction = {
                idUsuario: currentUser.id, // ID do usuário logado
                nomeUsuario: currentUser.username, // Nome para referência
                quantidade: quantity,
                species: speciesInput.value,
                data: new Date().toISOString() // Timestamp da ação
            };

            // Adiciona a nova ação à lista existente
            const allActions = getActionsData();
            allActions.push(newAction);
            setActionsData(allActions);

            console.log('Novo registro de reflorestamento (JSON):', JSON.stringify(newAction, null, 2));
            alert(`${quantity} ${speciesInput.value}(s) registradas com sucesso!`);

            reforestationForm.reset(); // Limpa o formulário
        });
    }

    // Página: perfil.html
    const profileContainer = document.getElementById('profile-container');
    if (profileContainer) {
        const userData = getUserData();
        if (!userData) {
            alert("Usuário não encontrado. Por favor, faça o cadastro/login.");
            window.location.href = 'index.html';
            return;
        }

        // Seleciona Elementos do DOM
        const usernameDisplay = document.getElementById('profile-username');
        const memberSinceDisplay = document.getElementById('profile-member-since');
        const treeCountDisplay = document.getElementById('profile-tree-count');
        const avatarImage = document.getElementById('profile-avatar-img');
        const avatarStageDisplay = document.getElementById('profile-avatar-stage');
        const bioDisplay = document.getElementById('profile-bio-text');
        const bioEditArea = document.getElementById('profile-bio-edit-area');
        const editBioButton = document.getElementById('edit-bio-btn');
        const saveBioButton = document.getElementById('save-bio-btn');
        const cancelBioButton = document.getElementById('cancel-bio-btn');

        // Calcula Total de Árvores do Usuário Logado
        const userActions = getActionsData().filter(action => action.idUsuario === userData.id);
        const totalTrees = userActions.reduce((sum, action) => sum + (action.quantidade || 0), 0);

        // Determina Estágio do Avatar
        let currentStage = ESTAGIOS_AVATAR.PLANTADA; // Default
        for (const stageKey in ESTAGIOS_AVATAR) {
            if (totalTrees >= ESTAGIOS_AVATAR[stageKey].min) {
                currentStage = ESTAGIOS_AVATAR[stageKey];
            }
        }
        const stageDisplayName = totalTrees >= 1500 ? "Madura+" : currentStage.nome;


        // Atualiza DOM com Dados do Usuário
        if (usernameDisplay) usernameDisplay.textContent = userData.username;
        if (memberSinceDisplay && userData.registeredAt) {
             try { memberSinceDisplay.textContent = new Date(userData.registeredAt).toLocaleDateString('pt-BR'); }
             catch(e){ memberSinceDisplay.textContent = '-'; }
        }
        if (treeCountDisplay) treeCountDisplay.textContent = totalTrees;
        if (avatarStageDisplay) avatarStageDisplay.textContent = stageDisplayName;
        if (bioDisplay) bioDisplay.textContent = userData.bio || '(Sem bio definida)';
        if (bioEditArea) bioEditArea.value = userData.bio || '';

        // Atualiza Avatar
        if (avatarImage && userData.avatarTree) {
            const avatarFileName = `assets/images/${userData.avatarTree}-${currentStage.arquivo}.png`;
            avatarImage.src = avatarFileName;
            avatarImage.alt = `Avatar ${avataresArvores[userData.avatarTree]?.nome || userData.avatarTree} - Estágio ${stageDisplayName}`;
            avatarImage.onerror = () => {
                 console.warn(`Imagem ${avatarFileName} não encontrada. Usando placeholder.`);
                 avatarImage.src = 'assets/images/placeholder-avatar.png';
                 avatarImage.alt = 'Avatar Padrão';
            };
        }

        // Lógica de Edição da BIO
        if (editBioButton && saveBioButton && cancelBioButton && bioEditArea && bioDisplay) {
             editBioButton.addEventListener('click', () => {
                 bioDisplay.classList.add('hidden');
                 editBioButton.classList.add('hidden');
                 bioEditArea.classList.remove('hidden');
                 saveBioButton.classList.remove('hidden');
                 cancelBioButton.classList.remove('hidden');
                 bioEditArea.focus();
             });

             saveBioButton.addEventListener('click', () => {
                 const newBio = bioEditArea.value.trim();
                 userData.bio = newBio; // Atualiza objeto na memória
                 setUserData(userData); // Salva no localStorage
                 bioDisplay.textContent = newBio || '(Sem bio definida)'; // Atualiza exibição

                 // Esconde/Mostra elementos
                 bioDisplay.classList.remove('hidden');
                 editBioButton.classList.remove('hidden');
                 bioEditArea.classList.add('hidden');
                 saveBioButton.classList.add('hidden');
                 cancelBioButton.classList.add('hidden');
             });

            cancelBioButton.addEventListener('click', () => {
                 // Restaura valor original e esconde/mostra controles
                 bioEditArea.value = userData.bio || ''; // Volta ao valor salvo
                 bioDisplay.classList.remove('hidden');
                 editBioButton.classList.remove('hidden');
                 bioEditArea.classList.add('hidden');
                 saveBioButton.classList.add('hidden');
                 cancelBioButton.classList.add('hidden');
            });
        }
    }

   // assets/js/script.js

// ... (Código anterior: configuração global, utilitários, tema, logout, cadastro usuário, cadastro ação, perfil) ...

    // Página: relatorio.html
    const reportSearchForm = document.getElementById('report-search-form');
    if (reportSearchForm) {
        const currentUser = getUserData(); // Útil para saber quem está logado
        if (!currentUser) {
            alert("Você precisa estar logado para ver o relatório.");
            window.location.href = 'index.html';
            return; // Impede execução se não logado
        }

        const userInput = document.getElementById('search-user');
        const speciesInput = document.getElementById('search-species');
        const resultsTableBody = document.getElementById('results-table-body');
        const resultsContainer = document.getElementById('results-container');
        const resultsTable = document.getElementById('results-table');
        const loadingMessage = resultsContainer.querySelector('p'); // Seleciona a mensagem inicial

        // Preenche select de espécies
        const speciesSelect = document.getElementById('search-species');
        if (speciesSelect) {
            // Limpa opções antigas (caso existam)
            speciesSelect.innerHTML = '<option value="">Todas as Espécies</option>';
            especiesArvores.forEach(especie => {
                const option = document.createElement('option');
                option.value = especie;
                option.textContent = especie;
                speciesSelect.appendChild(option);
            });
        }

        // --- Função para carregar TODOS os usuários (JSON + LocalStorage) ---
        // Similar à lógica de destaques.js, mas simplificada para obter a lista de usuários
        const getAllUsers = async () => {
            let usuariosMap = new Map();
            // 1. Carrega base do JSON
            try {
                const response = await fetch('data/usuarios.json');
                if (response.ok) {
                    const dadosBase = await response.json();
                    (dadosBase.usuarios || []).forEach(u => {
                        if(u && u.id) usuariosMap.set(u.id, { ...u });
                    });
                }
            } catch (e) { console.warn("Não foi possível carregar usuários base:", e); }

            // 2. Adiciona/Atualiza com usuário logado
            const usuarioLogado = getUserData();
            if (usuarioLogado && usuarioLogado.id) {
                 const baseUser = usuariosMap.get(usuarioLogado.id) || {};
                 usuariosMap.set(usuarioLogado.id, { ...baseUser, ...usuarioLogado });
            }
            return Array.from(usuariosMap.values()); // Retorna lista de usuários
        };


        // --- Função para Exibir Resultados (Agora baseada em ações filtradas) ---
        const displayResults = (actionsToDisplay) => {
            if (!resultsTableBody || !resultsContainer || !resultsTable) return;

            resultsTableBody.innerHTML = ''; // Limpa sempre

            if (actionsToDisplay.length === 0) {
                // Mensagem padrão se NENHUMA ação foi encontrada
                // (Será sobrescrita se a busca foi por usuário específico sem ações)
                resultsTable.classList.add('hidden');
                resultsContainer.innerHTML = '<p class="no-results">Nenhuma ação encontrada com os filtros aplicados.</p>';
                return;
            }

            resultsTable.classList.remove('hidden');
            // Garante que a tabela esteja visível e dentro do container
            if (!resultsContainer.contains(resultsTable)) {
                 resultsContainer.innerHTML = ''; // Limpa mensagem "sem resultados"
                 resultsContainer.appendChild(resultsTable);
            }


            // Ordena por data (mais recente primeiro)
            actionsToDisplay.sort((a, b) => new Date(b.data) - new Date(a.data));

            actionsToDisplay.forEach(action => {
                const row = resultsTableBody.insertRow();
                if (action.idUsuario === currentUser.id) {
                    row.style.backgroundColor = 'rgba(var(--primary-color-rgb), 0.05)'; // Destaque sutil
                }

                row.insertCell().textContent = action.nomeUsuario || action.idUsuario;
                row.insertCell().textContent = action.species;
                const cellQuantity = row.insertCell();
                cellQuantity.textContent = action.quantidade;
                cellQuantity.classList.add('col-quantity');
                const cellDate = row.insertCell();
                try {
                    cellDate.textContent = new Date(action.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                } catch (e) { cellDate.textContent = '-'; }
                cellDate.classList.add('col-date');
            });
        };

        // --- Event Listener do Formulário de Busca (Lógica Principal) ---
        reportSearchForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (loadingMessage) loadingMessage.textContent = "Buscando..."; // Feedback

            const searchTermUser = userInput.value.trim().toLowerCase();
            const searchTermSpecies = speciesInput.value;

            // Carrega todos os usuários e ações CADA VEZ que busca (garante dados atualizados)
            const allUsers = await getAllUsers();
            const allActions = getActionsData();

            let finalActionsToDisplay = [];
            let userExists = false;

            // 1. Filtra usuários se um nome/ID foi digitado
            const filteredUsers = searchTermUser
                ? allUsers.filter(user =>
                    (user.username && user.username.toLowerCase().includes(searchTermUser)) ||
                    (user.id && user.id.toLowerCase().includes(searchTermUser))
                  )
                : allUsers; // Se não buscou usuário, considera todos

            if (searchTermUser && filteredUsers.length > 0) {
                 userExists = true; // Indica que o usuário pesquisado foi encontrado na lista de usuários
            }

            // 2. Filtra ações baseado nos usuários filtrados E na espécie selecionada
            const filteredUserIDs = new Set(filteredUsers.map(u => u.id)); // Cria um Set de IDs para busca rápida

            finalActionsToDisplay = allActions.filter(action => {
                const userMatch = filteredUserIDs.has(action.idUsuario); // Verifica se a ação pertence a um usuário filtrado
                const speciesMatch = !searchTermSpecies || action.species === searchTermSpecies;
                return userMatch && speciesMatch;
            });

            // 3. Exibe as ações encontradas
            displayResults(finalActionsToDisplay);

            // 4. Ajusta a mensagem de "sem resultados" se necessário
            if (finalActionsToDisplay.length === 0) {
                if (searchTermUser && userExists) {
                    // Usuário foi buscado, existe, mas não tem ações (ou não com a espécie filtrada)
                     resultsContainer.innerHTML = `<p class="no-results">Usuário '${userInput.value.trim()}' encontrado, mas não possui ações ${searchTermSpecies ? `da espécie '${searchTermSpecies}'` : 'registradas'} com os filtros aplicados.</p>`;
                 } else if (searchTermUser && !userExists) {
                      // Usuário foi buscado, mas não foi encontrado na lista de usuários
                       resultsContainer.innerHTML = `<p class="no-results">Nenhum usuário encontrado com o termo '${userInput.value.trim()}'.</p>`;
                 } else {
                      // Nenhuma ação encontrada, e não foi busca por usuário específico (ex: filtro só por espécie)
                      resultsContainer.innerHTML = `<p class="no-results">Nenhuma ação encontrada com os filtros aplicados.</p>`;
                 }
                 resultsTable.classList.add('hidden'); // Garante que a tabela está escondida
            } else {
                 // Se encontrou ações, garante que a mensagem "sem resultados" não esteja lá
                 const noResultsP = resultsContainer.querySelector('.no-results');
                 if(noResultsP) noResultsP.remove();
            }

        });

        // --- Carregamento Inicial ---
        // Exibe todas as ações ao carregar a página inicialmente
         const initialActions = getActionsData();
         displayResults(initialActions);
         // Esconde a mensagem inicial "Carregando" se ela existir
         if(loadingMessage && resultsContainer.contains(loadingMessage) && initialActions.length > 0) {
              loadingMessage.remove();
         } else if (initialActions.length === 0) {
              displayResults([]); // Chama para mostrar a mensagem "sem resultados" correta
         }


    } // Fim do if (reportSearchForm)

// ... (Resto do código do script.js: Inicialização applyThemeAndNavState, função goBack) ...

}); // Fim do DOMContentLoaded

// ... (Função goBack fora do DOMContentLoaded) ...
function goBack() {
    window.history.back();
}