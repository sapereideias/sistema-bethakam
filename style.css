// BANCO DE DADOS LOCAL 100% INDEPENDENTE (localStorage)
let dados = JSON.parse(localStorage.getItem('bethakam_local_db')) || {
  polos: [],
  turmas: [],
  professores: [],
  alunos: [],
  disciplinas: [],
  notas: {},
  credenciais: {
    admin: "admin123",
    secretario: "sec123"
  }
};

let usuarioLogado = null;

function salvarLocalmente(mensagemSucesso) {
  localStorage.setItem('bethakam_local_db', JSON.stringify(dados));
  if (mensagemSucesso) alert(mensagemSucesso);
}

window.onload = function() {
  renderizarListasAdmin();
  atualizarOpcoesLogin();
};

function atualizarOpcoesLogin() {
  const perfil = document.getElementById('perfil-select').value;
  const labelUsuario = document.getElementById('label-usuario');
  const inputUsuario = document.getElementById('usuario-input');
  const inputSenha = document.getElementById('senha-input');

  inputUsuario.value = '';
  inputSenha.value = '';

  if (perfil === 'admin') {
    labelUsuario.innerText = "Usuário do Administrador:";
    inputUsuario.placeholder = "admin";
  } else if (perfil === 'secretario') {
    labelUsuario.innerText = "Usuário do Secretário:";
    inputUsuario.placeholder = "secretario";
  } else if (perfil === 'professor') {
    labelUsuario.innerText = "Nome do Professor:";
    inputUsuario.placeholder = "Digite o nome do Professor";
  } else if (perfil === 'aluno') {
    labelUsuario.innerText = "CPF ou E-mail do Aluno:";
    inputUsuario.placeholder = "Digite seu CPF ou E-mail";
  }
}

function fazerLogin() {
  const perfil = document.getElementById('perfil-select').value;
  const usuario = document.getElementById('usuario-input').value.trim();
  const senha = document.getElementById('senha-input').value.trim();

  if (!usuario || !senha) {
    return alert("Preencha usuário/CPF/E-mail e senha!");
  }

  if (perfil === 'admin') {
    if (usuario.toLowerCase() === 'admin' && senha === dados.credenciais.admin) {
      usuarioLogado = { perfil: 'admin', identificador: 'admin' };
      document.getElementById('tela-login').classList.add('oculto');
      configurarTelaAdmin('Administrador');
    } else {
      alert("Usuário ou senha de Administrador incorretos!");
    }
  } else if (perfil === 'secretario') {
    if (usuario.toLowerCase() === 'secretario' && senha === dados.credenciais.secretario) {
      usuarioLogado = { perfil: 'secretario', identificador: 'secretario' };
      document.getElementById('tela-login').classList.add('oculto');
      configurarTelaAdmin('Secretário');
    } else {
      alert("Usuário ou senha de Secretário incorretos!");
    }
  } else if (perfil === 'professor') {
    const prof = dados.professores.find(p => {
      const nomeProf = typeof p === 'string' ? p : p.nome;
      const senhaProf = typeof p === 'string' ? '12345678' : p.senha;
      return nomeProf.toLowerCase() === usuario.toLowerCase() && senhaProf === senha;
    });

    if (prof) {
      const nomeFinal = typeof prof === 'string' ? prof : prof.nome;
      usuarioLogado = { perfil: 'professor', identificador: nomeFinal };
      document.getElementById('tela-login').classList.add('oculto');
      document.getElementById('tela-professor').classList.remove('oculto');
      carregarSelectDisciplinasProf(nomeFinal);
    } else {
      alert("Professor não encontrado ou senha incorreta!");
    }
  } else if (perfil === 'aluno') {
    const termoBusca = usuario.toLowerCase();
    const cpfLimpoBusca = usuario.replace(/\D/g, '');

    const aluno = dados.alunos.find(a => {
      const matchEmail = a.email && a.email.toLowerCase() === termoBusca;
      const matchCpf = a.cpf && a.cpf.replace(/\D/g, '') === cpfLimpoBusca && cpfLimpoBusca.length > 0;
      return (matchEmail || matchCpf) && a.senha === senha;
    });

    if (!aluno) {
      return alert("CPF/E-mail ou Senha incorretos!");
    }

    usuarioLogado = { perfil: 'aluno', identificador: aluno.matricula };
    document.getElementById('tela-login').classList.add('oculto');
    document.getElementById('tela-aluno').classList.remove('oculto');
    carregarHistoricoAluno(aluno.matricula);
  }
}

