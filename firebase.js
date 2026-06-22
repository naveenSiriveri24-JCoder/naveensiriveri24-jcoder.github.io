import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { getStorage }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

const firebaseConfig = {

    apiKey:
        "AIzaSyBV5xffgdbeQ4R6wuQa3VC97Pg4dI_jFDk",

    authDomain:
        "expense-tracker-6412b.firebaseapp.com",

    projectId:
        "expense-tracker-6412b",

    storageBucket:
        "expense-tracker-6412b.firebasestorage.app",

    messagingSenderId:
        "652987652417",

    appId:
        "1:652987652417:web:ed36317e16a965c057a9c0"

};

const app =
    initializeApp(
        firebaseConfig
    );

export const db =
    getFirestore(app);

export const storage =
    getStorage(app);