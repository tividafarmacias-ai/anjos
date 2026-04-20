const FIREBASE_BASE_URL = "https://certificado-7974e-default-rtdb.firebaseio.com";

const state = {
  records: [],
  filteredRecords: [],
  editingId: null,
  deletingId: null,
};

const TABLE_COLUMNS = [
  { key: "id", label: "ID" },
  { key: "NOME_FANTASIA", label: "Nome Fantasia" },
  { key: "RAZÃO_SOCIAL", label: "Razão Social" },
  {
    key: "cidadeUf",
    label: "Município / UF",
    formatter: (record) => `${record["MUNICÍPIO"] || "-"} / ${record["UF"] || "-"}`,
  },
  { key: "ANJO", label: "Anjo" },
  { key: "PROPRIETÁRIO", label: "Proprietário" },
];

const FORM_SECTIONS = [
  {
    title: "Dados principais",
    fields: [
      { key: "CAT_REDE", label: "CAT REDE", type: "number", col: 2 },
      { key: "ANJO", label: "Anjo", type: "text", col: 3 },
      { key: "CÓDIGO_MEDICON", label: "Código Medicon", type: "number", col: 3 },
      { key: "CLAS", label: "Classificação", type: "text", col: 2 },
      { key: "DATA_DE_ADESÃO", label: "Data de Adesão", type: "text", col: 2 },

      { key: "RAZÃO_SOCIAL", label: "Razão Social", type: "text", col: 6 },
      { key: "NOME_FANTASIA", label: "Nome Fantasia", type: "text", col: 6 },

      { key: "PROPRIETÁRIO", label: "Proprietário", type: "text", col: 6 },
      { key: "GESTOR_DA_LOJA", label: "Gestor da Loja", type: "text", col: 6 },
      { key: "Whatsapp", label: "Whatsapp", type: "text", col: 4 },
      { key: "instagram", label: "Instagram", type: "text", col: 2 },


      { key: "CNPJ", label: "CNPJ", type: "text", col: 4 },
      { key: "IESTADUAL", label: "Inscrição Estadual", type: "text", col: 4 },
      { key: "EMAIL", label: "E-mail(s)", type: "text", col: 4 },

      { key: "DDD", label: "DDD", type: "number", col: 2 },
      { key: "Telefone_1", label: "Telefone", type: "text", col: 4 },
      { key: "CONSULTORIA_EXTERNA", label: "Consultoria Externa", type: "text", col: 3 },
      { key: "MATRIZ_FILIAL", label: "Matriz / Filial", type: "text", col: 3 },
    ],
  },
  {
    title: "Endereço",
    fields: [
      { key: "ENDEREÇO", label: "Endereço", type: "text", col: 5 },
      { key: "Nº", label: "Número", type: "text", col: 2 },
      { key: "COMPLEMENTO", label: "Complemento", type: "text", col: 5 },

      { key: "BAIRRO", label: "Bairro", type: "text", col: 4 },
      { key: "CEP", label: "CEP", type: "text", col: 3 },
      { key: "MUNICÍPIO", label: "Município", type: "text", col: 3 },
      { key: "UF", label: "UF", type: "text", col: 2 },

      { key: "REGIÃO_INTERMEDIÁRIA", label: "Região Intermediária", type: "text", col: 6 },
      { key: "REGIÃO_IMEDIATA", label: "Região Imediata", type: "text", col: 6 },
    ],
  },
  {
    title: "Operacional / Sistemas",
    fields: [
      { key: "POSSUI_PEC", label: "Possui PEC", type: "text", col: 3 },
      { key: "SISTEMA", label: "Sistema", type: "text", col: 3 },
      { key: "GC", label: "GC", type: "text", col: 2 },
      { key: "PBM", label: "PBM", type: "text", col: 2 },
      { key: "MIP", label: "MIP", type: "text", col: 2 },

      { key: "Farmácia Popular", label: "Farmácia Popular", type: "text", col: 3 },
      { key: "SMARTPED", label: "SmartPed", type: "text", col: 3 },
      { key: "SCANTECH", label: "Scanntech", type: "text", col: 2 },
      { key: "E-DELIVERY", label: "E-Delivery", type: "text", col: 2 },
      { key: "TRADE", label: "Trade", type: "text", col: 2 },

      { key: "INTEG_BC_TRIER?", label: "Integração BC Trier", type: "text", col: 4 },
      { key: "GCP_TRIER", label: "GCP Trier", type: "text", col: 4 },
      { key: "VERÃO_PREMIADO", label: "Verão Premiado", type: "text", col: 4 },
    ],
  },
  {
    title: "Informações complementares",
    fields: [
      { key: "Possui_Fachada", label: "Possui Fachada", type: "text", col: 3 },
      { key: "Associado_REFAR", label: "Associado REFAR", type: "text", col: 3 },
      { key: "Associado_COOFARSUL", label: "Associado COOFARSUL", type: "text", col: 3 },
      { key: "TERMO_IMAGEM_ASSINADO?", label: "Termo de Imagem Assinado", type: "text", col: 3 },

      { key: "RAZÃO_MATRIZ", label: "Razão Matriz", type: "text", col: 6 },
      { key: "DOCUMENTAÇÃO", label: "Documentação", type: "text", col: 6 },

      { key: "OBSERVAÇÕES", label: "Observações", type: "textarea", col: 12 },
    ],
  },
];

