import { db }
from "./firebase.js";

import {
    collection,
    getDocs
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const pinBoxes =
    document.querySelectorAll(
        ".pin-box"
    );

pinBoxes.forEach(
    (box, index) => {

        box.addEventListener(
            "input",
            () => {

                if(
                    box.value &&
                    index < 3
                ){

                    pinBoxes[
                        index + 1
                    ].focus();
                }
            }
        );
    }
);

async function verifyPin(){

    const pin =
        [...document.querySelectorAll(
            ".pin-box"
        )]
        .map(
            box => box.value
        )
        .join("");

    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );

        let valid = false;
        let userName = "";

        snapshot.forEach(doc => {

            const user =
                doc.data();

            if(
                user.pin === pin
            ){

                valid = true;

                userName =
                    user.name;
            }
        });

        if(valid){

            sessionStorage.setItem(
                "loggedIn",
                "true"
            );

            sessionStorage.setItem(
                "userName",
                userName
            );

            showToast(
                `✅ Welcome ${userName}`,
                "success"
            );

            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1000);

        }
        else{

            showToast(
                "❌ Invalid PIN",
                "error"
            );
        }

    }
    catch(error){

        console.error(
            error
        );

        showToast(
            "❌ Unable to verify PIN",
            "error"
        );
    }
}

document
    .getElementById(
        "verifyBtn"
    )
    .addEventListener(
        "click",
        verifyPin
    );

const texts = [
    "Track Expenses.",
    "Manage Budget.",
    "Save Money.",
    "Achieve Goals."
];

let index = 0;

setInterval(() => {

    index =
        (index + 1) %
        texts.length;

    document.getElementById(
        "changingText"
    ).textContent =
        texts[index];

}, 1300);

function showToast(
    message,
    type = "error"
){

    const toast =
        document.getElementById(
            "toast"
        );

    toast.textContent =
        message;

    toast.className =
        `toast show ${type}`;

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);
}