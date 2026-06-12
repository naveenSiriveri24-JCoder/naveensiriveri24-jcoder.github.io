let expenses = [];
let editId = null;
let expenseChart = null;
let categories = [
    "Electricity",
    "Gas",
    "Internet",
    "Food",
    "Rent",
    "Other"
];

function saveCategories(){

    localStorage.setItem(
        "categories",
        JSON.stringify(categories)
    );
}

async function addExpense() {

    const title =
        document.getElementById("title").value;

    const amount =
        document.getElementById("amount").value;

    const category =
        document.getElementById("category").value;

    const date =
        document.getElementById("date").value;

    const file =
        document.getElementById("billPhoto").files[0];

    if (
        !title ||
        !amount ||
        !category ||
        !date
    ) {
        alert("Please fill all fields");
        return;
    }

    let imageData = "";

    if (file) {
        imageData = await getBase64(file);
    }

    if(editId){

    const expense =
        expenses.find(
            expense => expense.id === editId
        );

    expense.title = title;
    expense.amount = Number(amount);
    expense.category = category;
    expense.date = date;

    await updateExpenseInSheet(expense);

    renderExpenses();

    clearForm();

    editId = null;

    return;
}

    const expense = {
        id: Date.now(),
        title,
        amount: Number(amount),
        category,
        date,
        image: imageData
    };

  await  saveExpenseToSheet(expense);

    expenses.push(expense);

    renderExpenses();

    clearForm();
}

function renderExpenses() {

    const table =
        document.getElementById("expenseTable");

    const dashboard =
        document.getElementById("dashboard");

    const searchText =
        document.getElementById("searchInput")
            ?.value
            .toLowerCase() || "";

    const selectedMonth =
        document.getElementById("monthFilter")
            ?.value || "";

    table.innerHTML = "";
    dashboard.innerHTML = "";

    let total = 0;

    const categoryTotals = {};

    expenses.forEach(expense => {

        if (
            searchText &&
            !expense.title
                .toLowerCase()
                .includes(searchText)
        ) {
            return;
        }

        if (
            selectedMonth &&
            !expense.date
                .startsWith(selectedMonth)
        ) {
            return;
        }

        total += expense.amount;

        if(categoryTotals[expense.category]){
            categoryTotals[expense.category] += expense.amount;
        }else{
            categoryTotals[expense.category] = expense.amount;
        }

        table.innerHTML += `
            <tr>
                <td>${expense.title}</td>
                <td>₹${expense.amount}</td>
                <td>${expense.category}</td>
                <td>${expense.date}</td>
                <td>
                    ${
                        expense.image
                        ? `<button onclick="viewImage('${expense.image}')">
                            View
                           </button>`
                        : "No Image"
                    }
                </td>
                
                <td>
                    <button
                        onclick="editExpense(${expense.id})">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteExpense(${expense.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });

    dashboard.innerHTML += `
    <div class="card">
        <h3>Total Bills</h3>
        <p>${expenses.length}</p>
    </div>
    `;
    dashboard.innerHTML += `
        <div class="card">
            <h3>Total Expenses</h3>
            <p>₹${total}</p>
        </div>
    `;

    for(const category in categoryTotals){

        dashboard.innerHTML += `
            <div class="card">
                <h3>${category}</h3>
                <p>₹${categoryTotals[category]}</p>
            </div>
        `;
    }

    document.getElementById("totalAmount").innerText =
        total;
    renderChart(categoryTotals);
}

async function deleteExpense(id){

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this expense?"
        );

    if(!confirmDelete){
        return;
    }

    await deleteExpenseFromSheet(id);

    expenses =
        expenses.filter(
        expense => expense.id !== id
    );

    saveExpenses();

    renderExpenses();
}

function clearForm(){

    document.getElementById("title").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
    document.getElementById("date").value = "";
    document.getElementById("billPhoto").value = "";
}

function saveExpenses() {
    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );
}

const storedExpenses =
    localStorage.getItem("expenses");

if (storedExpenses) {
    expenses = JSON.parse(storedExpenses);
    renderExpenses();
}

function getBase64(file) {
    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () =>
            resolve(reader.result);

        reader.onerror = error =>
            reject(error);
    });
}

function viewImage(image){

    const win =
        window.open("");

    win.document.write(`
        <img
            src="${image}"
            style="max-width:100%">
    `);
}

function editExpense(id){

    const expense = expenses.find(
        expense => expense.id === id
    );

    if(!expense){
        return;
    }

    document.getElementById("title").value =
        expense.title;

    document.getElementById("amount").value =
        expense.amount;

    document.getElementById("category").value =
        expense.category;

    document.getElementById("date").value =
        expense.date.split("T")[0];

    editId = id;
}

function renderChart(categoryTotals){

    const ctx =
        document.getElementById("expenseChart");

    if(!ctx){
        return;
    }

    if(expenseChart){
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: Object.keys(categoryTotals),

            datasets: [{
                data: Object.values(categoryTotals)
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
}

function exportCSV() {

    const rows = [
        ["Title","Amount","Category","Date"]
    ];

    expenses.forEach(expense => {

        rows.push([
            expense.title,
            expense.amount,
            expense.category,
            expense.date
        ]);
    });

    const csv =
        rows.map(
            row => row.join(",")
        ).join("\n");

    const blob =
        new Blob([csv], {
            type: "text/csv"
        });

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download = "expenses.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

function renderCategories(){

    const categorySelect =
        document.getElementById("category");

    categorySelect.innerHTML =
        '<option value="">Select Category</option>';

    categories.forEach(category => {

        categorySelect.innerHTML += `
            <option value="${category}">
                ${category}
            </option>
        `;
    });

    const deleteSelect =
        document.getElementById("categoryDelete");

    if(deleteSelect){

        deleteSelect.innerHTML = "";

        categories.forEach(category => {

            deleteSelect.innerHTML += `
                <option value="${category}">
                    ${category}
                </option>
            `;
        });
    }
}

function addCategory(){

    const input =
        document.getElementById("categoryInput");

    const category =
        input.value.trim();

    if(!category){
        alert("Enter category name");
        return;
    }

    if(categories.includes(category)){
        alert("Category already exists");
        return;
    }

    categories.push(category);

    saveCategories();

    renderCategories();

    input.value = "";
}

function deleteCategory(){

    const category =
        document.getElementById("categoryDelete").value;

    const used =
        expenses.some(
            expense => expense.category === category
        );

    if(used){
        alert(
            "Cannot delete category because expenses use it."
        );
        return;
    }

    categories =
        categories.filter(
            c => c !== category
        );

    saveCategories();

    renderCategories();
    
}

const storedCategories =
    localStorage.getItem("categories");

if(storedCategories){
    categories = JSON.parse(storedCategories);
}

renderCategories();

loadExpensesFromSheet();