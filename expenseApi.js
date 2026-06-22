import { db }
from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc
}

from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";



export async function saveExpense(
    expense
){

    await addDoc(
        collection(
            db,
            "expenses"
        ),
        expense
    );
}

export async function loadExpenses(){

    const snapshot =
        await getDocs(
            collection(
                db,
                "expenses"
            )
        );

    const expenses = [];

    snapshot.forEach(doc => {

        expenses.push({

            id: doc.id,

            ...doc.data()

        });

    });

    return expenses;
}

export async function deleteExpenseById(
    id
){

    await deleteDoc(

        doc(
            db,
            "expenses",
            id
        )

    );
}

export async function updateExpenseById(
    id,
    expense
){

    await updateDoc(

        doc(
            db,
            "expenses",
            id
        ),

        expense

    );
}