// CONFIG FIREBASE (Sua config original)
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

// Variáveis Globais de Estado
let mapaPersonagens = {};
let mapaJogadores = {};

// ==================
// NAVEGAÇÃO DA SPA
// ==================
function navigate(pageId) {
    // Esconde todas as páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Remove active dos botões do menu
    document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));
    
    // Mostra a página alvo e ativa o botão
    document.getElementById(pageId).classList.add('active');
    document.getElementById('btn-' + pageId).classList.add('active');
}

// ==================
// LISTENERS FIREBASE
// ==================

// Listener de Jogadores
db.collection("jogadores").onSnapshot(snapshot => {
    let listaHTML = "";
    let selectHTML = '<option value="todos">Todos os Jogadores</option>';
    
    snapshot.forEach(doc => {
        let j = doc.data();
        mapaJogadores[doc.id] = j.nome;
        
        listaHTML += `
        <div class="card">
            <h3>👥 ${j.nome}</h3>
            <div class="flex-gap">
                <button class="btn-danger" onclick="deletarJogador('${doc.id}')">Deletar</button>
            </div>
        </div>`;
        
        selectHTML += `<option value="${doc.id}">${j.nome}</option>`;
    });

    document.getElementById("listaJogadores").innerHTML = listaHTML;
    document.getElementById("filtroJogadorPersonagem").innerHTML = selectHTML;
});

// Listener de Personagens
db.collection("personagens").onSnapshot(snapshot => {
    let listaHTML = "";
    let selectMesaHTML = "";
    mapaPersonagens = {}; // Reseta o mapa

    snapshot.forEach(doc => {
        let p = doc.data();
        mapaPersonagens[doc.id] = p;
        let nomeJogador = mapaJogadores[p.jogadorId] || "Sem Jogador";

        // Preenche listagem de personagens
        listaHTML += `
        <div class="card">
            <h3>🛡️ ${p.nome}</h3>
            <p><strong>Jogador:</strong> ${nomeJogador}</p>
            <p><strong>SAA:</strong> ${p.saa} | <strong>REISAA:</strong> ${p.reisaa} | <strong>Vida:</strong> ${p.vida}</p>
            <div class="flex-gap">
                <button class="btn-primary" onclick="abrirEditor('${doc.id}')">Editar</button>
                <button class="btn-danger" onclick="deletarPersonagem('${doc.id}')">Deletar</button>
            </div>
        </div>`;

        // Preenche select da Mesa
        selectMesaHTML += `<option value="${doc.id}">${p.nome} (${nomeJogador})</option>`;
    });

    document.getElementById("listaPersonagens").innerHTML = listaHTML;
    document.getElementById("personagemSelectMesa").innerHTML = selectMesaHTML;
});

// ==================
// JOGADORES CRUD
// ==================
function criarJogador() {
    let input = document.getElementById("nomeJogador");
    if(!input.value.trim()) return alert("Digite um nome!");
    db.collection("jogadores").add({ nome: input.value });
    input.value = "";
}

function deletarJogador(id) {
    if(confirm("Deletar jogador e seus personagens?")) {
        db.collection("jogadores").doc(id).delete();
        // Em um app real, você faria uma query para deletar os personagens desse ID também.
    }
}

// ==================
// PERSONAGENS CRUD
// ==================
function criarPersonagem() {
    let jogadorId = document.getElementById("filtroJogadorPersonagem").value;
    if(jogadorId === "todos") return alert("Selecione um jogador específico no filtro acima para vincular o novo personagem.");

    db.collection("personagens").add({
        jogadorId: jogadorId,
        nome: "Novo Personagem",
        origem: "", idade: "", altura: "",
        forca: 0, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0,
        pericias: { forca: 0, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0 },
        inventario: [""], equipado: [""], restricoes: ["", "", ""],
        vida: 10, saa: 10, reisaa: 5
    });
}

function deletarPersonagem(id) {
    if(confirm("Tem certeza que deseja deletar o personagem?")) {
        db.collection("personagens").doc(id).delete();
    }
}

// ==================
// EDITOR DE PERSONAGEM
// ==================
function abrirEditor(id) {
    let p = mapaPersonagens[id];
    if(!p) return;

    document.getElementById("editorPersonagem").classList.remove("hidden");
    document.getElementById("editId").value = id;
    
    // Basicos
    document.getElementById("editNome").value = p.nome || "";
    document.getElementById("editOrigem").value = p.origem || "";
    document.getElementById("editIdade").value = p.idade || "";
    document.getElementById("editAltura").value = p.altura || "";
    
    // Atributos
    document.getElementById("editFor").value = p.forca || 0;
    document.getElementById("editDes").value = p.destreza || 0;
    document.getElementById("editCon").value = p.constituicao || 0;
    document.getElementById("editInt").value = p.inteligencia || 0;
    document.getElementById("editSab").value = p.sabedoria || 0;
    document.getElementById("editCar").value = p.carisma || 0;
    
    // Pericias
    document.getElementById("editPFor").value = p.pericias?.forca || 0;
    document.getElementById("editPDes").value = p.pericias?.destreza || 0;
    document.getElementById("editPCon").value = p.pericias?.constituicao || 0;
    document.getElementById("editPInt").value = p.pericias?.inteligencia || 0;
    document.getElementById("editPSab").value = p.pericias?.sabedoria || 0;
    document.getElementById("editPCar").value = p.pericias?.carisma || 0;
    
    // Status
    document.getElementById("editVida").value = p.vida || 0;
    document.getElementById("editSaa").value = p.saa || 0;
    document.getElementById("editReisaa").value = p.reisaa || 0;
    
    // Scrolla para o editor
    document.getElementById("editorPersonagem").scrollIntoView({ behavior: 'smooth' });
}

