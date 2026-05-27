const canvas = document.getElementById("cenario");
const ctx = canvas.getContext("2d");

const inputVelocidade =
    document.getElementById("aceleracao");

const inputObstaculos =
    document.getElementById("obstaculos");

let posicaoX = 10;
const metrosTotais = 158.33;


const imgFundo = new Image();

imgFundo.src = "./IMG/fundinho.jpg";

let fundoCarregado = false;

imgFundo.onload = () => {

    fundoCarregado = true;
};



let velocidadeBase = 0;
let velocidadeX = 0;

let aceleracao = 0;

let velocidadeAlvo = 0;

let listaObstaculos = [];

let terminou = false;

let tempoInicial = 0;
let tempoDecorrido = 0;

// histórico do gráfico
let historicoTempo = [];
let historicoVelocidade = [];

let grafico = null;

// imagem do carro
const imgCarro = new Image();

imgCarro.src = "./IMG/Mcquenn.png";

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
            altura: 40
        });
    }
}

// colisão
function verificarColisao(obstaculo) {

    return (

        posicaoX + 40 > obstaculo.x &&

        posicaoX <
        obstaculo.x + obstaculo.largura
    );
}

// cria gráfico
function criarGrafico() {

    const ctxGrafico =
        document.getElementById("grafico");

    if (grafico) {

        grafico.destroy();
    }

    grafico = new Chart(ctxGrafico, {

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

                x: {

                    title: {

                        display: true,

                        text: "Tempo (s)"
                    }
                },

                y: {

                    title: {

                        display: true,

                        text: "Velocidade (km/h)"
                    }
                }
            }
        }
    });
}

function atualizarSimulacao() {

    let emObstaculo = false;

    // verifica obstáculos
    for (let obstaculo of listaObstaculos) {

        if (verificarColisao(obstaculo)) {

            emObstaculo = true;
        }
    }

    let posicaoMetros =
    (posicaoX / canvas.width) * metrosTotais; 

    // velocidade alvo
    if (emObstaculo) {

        velocidadeAlvo = velocidadeBase / 2;

    } else {

        velocidadeAlvo = velocidadeBase;
    }

    // aceleração
    if (!terminou && velocidadeX < velocidadeAlvo) {

        velocidadeX += aceleracao;

        if (velocidadeX > velocidadeAlvo) {

            velocidadeX = velocidadeAlvo;
        }
    }

    // desaceleração
    if (!terminou && velocidadeX > velocidadeAlvo) {

        velocidadeX -= aceleracao;

        if (velocidadeX < velocidadeAlvo) {

            velocidadeX = velocidadeAlvo;
        }
    }

    // movimento
    if (posicaoX < canvas.width - 40) {

        posicaoX += (velocidadeX * 3) / 60;

    } else {

        posicaoX = canvas.width - 40;

        velocidadeX = velocidadeBase;

        terminou = true;
    }

    // tempo
    if (!terminou) {

        tempoDecorrido =
            (performance.now() - tempoInicial) / 1000;
    }

    // guarda histórico
    if (!terminou) {

    historicoTempo.push(
        tempoDecorrido.toFixed(2)
    );

    historicoVelocidade.push(
        velocidadeX.toFixed(2)
    );

    // atualiza gráfico
    criarGrafico();
}

    // atualiza gráfico em tempo real
    criarGrafico();

    // limpa tela
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // fundo
    if (fundoCarregado) {

        ctx.drawImage(
            imgFundo,
            0,
            0,
            canvas.width,
            canvas.height
        );

    } else {

        ctx.fillStyle = "black";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

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
            92,
            73,
            80
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
    // fundo
    ctx.fillStyle = "black";
    
    ctx.fillRect(
        10,
        10,
        180,
        83, 
    );
    ctx.strokeStyle = "white";

    ctx.lineWidth = 3;

    ctx.strokeRect(
        10,
        10,
        180,
        83
    );
    // textos
    ctx.fillStyle = "white";

    ctx.font = "16px sans-serif";

    ctx.fillText(

        `Posição: ${posicaoMetros.toFixed(2)} m`,

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

    aceleracao = velocidadeBase / 100;

    velocidadeAlvo = velocidadeBase;

    velocidadeX = 0;

    let qtdObstaculos = Number(
        inputObstaculos.value
    );

    criarObstaculos(qtdObstaculos);

    posicaoX = 10;

    terminou = false;

    tempoInicial = performance.now();

    tempoDecorrido = 0;

    historicoTempo = [];
    historicoVelocidade = [];
}

// inicia
reiniciar();

atualizarSimulacao();