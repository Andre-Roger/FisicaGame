const canvas = document.getElementById("cenario");
const ctx = canvas.getContext("2d");

const inputVelocidade = document.getElementById("velocidade");
const inputAceleracao = document.getElementById("aceleracao");
const inputObstaculos = document.getElementById("obstaculos");

const metrosTotais   = 158.33;
const pixelsPorMetro = canvas.width / metrosTotais;

// --- Estado físico ---
let posicaoMetros    = 0;
let velocidadeMS     = 0;
let velocidadeMaxMS  = 0;
let velocidadeAlvoMS = 0;
let aceleracaoMS2    = 0;

let velocidadeAoEntrar  = 0;
let emObstaculoAnterior = false;

// Guarda a velocidade do último frame antes de terminar
let velocidadeFinal  = 0;

let terminou        = false;
let tempoInicial    = 0;
let tempoDecorrido  = 0;
let ultimoTimestamp = null;

let listaObstaculos     = [];
let historicoTempo      = [];
let historicoVelocidade = [];
let grafico             = null;

// --- Imagem: fundo ---
const imgFundo = new Image();
imgFundo.src = "./IMG/fundinho.jpg";
let fundoCarregado = false;
imgFundo.onload = () => { fundoCarregado = true; };

// --- Imagem: carro ---
const imgCarro = new Image();
imgCarro.src = "./IMG/Mcquenn.png";
let imagemCarregada = false;
imgCarro.onload = () => { imagemCarregada = true; };

// --- Imagem: obstáculo intacto ---
const imgObstaculo = new Image();
imgObstaculo.src = "./IMG/agua-antes.png";
let obsCarregada = false;
imgObstaculo.onload = () => { obsCarregada = true; };

// --- Imagem: obstáculo após ser passado ---
const imgObstaculoPassado = new Image();
imgObstaculoPassado.src = "./IMG/agua-depois.png";
let obsPassadaCarregada = false;
imgObstaculoPassado.onload = () => { obsPassadaCarregada = true; };

// --- Obstáculos ---
function criarObstaculos(qtd) {
    listaObstaculos = [];
    for (let i = 0; i < qtd; i++) {
        listaObstaculos.push({
            x:       (canvas.width - 100) / (qtd + 1) * (i + 1), // posição em pixels
            y:       125,
            largura: 50,
            altura:  50,
            passado: false          // controla qual imagem usar
        });
    }
}

// Colisão: carro ainda está dentro do obstáculo
function verificarColisao(obs) {
    const px = posicaoMetros * pixelsPorMetro;
    return px + 60 > obs.x && px < obs.x + obs.largura;
}

// Passou: carro já ultrapassou completamente o obstáculo
function verificarPassou(obs) {
    const px = posicaoMetros * pixelsPorMetro;
    return px > obs.x + obs.largura;
}

// --- Gráfico ---
function criarGrafico() {
    const ctxG = document.getElementById("grafico");
    if (grafico) grafico.destroy();
    grafico = new Chart(ctxG, {
        type: "line",
        data: {
            labels: historicoTempo,
            datasets: [{
                label: "Velocidade (km/h)",
                data: historicoVelocidade,
                borderWidth: 2,
                tension: 0.2
            }]
        },
        options: {
            responsive: false,
            animation: false,
            scales: {
                x: { title: { display: true, text: "Tempo (s)" } },
                y: { title: { display: true, text: "Velocidade (km/h)" } }
            }
        }
    });
}

function atualizarGrafico() {
    if (!grafico) { criarGrafico(); return; }
    grafico.data.labels            = historicoTempo;
    grafico.data.datasets[0].data  = historicoVelocidade;
    grafico.update("none");
}

