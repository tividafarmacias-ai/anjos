
    const FIREBASE_BASE_URL = "https://certificado-7974e-default-rtdb.firebaseio.com";

    const state = {
      records: [],
      filteredRecords: [],
    };

    document.addEventListener("DOMContentLoaded", () => {
      setupEvents();
      loadRecords();
    });

    function setupEvents() {
      document.getElementById("searchInput").addEventListener("input", applyFilters);
      document.getElementById("anjoFilter").addEventListener("change", applyFilters);
      document.getElementById("ufFilter").addEventListener("change", applyFilters);
      document.getElementById("classFilter").addEventListener("change", applyFilters);
      document.getElementById("btnExportSummary").addEventListener("click", exportSummaryJson);
    }

    async function loadRecords() {
      setTableLoading("Carregando dados...");

      try {
        const response = await fetch(`${FIREBASE_BASE_URL}/associados.json`);
        if (!response.ok) throw new Error("Erro ao buscar registros");

        const data = await response.json();
        const normalized = normalizeFirebaseData(data);

        state.records = normalized;
        state.filteredRecords = [...normalized];

        populateFilters(normalized);
        renderAll();
      } catch (error) {
        console.error(error);
        setTableLoading("Erro ao carregar os dados do dashboard.");
      }
    }

    function normalizeFirebaseData(data) {
      if (!data) return [];

      const list = Array.isArray(data)
        ? data.map((record, index) => record ? { id: String(index), ...record } : null).filter(Boolean)
        : Object.entries(data).map(([id, record]) => ({ id, ...record }));

      return list
        .map((record) => {
          const matrizFilial = record?.["MATRIZ_FILIAL"]
            || record?.["MATRIZ "]?.[" FILIAL"]
            || record?.["MATRIZ"]?.["FILIAL"]
            || "";

          const farmaciaPopular = record?.["Farmácia Popular"] ?? record?.["Farmácia_Popular"] ?? "";
          const gcpTrier = record?.["GCP_TRIER"] ?? record?.["GCP TRIER"] ?? "";
          const whatsapp = record?.["Whatsapp"] ?? "";
          const instagram = normalizeInstagramUsername(record?.["instagram"] ?? "");
          const nomeFantasia = record?.["NOME_FANTASIA"] ?? record?.["NOME FANTASIA"] ?? "";
          const razaoSocial = record?.["RAZÃO_SOCIAL"] ?? record?.["RAZÃO SOCIAL"] ?? "";
          const municipio = record?.["MUNICÍPIO"] ?? "";
          const uf = record?.["UF"] ?? "";
          const termoImagem = record?.["TERMO_IMAGEM_ASSINADO?"] ?? "";
          const possuiPec = record?.["POSSUI_PEC"] ?? "";
          const classificacao = record?.["CLAS"] ?? "";

          return {
            ...record,
            id: String(record.id),
            MATRIZ_FILIAL: matrizFilial,
            FARMACIA_POPULAR: farmaciaPopular,
            GCP_TRIER_NORMALIZADO: gcpTrier,
            Whatsapp: whatsapp,
            instagram: instagram,
            NOME_FANTASIA: nomeFantasia,
            RAZÃO_SOCIAL: razaoSocial,
            MUNICÍPIO: municipio,
            UF: uf,
            TERMO_IMAGEM_ASSINADO: termoImagem,
            POSSUI_PEC_NORMALIZADO: possuiPec,
            CLAS_NORMALIZADO: classificacao,
          };
        })
        .sort((a, b) => Number(a.id) - Number(b.id));
    }

    function populateFilters(records) {
      fillSelect("anjoFilter", getUniqueValues(records, "ANJO"));
      fillSelect("ufFilter", getUniqueValues(records, "UF"));
      fillSelect("classFilter", getUniqueValues(records, "CLAS_NORMALIZADO"));
    }

    function fillSelect(selectId, values) {
      const select = document.getElementById(selectId);
      const firstOption = select.querySelector("option").outerHTML;
      select.innerHTML = firstOption + values.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
    }

    function getUniqueValues(records, key) {
      return [...new Set(records.map(record => formatValue(record[key])).filter(value => value !== "-"))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    }

    function applyFilters() {
      const term = document.getElementById("searchInput").value.trim().toLowerCase();
      const anjo = document.getElementById("anjoFilter").value;
      const uf = document.getElementById("ufFilter").value;
      const clas = document.getElementById("classFilter").value;

      state.filteredRecords = state.records.filter((record) => {
        const matchesSearch = !term || [
          record.id,
          record["NOME_FANTASIA"],
          record["RAZÃO_SOCIAL"],
          record["MUNICÍPIO"],
          record["UF"],
          record["ANJO"],
          record["PROPRIETÁRIO"],
          record["CNPJ"],
          record["EMAIL"],
          record["Whatsapp"],
          record["instagram"],
        ].filter(Boolean).join(" ").toLowerCase().includes(term);

        const matchesAnjo = !anjo || (record["ANJO"] || "") === anjo;
        const matchesUf = !uf || (record["UF"] || "") === uf;
        const matchesClas = !clas || (record["CLAS_NORMALIZADO"] || "") === clas;

        return matchesSearch && matchesAnjo && matchesUf && matchesClas;
      });

      renderAll();
    }

    function clearFilters() {
      document.getElementById("searchInput").value = "";
      document.getElementById("anjoFilter").value = "";
      document.getElementById("ufFilter").value = "";
      document.getElementById("classFilter").value = "";
      state.filteredRecords = [...state.records];
      renderAll();
    }

    function renderAll() {
      renderStats();
      renderRankings();
      renderInsights();
      renderTable();
    }

    function renderStats() {
      const total = state.filteredRecords.length;
      const whatsapp = state.filteredRecords.filter(record => normalizeWhatsappNumber(record["Whatsapp"])).length;
      const instagram = state.filteredRecords.filter(record => normalizeInstagramUsername(record["instagram"])).length;
      const pec = state.filteredRecords.filter(record => hasMeaningfulValue(record["POSSUI_PEC_NORMALIZADO"])).length;
      const termo = state.filteredRecords.filter(record => isPositive(record["TERMO_IMAGEM_ASSINADO"])).length;
      const filiais = state.filteredRecords.filter(record => isFilial(record["MATRIZ_FILIAL"])).length;

      setStat("statTotal", total);
      setStat("statWhatsapp", whatsapp);
      setStat("statInstagram", instagram);
      setStat("statPec", pec);
      setStat("statTermo", termo);
      setStat("statFiliais", filiais);

      setStat("statWhatsappPct", percentOf(whatsapp, total));
      setStat("statInstagramPct", percentOf(instagram, total));
      setStat("statPecPct", percentOf(pec, total));
      setStat("statTermoPct", percentOf(termo, total));
      setStat("statFiliaisPct", percentOf(filiais, total));
    }

    function renderRankings() {
      renderRankingList("anjoRanking", groupCount(state.filteredRecords, "ANJO"), "associados", "primary");
      renderRankingList("ufRanking", groupCount(state.filteredRecords, "UF"), "associados", "success");
    }

    function renderRankingList(containerId, entries, label, pillClass) {
      const container = document.getElementById(containerId);
      const topEntries = entries.slice(0, 8);

      if (!topEntries.length) {
        container.innerHTML = `<div class="empty-state">Nenhum dado para exibir.</div>`;
        return;
      }

      container.innerHTML = topEntries.map(([name, total]) => `
        <div class="ranking-item">
          <div>
            <strong>${escapeHtml(name)}</strong>
            <span>${escapeHtml(label)}</span>
          </div>
          <span class="pill ${pillClass}">${total}</span>
        </div>
      `).join("");
    }

    function renderInsights() {
      const total = state.filteredRecords.length;
      const semWhatsapp = state.filteredRecords.filter(record => !normalizeWhatsappNumber(record["Whatsapp"])).length;
      const semInstagram = state.filteredRecords.filter(record => !normalizeInstagramUsername(record["instagram"])).length;
      const comGc = state.filteredRecords.filter(record => isPositive(record["GC"])).length;
      const comTrade = state.filteredRecords.filter(record => hasMeaningfulValue(record["TRADE"])).length;
      const comDelivery = state.filteredRecords.filter(record => hasMeaningfulValue(record["E-DELIVERY"])).length;
      const comScanntech = state.filteredRecords.filter(record => hasMeaningfulValue(record["SCANTECH"])).length;

      const items = [
        { title: "Sem WhatsApp cadastrado", text: `${semWhatsapp} registros sem canal direto`, pill: percentOf(semWhatsapp, total), type: "danger" },
        { title: "Sem Instagram cadastrado", text: `${semInstagram} registros sem presença social mapeada`, pill: percentOf(semInstagram, total), type: "warning" },
        { title: "GC sinalizado", text: `${comGc} associados com GC positivo`, pill: percentOf(comGc, total), type: "success" },
        { title: "Trade preenchido", text: `${comTrade} associados com informação de trade`, pill: percentOf(comTrade, total), type: "primary" },
        { title: "E-delivery preenchido", text: `${comDelivery} associados com dado de e-delivery`, pill: percentOf(comDelivery, total), type: "primary" },
        { title: "Scanntech preenchido", text: `${comScanntech} associados com dado de Scanntech`, pill: percentOf(comScanntech, total), type: "primary" },
      ];

      const container = document.getElementById("insightsList");
      container.innerHTML = items.map(item => `
        <div class="insight-item">
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.text)}</span>
          </div>
          <span class="pill ${item.type}">${escapeHtml(item.pill)}</span>
        </div>
      `).join("");
    }

    function renderTable() {
      const tbody = document.getElementById("tableBody");

      if (!state.filteredRecords.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="10" class="empty-state">Nenhum associado encontrado para os filtros aplicados.</td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = state.filteredRecords.map(record => {
        const whatsapp = normalizeWhatsappNumber(record["Whatsapp"]);
        const instagram = normalizeInstagramUsername(record["instagram"]);

        return `
          <tr>
            <td>${escapeHtml(record.id)}</td>
            <td>${escapeHtml(formatValue(record["NOME_FANTASIA"]))}</td>
            <td>${escapeHtml(formatValue(record["RAZÃO_SOCIAL"]))}</td>
            <td>${escapeHtml(formatValue(record["ANJO"]))}</td>
            <td>${escapeHtml(formatValue(record["MUNICÍPIO"]))} / ${escapeHtml(formatValue(record["UF"]))}</td>
            <td>${escapeHtml(formatValue(record["CLAS_NORMALIZADO"]))}</td>
            <td>${escapeHtml(formatValue(record["POSSUI_PEC_NORMALIZADO"]))}</td>
            <td>
              ${whatsapp
                ? `<a class="link-btn" href="https://wa.me/${whatsapp}" target="_blank" rel="noopener noreferrer">Abrir</a>`
                : "-"}
            </td>
            <td>
              ${instagram
                ? `<a class="link-btn" href="https://www.instagram.com/${instagram}" target="_blank" rel="noopener noreferrer">@${escapeHtml(instagram)}</a>`
                : "-"}
            </td>
            <td>${escapeHtml(isFilial(record["MATRIZ_FILIAL"]) ? "Sim" : "Não")}</td>
          </tr>
        `;
      }).join("");
    }

    function exportFilteredJson() {
      const payload = {
        exportedAt: new Date().toISOString(),
        total: state.filteredRecords.length,
        filters: getCurrentFilters(),
        records: state.filteredRecords,
      };

      downloadJson(payload, `associados-filtrados-${getDateStamp()}.json`);
    }

    function exportSummaryJson() {
      const payload = buildSummaryPayload();
      downloadJson(payload, `dashboard-resumo-associados-${getDateStamp()}.json`);
    }

    function buildSummaryPayload() {
      const total = state.filteredRecords.length;
      const byAnjo = Object.fromEntries(groupCount(state.filteredRecords, "ANJO"));
      const byUf = Object.fromEntries(groupCount(state.filteredRecords, "UF"));
      const byClass = Object.fromEntries(groupCount(state.filteredRecords, "CLAS_NORMALIZADO"));

      return {
        exportedAt: new Date().toISOString(),
        scope: "filtered_view",
        filters: getCurrentFilters(),
        totals: {
          totalAssociados: total,
          comWhatsapp: state.filteredRecords.filter(record => normalizeWhatsappNumber(record["Whatsapp"])).length,
          comInstagram: state.filteredRecords.filter(record => normalizeInstagramUsername(record["instagram"])).length,
          comPecInformado: state.filteredRecords.filter(record => hasMeaningfulValue(record["POSSUI_PEC_NORMALIZADO"])).length,
          comTermoImagem: state.filteredRecords.filter(record => isPositive(record["TERMO_IMAGEM_ASSINADO"])).length,
          filiais: state.filteredRecords.filter(record => isFilial(record["MATRIZ_FILIAL"])).length,
        },
        distribution: {
          anjos: byAnjo,
          uf: byUf,
          classificacao: byClass,
        },
        diagnostics: {
          semWhatsapp: state.filteredRecords.filter(record => !normalizeWhatsappNumber(record["Whatsapp"])).map(minimalRecord),
          semInstagram: state.filteredRecords.filter(record => !normalizeInstagramUsername(record["instagram"])).map(minimalRecord),
          semPec: state.filteredRecords.filter(record => !hasMeaningfulValue(record["POSSUI_PEC_NORMALIZADO"])).map(minimalRecord),
        }
      };
    }

    function minimalRecord(record) {
      return {
        id: record.id,
        nomeFantasia: record["NOME_FANTASIA"] || "",
        razaoSocial: record["RAZÃO_SOCIAL"] || "",
        anjo: record["ANJO"] || "",
        municipio: record["MUNICÍPIO"] || "",
        uf: record["UF"] || "",
        whatsapp: record["Whatsapp"] || "",
        instagram: record["instagram"] || "",
      };
    }

    function getCurrentFilters() {
      return {
        search: document.getElementById("searchInput").value.trim(),
        anjo: document.getElementById("anjoFilter").value,
        uf: document.getElementById("ufFilter").value,
        classificacao: document.getElementById("classFilter").value,
      };
    }

    function groupCount(records, key) {
      const map = new Map();

      records.forEach((record) => {
        const value = formatValue(record[key]);
        const safeValue = value === "-" ? "Não informado" : value;
        map.set(safeValue, (map.get(safeValue) || 0) + 1);
      });

      return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
    }

    function normalizeWhatsappNumber(value) {
      if (!value) return "";
      let number = String(value).replace(/\D/g, "").replace(/^0+/, "");
      if (number && !number.startsWith("55")) number = `55${number}`;
      return number;
    }

    function normalizeInstagramUsername(value) {
      if (!value) return "";
      return String(value)
        .trim()
        .replace(/^@+/, "")
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
        .replace(/^instagram\.com\//i, "")
        .replace(/\/.*$/, "")
        .trim();
    }

    function isPositive(value) {
      const normalized = String(value || "").trim().toUpperCase();
      return ["SIM", "S", "OK", "TRUE", "VERDADEIRO", "NOVA"].includes(normalized);
    }

    function isFilial(value) {
      const normalized = String(value || "").trim().toUpperCase();
      return normalized === "FILIAL";
    }

    function hasMeaningfulValue(value) {
      return value !== null && value !== undefined && String(value).trim() !== "";
    }

    function percentOf(part, total) {
      if (!total) return "0%";
      return `${((part / total) * 100).toFixed(1).replace(".", ",")}%`;
    }

    function setStat(id, value) {
      document.getElementById(id).textContent = value;
    }

    function setTableLoading(message) {
      document.getElementById("tableBody").innerHTML = `
        <tr>
          <td colspan="10" class="empty-state">${escapeHtml(message)}</td>
        </tr>
      `;
    }

    function downloadJson(data, fileName) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    function getDateStamp() {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const mi = String(now.getMinutes()).padStart(2, "0");
      return `${yyyy}${mm}${dd}-${hh}${mi}`;
    }

    function formatValue(value) {
      if (value === null || value === undefined || value === "") return "-";
      return String(value);
    }

    function escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

  