function configurarTelaAdmin(nomePerfil) {
  document.getElementById('tela-admin').classList.remove('oculto');
  document.getElementById('titulo-painel-gestao').innerText = `Painel de Gestão Acadêmica (${nomePerfil})`;
  document.getElementById('box-cad-prof').style.display = (nomePerfil === 'Secretário') ? 'none' : 'block';
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

function abrirModalSenha() {
  document.getElementById('nova-senha-input').value = '';
  document.getElementById('confirma-senha-input').value = '';
  document.getElementById('modal-senha').classList.remove('oculto');
}

function fecharModalSenha() {
  document.getElementById('modal-senha').classList.add('oculto');
}

function salvarNovaSenha() {
  const novaSenha = document.getElementById('nova-senha-input').value.trim();
  const confirmaSenha = document.getElementById('confirma-senha-input').value.trim();

  if (!novaSenha) return alert("Digite a nova senha!");
  if (novaSenha !== confirmaSenha) return alert("As senhas não coincidem!");

  if (usuarioLogado.perfil === 'admin') {
    dados.credenciais.admin = novaSenha;
  } else if (usuarioLogado.perfil === 'secretario') {
    dados.credenciais.secretario = novaSenha;
  } else if (usuarioLogado.perfil === 'aluno') {
    const aluno = dados.alunos.find(a => a.matricula === usuarioLogado.identificador);
    if (aluno) aluno.senha = novaSenha;
  }

  fecharModalSenha();
  salvarLocalmente("Senha alterada com sucesso!");
}

function cadastrarPolo() {
  const nome = document.getElementById('cad-polo-nome').value.trim();
  if (!nome) return alert('Digite o nome do polo!');
  dados.polos.push(nome);
  document.getElementById('cad-polo-nome').value = '';
  renderizarListasAdmin();
  salvarLocalmente('Polo cadastrado!');
}

function cadastrarTurma() {
  const nome = document.getElementById('cad-turma-nome').value.trim();
  const polo = document.getElementById('cad-turma-polo').value;
  if (!nome || !polo) return alert('Preencha nome da turma e selecione o polo!');
  dados.turmas.push({ id: Date.now(), nome: nome, polo: polo });
  document.getElementById('cad-turma-nome').value = '';
  renderizarListasAdmin();
  salvarLocalmente('Turma cadastrada!');
}

function cadastrarProfessor() {
  const nome = document.getElementById('cad-prof-nome').value.trim();
  const senha = document.getElementById('cad-prof-senha').value.trim() || '12345678';
  if (!nome) return alert('Digite o nome do professor!');
  dados.professores.push({ nome: nome, senha: senha });
  document.getElementById('cad-prof-nome').value = '';
  document.getElementById('cad-prof-senha').value = '';
  renderizarListasAdmin();
  salvarLocalmente('Professor cadastrado!');
}

function cadastrarDisciplina() {
  const nome = document.getElementById('cad-disc-nome').value.trim();
  const turmaId = document.getElementById('cad-disc-turma').value;
  const periodo = document.getElementById('cad-disc-periodo').value;
  const ano = document.getElementById('cad-disc-ano').value.trim();
  const semestre = document.getElementById('cad-disc-semestre').value;

  if (!nome || !turmaId || !ano) return alert('Preencha nome, turma e ano!');

  dados.disciplinas.push({
    id: Date.now(),
    nome: nome,
    turmaId: turmaId,
    periodo: periodo,
    ano: ano,
    semestre: semestre
  });

  document.getElementById('cad-disc-nome').value = '';
  document.getElementById('cad-disc-ano').value = '';
  renderizarListasAdmin();
  salvarLocalmente('Disciplina cadastrada!');
}

function cadastrarAluno() {
  const nome = document.getElementById('cad-aluno-nome').value.trim();
  const email = document.getElementById('cad-aluno-email').value.trim();
  const cpf = document.getElementById('cad-aluno-cpf').value.trim();
  const polo = document.getElementById('cad-aluno-polo').value;
  const turmaId = document.getElementById('cad-aluno-turma').value;

  if (!nome || !cpf || !polo || !turmaId) {
    return alert('Preencha Nome, CPF, Polo e Turma!');
  }

  const agora = new Date();
  const ano = agora.getFullYear().toString();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const cpfLimpo = cpf.replace(/\D/g, '');
  const matricula = `${ano}${mes}${cpfLimpo.substring(0, 5).padEnd(5, '0')}`;
  const senhaAutomática = `${cpfLimpo.substring(0, 4).padEnd(4, '0')}${String(dados.alunos.length + 1).padStart(4, '0')}`;

  dados.alunos.push({
    matricula: matricula,
    nome: nome,
    email: email,
    cpf: cpf,
    senha: senhaAutomática,
    polo: polo,
    turma: turmaId,
    historicoModular: []
  });

  renderizarListasAdmin();
  salvarLocalmente(`Aluno Cadastrado!\n\nMatrícula: ${matricula}\nSenha: ${senhaAutomática}`);
}

function excluirAluno(matricula) {
  if (!confirm("Deseja realmente excluir este aluno?")) return;
  dados.alunos = dados.alunos.filter(a => a.matricula !== matricula);
  renderizarListasAdmin();
  salvarLocalmente("Aluno excluído com sucesso!");
}

function renderizarListasAdmin() {
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

  const ulProf = document.getElementById('lista-professores');
  const selectProf = document.getElementById('cad-disc-prof');
  ulProf.innerHTML = '';
  selectProf.innerHTML = '<option value="">Selecione o Professor</option>';

  dados.professores.forEach(prof => {
    const nome = typeof prof === 'string' ? prof : prof.nome;
    ulProf.innerHTML += `<li>${nome}</li>`;
    selectProf.innerHTML += `<option value="${nome}">${nome}</option>`;
  });

  const ulAluno = document.getElementById('lista-alunos');
  ulAluno.innerHTML = '';
  dados.alunos.forEach(a => {
    ulAluno.innerHTML += `
      <li style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span><strong>Mat: ${a.matricula}</strong> - ${a.nome} | 🔑 Senha: ${a.senha}</span>
        <button class="btn-sair" style="padding:2px 6px; font-size:10px;" onclick="excluirAluno('${a.matricula}')">Excluir</button>
      </li>
    `;
  });
}

function importarPlanilhaExcel() {
  const inputArquivo = document.getElementById('arquivo-excel');
  const arquivo = inputArquivo.files[0];
  if (!arquivo) return alert('Selecione uma planilha!');

  const leitor = new FileReader();
  leitor.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const linhas = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    let count = 0;
    linhas.forEach(linha => {
      const cpf = String(linha.CPF || linha.cpf || '').trim();
      const nome = String(linha.Nome || linha.NOME || '').trim();
      const mes = String(linha.Mes || linha.MES || '').trim();
      const ano = String(linha.Ano || linha.ANO || '').trim();
      const discNome = String(linha.Disciplina || linha.DISCIPLINA || '').trim();
      const profNome = String(linha.Professor || linha.PROFESSOR || '—').trim();
      const notaVal = linha.Nota !== undefined ? String(linha.Nota).trim() : '—';

      if (!cpf || !discNome) return;

      const cpfLimpo = cpf.replace(/\D/g, '');
      let aluno = dados.alunos.find(a => a.cpf.replace(/\D/g, '') === cpfLimpo);

      if (!aluno) {
        const agora = new Date();
        const matricula = `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, '0')}${cpfLimpo.substring(0, 5).padEnd(5, '0')}`;
        const senha = `${cpfLimpo.substring(0, 4).padEnd(4, '0')}${String(dados.alunos.length + 1).padStart(4, '0')}`;

        aluno = {
          matricula: matricula,
          nome: nome || 'Aluno Importado',
          cpf: cpf,
          senha: senha,
          polo: 'Sede Principal',
          turma: 'Geral',
          historicoModular: []
        };
        dados.alunos.push(aluno);
      }

      if (!aluno.historicoModular) aluno.historicoModular = [];
      aluno.historicoModular.push({ mes, ano, disciplina: discNome, professor: profNome, nota: notaVal });
      count++;
    });

    renderizarListasAdmin();
    salvarLocalmente(`${count} registro(s) da planilha importados com sucesso!`);
  };
  leitor.readAsArrayBuffer(arquivo);
}

