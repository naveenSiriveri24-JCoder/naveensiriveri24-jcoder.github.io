const API_URL =
    "https://script.google.com/macros/s/AKfycbwdzL_n2092MBD736JtuIYcINKsHcsyus4k60TsUf30W5KP_p9WKQQ3g6mrRR2FVjs/exec";

async function loadExpensesFromSheet(){

    try{

        const response =
            await fetch(API_URL);

        const data =
            await response.json();

        expenses = data;

        renderExpenses();

    }catch(error){

        console.error(
            "Error loading expenses:",
            error
        );
    }
}

async function saveExpenseToSheet(expense){

    try{

        await fetch(API_URL, {

            method: "POST",

            body: JSON.stringify(expense)

        });

        console.log(
            "Expense sent to Google Sheet"
        );

    }catch(error){

        console.error(
            "POST Error:",
            error
        );
    }
}

async function deleteExpenseFromSheet(id){

    await fetch(API_URL, {

        method: "POST",

        body: JSON.stringify({

            action: "delete",

            id: id

        })

    });
}

async function updateExpenseInSheet(expense){

    await fetch(API_URL, {

        method: "POST",

        body: JSON.stringify({

            action: "update",

            id: expense.id,

            title: expense.title,

            amount: expense.amount,

            category: expense.category,

            date: expense.date

        })

    });
}