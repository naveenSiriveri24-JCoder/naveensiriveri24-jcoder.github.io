if(
    !sessionStorage.getItem(
        "loggedIn"
    )
){

    window.location.replace(
        "login.html"
    );
}

import {
    saveExpense,
    loadExpenses,
    deleteExpenseById,
     updateExpenseById
}
from "./expenseApi.js";

async function init(){

     expenses =
        await loadExpenses();

    console.log(
        expenses
    );

    renderExpenses();

    renderDashboard();
}

init();

let deleteId = null;
let expenses = [];
let expenseChart = null;
let categories = [
    "Electricity",
    "Gas",
    "Internet",
    "Food",
    "Rent",
    "Other"
];
let trendChart;
let chart;
let selectedImage = "";
let currentPage = 1;
const recordsPerPage = 10;

function saveCategories(){

    localStorage.setItem(
        "categories",
        JSON.stringify(categories)
    );
}

async function addExpense() {
    
    const titleInput =
        document.getElementById(
            "title"
        );

    const amountInput =
        document.getElementById(
            "amount"
        );

    const categoryInput =
        document.getElementById(
            "category"
        );

    const dateInput =
        document.getElementById(
            "date"
        );

    [
        titleInput,
        amountInput,
        categoryInput,
        dateInput
    ].forEach(field => {

        field.classList.remove(
            "input-error"
        );
    });

    let valid = true;

    if(
        !titleInput.value.trim()
    ){

        titleInput.classList.add(
            "input-error"
        );

        valid = false;
    }

    if(
        !amountInput.value
    ){

        amountInput.classList.add(
            "input-error"
        );

        valid = false;
    }

    if(
        !categoryInput.value
    ){

        categoryInput.classList.add(
            "input-error"
        );

        valid = false;
    }

    if(
        !dateInput.value
    ){

        dateInput.classList.add(
            "input-error"
        );

        valid = false;
    }

    if(!valid){

        showToast(
            "⚠️ Please fill all required fields"
        );

        return;
    }

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
        showToast("Please fill all fields");
        return;
    }

 



    // ADD NEW
const expense = {

    title,

    amount:
        Number(amount),

    category,

    date,

    image:
        selectedImage,

    userName:
        sessionStorage.getItem(
            "userName"
        )

};

await saveExpense(
    expense
);

showToast(
    "✅ Expense Added",
    "success"
);

expenses =
    await loadExpenses();

renderExpenses();

renderDashboard();

clearForm();
}
window.addExpense = addExpense;

