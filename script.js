// A SUA CHAVE DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDs09lCBfgpfkfRrH97DHWg6dD_6XVEa7c",
  authDomain: "bethakam-pet.firebaseapp.com",
  projectId: "bethakam-pet",
  storageBucket: "bethakam-pet.firebasestorage.app",
  messagingSenderId: "87176942051",
  appId: "1:87176942051:web:6ee27387e14470d673d0d6"
};

// INICIALIZANDO O FIREBASE E O BANCO DE DADOS
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// VARIÁVEL QUE GUARDA TUDO NO SISTEMA
let dados = {
  polos: [],         // NOVO: Guarda os Polos
  turmas: [],        // NOVO: Guarda as Turmas vinculadas aos Polos
  professores: [],
  alunos: [],
  disciplinas: [],
  notas: {}
};

let usuarioLogado = null;

// FUNÇÃO MÁGICA QUE SALVA NA NUVEM
function salvarNoFirebase(mensagemSucesso) {
  db.collection("sistema").doc("bancoDeDados").set(dados)
    .then(() => {
      if(mensagemSucesso) alert(mensagemSucesso);
    })
    .catch((error) => {
      alert("Erro ao salvar na nuvem: " + error);
    });
}

// CARREGAMENTO INICIAL
window.onload = function() {
  document.getElementById('btn-login').disabled = true;
  
  db.collection("sistema").doc("bancoDeDados").get().then((doc) => {
    if (doc.exists) {
      const dadosNuvem = doc.data();
      // Garante que as listas novas existam, mesmo em bancos antigos
      dados.polos = dadosNuvem.polos || [];
      dados.turmas = dadosNuvem.turmas || [];
      dados.professores = dadosNuvem.professores || [];
      dados.alunos = dadosNuvem.alunos || [];
      dados.disciplinas = dadosNuvem.disciplinas || [];
      dados.notas = dadosNuvem.notas || {};
    } else {
      salvarNoFirebase();
    }
    
    document.getElementById('msg-carregando').classList.add('oculto');
    document.getElementById('btn-login').disabled = false;
    
    preencherAnosIngresso();
    renderizarListasAdmin();
    atualizarOpcoesLogin();
  }).catch((error) => {
    console.error("Erro ao conectar no banco:", error);
    document.getElementById('msg-carregando').innerText = "Erro de conexão. Verifique sua internet.";
  });
};

function preencherAnosIngresso() {
  const selectAno = document.getElementById('cad-aluno-ano-ingresso');
  if (!selectAno) return;
  selectAno.innerHTML = '';
  const anoAtual = new Date().getFullYear();
  for (let ano = 2002; ano <= anoAtual; ano++) {
    selectAno.innerHTML += `<option value="${ano}">${ano}</option>`;
  }
}

// NAVEGAÇÃO DE TELA E PERFIS
function atualizarOpcoesLogin() {
  const perfil = document.getElementById('perfil-select').value;
  const labelUsuario = document.getElementById('label-usuario');
  const inputUsuario = document.getElementById('usuario-input');
  const inputSenha = document.getElementById('senha-input');

  inputUsuario.value = '';
  inputSenha.value = '';

  if (perfil === 'admin') {
    labelUsuario.innerText = "Usuário do Administrador:";
    inputUsuario.placeholder = "Digite o usuário (ex: admin)";
  } else if (perfil === 'secretario') {
    labelUsuario.innerText = "Usuário do Secretário:";
    inputUsuario.placeholder = "Digite o usuário (ex: secretario)";
  } else if (perfil === 'professor') {
    labelUsuario.innerText = "Nome do Professor:";
    inputUsuario.placeholder = "Digite o nome do Professor";
  } else if (perfil === 'aluno') {
    labelUsuario.innerText = "CPF do Aluno:";
    inputUsuario.placeholder = "Digite seu CPF (apenas números)";
  }
}

