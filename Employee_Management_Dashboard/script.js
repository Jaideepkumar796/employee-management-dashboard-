/* Employee Management Dashboard - Vanilla JS + LocalStorage */
(() => {
  const STORAGE_KEY = "employee_records_v1";

  // DOM
  const form = document.getElementById("employeeForm");
  const nameIn = document.getElementById("name");
  const emailIn = document.getElementById("email");
  const phoneIn = document.getElementById("phone");
  const roleIn = document.getElementById("role");
  const addressIn = document.getElementById("address");
  const salaryIn = document.getElementById("salary");
  const currencyIn = document.getElementById("currency");
  const employeeIdIn = document.getElementById("employeeId");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const addOpen = document.getElementById("addOpen");
  const formPanel = document.getElementById("formPanel");
  const tableBody = document.querySelector("#employeeTable tbody");
  const emptyState = document.getElementById("emptyState");
  const summary = document.getElementById("summary");
  const searchInput = document.getElementById("searchInput");
  const clearSearch = document.getElementById("clearSearch");
  const filterField = document.getElementById("filterField");

  // Utilities
  const uid = () => 'id_'+Date.now()+'_'+Math.floor(Math.random()*9999);
  const readStorage = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const writeStorage = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  // State
  let records = readStorage();
  let editingId = null;

  // Render
  function renderTable(list = records) {
    tableBody.innerHTML = "";
    if(!list.length){
      emptyState.style.display = "block";
    } else {
      emptyState.style.display = "none";
    }
    list.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.email)}</td>
        <td>${escapeHtml(r.phone)}</td>
        <td><span class="role-pill">${escapeHtml(r.role)}</span></td>
        <td>${escapeHtml(r.address)}</td>
        <td>${formatCurrency(r.salary, r.currency)}</td>
        <td>
          <div class="actions">
            <button class="icon-btn icon-edit" data-id="${r.id}" title="Edit">✏️</button>
            <button class="icon-btn icon-del" data-id="${r.id}" title="Delete">🗑️</button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
    summary.textContent = `${list.length} record${list.length !== 1 ? 's' : ''}`;
  }

  // Helpers
  function escapeHtml(text){
    if(text === null || text === undefined) return "";
    return String(text).replace(/[&<>"'`=\/]/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#96;','=':'&#61;'
    })[s]);
  }

  function formatCurrency(value, cur){
    if(value === "" || value === null || isNaN(Number(value))) return "-";
    const n = Number(value);
    const fmt = new Intl.NumberFormat(undefined, {maximumFractionDigits:2});
    return `${fmt.format(n)} ${cur}`;
  }

  // CRUD
  function addRecord(data){
    records.unshift(data);
    writeStorage(records);
    renderTable(recordsFiltered());
    showToast("Record added");
  }

  function updateRecord(id, patch){
    records = records.map(r => r.id === id ? {...r, ...patch} : r);
    writeStorage(records);
    renderTable(recordsFiltered());
    showToast("Record updated");
  }

  function deleteRecord(id){
    if(!confirm("Delete this record?")) return;
    records = records.filter(r => r.id !== id);
    writeStorage(records);
    renderTable(recordsFiltered());
    showToast("Record deleted");
  }

  // Form handlers
  function openAdd(){
    resetForm();
    employeeIdIn.value = "";
    editingId = null;
    document.getElementById("formTitle").textContent = "Add Employee";
    formPanel.scrollIntoView({behavior:"smooth", block:"start"});
  }

  function openEdit(id){
    const r = records.find(x => x.id === id);
    if(!r) return;
    employeeIdIn.value = r.id;
    nameIn.value = r.name;
    emailIn.value = r.email;
    phoneIn.value = r.phone;
    roleIn.value = r.role;
    addressIn.value = r.address;
    salaryIn.value = r.salary;
    currencyIn.value = r.currency || "PKR";
    editingId = id;
    document.getElementById("formTitle").textContent = "Edit Employee";
    formPanel.scrollIntoView({behavior:"smooth", block:"start"});
  }

  function resetForm(){
    form.reset();
    salaryIn.value = "";
    currencyIn.value = "PKR";
    employeeIdIn.value = "";
    editingId = null;
  }

  // Search & Filter
  function recordsFiltered(){
    const q = (searchInput.value || "").trim().toLowerCase();
    const field = filterField.value || "name";
    if(!q) return records;
    return records.filter(r => {
      const val = (r[field] || "").toString().toLowerCase();
      return val.includes(q);
    });
  }

  function handleSearch(){
    const list = recordsFiltered();
    renderTable(list);
  }

  // Toast (simple)
  function showToast(msg){
    // small ephemeral feedback using alert subtle style
    console.log(msg);
  }

  // Events
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const payload = {
      id: employeeIdIn.value || uid(),
      name: nameIn.value.trim(),
      email: emailIn.value.trim(),
      phone: phoneIn.value.trim(),
      role: roleIn.value,
      address: addressIn.value.trim(),
      salary: salaryIn.value ? Number(salaryIn.value).toFixed(2) : "",
      currency: currencyIn.value
    };
    // Basic validation
    if(!payload.name || !payload.email || !payload.phone || !payload.role){
      alert("Please fill required fields (Name, Email, Phone, Role).");
      return;
    }

    if(editingId){
      updateRecord(editingId, payload);
    } else {
      addRecord(payload);
      resetForm();
    }
    document.getElementById("formTitle").textContent = "Add Employee";
  });

  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    resetForm();
  });

  addOpen.addEventListener("click", openAdd);

  // Table actions (event delegation)
  tableBody.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".icon-edit");
    const delBtn = e.target.closest(".icon-del");
    if(editBtn){
      const id = editBtn.dataset.id;
      openEdit(id);
    } else if(delBtn){
      const id = delBtn.dataset.id;
      deleteRecord(id);
    }
  });

  // Search & filter
  searchInput.addEventListener("input", handleSearch);
  clearSearch.addEventListener("click", () => { searchInput.value = ""; handleSearch(); });
  filterField.addEventListener("change", handleSearch);

  // initial render
  renderTable(records);

  // Expose some for dev console
  window._EMP = {get:()=>records, add:addRecord, update:updateRecord, del:deleteRecord, reset:resetForm};

  // Optional: prefill demo data if empty (only first-time)
  if(records.length === 0){
    const demo = [
      {id:uid(), name:"Ayesha Khan", email:"ayesha.khan@gmail.com", phone:"+92 300 1234567", role:"Manager", address:"Clifton, Karachi", salary:"120000", currency:"PKR"},
      {id:uid(), name:"Bilal Ahmed", email:"bilal.dev@gmail.com", phone:"+92 301 7654321", role:"Developer", address:"Gulshan-e-Iqbal", salary:"2000", currency:"USD"},
      {id:uid(), name:"Sara Ali", email:"sara.designer@gmail.com", phone:"+92 333 9876543", role:"Designer", address:"DHA", salary:"1800", currency:"USD"}
    ];
    records = demo;
    writeStorage(records);
    renderTable(records);
  }

})();
