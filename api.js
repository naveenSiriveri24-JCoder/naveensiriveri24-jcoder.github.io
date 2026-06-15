const API_URL =
    "https://script.google.com/macros/s/AKfycbx00S2VqAy6yBe1eybyQfHkbDh0VxlsW8wH3hTaNhLld88f6xZhjCeaqBLqgut86AVE/exec";

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

    }catch(error){

        console.error(error);
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