const canvas = document.getElementById("cenario");
const ctx = canvas.getContext("2d");

const inputVelocidade =
    document.getElementById("aceleracao");

const inputObstaculos =
    document.getElementById("obstaculos");

let posicaoX = 10;

let velocidadeBase = 0;
let velocidadeX = 0;

let listaObstaculos = [];
let terminou = false;
let tempoInicial = 0;
let tempoDecorrido = 0;

let tempoDesacelerado = 0;

// imagem do carro
const imgCarro = new Image();

imgCarro.src = "./IMG/imagem.jpg";

let imagemCarregada = false;

imgCarro.onload = () => {

    imagemCarregada = true;
};

// cria obstáculos
function criarObstaculos(qtd) {

    listaObstaculos = [];

    for (let i = 0; i < qtd; i++) {

        listaObstaculos.push({

            x: 200 + (i * 120),
            y: 110,

            largura: 40,
            altura: 40,

            colidiu: false
        });
    }
}

// verifica colisão
function verificarColisao(obstaculo) {

    return (

        posicaoX + 40 > obstaculo.x &&

        posicaoX <
        obstaculo.x + obstaculo.largura
    );
}

function atualizarSimulacao() {

    // velocidade normal
    if (tempoDesacelerado > 0) {

        velocidadeX = velocidadeBase / 2;

        tempoDesacelerado -= 16;

    } else {

        velocidadeX = velocidadeBase;
    }

    // colisão
    for (let obstaculo of listaObstaculos) {

        if (

            verificarColisao(obstaculo) &&

            !obstaculo.colidiu
        ) {

            // desacelera
            tempoDesacelerado = 2000;

            obstaculo.colidiu = true;
        }
    }

    // movimento
    if (posicaoX < canvas.width - 40) {

    posicaoX += (velocidadeX * 3) / 60;

    } else {

    terminou = true;
}

    // tempo
    if (!terminou) {

        tempoDecorrido =
            (performance.now() - tempoInicial) / 1000;
    }

    // limpa tela
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // chão
    ctx.fillStyle = "#333";

    ctx.fillRect(
        0,
        140,
        canvas.width,
        5
    );

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

    // carro
    if (imagemCarregada) {

        ctx.drawImage(
            imgCarro,
            posicaoX,
            100,
            40,
            40
        );

    } else {

        ctx.fillStyle = "red";

        ctx.fillRect(
            posicaoX,
            100,
            40,
            40
        );
    }

    // textos
    ctx.fillStyle = "white";

    ctx.font = "16px sans-serif";

    ctx.fillText(

        `Posição: ${Math.round(posicaoX)} px`,

        20,
        30
    );

    ctx.fillText(

        `Velocidade: ${velocidadeX.toFixed(2)} km/h`,

        20,
        55
    );

    ctx.fillText(

        `Tempo: ${tempoDecorrido.toFixed(2)} s`,

        20,
        80
    );

    requestAnimationFrame(
        atualizarSimulacao
    );
}

// botão
function reiniciar() {

    velocidadeBase = Number(
        inputVelocidade.value
    );

    let qtdObstaculos = Number(
        inputObstaculos.value
    );

    criarObstaculos(qtdObstaculos);

    posicaoX = 10;

    tempoInicial = performance.now();
}

// inicia
reiniciar();

atualizarSimulacao();

