const canvas = document.getElementById("cenario");
const ctx = canvas.getContext("2d");

let posicaoX = 10;

let velocidadeBase = 0;
let velocidadeX = 0;

let listaObstaculos = [];

// cria obstáculos
function criarObstaculos(qtd) {

    listaObstaculos = [];

    for (let i = 0; i < qtd; i++) {

        listaObstaculos.push({
            x: 150 + (i * 120),
            y: 110,
            largura: 30,
            altura: 30
        });
    }
}

function atualizarSimulacao() {

    // velocidade normal
    velocidadeX = velocidadeBase;

    // verifica colisão
    for (let obstaculo of listaObstaculos) {

        if (
            posicaoX + 40 > obstaculo.x &&
            posicaoX < obstaculo.x + obstaculo.largura
        ) {

            // desacelera
            velocidadeX = velocidadeBase / 2;
        }
    }

    // movimento
    if (posicaoX < canvas.width - 40) {

        posicaoX += (velocidadeX * 3) / 60;
    }

    // limpa tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // chão
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 140, canvas.width, 5);

    // obstáculos
    ctx.fillStyle = "blue";

    for (let obstaculo of listaObstaculos) {

        ctx.fillRect(
            obstaculo.x,
            obstaculo.y,
            obstaculo.largura,
            obstaculo.altura
        );
    }

    // bloco
    ctx.fillStyle = "red";
    ctx.fillRect(posicaoX, 100, 40, 40);

    // textos
    ctx.fillStyle = "white";
    ctx.font = "16px sans-serif";

    ctx.fillText(
        `Posição: ${Math.round(posicaoX)} px`,
        20,
        30
    );

    ctx.fillText(
        `Velocidade: ${velocidadeX.toFixed(2)} Km/h`,
        20,
        55
    );

    requestAnimationFrame(atualizarSimulacao);

    tempoDecorrido = (performance.now() - tempoInicial) / 1000;
}

// botão
function reiniciar() {

    velocidadeBase = Number(
        document.getElementById("numero").value
    );

    let qtdObstaculos = Number(
        document.getElementById("obstaculos").value
    );

    criarObstaculos(qtdObstaculos);

    posicaoX = 10;

    tempoInicial = performance.now();
}

// inicia animação
atualizarSimulacao();