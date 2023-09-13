let transactions = [];
// cria elementos na tela
function createTransactionContainer(id) {
  const container = document.createElement("div");
  container.classList.add("transaction");
  container.id = `transaction-${id}`;
  return container;
}

function createTransactionTitle(name) {
  const title = document.createElement("span");
  title.classList.add("transaction-title");
  title.textContent = name;
  return title;
}

function createTransactionAmount(amount) {
  const span = document.createElement("span");

  const formater = Intl.NumberFormat("pt-BR", {
    compactDisplay: "long",
    currency: "BRL",
    style: "currency",
  });

  const formatedAmount = formater.format(amount);

  if (amount > 0) {
    span.textContent = `${formatedAmount} C`;
    span.classList.add("transaction-amount", "credit");
  } else {
    span.textContent = `${formatedAmount} D`;
    span.classList.add("transaction-amount", "debit");
  }

  return span;
}

function createEditBtnTransaction(transaction) {
  const editBtn = document.createElement("button");
  editBtn.classList.add = "edit-btn";
  editBtn.textContent = "Editar";

  editBtn.addEventListener("click", () => {
    document.querySelector("#id").value = transaction.id;
    document.querySelector("#name").value = transaction.name;
    document.querySelector("#amount").value = transaction.amount;

    document.querySelector("#name").focus();
  });

  return editBtn;
}
function createDeleteBtnTransaction(id) {
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add = "delete-btn";
  deleteBtn.textContent = "Excluir";

  deleteBtn.addEventListener("click", async () => {
    await fetch(`http://localhost:3000/transactions/${id}`, {
      method: "DELETE",
    });
    deleteBtn.parentElement.remove();
    const indexToRemove = transactions.findIndex((t) => t.id === id);
    transactions.splice(indexToRemove, 1);
    updateBalance();
  });

  return deleteBtn;
}

// renderiza elemtno na tela
function renderTransaction(transaction) {
  const container = createTransactionContainer(transaction.id);
  const title = createTransactionTitle(transaction.name);
  const amount = createTransactionAmount(transaction.amount);
  const editBtn = createEditBtnTransaction(transaction);
  const deleteBtn = createDeleteBtnTransaction(transaction.id);

  container.append(title, amount, editBtn, deleteBtn);
  document.querySelector("#transactions").append(container);
}

function updateBalance() {
  const balanceSpan = document.querySelector("#balance");
  const balance = transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );
  const formater = Intl.NumberFormat("pt-BR", {
    compactDisplay: "long",
    currency: "BRL",
    style: "currency",
  }).format(balance);

  balanceSpan.textContent = formater;
}

// fucntions async
async function saveTransaction(event) {
  event.preventDefault();

  const id = document.querySelector("#id").value;
  const newTransaction = {
    name: document.querySelector("#name").value,
    amount: Number(document.querySelector("#amount").value),
  };

  if (id) {
    // editar transação
    const responseTransactions = await fetch(
      `http://localhost:3000/transactions/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(newTransaction),
        headers: { "Content-Type": "application/json" },
      }
    ).then((response) => response.json());

    const indexToRemove = transactions.findIndex((t) => t.id === id);
    transactions.splice(indexToRemove, 1, responseTransactions);
    document.querySelector(`#transaction-${id}`).remove();

    renderTransaction(responseTransactions);
  } else {
    // criar nova transação
    const responseTransactions = await fetch(
      "http://localhost:3000/transactions",
      {
        method: "POST",
        body: JSON.stringify(newTransaction),
        headers: { "Content-Type": "application/json" },
      }
    ).then((response) => response.json());

    transactions.push(responseTransactions);
    renderTransaction(responseTransactions);
  }

  event.target.reset();
  updateBalance();
}

async function fetchTransactions() {
  return await fetch("http://localhost:3000/transactions").then((res) =>
    res.json()
  );
}

async function setup() {
  const results = await fetchTransactions();
  transactions.push(...results);
  transactions.forEach(renderTransaction);
  updateBalance();
}
document.querySelector("form").addEventListener("submit", saveTransaction);
document.addEventListener("DOMContentLoaded", setup);
