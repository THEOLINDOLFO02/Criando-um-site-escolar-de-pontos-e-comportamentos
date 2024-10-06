// Variável global para armazenar o gráfico do aluno
let chartAluno = null;

// Variável global para armazenar a ação pendente
let acaoPendente = null;

document.getElementById('criar-turma').addEventListener('click', criarTurma);
document.getElementById('adicionar-aluno').addEventListener('click', adicionarAluno);
document.getElementById('voltar-turmas').addEventListener('click', voltarTurmas);
document.getElementById('calcular-ranking').addEventListener('click', calcularRanking);
document.getElementById('resetar-pontos').addEventListener('click', resetarPontos);
document.getElementById('resetar-feedbacks').addEventListener('click', resetarFeedbacks);
document.getElementById('exportarHistoricoPDF').addEventListener('click', exportarHistoricoPDF);

let turmas = JSON.parse(localStorage.getItem('turmas')) || {};

function salvarDados() {
    localStorage.setItem('turmas', JSON.stringify(turmas));
}

function criarTurma() {
    const nomeTurma = document.getElementById('nome-turma').value.trim();
    if (nomeTurma && !turmas[nomeTurma]) {
        turmas[nomeTurma] = {};
        salvarDados();
        atualizarListaTurmas();
        document.getElementById('nome-turma').value = '';
    } else if (turmas[nomeTurma]) {
        alert('Essa turma já existe!');
    } else {
        alert('Por favor, insira um nome de turma válido.');
    }
}
    // Adiciona o Turma ao pressionar Enter
    document.getElementById('nome-turma').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            criarTurma();
        }
    });

function atualizarListaTurmas() {
    const turmasDiv = document.getElementById('turmas');
    turmasDiv.innerHTML = '';
    for (const turma in turmas) {
        const turmaElement = document.createElement('div');
        turmaElement.innerHTML = `
            ${turma}
            <button onclick="excluirTurma('${turma}')">Excluir Turma</button>
        `;
        turmaElement.classList.add('turma');
        turmaElement.addEventListener('click', () => selecionarTurma(turma));
        turmasDiv.appendChild(turmaElement);
    }
}

function selecionarTurma(turma) {
    document.getElementById('turma-container').style.display = 'none';
    document.getElementById('aluno-container').style.display = 'block';
    document.getElementById('nome-da-turma').textContent = turma;
    atualizarListaAlunos(turma);
    gerarGraficoTurma(turma);
}

function voltarTurmas() {
    document.getElementById('turma-container').style.display = 'block';
    document.getElementById('aluno-container').style.display = 'none';
}

function adicionarAluno() {
    const nomeAluno = document.getElementById('nome-aluno').value.trim();
    const turma = document.getElementById('nome-da-turma').textContent;
    if (nomeAluno && !turmas[turma][nomeAluno]) {
        turmas[turma][nomeAluno] = { pontos: 0, feedbacks: [], historico: [] };
        salvarDados();
        atualizarListaAlunos(turma);
        document.getElementById('nome-aluno').value = '';
    } else if (turmas[turma][nomeAluno]) {
        alert('Esse aluno já existe na turma!');
    } else {
        alert('Por favor, insira um nome de aluno válido.');
    }
}
       // Adiciona o aluno ao pressionar Enter
    document.getElementById('nome-aluno').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            adicionarAluno();
        }
    });

function atualizarListaAlunos(turma) {
    const listaAlunos = document.getElementById('lista-alunos');
    listaAlunos.innerHTML = '';
    for (const aluno in turmas[turma]) {
        const alunoElement = document.createElement('li');
        alunoElement.innerHTML = `
            ${aluno} - Pontos: ${turmas[turma][aluno].pontos}
            <button class="recompensa" onclick="atribuirPontos('${turma}', '${aluno}', 1)">Positivo</button>
            <button onclick="abrirModal('modal-positivo', '${turma}', '${aluno}')">Comportamento</button>
            <button class="nivel-leve" onclick="atribuirPontos('${turma}', '${aluno}', -1)">Leve</button>
            <button onclick="abrirModal('modal-leve', '${turma}', '${aluno}')">Comportamento</button>
            <button class="nivel-moderado" onclick="atribuirPontos('${turma}', '${aluno}', -2)">Moderado</button>
            <button onclick="abrirModal('modal-moderado', '${turma}', '${aluno}')">Comportamento</button>
            <button class="nivel-grave" onclick="atribuirPontos('${turma}', '${aluno}', -3)">Grave</button>
            <button onclick="abrirModal('modal-grave', '${turma}', '${aluno}')">Comportamento</button>
            <button onclick="excluirAluno('${turma}', '${aluno}')">Excluir Aluno</button>
            <button onclick="gerarGraficoAluno('${turma}', '${aluno}')">Ver Gráfico</button>
        `;
        listaAlunos.appendChild(alunoElement);
    }
}

