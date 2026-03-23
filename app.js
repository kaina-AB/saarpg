// CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyB3_WGrYihcvfCQifwxSgnOCF_WSVmjyIE",
  authDomain: "saa-rpg.firebaseapp.com",
  projectId: "saa-rpg",
  storageBucket: "saa-rpg.firebasestorage.app",
  messagingSenderId: "335733843494",
  appId: "1:335733843494:web:02c817cd64bb12126f68e7"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ==================
// JOGADORES
// ==================

function criarJogador() {
    let nome = document.getElementById("nomeJogador").value;

    db.collection("jogadores").add({
        nome: nome
    });
}

// LISTENER TEMPO REAL
db.collection("jogadores").onSnapshot(snapshot => {
    let html = "";

    snapshot.forEach(doc => {
        let j = doc.data();

        html += `
        <div class="card">
            ${j.nome}
            <button onclick="criarPersonagem('${doc.id}')">+ Personagem</button>
        </div>`;
    });

    document.getElementById("jogadores").innerHTML = html;
});

// ==================
// PERSONAGENS
// ==================

function criarPersonagem(jogadorId) {
    db.collection("personagens").add({
        jogadorId,
        nome: "Novo",

        forca: 0,
        destreza: 0,
        constituicao: 0,
        inteligencia: 0,
        sabedoria: 0,
        carisma: 0,

        saa: 10,
        reisaa: 5
    });
}

// TEMPO REAL PERSONAGENS
db.collection("personagens").onSnapshot(snapshot => {
    let html = "";
    let select = document.getElementById("personagemSelect");

    select.innerHTML = "";

    snapshot.forEach(doc => {
        let p = doc.data();

        html += `
        <div class="card">
            <b>${p.nome}</b><br>
            SAA: ${p.saa} | REISAA: ${p.reisaa}<br>

            <button onclick="editar('${doc.id}')">Editar</button>
            <button onclick="deletar('${doc.id}')">Deletar</button>
        </div>`;

        let opt = document.createElement("option");
        opt.value = doc.id;
        opt.textContent = p.nome;
        select.appendChild(opt);
    });

    document.getElementById("personagens").innerHTML = html;
});

// ==================
// EDITAR
// ==================

async function editar(id) {
    let ref = db.collection("personagens").doc(id);
    let doc = await ref.get();
    let p = doc.data();

    let nome = prompt("Nome:", p.nome);
    let forca = prompt("Força:", p.forca);
    let destreza = prompt("Destreza:", p.destreza);
    let constituicao = prompt("Constituição:", p.constituicao);
    let inteligencia = prompt("Inteligência:", p.inteligencia);
    let sabedoria = prompt("Sabedoria:", p.sabedoria);

    await ref.update({
        nome,
        forca: +forca,
        destreza: +destreza,
        constituicao: +constituicao,
        inteligencia: +inteligencia,
        sabedoria: +sabedoria
    });
}
// ==================
// DELETAR
// ==================

function deletar(id) {
    db.collection("personagens").doc(id).delete();
}

// ==================
// ROLAGEM
// ==================

function roll(n) {
    let total = 0;
    for (let i = 0; i < n; i++) {
        total += Math.floor(Math.random() * 20) + 1;
    }
    return total;
}

async function rolar() {
    let id = document.getElementById("personagemSelect").value;
    let tipo = document.getElementById("tipo").value;
    let saa = parseInt(document.getElementById("saa").value) || 1;
    let usarReisaa = document.getElementById("reisaa").checked;

    let ref = db.collection("personagens").doc(id);
    let doc = await ref.get();
    let p = doc.data();

    let energia = usarReisaa ? "reisaa" : "saa";

    if (saa > p[energia]) {
        alert("Sem recurso suficiente");
        return;
    }

    let base = 0;

    switch (tipo) {
        case "forca":
            base = p.forca;
            break;

        case "respiracao":
            base = p.destreza + p.constituicao;
            break;

        case "combate":
            base = p.forca + p.destreza;
            break;

        case "fluxo":
            base = p.forca + (usarReisaa ? p.inteligencia : p.sabedoria);
            break;

        case "arma":
            base = p.forca + p.sabedoria;
            break;

        case "tudo":
            base = p.forca + p.destreza + p.constituicao +
                   (usarReisaa ? p.inteligencia : p.sabedoria);
            break;

        default:
            base = p[tipo] || 0;
    }

    let total = roll(saa) + base;

    await ref.update({
        [energia]: p[energia] - saa
    });

    document.getElementById("resultado").innerText =
        `Resultado: ${total} | ${energia.toUpperCase()} restante: ${p[energia] - saa}`;
}