 const FIREBASE_BASE_URL = "https://certificado-7974e-default-rtdb.firebaseio.com";

    const DATE_RULES = {
      data_relatorio_1: { label: "Relatório 1", months: 3 },
      data_relatorio_2: { label: "Relatório 2", months: 6 },
      data_relatorio_3: { label: "Relatório 3", months: 1 },
      data_certificado: { label: "Certificado", months: 12 },
    };

    const state = {
      records: [],
      filteredRecords: [],
      editingId: null,
    };

    document.addEventListener("DOMContentLoaded", () => {
      setupEvents();
      loadRecords();
    });

    function setupEvents() {
      document.getElementById("btnReload").addEventListener("click", loadRecords);
      document.getElementById("searchInput").addEventListener("input", applyFilters);
      document.getElementById("anjoFilter").addEventListener("change", applyFilters);
      document.getElementById("alertFilter").addEventListener("change", applyFilters);
      document.getElementById("fieldFilter").addEventListener("change", applyFilters);
      document.getElementById("associateForm").addEventListener("submit", handleFormSubmit);

      document.querySelectorAll("[data-close]").forEach((el) => {
        el.addEventListener("click", () => closeModal(el.dataset.close));
      });
    }

    async function loadRecords() {
      setTableLoading("Carregando registros...");

      try {
        const response = await fetch(`${FIREBASE_BASE_URL}/associados.json`);
        if (!response.ok) throw new Error("Erro ao buscar registros");

        const data = await response.json();
        const normalized = normalizeFirebaseData(data);

        state.records = normalized;
        state.filteredRecords = [...normalized];

        populateFilters();
        renderAll();
      } catch (error) {
        console.error(error);
        setTableLoading("Erro ao carregar os registros.");
        showToast("Erro ao carregar registros.", "error");
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

          const normalized = {
            ...record,
            id: String(record.id),
            NOME_FANTASIA: record?.["NOME_FANTASIA"] || record?.["NOME FANTASIA"] || "",
            RAZÃO_SOCIAL: record?.["RAZÃO_SOCIAL"] || record?.["RAZÃO SOCIAL"] || "",
            MUNICÍPIO: record?.["MUNICÍPIO"] || "",
            UF: record?.["UF"] || "",
            ANJO: record?.["ANJO"] || "",
            CNPJ: record?.["CNPJ"] || "",
            MATRIZ_FILIAL: matrizFilial,
            data_relatorio_1: record?.["data_relatorio_1"] || "",
            data_relatorio_2: record?.["data_relatorio_2"] || "",
            data_relatorio_3: record?.["data_relatorio_3"] || "",
            data_certificado: record?.["data_certificado"] || "",
          };

          normalized._status = buildRecordStatus(normalized);
          return normalized;
        })
        .sort((a, b) => Number(a.id) - Number(b.id));
    }

    function buildRecordStatus(record) {
      const fields = {};
      let hasAnyAlert = false;
      let hasAnyEmpty = false;

      Object.entries(DATE_RULES).forEach(([key, rule]) => {
        const result = evaluateDateRule(record[key], rule.months);
        fields[key] = result;

        if (result.status === "alert") hasAnyAlert = true;
        if (result.status === "empty") hasAnyEmpty = true;
      });

      return {
        fields,
        hasAnyAlert,
        hasAnyEmpty,
        isOk: !hasAnyAlert && !hasAnyEmpty,
      };
    }

    function evaluateDateRule(value, monthsLimit) {
      if (!value || !String(value).trim()) {
        return {
          status: "empty",
          label: "Sem data",
          ageInMonths: null,
          parsedDate: null,
        };
      }

      const parsed = parseBrazilianDate(value);
      if (!parsed) {
        return {
          status: "empty",
          label: "Data inválida",
          ageInMonths: null,
          parsedDate: null,
        };
      }

      const now = new Date();
      const threshold = addMonths(parsed, monthsLimit);
      const isAlert = threshold < startOfDay(now);
      const ageInMonths = diffInMonths(parsed, now);

      return {
        status: isAlert ? "alert" : "ok",
        label: isAlert ? "Vencido" : "Em dia",
        ageInMonths,
        parsedDate: parsed,
      };
    }

    function populateFilters() {
      const anjos = [...new Set(state.records.map(record => record.ANJO).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
      const select = document.getElementById("anjoFilter");
      select.innerHTML = `<option value="">Todos</option>${anjos.map(anjo => `<option value="${escapeHtml(anjo)}">${escapeHtml(anjo)}</option>`).join("")}`;
    }

    function applyFilters() {
      const term = document.getElementById("searchInput").value.trim().toLowerCase();
      const anjo = document.getElementById("anjoFilter").value;
      const alertFilter = document.getElementById("alertFilter").value;
      const fieldFilter = document.getElementById("fieldFilter").value;

      state.filteredRecords = state.records.filter((record) => {
        const searchBase = [
          record.id,
          record.NOME_FANTASIA,
          record.RAZÃO_SOCIAL,
          record.MUNICÍPIO,
          record.UF,
          record.ANJO,
          record.CNPJ,
        ].filter(Boolean).join(" ").toLowerCase();

        const matchesSearch = !term || searchBase.includes(term);
        const matchesAnjo = !anjo || record.ANJO === anjo;

        let matchesAlert = true;
        if (alertFilter === "alert") matchesAlert = record._status.hasAnyAlert;
        if (alertFilter === "ok") matchesAlert = record._status.isOk;
        if (alertFilter === "empty") matchesAlert = record._status.hasAnyEmpty;

        let matchesField = true;
        if (fieldFilter) {
          const fieldStatus = record._status.fields[fieldFilter];
          if (alertFilter === "alert") matchesField = fieldStatus?.status === "alert";
          else if (alertFilter === "ok") matchesField = fieldStatus?.status === "ok";
          else if (alertFilter === "empty") matchesField = fieldStatus?.status === "empty";
          else matchesField = Boolean(fieldStatus);
        }

        return matchesSearch && matchesAnjo && matchesAlert && matchesField;
      });

      renderAll();
    }

    function clearFilters() {
      document.getElementById("searchInput").value = "";
      document.getElementById("anjoFilter").value = "";
      document.getElementById("alertFilter").value = "";
      document.getElementById("fieldFilter").value = "";
      state.filteredRecords = [...state.records];
      renderAll();
    }

    function renderAll() {
      renderStats();
      renderFieldAlertList();
      renderAnjoList();
      renderTable();
    }

    function renderStats() {
      const total = state.filteredRecords.length;
      const alertTotal = state.filteredRecords.filter(record => record._status.hasAnyAlert).length;
      const emptyTotal = state.filteredRecords.filter(record => record._status.hasAnyEmpty).length;
      const okTotal = state.filteredRecords.filter(record => record._status.isOk).length;
      const r1Alert = countFieldStatus("data_relatorio_1", "alert");
      const r2Alert = countFieldStatus("data_relatorio_2", "alert");
      const r3Alert = countFieldStatus("data_relatorio_3", "alert");
      const certAlert = countFieldStatus("data_certificado", "alert");

      setText("statTotal", total);
      setText("statAlertTotal", alertTotal);
      setText("statR1Alert", r1Alert);
      setText("statR2Alert", r2Alert);
      setText("statR3Alert", r3Alert);
      setText("statCertAlert", certAlert);
      setText("statEmpty", emptyTotal);
      setText("statOk", okTotal);
    }

    function renderFieldAlertList() {
      const container = document.getElementById("fieldAlertList");
      const items = Object.entries(DATE_RULES).map(([key, rule]) => {
        const alertCount = countFieldStatus(key, "alert");
        const emptyCount = countFieldStatus(key, "empty");
        const okCount = countFieldStatus(key, "ok");

        return `
          <div class="ranking-item">
            <div>
              <div class="label">${escapeHtml(rule.label)}</div>
              <div class="sub">${okCount} em dia • ${emptyCount} sem data</div>
            </div>
            <span class="pill ${alertCount > 0 ? "danger" : "success"}">${alertCount} alertas</span>
          </div>
        `;
      }).join("");

      container.innerHTML = items || `<div class="empty-state">Nenhum dado disponível.</div>`;
    }

    function renderAnjoList() {
      const container = document.getElementById("anjoList");
      const grouped = new Map();

      state.filteredRecords.forEach((record) => {
        const key = record.ANJO || "Não informado";
        if (!grouped.has(key)) grouped.set(key, { total: 0, alerts: 0 });
        const item = grouped.get(key);
        item.total += 1;
        if (record._status.hasAnyAlert) item.alerts += 1;
      });

      const rows = [...grouped.entries()]
        .sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0], "pt-BR"))
        .slice(0, 8)
        .map(([name, meta]) => `
          <div class="ranking-item">
            <div>
              <div class="label">${escapeHtml(name)}</div>
              <div class="sub">${meta.total} associados monitorados</div>
            </div>
            <span class="pill ${meta.alerts > 0 ? "warning" : "success"}">${meta.alerts} alertas</span>
          </div>
        `).join("");

      container.innerHTML = rows || `<div class="empty-state">Nenhum dado disponível.</div>`;
    }

    function renderTable() {
      const tbody = document.getElementById("tableBody");

      if (!state.filteredRecords.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="10" class="empty-state">Nenhum associado encontrado.</td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = state.filteredRecords.map((record) => {
        const r1 = record._status.fields.data_relatorio_1;
        const r2 = record._status.fields.data_relatorio_2;
        const r3 = record._status.fields.data_relatorio_3;
        const cert = record._status.fields.data_certificado;

        return `
          <tr>
            <td>${escapeHtml(record.id)}</td>
            <td>${escapeHtml(formatValue(record.NOME_FANTASIA))}</td>
            <td>${escapeHtml(formatValue(record.ANJO))}</td>
            <td>${renderDateCell(record.data_relatorio_1, r1)}</td>
            <td>${renderDateCell(record.data_relatorio_2, r2)}</td>
            <td>${renderDateCell(record.data_relatorio_3, r3)}</td>
            <td>${renderDateCell(record.data_certificado, cert)}</td>
            <td>
              <div class="actions">
                <button class="action-btn" data-action="edit" data-id="${record.id}">
                  <i class="fas fa-pen"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");

      bindTableActions();
    }

    function bindTableActions() {
      document.querySelectorAll("[data-action='edit']").forEach((btn) => {
        btn.addEventListener("click", () => openEditModal(btn.dataset.id));
      });
    }

    function renderDateCell(value, status) {
      const formatted = formatValue(value);
      const cls = status.status === "alert" ? "status-alert" : status.status === "ok" ? "status-ok" : "status-empty";
      return `
        <div>${escapeHtml(formatted)}</div>
        <div style="margin-top:6px;">
          <span class="status-tag ${cls}">${escapeHtml(status.label)}</span>
        </div>
      `;
    }

    function renderGeneralStatus(status) {
      if (status.hasAnyAlert) {
        return `<span class="status-tag status-alert"><i class="fas fa-triangle-exclamation"></i> Com alerta</span>`;
      }
      if (status.hasAnyEmpty) {
        return `<span class="status-tag status-empty"><i class="fas fa-clock"></i> Pendente</span>`;
      }
      return `<span class="status-tag status-ok"><i class="fas fa-circle-check"></i> Em dia</span>`;
    }

    function openEditModal(id) {
      const record = state.records.find((item) => item.id === id);
      if (!record) return;

      state.editingId = id;
      document.getElementById("formTitle").textContent = `Atualizar datas do associado #${id}`;
      document.getElementById("formSubtitle").textContent = `${record.NOME_FANTASIA || record.RAZÃO_SOCIAL || "Associado"} • ${record.MUNICÍPIO || "-"}/${record.UF || "-"}`;

      document.getElementById("data_relatorio_1").value = toInputDate(record.data_relatorio_1);
      document.getElementById("data_relatorio_2").value = toInputDate(record.data_relatorio_2);
      document.getElementById("data_relatorio_3").value = toInputDate(record.data_relatorio_3);
      document.getElementById("data_certificado").value = toInputDate(record.data_certificado);

      openModal("formModal");
    }

    async function handleFormSubmit(event) {
      event.preventDefault();
      if (!state.editingId) return;

      const record = state.records.find((item) => item.id === state.editingId);
      if (!record) return;

      const payload = {
        ...record,
        data_relatorio_1: fromInputDate(document.getElementById("data_relatorio_1").value),
        data_relatorio_2: fromInputDate(document.getElementById("data_relatorio_2").value),
        data_relatorio_3: fromInputDate(document.getElementById("data_relatorio_3").value),
        data_certificado: fromInputDate(document.getElementById("data_certificado").value),
      };

      delete payload.id;
      delete payload._status;

      try {
        await updateRecord(state.editingId, payload);
        closeModal("formModal");
        showToast("Datas atualizadas com sucesso.", "success");
        await loadRecords();
      } catch (error) {
        console.error(error);
        showToast("Erro ao atualizar os dados.", "error");
      }
    }

    async function updateRecord(id, payload) {
      const response = await fetch(`${FIREBASE_BASE_URL}/associados/${id}.json`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao atualizar registro");
    }

    function countFieldStatus(fieldKey, status) {
      return state.filteredRecords.filter(record => record._status.fields[fieldKey]?.status === status).length;
    }

    function parseBrazilianDate(value) {
      const match = String(value || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) return null;

      const [, dd, mm, yyyy] = match;
      const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      if (Number.isNaN(date.getTime())) return null;
      return startOfDay(date);
    }

    function toInputDate(value) {
      const parsed = parseBrazilianDate(value);
      if (!parsed) return "";
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, "0");
      const dd = String(parsed.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    function fromInputDate(value) {
      if (!value) return "";
      const [yyyy, mm, dd] = value.split("-");
      if (!yyyy || !mm || !dd) return "";
      return `${dd}/${mm}/${yyyy}`;
    }

    function startOfDay(date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    function addMonths(date, months) {
      const d = new Date(date);
      d.setMonth(d.getMonth() + months);
      return startOfDay(d);
    }

    function diffInMonths(start, end) {
      const years = end.getFullYear() - start.getFullYear();
      const months = end.getMonth() - start.getMonth();
      return years * 12 + months;
    }

    function openModal(id) {
      document.getElementById(id).classList.remove("hidden");
    }

    function closeModal(id) {
      document.getElementById(id).classList.add("hidden");
      if (id === "formModal") {
        state.editingId = null;
      }
    }

    function showToast(message, type = "success") {
      const toast = document.getElementById("toast");
      toast.textContent = message;
      toast.className = `toast ${type}`;

      setTimeout(() => {
        toast.classList.add("hidden");
      }, 3000);
    }

    function setTableLoading(message) {
      document.getElementById("tableBody").innerHTML = `
        <tr>
          <td colspan="10" class="empty-state">${escapeHtml(message)}</td>
        </tr>
      `;
    }

    function setText(id, value) {
      document.getElementById(id).textContent = value;
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