function fazerLogin() {
  const perfil = document.getElementById('perfil-select').value;
  const usuario = document.getElementById('usuario-input').value.trim();
  const senha = document.getElementById('senha-input').value.trim();

  if (!usuario || !senha) {
    alert("Por favor, preencha o usuário/CPF e a senha!");
    return;
  }

  if (perfil === 'admin') {
    if (usuario.toLowerCase() === 'admin' && senha === 'admin123') {
      usuarioLogado = { perfil: 'admin' };
      document.getElementById('tela-login').classList.add('oculto');
      configurarTelaAdmin('Administrador');
    } else {
      alert("Usuário ou senha de Administrador incorretos!");
    }
  } else if (perfil === 'secretario') {
    if (usuario.toLowerCase() === 'secretario' && senha === 'sec123') {
      usuarioLogado = { perfil: 'secretario' };
      document.getElementById('tela-login').classList.add('oculto');
      configurarTelaAdmin('Secretário');
    } else {
      alert("Usuário ou senha de Secretário incorretos!");
    }
  } else if (perfil === 'professor') {
    usuarioLogado = { perfil: 'professor', nome: usuario };
    document.getElementById('tela-login').classList.add('oculto');
    document.getElementById('tela-professor').classList.remove('oculto');
    carregarSelectDisciplinasProf(usuario);
  } else if (perfil === 'aluno') {
    const cpfLimpo = usuario.replace(/\D/g, '');
    const aluno = dados.alunos.find(a => a.cpf.replace(/\D/g, '') === cpfLimpo && a.senha === senha);

    if (!aluno) {
      alert("CPF ou Senha incorretos!");
      return;
    }

    usuarioLogado = { perfil: 'aluno', matricula: aluno.matricula };
    document.getElementById('tela-login').classList.add('oculto');
    document.getElementById('tela-aluno').classList.remove('oculto');
    carregarHistoricoAluno(aluno.matricula);
  }
}

function configurarTelaAdmin(nomePerfil) {
  document.getElementById('tela-admin').classList.remove('oculto');
  document.getElementById('titulo-painel-gestao').innerText = `Painel de Gestão Acadêmica (${nomePerfil})`;
  
  const boxProf = document.getElementById('box-cad-prof');
  if (nomePerfil === 'Secretário') {
    boxProf.style.display = 'none';
  } else {
    boxProf.style.display = 'block';
  }

  renderizarListasAdmin();
}

function deslogar() {
  usuarioLogado = null;
  document.getElementById('usuario-input').value = '';
  document.getElementById('senha-input').value = '';
  document.getElementById('tela-admin').classList.add('oculto');
  document.getElementById('tela-professor').classList.add('oculto');
  document.getElementById('tela-aluno').classList.add('oculto');
  document.getElementById('tela-login').classList.remove('oculto');
}

// ----------------- CADASTROS -----------------

function cadastrarPolo() {
  const nome = document.getElementById('cad-polo-nome').value.trim();
  if (!nome) return alert('Digite o nome do polo!');
  
  dados.polos.push(nome);
  document.getElementById('cad-polo-nome').value = '';
  renderizarListasAdmin();
  salvarNoFirebase('Polo cadastrado com sucesso!');
}

function cadastrarTurma() {
  const nome = document.getElementById('cad-turma-nome').value.trim();
  const polo = document.getElementById('cad-turma-polo').value;
  if (!nome || !polo) return alert('Preencha o nome da turma e selecione o polo!');
  
  const novaTurma = {
    id: Date.now(),
    nome: nome,
    polo: polo
  };

  dados.turmas.push(novaTurma);
  document.getElementById('cad-turma-nome').value = '';
  renderizarListasAdmin();
  salvarNoFirebase('Turma cadastrada com sucesso!');
}

function cadastrarProfessor() {
  const nome = document.getElementById('cad-prof-nome').value.trim();
  if (!nome) return alert('Digite o nome do professor!');
  
  dados.professores.push(nome);
  document.getElementById('cad-prof-nome').value = '';
  renderizarListasAdmin();
  salvarNoFirebase('Professor cadastrado com sucesso!');
}

function cadastrarDisciplina() {
  const nome = document.getElementById('cad-disc-nome').value.trim();
  const turmaId = document.getElementById('cad-disc-turma').value;
  const periodo = document.getElementById('cad-disc-periodo').value;
  const ano = document.getElementById('cad-disc-ano').value.trim();
  const semestre = document.getElementById('cad-disc-semestre').value;
  const ch = document.getElementById('cad-disc-ch').value.trim() || "60";
  const prof = document.getElementById('cad-disc-prof').value;

  if (!nome || !turmaId || !ano) return alert('Preencha o nome, turma e ano da disciplina!');

  const novaDisc = {
    id: Date.now(),
    nome: nome,
    turmaId: turmaId, // Vinculada à Turma
    periodo: periodo,
    ano: ano,
    semestre: semestre,
    ch: ch,
    professor: prof || "A Definir"
  };

  dados.disciplinas.push(novaDisc);
  document.getElementById('cad-disc-nome').value = '';
  document.getElementById('cad-disc-ano').value = '';
  
  renderizarListasAdmin();
  salvarNoFirebase('Disciplina cadastrada com sucesso!');
}