const detailsFields = [
  "CAT_REDE",
  "ANJO",
  "CÓDIGO_MEDICON",
  "REGIÃO_INTERMEDIÁRIA",
  "REGIÃO_IMEDIATA",
  "RAZÃO_SOCIAL",
  "NOME_FANTASIA",
  "PROPRIETÁRIO",
  "Whatsapp",
  "instagram",
  "CONSULTORIA_EXTERNA",
  "GESTOR_DA_LOJA",
  "CNPJ",
  "IESTADUAL",
  "ENDEREÇO",
  "Nº",
  "COMPLEMENTO",
  "BAIRRO",
  "CEP",
  "MUNICÍPIO",
  "UF",
  "DDD",
  "Telefone_1",
  "EMAIL",
  "POSSUI_PEC",
  "CLAS",
  "Possui_Fachada",
  "Associado_REFAR",
  "Associado_COOFARSUL",
  "DOCUMENTAÇÃO",
  "SISTEMA",
  "TRADE",
  "VERÃO_PREMIADO",
  "SCANTECH",
  "E-DELIVERY",
  "GC",
  "PBM",
  "INTEG_BC_TRIER?",
  "GCP TRIER",
  "MIP",
  "Farmácia_Popular",
  "SMARTPED",
  "TERMO_IMAGEM_ASSINADO?",
  "DATA_DE_ADESÃO",
  "MATRIZ_FILIAL",
  "RAZÃO_MATRIZ",
  "OBSERVAÇÕES",
];

document.addEventListener("DOMContentLoaded", () => {
  buildForm();
  setupEvents();
  loadRecords();
});

function setupEvents() {
  document.getElementById("btnNovo").addEventListener("click", openCreateModal);
  document.getElementById("btnReload").addEventListener("click", loadRecords);
  document.getElementById("searchInput").addEventListener("input", handleSearch);
  document.getElementById("associateForm").addEventListener("submit", handleFormSubmit);
  document.getElementById("btnConfirmDelete").addEventListener("click", confirmDelete);

  document.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", () => closeModal(el.dataset.close));
  });
}

async function loadRecords() {
  setTableLoading("Carregando registros...");

  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/.json`);
    if (!response.ok) throw new Error("Erro ao buscar registros");

    const data = await response.json();
    const normalized = normalizeFirebaseData(data);

    state.records = normalized;
    state.filteredRecords = [...normalized];

    updateStats();
    renderTable();
  } catch (error) {
    console.error(error);
    setTableLoading("Erro ao carregar os registros.");
    showToast("Erro ao carregar registros.", "error");
  }
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

function normalizeFirebaseData(data) {
  if (!data) return [];

  // Se o Firebase retornar um Array (comum quando as chaves são números)
  if (Array.isArray(data)) {
    return data
      .map((record, index) => {
        if (!record) return null; // Ignora o índice 0 se ele for nulo
        return {
          id: String(index),
          ...record,
          MATRIZ_FILIAL: record?.["MATRIZ "]?.[" FILIAL"] || "",
        };
      })
      .filter(record => record !== null) // Remove os nulos da lista
      .sort((a, b) => Number(a.id) - Number(b.id));
  }

  // Se o Firebase retornar um Objeto (comportamento padrão)
  return Object.entries(data)
    .map(([id, record]) => ({
      id,
      ...record,
      MATRIZ_FILIAL: record?.["MATRIZ "]?.[" FILIAL"] || "",
    }))
    .sort((a, b) => Number(a.id) - Number(b.id));
}

function renderTable() {
  const tbody = document.getElementById("tableBody");

  if (!state.filteredRecords.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">Nenhum associado encontrado.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = state.filteredRecords
    .map((record) => {
      const cells = TABLE_COLUMNS.map((col) => {
        const value = col.formatter ? col.formatter(record) : record[col.key];
        return `<td>${escapeHtml(formatValue(value))}</td>`;
      }).join("");

      const whatsappNumber = normalizeWhatsappNumber(record["Whatsapp"]);
      const instagramUsername = normalizeInstagramUsername(record["instagram"]);

      return `
        <tr>
          ${cells}
          <td>
            <div class="actions">
              <button class="action-btn details" data-action="details" data-id="${record.id}" title="Ver Detalhes">
                <i class="fas fa-eye"></i>
              </button>

              ${
                whatsappNumber
                  ? `<a
                      class="action-btn whatsapp"
                      href="https://wa.me/${whatsappNumber}"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Enviar WhatsApp"
                    >
                      <i class="fab fa-whatsapp"></i>
                    </a>`
                  : ""
              }

              ${
                instagramUsername
                  ? `<a
                      class="action-btn instagram"
                      href="https://www.instagram.com/${instagramUsername}"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir Instagram"
                    >
                      <i class="fab fa-instagram"></i>
                    </a>`
                  : ""
              }

              <button class="action-btn edit" data-action="edit" data-id="${record.id}" title="Editar Registro">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  bindTableActions();
}

