import { db }
from "./firebase.js";

import {

    collection,

    addDoc

}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
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



console.log(auth.currentUser);
async function importData(){

    const pin =

        document
        .getElementById(
            "pin"
        )
        .value
        .trim();

    if(pin.length !== 4){

        alert(
            "Enter 4 Digit PIN"
        );

        return;
    }

    try{

        const pinSnapshot =

            await getDoc(

                doc(
                    db,
                    "loginPins",
                    pin
                )
            );

        if(!pinSnapshot.exists()){

            alert(
                "Invalid PIN"
            );

            return;
        }

        const email =
            pinSnapshot.data().email;

        await signInWithEmailAndPassword(

            auth,

            email,

            pin + "MBT@2026"

        );

        console.log(

            "Logged in as",

            auth.currentUser.uid

        );

        const file =

            document
            .getElementById(
                "jsonFile"
            )
            .files[0];

        if(!file){

            alert(
                "Select JSON File"
            );

            return;
        }

        const text =
            await file.text();

        const expenses =
            JSON.parse(text);

        for(const expense of expenses){

            expense.userId =
                auth.currentUser.uid;

            await addDoc(

                collection(
                    db,
                    "expenses"
                ),

                expense

            );
        }

        alert(

            "✅ Import Successful"

        );

    }
    catch(error){

        console.error(error);

        alert(error.message);
    }
}

window.importData=importData;

const uploadBox=document.getElementById("uploadBox");

const jsonFile=document.getElementById("jsonFile");

const fileName=document.getElementById("fileName");

const fileSize=document.getElementById("fileSize");

const removeBtn=document.getElementById("removeFileBtn");

const importBtn=document.querySelector(".import-btn");

/* Disable initially */

importBtn.disabled=true;

function updateFile(file){

    if(!file){

        fileName.textContent="No file selected";

        fileSize.textContent="";

        document.getElementById("selectedFile").style.display="none";

        importBtn.disabled=true;

        return;

    }

    if(file.name.split(".").pop().toLowerCase()!=="json"){

        alert("Only JSON files are allowed.");

        jsonFile.value="";

        updateFile(null);

        return;

    }

    /* Optional: 10 MB limit */

    if(file.size>10*1024*1024){

        alert("Maximum file size is 10 MB.");

        jsonFile.value="";

        updateFile(null);

        return;

    }

    fileName.textContent = file.name;

    fileSize.textContent=
        (file.size/1024).toFixed(2)+" KB";

    document.getElementById("selectedFile").style.display="flex";

    importBtn.disabled=false;

}

/* Browse */

jsonFile.addEventListener("change",()=>{

    updateFile(jsonFile.files[0]);

});

/* Remove */

removeBtn.addEventListener("click",()=>{

    jsonFile.value="";

    updateFile(null);

});

/* Drag Events */
uploadBox.addEventListener("dragenter",(e)=>{

    e.preventDefault();

    uploadBox.classList.add("dragover");

});

uploadBox.addEventListener("dragover",(e)=>{

    e.preventDefault();

});

uploadBox.addEventListener("dragleave",(e)=>{

    if(!uploadBox.contains(e.relatedTarget)){

        uploadBox.classList.remove("dragover");

    }

});

uploadBox.addEventListener("drop",(e)=>{

    e.preventDefault();

    uploadBox.classList.remove("dragover");

    const files=e.dataTransfer.files;

    if(files.length===0) return;

    const file=files[0];

    const extension=file.name.split(".").pop().toLowerCase();

    if(extension!=="json"){

        alert("Please select a JSON file.");

        return;

    }

    jsonFile.files=files;

    updateFile(file);

});