function cadastrarAluno() {
  const nome = document.getElementById('cad-aluno-nome').value.trim();
  const email = document.getElementById('cad-aluno-email').value.trim();
  const cpf = document.getElementById('cad-aluno-cpf').value.trim();
  const senha = document.getElementById('cad-aluno-senha').value.trim();
  const nascimento = document.getElementById('cad-aluno-nascimento').value;
  const polo = document.getElementById('cad-aluno-polo').value;
  const turmaId = document.getElementById('cad-aluno-turma').value; // Salva o ID da Turma
  const nacionalidade = document.getElementById('cad-aluno-nacionalidade').value;
  const natCidade = document.getElementById('cad-aluno-nat-cidade').value.trim();
  const natTipo = document.getElementById('cad-aluno-nat-tipo').value;
  const natUf = document.getElementById('cad-aluno-nat-uf').value.trim();
  const sexo = document.getElementById('cad-aluno-sexo').value;
  const pai = document.getElementById('cad-aluno-pai').value.trim();
  const mae = document.getElementById('cad-aluno-mae').value.trim();
  const ingresso = document.getElementById('cad-aluno-ingresso').value;
  const anoIngresso = document.getElementById('cad-aluno-ano-ingresso').value;
  const semestreIngresso = document.getElementById('cad-aluno-semestre-ingresso').value;

  if (!nome || !cpf || !senha || !polo || !turmaId) {
    return alert('Preencha Nome, CPF, Senha, Polo e Turma!');
  }

  if (senha.length > 8) {
    return alert('A senha deve ter no máximo 8 caracteres!');
  }

  const agora = new Date();
  const ano = agora.getFullYear().toString();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const cpfLimpo = cpf.replace(/\D/g, '');
  const cincoCpf = cpfLimpo.substring(0, 5).padEnd(5, '0');
  
  const matricula = `${ano}${mes}${cincoCpf}`;

  const novoAluno = {
    matricula: matricula,
    nome: nome,
    email: email,
    cpf: cpf,
    senha: senha,
    nascimento: nascimento,
    polo: polo,
    turma: turmaId, // Guarda o ID da turma
    nacionalidade: nacionalidade,
    naturalidade: `${natCidade} - ${natTipo}: ${natUf}`,
    sexo: sexo,
    pai: pai,
    mae: mae,
    ingresso: ingresso,
    anoSemestreIngresso: `${anoIngresso}.${semestreIngresso}`
  };

  dados.alunos.push(novoAluno);

  // Limpar formulário
  document.querySelectorAll('.grid-form-aluno input').forEach(input => input.value = '');

  renderizarListasAdmin();
  salvarNoFirebase(`Aluno cadastrado com sucesso!\nMatrícula Gerada: ${matricula}`);
}

