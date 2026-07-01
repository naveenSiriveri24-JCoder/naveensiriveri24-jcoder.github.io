import { auth, db }
from "./firebase.js";


import {
    doc,
    getDoc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

onAuthStateChanged(

    auth,

    async user => {

        if(user){

            await init();

        }else{

            window.location.replace(
                "index.html"
            );
        }
    }
);

import {
    signOut
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

async function logout(){

    await signOut(auth);

    window.location.replace(
        "index.html"
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

    await loadUserProfile();

    categories =
        currentUserData.categories || categories;

    await renderCategories();

    renderExpenses();

    renderDashboard();

}

let currentUserName = "";
let currentUserData = {};
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

async function saveCategories(){

    await updateDoc(

        doc(
            db,
            "users",
            auth.currentUser.uid
        ),

        {
            categories: categories
        }

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
            `<i class="fa-solid fa-triangle-exclamation"></i> Please fill all required fields` 
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
        showToast(`<i class="fa-solid fa-triangle-exclamation"></i> Please fill all fields`);
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

    createdAt: Date.now(), // Used only for sorting

    userId:
    auth.currentUser.uid

};
try{

await saveExpense(
    expense
);

showToast(
    `<i class="fa-solid fa-check"></i> Expense Added Successfully`,
    "success"
);
}
 catch(error){

    showToast(
        `<i class="fa-solid fa-circle-xmark"></i> Failed to Add Expense`,
        "error"
    );
}

expenses =
    await loadExpenses();

renderExpenses();

renderDashboard();

clearForm();
}
window.addExpense = addExpense;

function renderExpenses() {

 /* Show newest expenses first */

    expenses.sort((a, b) => {

        const timeA = a.createdAt || new Date(a.date).getTime();

        const timeB = b.createdAt || new Date(b.date).getTime();

        return timeB - timeA;

    });

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

    const totalPages = Math.max(
        1,
        Math.ceil(filteredExpenses.length / recordsPerPage)
    );

    if(currentPage < 1){

        currentPage = 1;

    }

    if(currentPage > totalPages){

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
    currentUserData.monthlyBudgets || {};

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
        `<i class="fa-solid fa-trash"></i> Expense Deleted`
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

        const existingExpense = expenses.find(
            expense => expense.id === id
        );
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
            ).value,
        
        /* Preserve original creation time */

         createdAt: existingExpense.createdAt || Date.now()

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
        `<i class="fa-solid fa-check-double"></i> Expense Updated`,
        "success"
    );
}
function lightenColor(hex, percent){

    hex = hex.replace("#","");

    let r = parseInt(hex.substring(0,2),16);
    let g = parseInt(hex.substring(2,4),16);
    let b = parseInt(hex.substring(4,6),16);

    r = Math.min(255, Math.floor(r + (255-r) * percent/100));
    g = Math.min(255, Math.floor(g + (255-g) * percent/100));
    b = Math.min(255, Math.floor(b + (255-b) * percent/100));

    return `rgb(${r},${g},${b})`;
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
const colors = [

"#2E7D32",
"#1565C0",
"#EF6C00",
"#C2185B",
"#6A1B9A",
"#00695C",
"#5D4037",
"#283593",
"#00838F",
"#F9A825",
"#8BC34A",
"#E91E63",
"#3F51B5",
"#795548",
"#009688",
"#9C27B0",
"#FF5722",
"#607D8B",
"#FFC107",
"#CDDC39"

];
const gradients = [];

colors.forEach(color => {

    const gradient =
        ctx.createLinearGradient(
            0,0,300,300
        );

    gradient.addColorStop(
        0,
        lightenColor(color,35)
    );

    gradient.addColorStop(
        1,
        color
    );

    gradients.push(gradient);

});

const legendGradients = colors.map(color =>
    `linear-gradient(135deg, ${lightenColor(color, 35)}, ${color})`
);

    expenseChart =
        new Chart(canvas, {

        type: "pie",

        data: {

            labels: labels,

            datasets: [{

                data: values,

                backgroundColor: labels.map(
                                (_, index) => gradients[index % gradients.length]),

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
                            background:${legendGradients[index % legendGradients.length]};
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
    "#fb7164"
);

gradient.addColorStop(
    .5,
    "#fbd918"
);

gradient.addColorStop(
    1,
    "#03ab43"
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
    "#1fbaf7"
);

gradient2.addColorStop(
    1,
    "#ff030c"
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

async function renderCategories(){

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

async function addCategory(){

    const input =
        document.getElementById("categoryInput");

    const category =
        input.value.trim();

    if(!category){
        showToast(`<i class="fa-solid fa-triangle-exclamation"></i> Enter Category name`);
        return;
    }

    if(categories.includes(category)){
       showToast(`<i class="fa-solid fa-triangle-exclamation"></i> Category already exists`);
        return;
    }
    try{
    categories.push(category);
    showToast(
    `<i class="fa-solid fa-check"></i> Category Added Successfully`,
    "success"
    );
    }catch(error){

    }
    
    await saveCategories();

    await renderCategories();

    input.value = "";
}

async function deleteCategory(){

    const category =
        document.getElementById(
            "categoryDelete"
        ).value;

    const used =
        expenses.some(
            expense => expense.category === category
        );

    if(used){

        showToast(
            `<i class="fa-solid fa-triangle-exclamation"></i> Cannot delete category because expenses are using it`,
            "warning"
        );

        return;

    }

    categories =
        categories.filter(
            c => c !== category
        );

    try{

        await saveCategories();

        await renderCategories();

        showToast(
            `<i class="fa-solid fa-trash-can"></i> Category deleted successfully`,
            "success"
        );

    }
    catch(error){

        console.error(error);

        showToast(
            `<i class="fa-solid fa-circle-xmark"></i> Failed to delete category`,
            "error"
        );

    }

}

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


function drawWatermark(doc){

    doc.setGState(
        new doc.GState({
            opacity:0.22
        })
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(70);

    doc.setTextColor(
        170,
        170,
        170
    );

    doc.text(
        "ExpenseFlow",
        130,
        200,
        {
            angle:40,
            align:"center"
        }
    );

    doc.setGState(
        new doc.GState({
            opacity:1
        })
    );

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



/* REPORT HEADER */

doc.setFillColor(
    104,
    159,
    56
);

doc.roundedRect(
    10,
    10,
    190,
    22,
    5,
    5,
    "F"
);

/* Gloss Highlight */

doc.setFillColor(
    255,
    255,
    255
);

doc.setGState(
    new doc.GState({
        opacity:0.20
    })
);

doc.roundedRect(
    10,
    10,
    190,
    6,
    5,
    5,
    "F"
);

doc.setGState(
    new doc.GState({
        opacity:1
    })
);

/* Border */

doc.setDrawColor(
    30,
    90,
    40
);

doc.roundedRect(
    10,
    10,
    190,
    22,
    5,
    5
);

/* Small App Name */

doc.setFont(
    "helvetica",
    "bold"
);

doc.setFontSize(10);

doc.setTextColor(
    220,
    255,
    220
);

doc.text(
    "ExpenseFlow",
    105,
    14,
    {
        align:"center"
    }
);

/* Main Heading */

doc.setFont(
    "helvetica",
    "bold"
);

doc.setFontSize(20);

doc.setTextColor(
    255,
    255,
    255
);

doc.text(

    "Expense Report",

    105,

    25,

    {

        align:"center"

    }

);

/* Report Period */


doc.setFont(
    "helvetica",
    "bold"
);

doc.setFontSize(
    12
);

doc.setTextColor(
    80,
    80,
    80
);

doc.text(

    selectedMonth

    ?

    `Report Period : ${selectedMonth}`

    :

    "Report Period : All Expenses",

    15,

    38

);

/* Divider Line */

doc.setDrawColor(
    220,
    220,
    220
);

doc.line(
    15,
    42,
    200,
    42
);

    /* SUMMARY CARD FUNCTION */

 function drawCard(
    x,
    y,
    title,
    value,
    color
){

    /* Card Background */

    doc.setFillColor(...color);

    doc.roundedRect(

        x,
        y,
        44,
        28,
        4,
        4,
        "F"

    );

    /* Gloss Highlight */

    doc.setFillColor(
        255,
        255,
        255
    );

    doc.roundedRect(

        x,
        y,
        44,
        8,
        4,
        4,
        "F"

    );

    /* Border */

    doc.setDrawColor(
        220,
        220,
        220
    );

    doc.roundedRect(

        x,
        y,
        44,
        28,
        4,
        4

    );

    /* Title */

    doc.setFont(

        "helvetica",

        "bold"

    );

    doc.setFontSize(10);

    doc.setTextColor(80);

    doc.text(

        title,

        x + 22,

        y + 6,

        {

            align:"center"

        }

    );

    /* Value */

    doc.setFontSize(12);

    doc.setTextColor(

        30,

        90,

        40

    );

    doc.text(

        String(value),

        x + 22,

        y + 19,

        {

            align:"center"

        }

    );

}

drawCard(
    12,
    40,
    "Total Bills",
    filteredExpenses.length,
    [232,245,233]
);

drawCard(
    60,
    40,
    "Total Expense",
    `Rs. ${total.toLocaleString()}`,
    [227,242,253]
);

drawCard(
    108,
    40,
    "Top Category",
    highestCategory,
    [255,243,224]
);

drawCard(
    156,
    40,
    "Average",
    `Rs. ${average.toLocaleString()}`,
    [248,232,255]
);

    /* TREND CHART TITLE */

/* Header Background */

doc.setFillColor(
    232,
    245,
    233
);

doc.roundedRect(
    10,
    70,
    190,
    10,
    4,
    4,
    "F"
);

/* Gloss Effect */

doc.setFillColor(
    255,
    255,
    255
);

doc.roundedRect(
    10,
    70,
    190,
    3,
    4,
    4,
    "F"
);

/* Header Border */

doc.setDrawColor(
    210,
    210,
    210
);

doc.roundedRect(
    10,
    70,
    190,
    10,
    4,
    4
);

/* Heading */

doc.setFont(
    "helvetica",
    "bold"
);

doc.setFontSize(13);

doc.setTextColor(
    46,
    125,
    50
);

doc.text(
    "Monthly Expense Trend",
    16,
    76.5
);

/* ==========================================
   UPDATE CHART
========================================== */

if(trendChart){

    trendChart.update();

}

/* ==========================================
   GET CHART IMAGE
========================================== */

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

/* ==========================================
   CHART CARD
========================================== */

if(trendImage){

    /* Background */

    doc.setFillColor(
        252,
        252,
        252
    );

    doc.roundedRect(
        10,
        82,
        190,
        68,
        5,
        5,
        "F"
    );

    /* Border */

    doc.setDrawColor(
        220,
        220,
        220
    );

    doc.roundedRect(
        10,
        82,
        190,
        68,
        5,
        5
    );

    /* Chart */

    doc.addImage(

        trendImage,

        "PNG",

        15,

        86,

        180,

        60

    );

}


/* TABLE TITLE */

/* Header Background */

doc.setFillColor(
    232,
    245,
    233
);

doc.roundedRect(
    10,
    154,
    190,
    10,
    4,
    4,
    "F"
);

/* Gloss Effect */

doc.setFillColor(
    255,
    255,
    255
);

doc.roundedRect(
    10,
    153,
    190,
    3,
    4,
    4,
    "F"
);

/* Border */

doc.setDrawColor(
    210,
    210,
    210
);

doc.roundedRect(
    10,
    153,
    190,
    10,
    4,
    4
);

/* Heading */

doc.setFont(
    "helvetica",
    "bold"
);

doc.setFontSize(13);

doc.setTextColor(
    46,
    125,
    50
);

doc.text(
    "Expense Details",
    17,
    159
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

    startY:165,

    margin:{

        left:10,

        right:10

    },

    tableWidth:"auto",

    theme:"striped",

    head:[[
        "Title",
        "Amount",
        "Category",
        "Date"
    ]],

    body:rows,

headStyles:{

    fillColor:[
        255,
        183,
        77
    ],

    textColor:255,

    fontStyle:"bold",

    fontSize:13,

    cellPadding:3,

    halign:"center",

    valign:"middle",

    lineWidth:0

},

    bodyStyles:{

        textColor:60,

        fontSize:9,

        cellPadding:3,

        valign:"middle"

    },

    alternateRowStyles:{

        fillColor:[
            247,
            250,
            247
        ]

    },

styles:{

    overflow:"linebreak",

    lineWidth:0,

    lineColor:[
        255,
        255,
        255
    ]

},

    columnStyles:{

        0:{
            cellWidth:70,
            halign:"left"
        },

        1:{
            cellWidth:35,
            halign:"center"
        },

        2:{
            cellWidth:45,
            halign:"center"
        },

        3:{
            cellWidth:40,
            halign:"center"
        }

    },

    tableLineWidth:0,

    tableLineColor:[
        255,
        255,
        255
    ],



});

    /* FOOTER */

const footerY =
    doc.lastAutoTable.finalY + 18;

doc.setDrawColor(
    220,
    220,
    220
);

doc.line(
    10,
    footerY - 6,
    200,
    footerY - 6
);

doc.setFont(
    "helvetica",
    "italic"
);

doc.setFontSize(9);

doc.setTextColor(120);

doc.text(

    `Generated on ${new Date().toLocaleString()}`,

    12,

    footerY

);

doc.text(

    "ExpenseFlow • Version 1.0.0",

    200,

    footerY,

    {

        align:"right"

    }

);

const totalPages = doc.getNumberOfPages();

for(let page = 1; page <= totalPages; page++){

    doc.setPage(page);

    drawWatermark(doc);

}
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
async function saveBudget(){

    const budget = Number(

        document.getElementById(
            "monthlyBudget"
        ).value

    );

    const selectedMonth =
        document.getElementById(
            "monthFilter"
        ).value;

    if(!currentUserData.monthlyBudgets){

        currentUserData.monthlyBudgets = {};

    }

    currentUserData.monthlyBudgets[selectedMonth] = budget;

    try{

        await updateDoc(

            doc(
                db,
                "users",
                auth.currentUser.uid
            ),

            {
                monthlyBudgets:
                    currentUserData.monthlyBudgets
            }

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

        showToast(
            `<i class="fa-solid fa-circle-check"></i> Budget saved successfully`,
            "success"
        );

    }
    catch(error){

        console.error(error);

        showToast(
            `<i class="fa-solid fa-circle-xmark"></i> Failed to save budget`,
            "error"
        );

    }

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

function showToast(
    message,
    type = "error"
){

    const toast =
        document.getElementById("toast");

    /* Remove previous types */

    toast.classList.remove(
        "success",
        "error",
        "warning",
        "info"
    );

    /* Add current type */

    toast.classList.add(type);

    toast.innerHTML = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 1000);

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
window.logout = logout;

if(
    "serviceWorker" in navigator
){

    navigator.serviceWorker
        .register("sw.js")
        .then(() => {

            console.log(
                "Service Worker Registered"
            );
        });
}

const networkBanner =
    document.getElementById(
        "networkBanner"
    );

const networkText =
    document.getElementById(
        "networkText"
    );

let bannerTimer;

function showNetworkBanner(
    message,
    status
){

    networkText.textContent =
        message;

    networkBanner.className =
        `network-banner show ${status}`;

    clearTimeout(
        bannerTimer
    );

    if(
        status === "online"
    ){

        bannerTimer =
            setTimeout(() => {

                networkBanner.classList.remove(
                    "show"
                );

            }, 1000);
    }
}

function closeNetworkBanner(){

    networkBanner.classList.remove(
        "show"
    );
}

window.addEventListener(
    "online",
    () => {

        showNetworkBanner(
            "🟢 Internet Connected",
            "online"
        );
    }
);

window.addEventListener(
    "offline",
    () => {

        showNetworkBanner(
            "🔴 No Internet Connection..! Check Your Network",
            "offline"
        );
    }
);

window.addEventListener(
    "load",
    () => {

        if(
            !navigator.onLine
        ){

            showNetworkBanner(
                "🔴 No Internet Connection..! Check Your Network",
                "offline"
            );
        }
    }
);
window.closeNetworkBanner = closeNetworkBanner;

async function loadUserProfile(){

    try{

        const uid =
            auth.currentUser.uid;

        const snapshot =
            await getDoc(

                doc(
                    db,
                    "users",
                    uid
                )
            );

        if(!snapshot.exists()){

            console.log(
                "User profile not found."
            );

            return;
        }

        const user =
            snapshot.data();

        currentUserData = user;
        console.log(currentUserData);
        currentUserName = user.name;

        document.getElementById(
            "headerUserName"
        ).textContent =
            user.name;

        document.getElementById(
            "profileName"
        ).textContent =
            user.name;

        document.getElementById(
            "profileEmail"
        ).textContent =
            user.email;

        document.getElementById(
            "profileMobile"
        ).textContent =
            user.mobile;

        document.getElementById(
            "profileUid"
        ).textContent =
            uid;

        if(user.createdAt){

            document.getElementById(
                "profileJoined"
            ).textContent =
                user.createdAt.toDate().toLocaleDateString();

        }else{

            document.getElementById(
                "profileJoined"
            ).textContent =
                "-";
        }

    }
    catch(error){

        console.error(
            error
        );
    }
}

function openProfile(){

    document
        .getElementById(
            "profileModal"
        )
        .classList.add(
            "show"
        );
         document.body.style.overflow = "hidden";
}

function closeProfile(){

    document
        .getElementById(
            "profileModal"
        )
        .classList.remove(
            "show"
        );
        document.body.style.overflow = "auto";
}

window.openProfile =
    openProfile;

window.closeProfile =
    closeProfile;

function openAbout(){

    document
        .getElementById(
            "aboutModal"
        )
        .classList.add(
            "show"
        );
        document.body.style.overflow = "hidden";
}

function closeAbout(){

    document
        .getElementById(
            "aboutModal"
        )
        .classList.remove(
            "show"
        );
        document.body.style.overflow = "auto";
}

window.openAbout =
    openAbout;

window.closeAbout =
    closeAbout;


/* for JSON backup */
async function exportBackup(){

    try{

        const user = auth.currentUser;

        if(!user){

            showToast(
                `<i class="fa-solid fa-circle-xmark"></i> User not logged in.`,
                "error"
            );

            return;

        }


        /* Current Date & Time */

        const now = new Date();
        const safeUserName = currentUserName
                        .trim()
                        .replace(/\s+/g, "_")
                        .replace(/[^a-zA-Z0-9_-]/g, "");
        /* Backup JSON */

        const backup={

            app:"ExpenseFlow",

            version:"1.0.0",

            backupDate:now.toISOString(),

            uid: auth.currentUser.uid,

            userName: currentUserName,

            userEmail:user.email,

            totalRecords:expenses.length,

            expenses:expenses

        };

        /* Filename */

        const filename=

            `ExpenseFlow_Backup_${safeUserName}_${
                now.getFullYear()
            }-${
                String(now.getMonth()+1).padStart(2,"0")
            }-${
                String(now.getDate()).padStart(2,"0")
            }_${
                String(now.getHours()).padStart(2,"0")
            }-${
                String(now.getMinutes()).padStart(2,"0")
            }-${
                String(now.getSeconds()).padStart(2,"0")
            }.json`;

        /* Download */

        const blob=new Blob(

            [

                JSON.stringify(

                    backup,

                    null,

                    2

                )

            ],

            {

                type:"application/json"

            }

        );

        const url=

            URL.createObjectURL(blob);

        const link=

            document.createElement("a");

        link.href=url;

        link.download=filename;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        showToast(

            `<i class="fa-solid fa-circle-check"></i> Backup exported successfully.`,

            "success"

        );

    }

    catch(error){

        console.error(error);

        showToast(

            `<i class="fa-solid fa-circle-xmark"></i> Backup export failed.`,

            "error"

        );

    }

}

window.exportBackup = exportBackup;

