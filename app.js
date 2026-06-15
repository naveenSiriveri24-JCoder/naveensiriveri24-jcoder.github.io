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

    // EDIT MODE
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

        saveExpenses();

        renderExpenses();

        clearForm();

        editId = null;

        return;
    }

    // ADD NEW
    const expense = {
        id: Date.now(),
        title,
        amount: Number(amount),
        category,
        date,
        image: imageData
    };

    await saveExpenseToSheet(expense);

    expenses.push(expense);

    saveExpenses();

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
    let billCount = 0;
    const categoryTotals = {};

    const filteredExpenses = expenses.filter(expense => {

    if(
        searchText &&
        !expense.title.toLowerCase().includes(searchText)
    ){
        return false;
    }

    if(
        selectedMonth &&
        !expense.date.startsWith(selectedMonth)
    ){
        return false;
    }

    return true;
    });

    filteredExpenses.forEach(expense => {


        total += expense.amount;
        billCount++;

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
            <p>${filteredExpenses.length}</p>
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

    const totalAmountElement =
    document.getElementById("totalAmount");

    if(totalAmountElement){
        totalAmountElement.innerText = total;
    }
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

    window.open(
        image,
        "_blank"
    );
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



function toggleTheme(){

    document.body.classList.toggle(
        "dark-mode"
    );

    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );

    localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
    );
}

const savedTheme =
    localStorage.getItem("theme");

if(savedTheme === "dark"){

    document.body.classList.add(
        "dark-mode"
    );

    document.getElementById(
        "themeSwitch"
    ).checked = true;
}

function exportPDF(){

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    const selectedMonth =
        document.getElementById(
            "monthFilter"
        ).value;

    const filteredExpenses =
        expenses.filter(expense => {

            if(
                selectedMonth &&
                !expense.date.startsWith(
                    selectedMonth
                )
            ){
                return false;
            }

            return true;
        });

    let total = 0;

    const categoryTotals = {};

    filteredExpenses.forEach(expense => {

        total += expense.amount;

        if(categoryTotals[expense.category]){
            categoryTotals[expense.category] += expense.amount;
        }else{
            categoryTotals[expense.category] = expense.amount;
        }
    });

    let highestCategory = "-";
    let highestAmount = 0;

    for(const category in categoryTotals){

        if(categoryTotals[category] > highestAmount){

            highestAmount =
                categoryTotals[category];

            highestCategory =
                category;
        }
    }

    const average =
        filteredExpenses.length > 0
        ?
        Math.round(
            total / filteredExpenses.length
        )
        :
        0;

    // HEADER

    doc.setFontSize(20);

    doc.text(
        "Expense Report",
        14,
        20
    );

    doc.setFontSize(11);

    doc.text(
        selectedMonth
        ?
        `Month: ${selectedMonth}`
        :
        "All Expenses",
        14,
        30
    );

    // SUMMARY SECTION

    doc.setFontSize(14);

    doc.text(
        "Summary",
        14,
        45
    );

    doc.setFontSize(11);

    doc.text(
        `Total Bills: ${filteredExpenses.length}`,
        14,
        55
    );

    doc.text(
        `Total Expenses: Rs. ${total}`,
        14,
        63
    );

    doc.text(
        `Highest Category: ${highestCategory}`,
        14,
        71
    );

    doc.text(
        `Average Expense: Rs. ${average}`,
        14,
        79
    );

    // TABLE

    const chartElement =
    document.querySelector(
        ".chart-container"
    );

html2canvas(chartElement)
.then(canvas => {

    const imgData =
        canvas.toDataURL("image/png");

    // Chart on top-right of page 1
    doc.addImage(
        imgData,
        "PNG",
        115,
        30,
        80,
        60
    );

    const rows = [];

    filteredExpenses.forEach(expense => {

        rows.push([
            expense.title,
            `Rs. ${expense.amount}`,
            expense.category,
            expense.date
        ]);
    });

    doc.autoTable({

        startY: 100,

        head: [[
            "Title",
            "Amount",
            "Category",
            "Date"
        ]],

        body: rows
    });

    doc.setFontSize(10);

    doc.text(
        `Generated On: ${
            new Date()
            .toLocaleString()
        }`,
        14,
        doc.lastAutoTable.finalY + 15
    );

    doc.save(
        selectedMonth
        ?
        `Expense-Report-${selectedMonth}.pdf`
        :
        "Expense-Report.pdf"
    );
});
}