function renderizarListasAdmin() {
  // ATUALIZA SELECTS DE POLOS
  const ulPolo = document.getElementById('lista-polos');
  const selTurmaPolo = document.getElementById('cad-turma-polo');
  const selAlunoPolo = document.getElementById('cad-aluno-polo');
  
  ulPolo.innerHTML = '';
  selTurmaPolo.innerHTML = '<option value="">Selecione o Polo primeiro</option>';
  selAlunoPolo.innerHTML = '<option value="">Selecione o Polo</option>';
  
  dados.polos.forEach(polo => {
    ulPolo.innerHTML += `<li>${polo}</li>`;
    selTurmaPolo.innerHTML += `<option value="${polo}">${polo}</option>`;
    selAlunoPolo.innerHTML += `<option value="${polo}">${polo}</option>`;
  });

  // ATUALIZA SELECTS DE TURMAS
  const ulTurma = document.getElementById('lista-turmas');
  const selDiscTurma = document.getElementById('cad-disc-turma');
  const selAlunoTurma = document.getElementById('cad-aluno-turma');

  ulTurma.innerHTML = '';
  selDiscTurma.innerHTML = '<option value="">Selecione a Turma</option>';
  selAlunoTurma.innerHTML = '<option value="">Selecione a Turma</option>';

  dados.turmas.forEach(t => {
    ulTurma.innerHTML += `<li>${t.nome} (Polo: ${t.polo})</li>`;
    selDiscTurma.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
    selAlunoTurma.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
  });

  // ATUALIZA SELECTS DE PROFESSORES
  const ulProf = document.getElementById('lista-professores');
  const selectProf = document.getElementById('cad-disc-prof');
  ulProf.innerHTML = '';
  selectProf.innerHTML = '<option value="">Selecione o Professor (Opcional)</option>';

  dados.professores.forEach(prof => {
    ulProf.innerHTML += `<li>${prof}</li>`;
    selectProf.innerHTML += `<option value="${prof}">${prof}</option>`;
  });

  // LISTA DE ALUNOS
  const ulAluno = document.getElementById('lista-alunos');
  ulAluno.innerHTML = '';
  if (dados.alunos.length === 0) {
    ulAluno.innerHTML = '<li><em>Nenhum aluno cadastrado.</em></li>';
  } else {
    dados.alunos.forEach(a => {
      ulAluno.innerHTML += `<li><strong>Matrícula: ${a.matricula}</strong> - ${a.nome} (CPF: ${a.cpf})</li>`;
    });
  }

  // LISTA DE DISCIPLINAS
  const ulDisc = document.getElementById('lista-disciplinas');
  ulDisc.innerHTML = '';
  if (dados.disciplinas.length === 0) {
    ulDisc.innerHTML = '<li><em>Nenhuma disciplina cadastrada.</em></li>';
  } else {
    dados.disciplinas.forEach(d => {
      const turmaObj = dados.turmas.find(t => t.id == d.turmaId);
      const nomeTurma = turmaObj ? turmaObj.nome : "Sem Turma";
      ulDisc.innerHTML += `<li>[${d.ano}.${d.semestre}] P${d.periodo} - ${d.nome} (Turma: ${nomeTurma})</li>`;
    });
  }
}

// PROFESSOR / SECRETÁRIO / ADMIN - LANÇAMENTO DE NOTA FINAL
function carregarSelectDisciplinasProf(nomeProf) {
  const select = document.getElementById('prof-disciplina-select');
  select.innerHTML = '<option value="">-- Selecione uma disciplina --</option>';

  const discDoProf = dados.disciplinas.filter(d => d.professor.toLowerCase() === nomeProf.toLowerCase() || nomeProf === "");

  discDoProf.forEach(d => {
    const turmaObj = dados.turmas.find(t => t.id == d.turmaId);
    const nomeTurma = turmaObj ? turmaObj.nome : "Sem Turma";
    select.innerHTML += `<option value="${d.id}">${d.nome} - ${nomeTurma} (${d.ano}.${d.semestre})</option>`;
  });
}

function carregarTurmaProfessor() {
  const discId = document.getElementById('prof-disciplina-select').value;
  const area = document.getElementById('area-lancamento-prof');

  if (!discId) {
    area.classList.add('oculto');
    return;
  }

  const disciplinaSelecionada = dados.disciplinas.find(d => d.id == discId);
  area.classList.remove('oculto');
  const corpo = document.getElementById('corpo-tabela-prof');
  corpo.innerHTML = '';

  // Exibe apenas os alunos que pertencem à turma vinculada a esta disciplina
  const alunosDaTurma = dados.alunos.filter(a => a.turma == disciplinaSelecionada.turmaId);

  if (alunosDaTurma.length === 0) {
    corpo.innerHTML = `<tr><td colspan="4">Nenhum aluno matriculado nesta turma.</td></tr>`;
    return;
  }

  alunosDaTurma.forEach(aluno => {
    const chave = `${aluno.matricula}_${discId}`;
    const registro = dados.notas[chave] || { notaFinal: '', situacao: 'APVD' };

    corpo.innerHTML += `
      <tr>
        <td>${aluno.matricula}</td>
        <td>${aluno.nome}</td>
        <td>
          <input type="number" step="0.1" class="input-nota input-notafinal" data-mat="${aluno.matricula}" value="${registro.notaFinal}" placeholder="0.0">
        </td>
        <td>
          <select class="select-situacao select-sitfinal" data-mat="${aluno.matricula}">
            <option value="APVD" ${registro.situacao === 'APVD' ? 'selected' : ''}>Aprovado (APVD)</option>
            <option value="RPVD" ${registro.situacao === 'RPVD' ? 'selected' : ''}>Reprovado (RPVD)</option>
            <option value="TM" ${registro.situacao === 'TM' ? 'selected' : ''}>Trancou Matrícula (TM)</option>
          </select>
        </td>
      </tr>
    `;
  });
}