function bindTableActions() {
  document.querySelectorAll("[data-action='details']").forEach((btn) => {
    btn.addEventListener("click", () => openDetailsModal(btn.dataset.id));
  });

  document.querySelectorAll("[data-action='edit']").forEach((btn) => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });

  document.querySelectorAll("[data-action='delete']").forEach((btn) => {
    btn.addEventListener("click", () => openDeleteModal(btn.dataset.id));
  });
}


function handleSearch(event) {
  const term = event.target.value.trim().toLowerCase();

  if (!term) {
    state.filteredRecords = [...state.records];
    renderTable();
    updateStats();
    return;
  }

  state.filteredRecords = state.records.filter((record) => {
    const searchBase = [
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
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchBase.includes(term);
  });

  renderTable();
  updateStats();
}

function updateStats() {
  document.getElementById("totalRecords").textContent = state.filteredRecords.length;
}

function setTableLoading(message) {
  document.getElementById("tableBody").innerHTML = `
    <tr>
      <td colspan="7" class="empty-state">${message}</td>
    </tr>
  `;
}

function openDetailsModal(id) {
  const record = state.records.find((item) => item.id === id);
  if (!record) return;

  document.getElementById("detailsSubtitle").textContent =
    `${record["NOME_FANTASIA"] || "Sem nome"} • ID ${record.id}`;

  const content = document.getElementById("detailsContent");
  content.innerHTML = detailsFields
    .map((field) => {
      const value =
        field === "MATRIZ_FILIAL"
          ? record["MATRIZ_FILIAL"]
          : record[field];

      const isWhatsapp = field === "Whatsapp";
      const isInstagram = field === "instagram";

      const whatsappNumber = normalizeWhatsappNumber(value);
      const instagramUsername = normalizeInstagramUsername(value);

      let renderedValue = escapeHtml(formatValue(value));

      if (isWhatsapp && whatsappNumber) {
        renderedValue = `
          <a href="https://wa.me/${whatsappNumber}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(formatValue(value))}
          </a>
        `;
      }

      if (isInstagram && instagramUsername) {
        renderedValue = `
          <a href="https://www.instagram.com/${instagramUsername}" target="_blank" rel="noopener noreferrer">
            @${escapeHtml(instagramUsername)}
          </a>
        `;
      }

      return `
        <div class="detail-card">
          <h4>${escapeHtml(field)}</h4>
          <p>${renderedValue}</p>
        </div>
      `;
    })
    .join("");

  openModal("detailsModal");
}

function openCreateModal() {
  state.editingId = null;
  document.getElementById("formTitle").textContent = "Novo associado";
  document.getElementById("associateForm").reset();
  fillForm({});
  openModal("formModal");
}

function openEditModal(id) {
  const record = state.records.find((item) => item.id === id);
  if (!record) return;

  state.editingId = id;
  document.getElementById("formTitle").textContent = `Editar associado #${id}`;
  fillForm(record);
  openModal("formModal");
}

function openDeleteModal(id) {
  const record = state.records.find((item) => item.id === id);
  if (!record) return;

  state.deletingId = id;
  document.getElementById("confirmText").textContent =
    `Deseja realmente excluir o associado "${record["NOME_FANTASIA"] || record["RAZÃO_SOCIAL"] || id}"?`;

  openModal("confirmModal");
}

async function confirmDelete() {
  if (!state.deletingId) return;

  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/${state.deletingId}.json`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Erro ao excluir");

    closeModal("confirmModal");
    showToast("Registro excluído com sucesso.", "success");
    state.deletingId = null;
    await loadRecords();
  } catch (error) {
    console.error(error);
    showToast("Erro ao excluir o registro.", "error");
  }
}

function normalizeWhatsappNumber(value) {
  if (!value) return "";

  let number = String(value).replace(/\D/g, "");

  // Se vier com 0 à esquerda, remove
  number = number.replace(/^0+/, "");

  // Se não começar com 55, adiciona
  if (number && !number.startsWith("55")) {
    number = `55${number}`;
  }

  return number;
}

function buildForm() {
  const container = document.getElementById("formSections");

  container.innerHTML = FORM_SECTIONS.map((section) => {
    const fieldsHtml = section.fields
      .map((field) => {
        const baseClass = `field col-${field.col || 12}`;
        const inputId = getInputId(field.key);

        if (field.type === "textarea") {
          return `
            <div class="${baseClass}">
              <label for="${inputId}">${field.label}</label>
              <textarea id="${inputId}" name="${field.key}"></textarea>
            </div>
          `;
        }

        return `
          <div class="${baseClass}">
            <label for="${inputId}">${field.label}</label>
            <input
              id="${inputId}"
              name="${field.key}"
              type="${field.type || "text"}"
            />
          </div>
        `;
      })
      .join("");

    return `
      <section class="form-section">
        <h4>${section.title}</h4>
        <div class="form-grid">
          ${fieldsHtml}
        </div>
      </section>
    `;
  }).join("");
}

function fillForm(record) {
  FORM_SECTIONS.forEach((section) => {
    section.fields.forEach((field) => {
      const el = document.querySelector(`[name="${CSS.escape(field.key)}"]`);
      if (!el) return;

      let value = "";

      if (field.key === "MATRIZ_FILIAL") {
        value = record["MATRIZ_FILIAL"] || record?.["MATRIZ "]?.[" FILIAL"] || "";
      } else {
        value = record[field.key] ?? "";
      }

      el.value = value;
    });
  });
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const payload = serializeForm();

  try {
    if (state.editingId) {
      await updateRecord(state.editingId, payload);
      showToast("Registro atualizado com sucesso.", "success");
    } else {
      const newId = await getNextId();
      await createRecord(newId, payload);
      showToast("Registro criado com sucesso.", "success");
    }

    closeModal("formModal");
    await loadRecords();
  } catch (error) {
    console.error(error);
    showToast("Erro ao salvar o registro.", "error");
  }
}

function serializeForm() {
  const formData = new FormData(document.getElementById("associateForm"));
  const flatData = Object.fromEntries(formData.entries());

  return mapFormToFirebasePayload(flatData);
}

function mapFormToFirebasePayload(data) {
  const payload = {};

  Object.entries(data).forEach(([key, value]) => {
    const cleanedValue = typeof value === "string" ? value.trim() : value;

    if (key === "MATRIZ_FILIAL") return;

    if (key === "CAT REDE" || key === "CÓDIGO MEDICON" || key === "DDD") {
      payload[key] = cleanedValue === "" ? "" : Number(cleanedValue);
      return;
    }

    payload[key] = cleanedValue;
  });

  payload["MATRIZ "] = {
    " FILIAL": (data["MATRIZ_FILIAL"] || "").trim(),
  };

  return payload;
}

async function getNextId() {
  const response = await fetch(`${FIREBASE_BASE_URL}/.json`);
  if (!response.ok) throw new Error("Erro ao gerar novo ID");

  const data = await response.json();
  const ids = Object.keys(data || {}).map((id) => Number(id)).filter((n) => !Number.isNaN(n));
  const maxId = ids.length ? Math.max(...ids) : 0;

  return String(maxId + 1);
}

async function createRecord(id, payload) {
  const response = await fetch(`${FIREBASE_BASE_URL}/${id}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Erro ao criar registro");
}

async function updateRecord(id, payload) {
    console.log(payload)
  const response = await fetch(`${FIREBASE_BASE_URL}/${id}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Erro ao atualizar registro");
}

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");

  if (id === "confirmModal") {
    state.deletingId = null;
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

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function getInputId(key) {
  return `field-${key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}