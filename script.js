const form = document.getElementById("transaction-form");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expensesEl = document.getElementById("expenses");
const savingsRateEl = document.getElementById("savings-rate");
const transactionList = document.getElementById("transaction-list");

const goalProgress = document.getElementById("goal-progress");
const goalText = document.getElementById("goal-text");

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

// ----------------------
// CHART SETUP
// ----------------------

const ctx = document.getElementById("spendingChart");

let spendingChart = new Chart(ctx, {
    type: "doughnut",
    data: {
        labels: ["Income", "Expenses"],
        datasets: [{
            data: [0, 0],
            backgroundColor: ["#22c55e", "#ef4444"],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom"
            }
        }
    }
});

// ----------------------
// SAVE
// ----------------------

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ----------------------
// UPDATE DASHBOARD
// ----------------------

function updateDashboard() {

    const income = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    const savingsRate =
        income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

    balanceEl.textContent = `$${balance.toFixed(2)}`;
    incomeEl.textContent = `$${income.toFixed(2)}`;
    expensesEl.textContent = `$${expenses.toFixed(2)}`;
    savingsRateEl.textContent = `${savingsRate}%`;

    // Update chart
    spendingChart.data.datasets[0].data = [income, expenses];
    spendingChart.update();

    // Goal (simple demo goal = $2000 savings)
    const goal = 2000;
    const progress = Math.min((balance / goal) * 100, 100);

    goalProgress.style.width = `${progress}%`;
    goalText.textContent = `${progress.toFixed(0)}% Complete`;
}

// ----------------------
// RENDER TRANSACTIONS
// ----------------------

function renderTransactions() {

    transactionList.innerHTML = "";

    if (transactions.length === 0) {
        transactionList.innerHTML = "<p>No transactions yet.</p>";
        return;
    }

    transactions.forEach((t, index) => {

        const row = document.createElement("div");
        row.classList.add("transaction-row");

        const desc = document.createElement("span");
        desc.textContent = t.description;

        const right = document.createElement("span");

        const value = document.createElement("span");
        value.classList.add(t.type === "income" ? "positive" : "negative");
        value.textContent =
            (t.type === "income" ? "+" : "-") +
            `$${t.amount.toFixed(2)}`;

        const btn = document.createElement("button");
        btn.textContent = "❌";
        btn.classList.add("delete-btn");

        btn.addEventListener("click", () => deleteTransaction(index));

        right.appendChild(value);
        right.appendChild(btn);

        row.appendChild(desc);
        row.appendChild(right);

        transactionList.appendChild(row);
    });
}

// ----------------------
// DELETE
// ----------------------

function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveTransactions();
    renderTransactions();
    updateDashboard();
}

// ----------------------
// ADD TRANSACTION
// ----------------------

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const description =
        document.getElementById("description").value.trim();

    const amount = parseFloat(
        document.getElementById("amount").value
    );

    const type = document.getElementById("type").value;

    if (!description || !Number.isFinite(amount) || amount <= 0)
        return;

    transactions.push({ description, amount, type });

    saveTransactions();
    renderTransactions();
    updateDashboard();

    form.reset();
});

// ----------------------
// INIT
// ----------------------

renderTransactions();
updateDashboard();