function fecharEditor() {
    document.getElementById("editorPersonagem").classList.add("hidden");
}

function salvarPersonagem() {
    let id = document.getElementById("editId").value;
    let ref = db.collection("personagens").doc(id);

    ref.update({
        nome: document.getElementById("editNome").value,
        origem: document.getElementById("editOrigem").value,
        idade: document.getElementById("editIdade").value,
        altura: document.getElementById("editAltura").value,

        forca: +document.getElementById("editFor").value,
        destreza: +document.getElementById("editDes").value,
        constituicao: +document.getElementById("editCon").value,
        inteligencia: +document.getElementById("editInt").value,
        sabedoria: +document.getElementById("editSab").value,
        carisma: +document.getElementById("editCar").value,

        pericias: {
            forca: +document.getElementById("editPFor").value,
            destreza: +document.getElementById("editPDes").value,
            constituicao: +document.getElementById("editPCon").value,
            inteligencia: +document.getElementById("editPInt").value,
            sabedoria: +document.getElementById("editPSab").value,
            carisma: +document.getElementById("editPCar").value
        },

        vida: +document.getElementById("editVida").value,
        saa: +document.getElementById("editSaa").value,
        reisaa: +document.getElementById("editReisaa").value
    }).then(() => {
        alert("Personagem salvo com sucesso!");
        fecharEditor();
    });
}

// ==================
// LOGICA DE ROLAGEM E CALCULO (Mantida do calculo.html original)
// ==================

function rollDetalhado(n){
    let resultados = [];
    let total = 0;
    for(let i=0;i<n;i++){
        let v = Math.floor(Math.random()*20)+1;
        resultados.push(v);
        total += v;
    }
    return { total, resultados };
}

function baseCalculo(p, tipo, useReisaa, usarPericia){
    let atributos = new Set();
    function add(nome){ atributos.add(nome); }

    // Simples
    if(tipo === "forca") add("forca");
    if(tipo === "destreza") add("destreza");
    if(tipo === "constituicao") add("constituicao");
    if(tipo === "inteligencia") add("inteligencia");
    if(tipo === "sabedoria") add("sabedoria");
    if(tipo === "carisma") add("carisma");

    // Especiais
    const RESP = ["resp","f_r","r_c","r_a","f_r_c","f_r_a","r_c_a"];
    const COMB = ["comb","f_c","r_c","c_a","f_r_c","f_c_a","r_c_a"];
    const FLUXO = ["fluxo","f_r","f_c","f_a","f_r_c","f_r_a","f_c_a"];
    const ARMA = ["arma","f_a","r_a","c_a","f_r_a","f_c_a","r_c_a"];

    if(RESP.includes(tipo)){ add("destreza"); add("constituicao"); }
    if(COMB.includes(tipo)){ add("forca"); add("destreza"); }
    if(FLUXO.includes(tipo)){ add("forca"); add(useReisaa ? "inteligencia" : "sabedoria"); }
    if(ARMA.includes(tipo)){ add("forca"); add("sabedoria"); }

    if(tipo === "tudo"){
        add("forca"); add("destreza"); add("constituicao");
        add(useReisaa ? "inteligencia" : "sabedoria");
    }

    let total = 0;
    atributos.forEach(attrName => {
        let v = p[attrName] || 0;
        if(usarPericia && ["forca","destreza","constituicao","inteligencia","sabedoria","carisma"].includes(tipo)){
            v += (p.pericias?.[attrName] || 0);
        }
        total += v;
    });

    return total;
}

function rolarDado(){
    let id = document.getElementById("personagemSelectMesa").value;
    let p = mapaPersonagens[id];
    if(!p) return alert("Selecione um personagem primeiro!");

    let n = parseInt(document.getElementById("saaGasto").value);
    if(isNaN(n) || n < 0) n = 0;

    let quantidadeDados = n + 1;
    let usarPericia = document.getElementById("usarPericia").checked;
    let useReisaa = document.getElementById("usarReisaa").checked;
    let tipo = document.getElementById("tipoTeste").value;

    let energia = useReisaa ? "reisaa" : "saa";

    if(n > 0 && n > p[energia]){
        return alert(`Recurso insuficiente! O personagem tem ${p[energia]} de ${energia.toUpperCase()}`);
    }

    // Animação
    let d = document.getElementById("dadoAnim");
    d.classList.add("rolling");

    let base = baseCalculo(p, tipo, useReisaa, usarPericia);

    setTimeout(async () => {
        d.classList.remove("rolling");

        let r = rollDetalhado(quantidadeDados);
        let totalFinal = r.total + base;

        // Deduz custo do BD
        if(n > 0){
            await db.collection("personagens").doc(id).update({
                [energia]: p[energia] - n
            });
        }

        // Printa resultado
        let box = document.getElementById("resultadoRolagem");
        box.innerHTML = `
            <strong style="font-size:24px; color: var(--accent);">Resultado Final: ${totalFinal}</strong><br>
            <span style="color:var(--text-muted); font-size: 14px;">
                Base (${tipo}): ${base} <br>
                Dados (${quantidadeDados}d20): [${r.resultados.join(", ")}] = ${r.total} <br>
                ${n > 0 ? `Custo debitado: -${n} ${energia.toUpperCase()}` : `(Nenhum custo debitado)`}
            </span>
        `;
    }, 800);
}