function salvarNotasProfessor() {
  const discId = document.getElementById('prof-disciplina-select').value;
  const disciplinaSelecionada = dados.disciplinas.find(d => d.id == discId);
  const alunosDaTurma = dados.alunos.filter(a => a.turma == disciplinaSelecionada.turmaId);

  alunosDaTurma.forEach(aluno => {
    const inputNota = document.querySelector(`.input-notafinal[data-mat="${aluno.matricula}"]`);
    const selectSit = document.querySelector(`.select-sitfinal[data-mat="${aluno.matricula}"]`);

    if (inputNota && selectSit) {
      const notaVal = inputNota.value.trim();
      const situacaoVal = selectSit.value;

      const chave = `${aluno.matricula}_${discId}`;
      dados.notas[chave] = {
        notaFinal: notaVal !== '' ? parseFloat(notaVal).toFixed(1) : '-',
        situacao: situacaoVal
      };
    }
  });

  salvarNoFirebase('Nota Final e Situação salvas com sucesso na nuvem!');
}

// VISUALIZAÇÃO DO HISTÓRICO DO ALUNO
function carregarHistoricoAluno(matricula) {
  const aluno = dados.alunos.find(a => a.matricula === matricula);
  if (!aluno) return;

  document.getElementById('hist-aluno-mat').innerText = aluno.matricula;
  document.getElementById('hist-aluno-nome').innerText = aluno.nome;
  document.getElementById('hist-aluno-cpf').innerText = aluno.cpf;
  document.getElementById('hist-aluno-email').innerText = aluno.email || "-";
  document.getElementById('hist-aluno-nascimento').innerText = aluno.nascimento || "-";
  document.getElementById('hist-aluno-nacionalidade').innerText = aluno.nacionalidade || "-";
  document.getElementById('hist-aluno-naturalidade').innerText = aluno.naturalidade || "-";
  document.getElementById('hist-aluno-sexo').innerText = aluno.sexo || "-";
  document.getElementById('hist-aluno-pai').innerText = aluno.pai || "-";
  document.getElementById('hist-aluno-mae').innerText = aluno.mae || "-";
  document.getElementById('hist-aluno-ingresso').innerText = aluno.ingresso || "-";
  document.getElementById('hist-aluno-ano-semestre').innerText = aluno.anoSemestreIngresso || "-";

  // Busca o nome da Turma baseada no ID salvo no aluno
  const turmaObj = dados.turmas.find(t => t.id == aluno.turma);
  document.getElementById('hist-polo-header').innerText = aluno.polo || "NÃO INFORMADO";
  document.getElementById('hist-turma-header').innerText = turmaObj ? turmaObj.nome : "NÃO INFORMADA";

  const corpo = document.getElementById('corpo-tabela-historico');
  corpo.innerHTML = '';

  // Filtra APENAS as disciplinas que pertencem à Turma deste aluno
  const disciplinasDaTurma = dados.disciplinas.filter(d => d.turmaId == aluno.turma);

  for (let p = 1; p <= 8; p++) {
    const disciplinasDoPeriodo = disciplinasDaTurma.filter(d => d.periodo == p);

    corpo.innerHTML += `
      <tr>
        <td colspan="6" class="linha-periodo-header">PERÍODO ${p}</td>
      </tr>
    `;

    if (disciplinasDoPeriodo.length === 0) {
      corpo.innerHTML += `
        <tr>
          <td>-</td>
          <td>-</td>
          <td style="text-align:left;">Sem disciplinas cadastradas neste período</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
        </tr>
      `;
    } else {
      disciplinasDoPeriodo.forEach(disc => {
        const chave = `${aluno.matricula}_${disc.id}`;
        const notaReg = dados.notas[chave] || { notaFinal: '-', situacao: 'TM' };

        let classeStatus = '';
        if (notaReg.situacao === 'APVD') classeStatus = 'status-apvd';
        if (notaReg.situacao === 'RPVD') classeStatus = 'status-rpvd';

        corpo.innerHTML += `
          <tr>
            <!-- AQUI ESTÁ A MÁGICA: O Ano e Semestre puxados da Disciplina! -->
            <td>${disc.ano}.${disc.semestre}</td> 
            <td>${disc.id}</td>
            <td style="text-align:left;">${disc.nome}</td>
            <td>${disc.ch}h</td>
            <td><strong>${notaReg.notaFinal}</strong></td>
            <td class="${classeStatus}">${notaReg.situacao}</td>
          </tr>
        `;
      });
    }
  }
}
