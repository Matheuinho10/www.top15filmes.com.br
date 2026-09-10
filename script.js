const loginModal = document.getElementById('loginModal');
const openLoginBtn = document.getElementById('openLoginBtn');
const closeLoginBtn = document.getElementById('closeLoginBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const usuarioInput = document.getElementById('loginIdentifier');
const senhaInput = document.getElementById('senha');
const userProfile = document.getElementById('userProfile');
const profileName = document.getElementById('profileName');
const logoutBtn = document.getElementById('logoutBtn');
const authTabs = document.querySelectorAll('.auth-tab');
const authPanels = document.querySelectorAll('.auth-panel');
const videoModal = document.getElementById('videoModal');
const closeVideoModalBtn = document.getElementById('closeVideoModalBtn');
const watchVideoButtons = document.querySelectorAll('.watchVideoBtn');
const republicaVideo = document.getElementById('republicaVideo');
const buscaFilmes = document.getElementById('buscaFilmes');
const buscaStatus = document.getElementById('buscaStatus');
const cardsCatalogo = document.querySelectorAll('.filmeCard');

const DEFAULT_USERS = [
  { usuario: 'admin', email: 'admin@top15.com', senha: '123456' }
];

function getUsers() {
  const storedUsers = localStorage.getItem('top15Users');

  if (!storedUsers) {
    localStorage.setItem('top15Users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }

  try {
    const parsedUsers = JSON.parse(storedUsers);
    return Array.isArray(parsedUsers) && parsedUsers.length ? parsedUsers : DEFAULT_USERS;
  } catch (error) {
    localStorage.setItem('top15Users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
}

function saveUsers(users) {
  localStorage.setItem('top15Users', JSON.stringify(users));
}

function openLoginModal() {
  if (!loginModal) return;

  loginModal.classList.remove('hidden');
  loginModal.setAttribute('aria-hidden', 'false');
  usuarioInput?.focus();
}

function closeLoginModal() {
  if (!loginModal) return;

  loginModal.classList.add('hidden');
  loginModal.setAttribute('aria-hidden', 'true');
  loginForm?.reset();
  registerForm?.reset();
  if (loginMessage) loginMessage.textContent = '';
  if (registerMessage) registerMessage.textContent = '';
}

function saveSession(username) {
  localStorage.setItem('top15Usuario', username);
  localStorage.setItem('top15Logado', 'true');
  updateUserState();
}

function clearSession() {
  localStorage.removeItem('top15Usuario');
  localStorage.removeItem('top15Logado');
  updateUserState();
}

function updateUserState() {
  const usuarioSalvo = localStorage.getItem('top15Usuario');
  const logado = localStorage.getItem('top15Logado') === 'true';

  if (openLoginBtn) {
    openLoginBtn.classList.toggle('hidden', logado);
  }

  if (userProfile) {
    userProfile.classList.toggle('hidden', !logado || !usuarioSalvo);
  }

  if (profileName && usuarioSalvo) {
    profileName.textContent = usuarioSalvo;
  }
}

function setActiveAuthTab(tabName) {
  authTabs.forEach((tab) => {
    const isActive = tab.dataset.authTab === tabName;
    tab.classList.toggle('active', isActive);
  });

  authPanels.forEach((panel) => {
    const isActive = panel.id === `${tabName}Panel`;
    panel.classList.toggle('active', isActive);
  });
}

function normalizarTexto(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function filtrarCatalogo() {
  const termo = normalizarTexto(buscaFilmes.value.trim());
  let encontrados = 0;

  cardsCatalogo.forEach((card) => {
    const corresponde = normalizarTexto(card.textContent).includes(termo);
    card.hidden = !corresponde;
    if (corresponde) encontrados += 1;
  });

  if (!termo) {
    buscaStatus.textContent = '';
    return;
  }

  buscaStatus.textContent = encontrados === 1
    ? '1 resultado encontrado.'
    : `${encontrados} resultados encontrados.`;
}

function openVideoModal() {
  if (!videoModal) return;

  videoModal.classList.remove('hidden');
  videoModal.setAttribute('aria-hidden', 'false');
  republicaVideo?.play().catch(() => {
    // autoplay pode ser bloqueado pelo navegador; o usuário pode iniciar manualmente
  });
}

function closeVideoModal() {
  if (!videoModal) return;

  videoModal.classList.add('hidden');
  videoModal.setAttribute('aria-hidden', 'true');

  if (republicaVideo) {
    republicaVideo.pause();
    republicaVideo.currentTime = 0;
  }
}

authTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    setActiveAuthTab(tab.dataset.authTab);
  });
});

watchVideoButtons.forEach((button) => {
  button.addEventListener('click', () => {
    openVideoModal();
  });
});

closeVideoModalBtn?.addEventListener('click', closeVideoModal);

videoModal?.addEventListener('click', (event) => {
  if (event.target === videoModal) {
    closeVideoModal();
  }
});

openLoginBtn?.addEventListener('click', () => {
  const usuarioSalvo = localStorage.getItem('top15Usuario');
  const logado = localStorage.getItem('top15Logado') === 'true';

  if (logado && usuarioSalvo) {
    return;
  }

  setActiveAuthTab('login');
  openLoginModal();
});

logoutBtn?.addEventListener('click', () => {
  const confirmar = window.confirm('Deseja sair da sua conta?');
  if (confirmar) {
    clearSession();
  }
});

closeLoginBtn?.addEventListener('click', closeLoginModal);

loginModal?.addEventListener('click', (event) => {
  if (event.target === loginModal) {
    closeLoginModal();
  }
});

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const identificador = usuarioInput.value.trim();
  const senha = senhaInput.value.trim();

  if (!identificador || !senha) {
    loginMessage.textContent = 'Preencha usuário/e-mail e senha para continuar.';
    loginMessage.style.color = '#ffc9c9';
    return;
  }

  const usuarios = getUsers();
  const usuarioEncontrado = usuarios.find((usuario) => {
    const mesmoUsuario = usuario.usuario.toLowerCase() === identificador.toLowerCase();
    const mesmoEmail = usuario.email.toLowerCase() === identificador.toLowerCase();
    return (mesmoUsuario || mesmoEmail) && usuario.senha === senha;
  });

  if (usuarioEncontrado) {
    saveSession(usuarioEncontrado.usuario);
    loginMessage.textContent = 'Login realizado com sucesso!';
    loginMessage.style.color = '#b7f7c7';

    setTimeout(() => {
      closeLoginModal();
    }, 900);
    return;
  }

  loginMessage.textContent = 'Usuário/e-mail ou senha inválidos.';
  loginMessage.style.color = '#ffc9c9';
});

registerForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const usuario = document.getElementById('registerUsuario').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const senha = document.getElementById('registerSenha').value.trim();

  if (!usuario || !email || !senha) {
    registerMessage.textContent = 'Preencha todos os campos para cadastrar.';
    registerMessage.style.color = '#ffc9c9';
    return;
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido) {
    registerMessage.textContent = 'Digite um e-mail válido.';
    registerMessage.style.color = '#ffc9c9';
    return;
  }

  if (senha.length < 6) {
    registerMessage.textContent = 'A senha precisa ter pelo menos 6 caracteres.';
    registerMessage.style.color = '#ffc9c9';
    return;
  }

  const usuarios = getUsers();
  const usuarioExiste = usuarios.some((item) => item.usuario.toLowerCase() === usuario.toLowerCase());
  const emailExiste = usuarios.some((item) => item.email.toLowerCase() === email.toLowerCase());

  if (usuarioExiste || emailExiste) {
    registerMessage.textContent = 'Usuário ou e-mail já cadastrados.';
    registerMessage.style.color = '#ffc9c9';
    return;
  }

  usuarios.push({ usuario, email, senha });
  saveUsers(usuarios);

  registerMessage.textContent = 'Cadastro realizado com sucesso! Faça login agora.';
  registerMessage.style.color = '#b7f7c7';
  registerForm.reset();
  setTimeout(() => {
    setActiveAuthTab('login');
    registerMessage.textContent = '';
  }, 1200);
});

buscaFilmes?.addEventListener('input', filtrarCatalogo);

updateUserState();

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (loginModal && !loginModal.classList.contains('hidden')) {
      closeLoginModal();
    }

    if (videoModal && !videoModal.classList.contains('hidden')) {
      closeVideoModal();
    }
  }
});