function abrirModal(modalId, turma, aluno) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    
    // Armazenar turma e aluno no modal para uso posterior
    modal.dataset.turma = turma;
    modal.dataset.aluno = aluno;

    // Limpar todas as checkboxes
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

function fecharModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function salvarSelecao(tipo) {
    const modalId = `modal-${tipo.toLowerCase()}`;
    const modal = document.getElementById(modalId);
    const turma = modal.dataset.turma;
    const aluno = modal.dataset.aluno;
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
    const feedbacks = [];

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            feedbacks.push(checkbox.value);
        }
    });

    // Adicionar feedbacks ao aluno
    turmas[turma][aluno].feedbacks.push({
        tipo: tipo,
        comportamentos: feedbacks,
        data: new Date().toLocaleDateString()
    });

    salvarDados();
    alert(`Feedbacks de ${tipo} salvos com sucesso!`);
    fecharModal(modalId);
    atualizarListaAlunos(turma);
}

function limparSelecao(tipo) {
    const checkboxes = document.querySelectorAll(`#modal-${tipo} input[type="checkbox"]`);
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

function atribuirPontos(turma, aluno, pontos) {
    turmas[turma][aluno].pontos += pontos;
    turmas[turma][aluno].historico.push({ data: new Date().toLocaleDateString(), pontos: turmas[turma][aluno].pontos });
    salvarDados();
    atualizarListaAlunos(turma);
    gerarGraficoTurma(turma);
}

function excluirAluno(turma, aluno) {
    delete turmas[turma][aluno];
    salvarDados();
    atualizarListaAlunos(turma);
    gerarGraficoTurma(turma);
}

function excluirTurma(turma) {
    delete turmas[turma];
    salvarDados();
    atualizarListaTurmas();
}

function resetarPontos() {
    const turma = document.getElementById('nome-da-turma').textContent;
    for (const aluno in turmas[turma]) {
        turmas[turma][aluno].pontos = 0;
        turmas[turma][aluno].historico = [{ data: new Date().toLocaleDateString(), pontos: 0 }];
    }
    salvarDados();
    atualizarListaAlunos(turma);
    gerarGraficoTurma(turma);
}

function resetarFeedbacks() {
    const turma = document.getElementById('nome-da-turma').textContent;
    for (const aluno in turmas[turma]) {
        turmas[turma][aluno].feedbacks = [];
    }
    salvarDados();
    atualizarListaAlunos(turma);
}

function calcularRanking() {
    const turma = document.getElementById('nome-da-turma').textContent;
    const alunos = Object.entries(turmas[turma]);
    const resultadoRanking = document.getElementById('resultado-ranking');
    
    alunos.sort((a, b) => b[1].pontos - a[1].pontos);

    let rankingHTML = '<h3>Ranking:</h3><ul>';
    alunos.forEach(([nome, dados], index) => {
        rankingHTML += `<li>${index + 1}. ${nome} : ${dados.pontos} pontos</li>`;
    });
    rankingHTML += '</ul>';
    
    resultadoRanking.innerHTML = rankingHTML;

    let feedbackHTML = '<h3>Feedbacks:</h3>';
    alunos.forEach(([nome, dados]) => {
        feedbackHTML += `<h4>${nome}:</h4><ul>`;
        dados.feedbacks.forEach(feedback => {
            feedbackHTML += `<li>${feedback.data} - ${feedback.tipo}: ${feedback.comportamentos.join(', ')}</li>`;
        });
        feedbackHTML += '</ul>';
    });
    
    resultadoRanking.innerHTML += feedbackHTML;
}

function gerarGraficoAluno(turma, aluno) {
    if (chartAluno) {
        chartAluno.destroy();
    }

    const ctx = document.getElementById('grafico-aluno').getContext('2d');
    const historico = turmas[turma][aluno].historico;

    const labels = historico.map(entry => entry.data);
    const data = historico.map(entry => entry.pontos);

    chartAluno = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Pontuação de ${aluno}`,
                data: data,
                borderColor: 'green',
                fill: false,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Data'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Pontos'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function gerarGraficoTurma(turma) {
    // Implementar se necessário
}

function exportarHistoricoPDF() {
    const turma = document.getElementById('nome-da-turma').textContent;
    
    // Criando uma nova instância do jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(`Histórico de Ranking e Comportamentos - ${turma}`, 14, 15);
    
    let yPos = 30;
    
    for (const aluno in turmas[turma]) {
        doc.setFontSize(12);
        doc.text(`Aluno: ${aluno}`, 14, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        doc.text(`Pontos: ${turmas[turma][aluno].pontos}`, 20, yPos);
        yPos += 7;
        
        doc.text("Feedbacks:", 20, yPos);
        yPos += 7;
        
        turmas[turma][aluno].feedbacks.forEach(feedback => {
            const feedbackText = `${feedback.data} - ${feedback.tipo}: ${feedback.comportamentos.join(', ')}`;
            const lines = doc.splitTextToSize(feedbackText, 180);
            doc.text(lines, 25, yPos);
            yPos += 7 * lines.length;
            
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
        });
        
        yPos += 10;
        
        if (yPos > 280) {
            doc.addPage();
            yPos = 20;
        }
    }
    
    doc.save(`historico_${turma}.pdf`);
}

// Adicione esta função no final do seu arquivo JavaScript
function inicializarCheckboxes() {
    const tipos = ['positivo', 'leve', 'moderado', 'grave'];
    const comportamentos = {
        positivo: [
            "Demonstra um profundo entendimento do conteúdo",
            "Aplica o conhecimento de forma criativa e inovadora",
            "Realiza pesquisas aprofundadas",
            "Participa ativamente das atividades",
            "É um líder positivo em sala de aula",
            "Inspira seus colegas e evolui constantemente",
            "Demonstra bom domínio do conteúdo",
            "Aplica o conhecimento em diferentes situações",
            "Demonstra habilidades de pesquisa e análise",
            "Evolui de forma significativa ao longo do processo de aprendizagem"
        ],
        leve: [
            "Pouca participação nas atividades",
            "Dificuldade em compreender o conteúdo",
            "Participação razoável nas atividades",
            "Demonstra um conhecimento básico do conteúdo",
            "Cumpre pouco com as tarefas propostas",
            "Apresenta dificuldades em algumas atividades mais complexas",
            "Não cumprir prazos",
            "Não traz material",
            "Não realiza leitura",
            "Não faz atividades",
            "Não entrega a atividade",
            "Falta de atenção",
            "Distração",
            "Conversas paralelas",
            "Não prestar atenção em explicações",
            "Interromper colegas",
            "Fica andando pela sala",
            "Não entregou a atividade",
            "Entregou a atividade atrasada",
            "Não entrou na plataforma"
        ],
        moderado: [
            "Desrespeito verbal",
            "Desobediência a regras básicas",
            "Usar linguagem ofensiva",
            "Jogar objetos",
            "Bagunça",
            "Desrespeito aos colegas",
            "Uso inadequado do celular: Jogo",
            "Uso inadequado do celular: Site de aposta"
        ],
        grave: [
            "Não entrega das atividades propostas",
            "Agressão física",
            "Agressão verbal",
            "Danos ao patrimônio",
            "Bullying",
            "Bater em colegas",
            "Xingar",
            "Quebrar objetos",
            "Atitudes que coloquem em risco a segurança de si mesmo ou dos outros e ameaças",
            "Porte de objetos cortantes",
            "Uso de drogas"
        ]
    };

    tipos.forEach(tipo => {
        const container = document.getElementById(`checkboxes-${tipo}`);
        comportamentos[tipo].forEach((comportamento, index) => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${tipo}${index + 1}`;
            checkbox.value = comportamento;

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = comportamento;

            container.appendChild(checkbox);
            container.appendChild(label);
            container.appendChild(document.createElement('br'));
        });
    });
}

// Chame esta função quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    inicializarCheckboxes();
    atualizarListaTurmas();
});
document.addEventListener('DOMContentLoaded', atualizarListaTurmas);