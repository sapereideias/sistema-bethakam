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
function renderizarListasAdmin() {
  // POLOS
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

  // TURMAS
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

  // PROFESSORES
  const ulProf = document.getElementById('lista-professores');
  const selectProf = document.getElementById('cad-disc-prof');
  ulProf.innerHTML = '';
  selectProf.innerHTML = '<option value="">Selecione o Professor (Opcional)</option>';

  dados.professores.forEach(prof => {
    const nome = typeof prof === 'string' ? prof : prof.nome;
    ulProf.innerHTML += `<li>${nome}</li>`;
    selectProf.innerHTML += `<option value="${nome}">${nome}</option>`;
  });

  // ALUNOS (Com botão de Excluir)
  const ulAluno = document.getElementById('lista-alunos');
  ulAluno.innerHTML = '';
  if (dados.alunos.length === 0) {
    ulAluno.innerHTML = '<li><em>Nenhum aluno cadastrado.</em></li>';
  } else {
    dados.alunos.forEach(a => {
      ulAluno.innerHTML += `
        <li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span><strong>Mat: ${a.matricula}</strong> - ${a.nome} | 🔑 Senha: <strong>${a.senha}</strong></span>
          <button class="btn-sair" style="padding: 3px 8px; font-size: 11px; margin-left: 10px;" onclick="excluirAluno('${a.matricula}')">Excluir</button>
        </li>
      `;
    });
  }

  // DISCIPLINAS
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
// FUNÇÃO PARA EXCLUIR ALUNO
function excluirAluno(matricula) {
  const aluno = dados.alunos.find(a => a.matricula === matricula);
  if (!aluno) return;

  // Pede confirmação antes de apagar
  const confirmacao = confirm(`Tem certeza que deseja excluir o aluno ${aluno.nome} (Matrícula: ${matricula})?`);
  if (!confirmacao) return;

  // 1. Remove o aluno da lista
  dados.alunos = dados.alunos.filter(a => a.matricula !== matricula);

  // 2. Remove as notas associadas a este aluno
  Object.keys(dados.notas).forEach(chave => {
    if (chave.startsWith(`${matricula}_`)) {
      delete dados.notas[chave];
    }
  });

  // 3. Atualiza a lista na tela e salva a alteração no Firebase
  renderizarListasAdmin();
  salvarNoFirebase("Aluno excluído com sucesso da nuvem!");
}