function carregarHistoricoAluno(matricula) {
  const aluno = dados.alunos.find(a => a.matricula === matricula);
  if (!aluno) return;

  document.getElementById('hist-aluno-mat').innerText = aluno.matricula;
  document.getElementById('hist-aluno-nome').innerText = aluno.nome;
  document.getElementById('hist-aluno-cpf').innerText = aluno.cpf;
  document.getElementById('hist-aluno-email').innerText = aluno.email || "-";
  document.getElementById('hist-polo-header').innerText = aluno.polo || "Sede";
  document.getElementById('hist-turma-header').innerText = aluno.turma || "Geral";

  const corpo = document.getElementById('corpo-tabela-historico');
  corpo.innerHTML = '';

  const lista = aluno.historicoModular || [];
  if (lista.length === 0) {
    corpo.innerHTML = `<tr><td colspan="5">Nenhuma disciplina cadastrada.</td></tr>`;
    return;
  }

  lista.forEach(item => {
    corpo.innerHTML += `
      <tr>
        <td>${item.mes || '-'}</td>
        <td>${item.ano || '-'}</td>
        <td style="text-align:left;">${item.disciplina}</td>
        <td>${item.professor || '—'}</td>
        <td><strong>${item.nota || '—'}</strong></td>
      </tr>
    `;
  });
}
