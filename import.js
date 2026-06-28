/* ------------------------------
   Global Variables
------------------------------ */

const uploadBox =
    document.getElementById("uploadBox");

const jsonFile =
    document.getElementById("jsonFile");

const fileName =
    document.getElementById("fileName");

const fileSize =
    document.getElementById("fileSize");

const removeBtn =
    document.getElementById("removeFileBtn");

const importBtn =
    document.querySelector(".import-btn");

const pinInput =
    document.getElementById("pin");

const selectedFile =
    document.getElementById("selectedFile");

let backupData = null;

let currentUser = null;

let importing = false;

const progress =
    document.getElementById("importProgress");

progress.style.display = "block";

document.getElementById("progressFill").style.width = "0%";

document.getElementById("progressText").textContent =
    "Preparing import...";

/* Disable Import initially */

importBtn.disabled = true;

onAuthStateChanged(

    auth,

    async user => {

        if (!user) {

            window.location.replace(
                "index.html"
            );

            return;

        }

        currentUser = user;

        await init();

    }

);

async function init() {

    validateImportButton();

}

function validateImportButton() {

    const hasFile =
        backupData !== null;

    const validPin =
        /^\d{4}$/.test(
            pinInput.value.trim()
        );

    importBtn.disabled =
        !(hasFile && validPin);

}

pinInput.addEventListener(

    "input",

    validateImportButton

);

removeBtn.addEventListener(

    "click",

    () => {

        jsonFile.value = "";

        backupData = null;

        fileName.textContent =
            "No file selected";

        fileSize.textContent =
            "";

        selectedFile.style.display =
            "none";

        validateImportButton();

        showToast(

            "File removed.",

            "info"

        );

    }

);

function showToast(

    message,

    type = "info"

) {

    const toast =
        document.getElementById(
            "toast"
        );

    toast.className =
        "toast";

    toast.classList.add(
        type
    );

    let icon = "";

    switch (type) {

        case "success":

            icon =
                '<i class="fa-solid fa-circle-check"></i>';

            break;

        case "error":

            icon =
                '<i class="fa-solid fa-circle-xmark"></i>';

            break;

        case "warning":

            icon =
                '<i class="fa-solid fa-triangle-exclamation"></i>';

            break;

        default:

            icon =
                '<i class="fa-solid fa-circle-info"></i>';

    }

    toast.innerHTML =
        `${icon}<span>${message}</span>`;

    toast.classList.add(
        "show"
    );

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);

}

async function updateFile(file){

    backupData = null;

    if(!file){

        fileName.textContent =
            "No file selected";

        fileSize.textContent = "";

        selectedFile.style.display =
            "none";

        validateImportButton();

        return;

    }

    /* File Extension */

    if(!file.name.toLowerCase().endsWith(".json")){

        showToast(

            "Only JSON backup files are allowed.",

            "error"

        );

        jsonFile.value="";

        return;

    }

    /* Max Size : 10 MB */

    if(file.size > 10 * 1024 * 1024){

        showToast(

            "Backup file exceeds 10 MB.",

            "error"

        );

        jsonFile.value="";

        return;

    }

    try{

        const text =
            await file.text();

        const backup =
            JSON.parse(text);

        /* -------- App -------- */

        if(backup.app !== "ExpenseFlow"){

            throw new Error(
                "This is not an ExpenseFlow backup."
            );

        }

        /* -------- Version -------- */

        if(backup.version !== "1.0.0"){

            throw new Error(
                "Unsupported backup version."
            );

        }

        /* -------- Expenses -------- */

        if(!Array.isArray(backup.expenses)){

            throw new Error(
                "Expenses section missing."
            );

        }

        /* -------- Count -------- */

        if(

            backup.totalRecords !==

            backup.expenses.length

        ){

            throw new Error(
                "Backup appears corrupted."
            );

        }

        /* -------- Current User -------- */

        const userDoc =
            await getDoc(

                doc(

                    db,

                    "users",

                    currentUser.uid

                )

            );

        if(!userDoc.exists()){

            throw new Error(
                "Unable to verify current user."
            );

        }

        const current =
            userDoc.data();

        /* -------- UID -------- */

        if(

            backup.uid &&

            backup.uid !== currentUser.uid

        ){

            throw new Error(
                "Backup belongs to another account."
            );

        }

        /* -------- Email -------- */

        if(

            backup.userEmail.toLowerCase()

            !==

            current.email.toLowerCase()

        ){

            throw new Error(

                "Backup email doesn't match."

            );

        }

        /* -------- Username -------- */

        if(

            backup.userName.trim()

            !==

            current.name.trim()

        ){

            throw new Error(

                "Backup username doesn't match."

            );

        }

        backupData = backup;

        fileName.textContent =
            file.name;

        fileSize.textContent =
            `${(

                file.size / 1024

            ).toFixed(2)} KB`;

        selectedFile.style.display =
            "flex";

        validateImportButton();

        showToast(

            "Backup verified successfully.",

            "success"

        );

    }

    catch(error){

        backupData = null;

        jsonFile.value="";

        selectedFile.style.display =
            "none";

        validateImportButton();

        showToast(

            error.message,

            "error"

        );

    }

}

