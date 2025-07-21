document.addEventListener('DOMContentLoaded', () => {
  loadSavedLoads();

  const form = document.getElementById('loadForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    saveLoad();
  });
});

function saveLoad() {
  const date = document.getElementById('date').value;
  const ticket = document.getElementById('ticket').value;
  const customer = document.getElementById('customer').value;
  const rig = document.getElementById('rig').value;
  const lease = document.getElementById('lease').value;
  const price = document.getElementById('price').value;
  const overnights = document.getElementById('overnights').value;
  const editIndex = document.getElementById('editIndex').value;

  const newLoad = { date, ticket, customer, rig, lease, price, overnights, selected: false };

  let loads = JSON.parse(localStorage.getItem('loads') || '[]');

  if (editIndex) {
    loads[parseInt(editIndex)] = newLoad;
    document.getElementById('editIndex').value = '';
  } else {
    loads.push(newLoad);
  }

  localStorage.setItem('loads', JSON.stringify(loads));
  document.getElementById('loadForm').reset();
  loadSavedLoads();
}

function loadSavedLoads() {
  const loadList = document.getElementById('loadList');
  let loads = JSON.parse(localStorage.getItem('loads') || '[]');
  loadList.innerHTML = '';

  loads.forEach((load, index) => {
    const div = document.createElement('div');
    div.className = 'load-entry';

    div.innerHTML = `
      <input type="checkbox" onchange="toggleSelect(${index})" ${load.selected ? 'checked' : ''}>
      <span><strong>${load.date}</strong> – ${load.customer} – $${load.price}</span><br>
      <small>Ticket: ${load.ticket}, Rig: ${load.rig}, Lease: ${load.lease}, Overnights: ${load.overnights}</small><br>
      <button onclick="editLoad(${index})">✏️ Edit</button>
      <button onclick="deleteLoad(${index})">🗑️ Delete</button>
    `;

    loadList.appendChild(div);
  });
}

function editLoad(index) {
  const loads = JSON.parse(localStorage.getItem('loads') || '[]');
  const load = loads[index];

  document.getElementById('date').value = load.date;
  document.getElementById('ticket').value = load.ticket;
  document.getElementById('customer').value = load.customer;
  document.getElementById('rig').value = load.rig;
  document.getElementById('lease').value = load.lease;
  document.getElementById('price').value = load.price;
  document.getElementById('overnights').value = load.overnights;
  document.getElementById('editIndex').value = index;
}

function deleteLoad(index) {
  let loads = JSON.parse(localStorage.getItem('loads') || '[]');
  loads.splice(index, 1);
  localStorage.setItem('loads', JSON.stringify(loads));
  loadSavedLoads();
}

function toggleSelect(index) {
  let loads = JSON.parse(localStorage.getItem('loads') || '[]');
  loads[index].selected = !loads[index].selected;
  localStorage.setItem('loads', JSON.stringify(loads));
}

function generatePaySheet() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Monster Services Job Sheet', 105, 15, null, null, 'center');

  const headers = ['Date', 'Ticket', 'Customer', 'Rig', 'Lease', 'Price', 'Overnights'];
  const loads = JSON.parse(localStorage.getItem('loads') || '[]').filter(l => l.selected);

  let startY = 25;
  doc.setFontSize(10);

  // Draw headers
  headers.forEach((h, i) => {
    doc.text(h, 10 + i * 28, startY);
  });

  startY += 5;

  // Draw rows
  loads.forEach((l, rowIndex) => {
    const row = [l.date, l.ticket, l.customer, l.rig, l.lease, `$${l.price}`, l.overnights];
    row.forEach((cell, i) => {
      doc.text(String(cell), 10 + i * 28, startY + rowIndex * 7);
    });
  });

  doc.save('MonsterServices_JobSheet.pdf');
}