function renderExpenses() {

    const table =
        document.getElementById("expenseTable");


    const searchText =
        document.getElementById("searchInput")
            ?.value
            .toLowerCase() || "";

    const selectedMonth =
        document.getElementById("monthFilter")
            ?.value || "";

    table.innerHTML = "";
    

    let total = 0;
    let billCount = 0;
    const categoryTotals = {};

    const filteredExpenses = expenses.filter(expense => {

 if(searchText){

    const titleMatch =
        expense.title
        .toLowerCase()
        .includes(searchText);

    const categoryMatch =
        expense.category
        .toLowerCase()
        .includes(searchText);

    const amountMatch =
        String(expense.amount)
        .includes(searchText);

    const dateMatch =
        expense.date
        .includes(searchText);

    if(
        !titleMatch &&
        !categoryMatch &&
        !amountMatch &&
        !dateMatch
    ){
        return false;
    }
}

    if(
        selectedMonth &&
        !expense.date.startsWith(selectedMonth)
    ){
        return false;
    }

    return true;
    });

    const totalPages =
    Math.ceil(
        filteredExpenses.length /
        recordsPerPage
    );

if(
    currentPage > totalPages &&
    totalPages > 0
){
    currentPage = totalPages;
}

const startIndex =
    (currentPage - 1) *
    recordsPerPage;

const endIndex =
    startIndex +
    recordsPerPage;

const paginatedExpenses =
    filteredExpenses.slice(
        startIndex,
        endIndex
    );

    paginatedExpenses.forEach(expense => {


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
                        onclick="editExpense('${expense.id}')">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteExpense('${expense.id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });



    const totalAmountElement =
    document.getElementById("totalAmount");

const budgets =
    JSON.parse(
        localStorage.getItem(
            "monthlyBudgets"
        )
    ) || {};

const budget =
    budgets[selectedMonth] || 0;

    const budgetInput =
    document.getElementById(
        "monthlyBudget"
    );

if(budgetInput){

    budgetInput.value =
        budget || "";
}

            const remaining =
                budget - total;
                
        const actualPercent =
            budget > 0
            ?
            (total / budget) * 100
            :
            0;

        const displayPercent =
            Math.min(
                actualPercent,
                100
            );

        const progressFill =
            document.getElementById(
                "progressFill"
            );

        progressFill.style.width =
            `${displayPercent}%`;

        document.getElementById(
            "progressText"
        ).innerText =
            `${Math.round(actualPercent)}%`;

        /* Progress Bar Colors */

        if(actualPercent > 100){

            progressFill.style.background =
                "#e53935";
        }
        else if(actualPercent > 80){

            progressFill.style.background =
                "#ff9800";
        }
        else{

            progressFill.style.background =
                "#4caf50";
        }

        /* Budget Details */

        document.getElementById(
            "budgetAmount"
        ).innerText =
            `₹${budget}`;

        document.getElementById(
            "spentAmount"
        ).innerText =
            `₹${total}`;

        document.getElementById(
            "remainingAmount"
        ).innerText =
            `₹${remaining}`;


    document.getElementById(
    "filteredBills"
        ).innerText =
            filteredExpenses.length;

        document.getElementById(
            "filteredAmount"
        ).innerText =
            `₹${total}`;

    if(totalAmountElement){
        totalAmountElement.innerText = total;
    }
    
   document.getElementById(
    "pageInfo"
).innerText =
    `Page ${currentPage} of ${Math.max(totalPages,1)}`;

document.getElementById(
    "prevBtn"
).disabled =
    currentPage === 1;

document.getElementById(
    "nextBtn"
).disabled =
    currentPage === totalPages ||
    totalPages === 0;

    renderTrendChart(
    filteredExpenses
            );

    
}

async function deleteExpense(id){

    deleteId = id;

    document.getElementById(
        "deleteModal"
    ).style.display =
        "flex";
}
function closeDeleteModal(){

    deleteId = null;

    document.getElementById(
        "deleteModal"
    ).style.display =
        "none";
}

async function confirmDelete(){

    if(!deleteId){
        return;
    }

    await deleteExpenseById(
        deleteId
    );

    expenses =
        await loadExpenses();

    renderExpenses();

    renderDashboard();

    closeDeleteModal();

    showToast(
        "🗑 Expense Deleted"
    );
}

window.closeDeleteModal =
    closeDeleteModal;

window.confirmDelete =
    confirmDelete;


function clearForm(){

    document.getElementById("title").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
    document.getElementById("date").value = "";
    document.getElementById("billPhoto").value = "";

    selectedImage = "";

    previewImage.src = "";

    previewContainer.style.display =
        "none";

    fileName.innerText = "";
}


function viewImage(image){

    document.getElementById(
        "modalImage"
    ).src = image;

    document.getElementById(
        "imageModal"
    ).style.display = "flex";
}

document.getElementById(
    "closeImageModal"
).addEventListener(
    "click",
    function(){

        document.getElementById(
            "imageModal"
        ).style.display =
            "none";
    }
);

document.getElementById(
    "imageModal"
).addEventListener(
    "click",
    function(e){

        if(
            e.target === this
        ){

            this.style.display =
                "none";
        }
    }
);

function editExpense(id){

    const expense =
        expenses.find(
            e => e.id === id
        );

    if(!expense){
        return;
    }

    document.getElementById(
        "editId"
    ).value =
        expense.id;
    document.getElementById(
        "editCategory"
    ).innerHTML =
        document.getElementById(
            "category"
        ).innerHTML;
    document.getElementById(
        "editTitle"
    ).value =
        expense.title;

    document.getElementById(
        "editAmount"
    ).value =
        expense.amount;

    document.getElementById(
        "editCategory"
    ).value =
        expense.category;

    document.getElementById(
        "editDate"
    ).value =
        expense.date;

    document.getElementById(
        "editModal"
    ).style.display =
        "block";
}
function closeModal(){

    document.getElementById(
        "editModal"
    ).style.display =
        "none";
}

async function saveEdit(){

    const id =
        document.getElementById(
            "editId"
        ).value;

    const updatedExpense = {

        title:
            document.getElementById(
                "editTitle"
            ).value,

        amount:
            Number(
                document.getElementById(
                    "editAmount"
                ).value
            ),

        category:
            document.getElementById(
                "editCategory"
            ).value,

        date:
            document.getElementById(
                "editDate"
            ).value

    };

    await updateExpenseById(

        id,

        updatedExpense

    );

    expenses =
        await loadExpenses();

    renderExpenses();

    renderDashboard();

    closeModal();

    showToast(
        "✅ Expense Updated",
        "success"
    );
}

function renderChart(categoryTotals){

    const canvas =
        document.getElementById(
            "expenseChart"
        );

    if(!canvas){
        return;
    }

    if(expenseChart){
        expenseChart.destroy();
    }

    const labels =
        Object.keys(categoryTotals);

    const values =
        Object.values(categoryTotals);

    const total =
        values.reduce(
            (a,b) => a + b,
            0
        );
const ctx =
    canvas.getContext("2d");

const gradients = [];

/* Green */

const g1 =
    ctx.createLinearGradient(
        0,0,300,300
    );

g1.addColorStop(
    0,
    "#7ddd82"
);

g1.addColorStop(
    1,
    "#2E7D32"
);

gradients.push(g1);

/* Blue */

const g2 =
    ctx.createLinearGradient(
        0,0,300,300
    );

g2.addColorStop(
    0,
    "#64B5F6"
);

g2.addColorStop(
    1,
    "#1565C0"
);

gradients.push(g2);

/* Orange */

const g3 =
    ctx.createLinearGradient(
        0,0,300,300
    );

g3.addColorStop(
    0,
    "#FFB74D"
);

g3.addColorStop(
    1,
    "#EF6C00"
);

gradients.push(g3);

/* Pink */

const g4 =
    ctx.createLinearGradient(
        0,0,300,300
    );

g4.addColorStop(
    0,
    "#e77d7d"
);

g4.addColorStop(
    1,
    "#f10a0a"
);

gradients.push(g4);
/*  const colors = [

//     "#81C784",
//     "#64B5F6",
//     "#9575CD",
//     "#F06292",
//     "#FFB74D",
//     "#4DB6AC",
//     "#A1887F"

 ]; */

const legendGradients = [

    "linear-gradient(135deg,#81C784,#2E7D32)",

    "linear-gradient(135deg,#64B5F6,#1565C0)",

    "linear-gradient(135deg,#FFB74D,#EF6C00)",

    "linear-gradient(135deg,#F48FB1,#C2185B)",

    "linear-gradient(135deg,#4DB6AC,#00695C)",

    "linear-gradient(135deg,#9575CD,#4527A0)",

    "linear-gradient(135deg,#A1887F,#5D4037)"
];

    expenseChart =
        new Chart(canvas, {

        type: "pie",

        data: {

            labels: labels,

            datasets: [{

                data: values,

                backgroundColor: gradients,

                borderWidth: 0.5,

                hoverOffset: 5,

                radius: "95%",
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                title: {

                    display: false
                },

                legend: {

                    display: false
                },

                tooltip: {

                    callbacks: {

                        label: function(context){

                            const value =
                                context.raw;

                            const percent =
                                (
                                    value /
                                    total
                                ) * 100;

                            return `${context.label}: ₹${value} (${percent.toFixed(1)}%)`;
                        }
                    }
                }
            }
        }
    });

    /* CUSTOM LEGEND */

    const legend =
        document.getElementById(
            "customLegend"
        );

    if(legend){

        legend.innerHTML = "";

        labels.forEach(
            (label,index) => {

            const percent =
                (
                    values[index] /
                    total
                ) * 100;

            legend.innerHTML += `

                <div class="legend-item">

                    <span
                        class="legend-color"
                        style="
                            background:${legendGradients[index]};
                        ">
                    </span>

                    <span>
                        ${label}
                        (${percent.toFixed(1)}%)
                    </span>

                </div>

            `;
        });
    }

    /* SUMMARY */

    const summary =
        document.getElementById(
            "pieChartSummary"
        );

    if(summary){

        const maxIndex =
            values.indexOf(
                Math.max(...values)
            );

        summary.innerHTML = `
            <strong>Total Expenses:</strong> ₹${total}
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <strong>Top Category:</strong> ${labels[maxIndex]}
        `;
    }
}

function renderTrendChart(filteredExpenses){

    const monthlyTotals = {};

    expenses.forEach(expense => {

        const month =
            expense.date.substring(0, 7);

        monthlyTotals[month] =
            (monthlyTotals[month] || 0)
            + expense.amount;
    });

    const labels =
        Object.keys(monthlyTotals).sort();

    const values =
        labels.map(
            month => monthlyTotals[month]
        );

    const canvas =
        document.getElementById(
            "trendChart"
        );

    if(!canvas){
        return;
    }

    const ctx =
        canvas.getContext("2d");

    if(trendChart){
        trendChart.destroy();
    }
const gradient =
    ctx.createLinearGradient(
        0,
        0,
        0,
        400
    );

gradient.addColorStop(
    0,
    "#7d97f5"
);

gradient.addColorStop(
    .5,
    "#3b38e6"
);

gradient.addColorStop(
    1,
    "#114df3"
);

const gradient2 =
    ctx.createLinearGradient(
        0,
        0,
        0,
        300
    );

gradient2.addColorStop(
    0,
    "#f57818"
);

gradient2.addColorStop(
    1,
    "#ff776a"
);
    trendChart =
        new Chart(ctx, {

            type: "bar",

            data: {

                labels,

                datasets: [

                    {
                        type: "bar",

                        label: "Expenses",

                        data: values,

                        borderRadius: 8,

                        borderColor:gradient,

                        backgroundColor:gradient,

                        borderWidth:4,

                        tension:.4,

                        fill:false,

                        order : 2
                    },

                    {
                        type: "line",

                        label: "Trend",

                        data: values,

                        tension: 0.4,

                        fill: false,

                        pointRadius: 5,
                        
                        borderColor:gradient2,

                        backgroundColor:gradient2,

                        order : 1
                    }

                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    x: {

                        offset: false,

                        grid: {
                            display: false
                        }

                    },

                    y: {

                        beginAtZero: true,

                        grid: {
                            display: false
                        }

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
        showToast("Enter Category name");
        return;
    }

    if(categories.includes(category)){
       showToast("Category already exists");
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
        showToast(
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

// loadExpensesFromSheet();



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

        categoryTotals[expense.category] =
            (categoryTotals[expense.category] || 0)
            + expense.amount;
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

    /* HEADER */
    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(20);

    doc.setTextColor(
    255,
    152,
    0
    );

    doc.text(
        "Expense Report",
        14,
        20
    );
    /* month */

    doc.setFont(
        "helvetica",
        "bold"
    );
    doc.setFontSize(15);

    doc.setTextColor(80);

    doc.text(
        selectedMonth
        ?
        `Month: ${selectedMonth}`
        :
        "All Expenses",
        14,
        30
    );

    /* SUMMARY CARD FUNCTION */

    function drawCard(
        x,
        y,
        title,
        value
    ){

        doc.setFillColor(
            232,
            245,
            233
        );

        doc.roundedRect(
            x,
            y,
            38,
            25,
            3,
            3,
            "F"
        );
         doc.setFont(
        "helvetica",
        "bold"
        );
        doc.setFontSize(13);

        doc.setTextColor(100);

        doc.text(
            title,
            x + 4,
            y + 8
        );

        doc.setFontSize(13);

        doc.setTextColor(
            46,
            125,
            50
        );

        doc.text(
            String(value),
            x + 4,
            y + 18
        );
    }

    /* SUMMARY CARDS */

    drawCard(
        10,
        40,
        "Bills",
        filteredExpenses.length
    );

    drawCard(
        58,
        40,
        "Expense",
        `Rs. ${total}`
    );

    drawCard(
        106,
        40,
        "Category",
        highestCategory
    );

    drawCard(
        154,
        40,
        "Average",
        `Rs. ${average}`
    );

    /* TREND CHART TITLE */

    doc.setFontSize(14);

    doc.setTextColor(
        46,
        125,
        50
    );

    doc.text(
        "Monthly Expense Trend",
        14,
        80
    );

    /* UPDATE CHART */

    if(trendChart){
        trendChart.update();
    }

    const trendCanvas =
        document.getElementById(
            "trendChart"
        );

    let trendImage = null;

    try{

        trendImage =
            trendCanvas.toDataURL(
                "image/png"
            );

    }catch(err){

        console.log(
            "Trend Error:",
            err
        );
    }

    /* ADD CHART */

    if(trendImage){

        doc.addImage(
            trendImage,
            "PNG",
            15,
            85,
            180,
            55
        );
    }

    /* TABLE TITLE */

    doc.setFontSize(14);

    doc.setTextColor(
        46,
        125,
        50
    );

    doc.text(
        "Expense Details",
        14,
        150
    );

    /* TABLE DATA */

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

        startY: 155,

        head: [[

            "Title",

            "Amount",

            "Category",

            "Date"

        ]],

        body: rows,

        headStyles: {

            fillColor: [
                76,
                175,
                80
            ]
        }
    });

    /* FOOTER */

    doc.setFontSize(10);

    doc.setTextColor(120);

    doc.text(

        `Generated On: ${
            new Date()
            .toLocaleString()
        }`,

        14,

        doc.lastAutoTable.finalY + 15

    );

    /* SAVE */

    doc.save(

        selectedMonth
        ?
        `Expense-Report-${selectedMonth}.pdf`
        :
        "Expense-Report.pdf"

    );
}


function showTab(tabId, button){

    document
        .querySelectorAll(".tab-content")
        .forEach(tab => {

            tab.style.display = "none";
        });

    document
        .querySelectorAll(".tab-btn")
        .forEach(btn => {

            btn.classList.remove("active");
        });

    document
        .getElementById(tabId)
        .style.display = "block";

    button.classList.add("active");
}

document.getElementById("date").value =
    new Date()
        .toISOString()
        .split("T")[0];

document.getElementById("monthFilter").value =
    new Date()
        .toISOString()
        .slice(0, 7);
document.getElementById(
    "monthFilter"
).addEventListener(
    "change",
    renderExpenses
);

function changeTheme(){

    const selectedTheme =
        document.getElementById(
            "themeSelector"
        ).value;

    document.getElementById(
        "themeStylesheet"
    ).href = selectedTheme;

    localStorage.setItem(
        "selectedTheme",
        selectedTheme
    );
}

window.addEventListener(
    "DOMContentLoaded",
    () => {

        const savedTheme =
            localStorage.getItem(
                "selectedTheme"
            );

        if(savedTheme){

            document.getElementById(
                "themeStylesheet"
            ).href = savedTheme;

            const selector =
                document.getElementById(
                    "themeSelector"
                );

            if(selector){
                selector.value =
                    savedTheme;
            }
        }
    }
);

const placeholders = [

    " Search by Title...",

    " Search by Category...",

    " Search by Amount...",

    " Search by Date..."
];

let placeholderIndex = 0;

setInterval(() => {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    if(
        searchInput &&
        document.activeElement !== searchInput
    ){

        searchInput.placeholder =
            placeholders[
                placeholderIndex
            ];

        placeholderIndex =
            (
                placeholderIndex + 1
            ) %
            placeholders.length;
    }

}, 2000);

function renderDashboard(){

    const dashboard =
        document.getElementById(
            "dashboard"
        );

    dashboard.innerHTML = "";

    let total = 0;

    const categoryTotals = {};

    expenses.forEach(expense => {

        total += expense.amount;

        categoryTotals[expense.category] =
            (categoryTotals[expense.category] || 0)
            + expense.amount;

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

    renderChart(
        categoryTotals
    );
}
function saveBudget(){

    const budget =
        Number(
            document.getElementById(
                "monthlyBudget"
            ).value
        );

    const selectedMonth =
        document.getElementById(
            "monthFilter"
        ).value;

    const budgets =
        JSON.parse(
            localStorage.getItem(
                "monthlyBudgets"
            )
        ) || {};

    budgets[selectedMonth] =
        budget;

    localStorage.setItem(
        "monthlyBudgets",
        JSON.stringify(budgets)
    );

    renderExpenses();
    const expensesButton =
    document.querySelector(
        '[onclick*="expensesTab"]'
    );

showTab(
    "expensesTab",
    expensesButton
);
}

function changePage(direction){

    currentPage += direction;

    renderExpenses();
}

document.getElementById(
    "searchInput"
).addEventListener(
    "input",
    () => {

        currentPage = 1;

        renderExpenses();
    }
);

document.getElementById(
    "monthFilter"
).addEventListener(
    "change",
    () => {

        currentPage = 1;

        renderExpenses();
    }
);

function showToast(message){

    const toast =
        document.getElementById(
            "toast"
        );

    toast.innerText =
        message;

    toast.classList.add(
        "show"
    );

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);
}

document
    .querySelectorAll(
        "#title,#amount,#category,#date"
    )
    .forEach(field => {

        field.addEventListener(
            "input",
            () => {

                field.classList.remove(
                    "input-error"
                );
            }
        );

        field.addEventListener(
            "change",
            () => {

                field.classList.remove(
                    "input-error"
                );
            }
        );
    });

 const uploadArea =
    document.getElementById(
        "uploadArea"
    );

const billPhoto =
    document.getElementById(
        "billPhoto"
    );

const previewContainer =
    document.getElementById(
        "previewContainer"
    );

const previewImage =
    document.getElementById(
        "previewImage"
    );

const fileName =
    document.getElementById(
        "fileName"
    );

const removeImage =
    document.getElementById(
        "removeImage"
    );

/* CLICK TO OPEN */

uploadArea.addEventListener(
    "click",
    () => billPhoto.click()
);

/* FILE SELECT */

billPhoto.addEventListener(
    "change",
    function(){

        const file =
            this.files[0];

        if(file){

            showPreview(file);
        }
    }
);

/* DRAG EVENTS */

uploadArea.addEventListener(
    "dragover",
    function(e){

        e.preventDefault();

        uploadArea.classList.add(
            "dragover"
        );
    }
);

uploadArea.addEventListener(
    "dragleave",
    function(){

        uploadArea.classList.remove(
            "dragover"
        );
    }
);

uploadArea.addEventListener(
    "drop",
    function(e){

        e.preventDefault();

        uploadArea.classList.remove(
            "dragover"
        );

        const file =
            e.dataTransfer.files[0];

        if(file){

            billPhoto.files =
                e.dataTransfer.files;

            showPreview(file);
        }
    }
);

/* PREVIEW */

function showPreview(file){

    fileName.innerText =
        file.name;

    const reader =
        new FileReader();

    reader.onload =
        function(e){

            selectedImage =
                e.target.result;

            previewImage.src =
                selectedImage;

            previewContainer.style.display =
                "block";
        };

    reader.readAsDataURL(file);
}

/* REMOVE IMAGE */

removeImage.addEventListener(
    "click",
    function(e){

        e.stopPropagation();

        billPhoto.value = "";

        selectedImage = "";

        previewImage.src = "";

        previewContainer.style.display =
            "none";

        fileName.innerText = "";
    }
);

window.showTab = showTab;
window.addExpense = addExpense;
window.exportCSV = exportCSV;
window.exportPDF = exportPDF;
window.changePage = changePage;
window.addCategory = addCategory;
window.deleteCategory = deleteCategory;
window.saveBudget = saveBudget;
window.saveEdit = saveEdit;
window.closeModal = closeModal;
window.toggleTheme = toggleTheme;
window.changeTheme = changeTheme;
window.renderExpenses = renderExpenses;
window.deleteExpense = deleteExpense;
window.editExpense = editExpense;
window.viewImage = viewImage;