jsonFile.addEventListener("change",()=>{

    updateFile(jsonFile.files[0]);

});

jsonFile.addEventListener(

    "change",

    async()=>{

        if(jsonFile.files.length){

            await updateFile(

                jsonFile.files[0]

            );

        }

    }

);

uploadBox.addEventListener(

    "drop",

    async(e)=>{

        e.preventDefault();

        uploadBox.classList.remove(

            "dragover"

        );

        if(

            !e.dataTransfer.files.length

        ) return;

        const file =

            e.dataTransfer.files[0];

        jsonFile.files =

            e.dataTransfer.files;

        await updateFile(file);

    }

);

async function importData(){

    if(importing) return;

    importing = true;

    importBtn.disabled = true;
     const progress =
        document.getElementById("importProgress");

    progress.style.display = "block";

    document.getElementById("progressFill").style.width = "0%";

    document.getElementById("progressText").textContent =
        "Preparing import...";
    try{

        /* -------------------------
           Validate Backup
        ------------------------- */

        if(!backupData){

            showToast(

                "Select a valid backup file.",

                "error"

            );

            importing = false;

            validateImportButton();

            return;

        }

        /* -------------------------
           Validate PIN
        ------------------------- */

        const pin =

            pinInput.value.trim();

        if(!/^\d{4}$/.test(pin)){

            showToast(

                "Enter a valid 4-digit PIN.",

                "error"

            );

            importing = false;

            validateImportButton();

            return;

        }

        showToast(

            "Verifying PIN...",

            "info"

        );

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

        if(!pinDoc.exists()){

            showToast(

                "Invalid PIN.",

                "error"

            );

            importing = false;

            validateImportButton();

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

            "Checking existing expenses...",

            "info"

        );

        /* -------------------------
           Existing Expenses
        ------------------------- */

        const existingSnapshot =

            await getDocs(

                query(

                    collection(

                        db,

                        "expenses"

                    ),

                    where(

                        "userId",

                        "==",

                        currentUser.uid

                    )

                )

            );

const existingKeys = new Set();

existingSnapshot.forEach(doc=>{

    const e = doc.data();

    const key = [

        e.title ?? "",

        e.amount ?? "",

        e.category ?? "",

        e.date ?? "",

        e.paymentMode ?? "",

        e.description ?? ""

    ].join("|");

    existingKeys.add(key);

});

        let imported = 0;

        let skipped = 0;

        let batch =

            writeBatch(db);

        let operationCount = 0;

        /* -------------------------
           Import Loop
        ------------------------- */

        for(const expense of backupData.expenses){

const expenseKey = [

    expense.title ?? "",

    expense.amount ?? "",

    expense.category ?? "",

    expense.date ?? "",

    expense.paymentMode ?? "",

    expense.description ?? ""

].join("|");

if(existingKeys.has(expenseKey)){

    skipped++;

    continue;

}

            if(duplicate){

                skipped++;

                continue;

            }

            const ref =

                doc(

                    collection(

                        db,

                        "expenses"

                    )

                );

            batch.set(

                ref,

                {

                    ...expense,

                    userId:

                        currentUser.uid

                }

            );

            imported++;

            operationCount++;

            /* -------------------------
               Firestore Limit
            ------------------------- */

            if(operationCount===450){

                await batch.commit();

                batch =

                    writeBatch(db);

                operationCount = 0;

            }

        }

        if(operationCount>0){

            await batch.commit();

        }

        /* -------------------------
           Success
        ------------------------- */

        showToast(

            `Imported ${imported}, Skipped ${skipped}`,

            "success"

        );

        /* -------------------------
           Reset UI
        ------------------------- */

        jsonFile.value="";

        pinInput.value="";

        backupData=null;

        selectedFile.style.display="none";

        fileName.textContent=

            "No file selected";

        fileSize.textContent="";

        validateImportButton();

    }

    catch(error){

        console.error(error);

        showToast(

            error.message,

            "error"

        );

    }

    finally{

        importing=false;

        validateImportButton();
        progress.style.display = "none";

    }

}

function updateProgress(

    current,

    total

){

    const percent =

        Math.round(

            current / total * 100

        );

    document.getElementById(

        "progressFill"

    ).style.width =

        percent + "%";

    document.getElementById(

        "progressText"

    ).textContent =

        `Importing ${current} of ${total}`;

}