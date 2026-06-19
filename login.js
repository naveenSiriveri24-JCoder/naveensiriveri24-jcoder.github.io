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

        const response =
            await fetch(
                `https://script.google.com/macros/s/AKfycbySuY4-SQmiAIgkOIHSR3cwXifRXvQTfbOpVtYY6JROGtQU64KKruy3wn0er9RjB-beKQ/exec?pin=${pin}`
            );

        const result =
            await response.json();

        console.log(result);

        if(result.success){

            sessionStorage.setItem(
                "loggedIn",
                "true"
            );
                            showToast(
                    "✅ Login Successful",
                    "success"
                );

                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 1000);
            window.location.href =
                "index.html";
        }
        else{

            showToast(
                "❌ Invalid PIN",
                "error"
            );
        }

    }
    catch(error){

        console.error(error);

        alert(
            "Unable to verify PIN"
        );
    }
}

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