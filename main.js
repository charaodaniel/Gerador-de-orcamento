import html2pdf from 'html2pdf.js';

document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM
  const form = document.getElementById('budgetForm');
  const addItemButton = document.getElementById('addItem');
  const itemsList = document.getElementById('itemsList');
  const exportPdfButton = document.getElementById('exportPdf');
  const preview = document.getElementById('preview');

  // Adiciona uma nova linha de item/serviço ao formulário
  addItemButton.addEventListener('click', () => {
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.innerHTML = `
      <select class="item-type" required>
        <option value="">Selecione o tipo</option>
        <option value="produto">Produto</option>
        <option value="servico">Serviço</option>
      </select>
      <input type="text" class="item-description" placeholder="Descrição" required>
      <input type="number" class="item-quantity" placeholder="Quantidade" min="1" required>
      <input type="number" class="item-price" placeholder="Preço Unitário" step="0.01" min="0" required>
      <button type="button" class="remove-item">Remover</button>
    `;
    itemsList.appendChild(itemRow);
  });

  // Remove uma linha de item/serviço quando o botão remover é clicado
  itemsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
      e.target.parentElement.remove();
    }
  });

  // Gera a visualização do orçamento
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Arrays para armazenar produtos e serviços separadamente
    const items = [];
    const services = [];
    const itemRows = document.querySelectorAll('.item-row');
    let totalItems = 0;
    let totalServices = 0;

    // Processa cada linha do formulário
    itemRows.forEach(row => {
      const type = row.querySelector('.item-type').value;
      const description = row.querySelector('.item-description').value;
      const quantity = parseFloat(row.querySelector('.item-quantity').value);
      const price = parseFloat(row.querySelector('.item-price').value);
      const subtotal = quantity * price;

      const entry = { description, quantity, price, subtotal };
      
      // Separa itens entre produtos e serviços
      if (type === 'produto') {
        items.push(entry);
        totalItems += subtotal;
      } else {
        services.push(entry);
        totalServices += subtotal;
      }
    });

    // Obtém o nome do cliente
    const clientName = document.getElementById('clientName').value;

    // Gera o HTML do orçamento
    const budgetHtml = `
      <div class="budget-preview">
        <h2>ORÇAMENTO - ${clientName}</h2>
        <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
        
        <div class="section">
          <h3>EMPRESA</h3>
          <p>${document.getElementById('companyName').value}</p>
          <p>CNPJ: ${document.getElementById('cnpj').value}</p>
          <p>${document.getElementById('address').value}</p>
          <p>Tel: ${document.getElementById('phone').value}</p>
        </div>

        <div class="section">
          <h3>CLIENTE</h3>
          <p>${clientName}</p>
          <p>CPF/CNPJ: ${document.getElementById('clientDocument').value}</p>
          <p>${document.getElementById('clientAddress').value}</p>
          <p>Tel: ${document.getElementById('clientPhone').value}</p>
        </div>

        ${items.length > 0 ? `
          <div class="section">
            <h3>PRODUTOS</h3>
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Qtd</th>
                  <th>Valor Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>R$ ${item.price.toFixed(2)}</td>
                    <td>R$ ${item.subtotal.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3"><strong>Total Produtos</strong></td>
                  <td><strong>R$ ${totalItems.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ` : ''}

        ${services.length > 0 ? `
          <div class="section">
            <h3>SERVIÇOS</h3>
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Qtd</th>
                  <th>Valor Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${services.map(service => `
                  <tr>
                    <td>${service.description}</td>
                    <td>${service.quantity}</td>
                    <td>R$ ${service.price.toFixed(2)}</td>
                    <td>R$ ${service.subtotal.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3"><strong>Total Serviços</strong></td>
                  <td><strong>R$ ${totalServices.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ` : ''}

        <div class="section">
          <h3>TOTAL GERAL</h3>
          <p><strong>R$ ${(totalItems + totalServices).toFixed(2)}</strong></p>
        </div>

        <div class="section">
          <h3>CONDIÇÕES</h3>
          <p>${document.getElementById('conditions').value}</p>
          <p>Validade da proposta: ${document.getElementById('validity').value} dias</p>
        </div>
      </div>
    `;

    // Atualiza a visualização do orçamento
    preview.innerHTML = budgetHtml;
    preview.classList.add('visible');
  });

  // Exporta o orçamento para PDF
  exportPdfButton.addEventListener('click', () => {
    if (!preview.innerHTML) {
      alert('Por favor, gere o orçamento primeiro.');
      return;
    }

    const element = preview;
    const opt = {
      margin: 1,
      filename: 'orcamento.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  });
});