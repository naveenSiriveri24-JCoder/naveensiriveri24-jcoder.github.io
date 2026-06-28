import { auth }
from "./firebase.js";

import {
    signInWithEmailAndPassword,
    setPersistence,
    browserSessionPersistence
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    db
}
from "./firebase.js";

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

        box.addEventListener(
            "keydown",
            e => {

                if(
                    e.key === "Backspace" &&
                    !box.value &&
                    index > 0
                ){

                    pinBoxes[
                        index - 1
                    ].focus();
                }
            }
        );
    }
);

async function verifyPin(){
const pinBoxes = [...document.querySelectorAll(".pin-box")];
const pin = pinBoxes
    .map(box => box.value)
    .join("");

    if(pin.length !== 4){

        showToast(
            `<i class="fa-solid fa-circle-xmark"></i> Enter Your Complete PIN`,
            "error"
        );

        return;
    }

    try{

        await setPersistence(
            auth,
            browserSessionPersistence
        );

        const pinDoc =
                        await getDoc(

                            doc(
                                db,
                                "loginPins",
                                pin
                            )
                        );

                    if(
                        !pinDoc.exists()
                    ){
                            /* Clear all PIN boxes */

                            pinBoxes.forEach(box => {

                                box.value = "";

                            });

                            /* Focus first box */

                            pinBoxes[0].focus();

                        showToast(
                            `<i class="fa-solid fa-xmark"></i> Invalied PIN`,
                            "error"
                        );

                        return;
                    }

                    const email =
                        pinDoc.data().email;

                    await signInWithEmailAndPassword(

                        auth,

                        email,

                        pin + "MBT@2026"

                    );

        showToast(
            `<i class="fa-solid fa-circle-check"></i>
            Login Successful`,
            "success"
        );

        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 700);

    }
    catch(error){

        console.error(error);

        showToast(
            `<i class="fa-solid fa-circle-xmark"></i> Invalied PIN`,
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

    }, 3000);

}

window.addEventListener(
    "pageshow",
    () => {

        document
            .querySelectorAll(
                ".pin-box"
            )
            .forEach(box => {

                box.value = "";
            });

        pinBoxes[0].focus();
    }
);

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