// --- Loop principal ---
function atualizarSimulacao(timestamp) { 
        velocidade = Number(inputVelocidade.value)
        if (velocidade < 0) {
            velocidadeMaxMS = 0
        }

    if (ultimoTimestamp === null) ultimoTimestamp = timestamp;
    const dt = Math.min((timestamp - ultimoTimestamp) / 1000, 0.05);
    ultimoTimestamp = timestamp;

    if (!terminou) {

        // CORREÇÃO: única declaração de emObstaculo
        const emObstaculo = listaObstaculos.some(obs => verificarColisao(obs));

        // Captura a velocidade só no momento em que entra no obstáculo
        if (emObstaculo && !emObstaculoAnterior) {
            velocidadeAoEntrar = velocidadeMS;
        }
        emObstaculoAnterior = emObstaculo;

        // Velocidade alvo: 63% da velocidade ao entrar se estiver no obstáculo
        velocidadeAlvoMS = emObstaculo ? velocidadeAoEntrar * 0.63 : velocidadeMaxMS;

        // MRUV: Δv = a · dt
        if (velocidadeMS < velocidadeAlvoMS) {
            velocidadeMS = Math.min(velocidadeMS + aceleracaoMS2 * dt, velocidadeAlvoMS);
        } else if (velocidadeMS > velocidadeAlvoMS) {
            velocidadeMS = Math.max(velocidadeMS - aceleracaoMS2 * dt, velocidadeAlvoMS);
        }

        // MRUV: Δx = v · dt
        posicaoMetros += velocidadeMS * dt;

        // Guarda velocidade atual para exibir depois de terminar
        velocidadeFinal = velocidadeMS;

        // CORREÇÃO: marca obstáculos já ultrapassados
        for (const obs of listaObstaculos) {
            if (!obs.passado && verificarPassou(obs)) obs.passado = true;
        }

        // Histórico a cada ~0,1 s
        tempoDecorrido = (performance.now() - tempoInicial) / 1000;
        const ultimoT  = historicoTempo[historicoTempo.length - 1];
        if (!ultimoT || tempoDecorrido - parseFloat(ultimoT) >= 0.1) {
            historicoTempo.push(tempoDecorrido.toFixed(2));
            historicoVelocidade.push((velocidadeMS * 3.6).toFixed(2));
            atualizarGrafico();
        }

        // Chegou ao fim
        if (posicaoMetros >= metrosTotais) {
            posicaoMetros = metrosTotais;
            terminou      = true;
        }
    }

    // --- Renderização ---

    // Converte metros → pixels e impede o carro de sair da tela
    const posicaoX = Math.min(
        posicaoMetros * pixelsPorMetro,
        canvas.width - 73   // 73 = largura do sprite do carro
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo
    if (fundoCarregado) {
        ctx.drawImage(imgFundo, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Obstáculos — imagem diferente dependendo se foi passado ou não
    for (const obs of listaObstaculos) {
        if (obs.passado && obsPassadaCarregada) {
            ctx.drawImage(imgObstaculoPassado, obs.x, obs.y, obs.largura, obs.altura);
        } else if (!obs.passado && obsCarregada) {
            ctx.drawImage(imgObstaculo, obs.x, obs.y, obs.largura, obs.altura);
        } else {
            // Fallback enquanto as imagens carregam
            ctx.fillStyle = obs.passado ? "gray" : "blue";
            ctx.fillRect(obs.x, obs.y, obs.largura, obs.altura);
        }
    }

    // Carro — continua visível após terminar
    if (imagemCarregada) {
        ctx.drawImage(imgCarro, posicaoX, 100, 73, 80);
    } else {
        ctx.fillStyle = "red";
        ctx.fillRect(posicaoX, 100, 40, 40);
    }

    // HUD — fundo
    ctx.fillStyle   = "black";
    ctx.fillRect(10, 10, 230, 100);
    ctx.strokeStyle = "white";
    ctx.lineWidth   = 3;
    ctx.strokeRect(10, 10, 230, 100);

    // HUD — texto
    // Após terminar, mostra a velocidade final (não zero)
    const velExibida = terminou ? velocidadeFinal : velocidadeMS;

    ctx.fillStyle = "white";
    ctx.font      = "16px sans-serif";
    ctx.fillText(`Posição:    ${posicaoMetros.toFixed(2)} m`,           20, 35);
    ctx.fillText(
        `Velocidade: ${(Math.abs(velExibida) * 3.6).toFixed(2)} km/h`,
        20,
        60
    );
    ctx.fillText(`Tempo:      ${tempoDecorrido.toFixed(2)} s`,           20, 85);

    if (terminou) {
        ctx.fillStyle = "black";
        ctx.font      = "bold 18px sans-serif";
        ctx.fillText("✓ Chegou!", 330, 30);
    }

    // CORREÇÃO: para o loop quando terminar, evitando processamento desnecessário
    if (!terminou) {
        requestAnimationFrame(atualizarSimulacao);
    }
}

// --- Reiniciar ---
function reiniciar() {
    const vKmh      = Number(inputVelocidade.value) || 60;
    const aMS2      = Number(inputAceleracao.value) || 0;
    const qtdObs    = Number(inputObstaculos.value) || 0;

    velocidadeMaxMS  = vKmh / 3.6;
    aceleracaoMS2 = Math.max(0, aMS2);
    velocidadeMS     = 0;
    velocidadeFinal  = 0;
    velocidadeAlvoMS = velocidadeMaxMS;
    posicaoMetros    = 0;
    terminou         = false;

    tempoInicial    = performance.now();
    tempoDecorrido  = 0;
    ultimoTimestamp = null;

    historicoTempo      = [];
    historicoVelocidade = [];

    criarObstaculos(qtdObs);
    criarGrafico();

    velocidadeAoEntrar  = 0;
    emObstaculoAnterior = false;
    requestAnimationFrame(atualizarSimulacao);
}

// --- Inicia ---
reiniciar();
requestAnimationFrame(atualizarSimulacao);
