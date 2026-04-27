const FIREBASE_URL = "https://certificado-7974e-default-rtdb.firebaseio.com";

document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardData();
    
    document.getElementById('refreshBtn').addEventListener('click', () => {
        const btn = document.getElementById('refreshBtn');
        btn.style.transform = "rotate(360deg)";
        btn.style.transition = "transform 0.5s";
        fetchDashboardData();
        setTimeout(() => btn.style.transform = "rotate(0deg)", 500);
    });
});

async function fetchDashboardData() {
    try {
        // Busca Associados e Histórico em paralelo
        const [resAssociados, resHistorico] = await Promise.all([
            fetch(`${FIREBASE_URL}/associados.json`),
            fetch(`${FIREBASE_URL}/historico.json`)
        ]);

        const associados = await resAssociados.json();
        const historico = await resHistorico.json();

        renderKPIs(associados);
        renderActivity(historico);
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
    }
}

function renderKPIs(data) {
    if (!data) return;
    
    const records = Object.values(data).filter(r => r !== null);
    
    // Cálculos
    const total = records.length;
    const matrizes = records.filter(r => {
        const mf = r["MATRIZ "]?.[" FILIAL"] || r.MATRIZ_FILIAL || "";
        return mf.toUpperCase().includes("MATRIZ");
    }).length;
    
    const cidades = new Set(records.map(r => r["MUNICÍPIO"]).filter(Boolean)).size;
    
    const pec = records.filter(r => 
        r.POSSUI_PEC === "SIM" || r.POSSUI_PEC === "S"
    ).length;

    // Atualiza DOM com animação simples
    animateValue("kpiTotal", total);
    animateValue("kpiMatriz", matrizes);
    animateValue("kpiCidades", cidades);
    animateValue("kpiPec", pec);
}

function renderActivity(data) {
    const list = document.getElementById("activityList");
    if (!data) {
        list.innerHTML = "<p class='loading-text'>Sem atividades recentes.</p>";
        return;
    }

    // Converte objeto em array, ordena por data decrescente e pega os últimos 5
    const activities = Object.values(data)
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 5);

    list.innerHTML = activities.map(act => `
        <div class="activity-item">
            <div class="activity-icon type-${act.tipo}"></div>
            <div class="activity-info">
                <h4>${act.dados.nome_fantasia || 'Registro'}</h4>
                <p>${formatActionMessage(act)}</p>
                <small>${new Date(act.data).toLocaleString('pt-BR')}</small>
            </div>
        </div>
    `).join("");
}

function formatActionMessage(act) {
    switch(act.tipo) {
        case 'CREATE': return "Novo associado cadastrado no sistema.";
        case 'UPDATE': return `Atualizado por ${act.usuario.nome.split(' ')[0]}.`;
        case 'DELETE': return "Um registro foi removido do banco de dados.";
        default: return "Alteração realizada.";
    }
}

function animateValue(id, endValue) {
    const obj = document.getElementById(id);
    let startValue = 0;
    const duration = 1000;
    const step = (timestamp) => {
        if (!startValue) startValue = timestamp;
        const progress = Math.min((timestamp - startValue) / duration, 1);
        obj.innerHTML = Math.floor(progress * endValue);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}