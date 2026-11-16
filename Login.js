// CHECK LOGIN STATUS
let isLogged = sessionStorage.getItem("isLogged") === "true";

// LOGIN VALIDATION FUNCTION
function ValidateData() {

    // GET CUSTOMER DETAILS
    let Name = document.getElementById("UserName").value.trim();
    let Surname = document.getElementById("Surname").value.trim();
    let Email = document.getElementById("Email").value.trim();
    let Telephone = document.getElementById("Telephone").value.trim();
    let Age = document.getElementById("Age").value;

    // STORE CUSTOMER DETAILS IN AN ARRAY
    let Details = [
        {
            value: Name,
            error: "NameError",
            message: "Please enter your name"
        },
        {
            value: Surname,
            error: "SurnameError",
            message: "Please enter your surname"
        },
        {
            value: Email,
            error: "EmailError",
            message: "Please enter a valid email address",
            invalid: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)
        },
        {
            value: Telephone,
            error: "TelephoneError",
            message: "Please enter a valid South African phone number",
            invalid: Telephone.length !== 10 ||
                     !Telephone.startsWith("0") ||
                     !/^\d+$/.test(Telephone)
        },
        {
            value: Age,
            error: "AgeError",
            message: "Eish Chief you are too young to use our website!",
            invalid: Age === "" || Number(Age) < 18
        }
    ];

    // RESET LOGIN STATUS
    isLogged = false;
    let HasErrors = false;

    // LOOP THROUGH ALL CUSTOMER DETAILS
    for (let i = 0; i < Details.length; i++) {
        let ErrorElement = document.getElementById(Details[i].error);
        if (!ErrorElement) continue;

        // CLEAR PREVIOUS ERROR MESSAGES
        ErrorElement.innerHTML = "";

        // CHECK IF FIELD IS EMPTY OR INVALID
        let Invalid = Details[i].value === "" ||
                      Details[i].invalid === true;

        if (Invalid) {
            ErrorElement.innerHTML = Details[i].message;
            ErrorElement.style.color = "red";
            HasErrors = true;
        }
    }

    // CHECK IF THERE ARE ANY ERRORS
    if (HasErrors) {
        return;
    }

    // SUCCESSFUL LOGIN
    isLogged = true;

    // SAVE LOGIN STATUS
    sessionStorage.setItem("isLogged", "true");

    // PHONE FRIENDLY - NO alert()
    showToast("Welcome " + Name + " " + Surname + " to Skhaftin Express!");

    // REDIRECT TO WEBSITE AFTER TOAST SHOWS
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1200);
}


// TOAST - REPLACES alert()

function showToast(message) {
    const old = document.querySelector(".toast");
    if (old) old.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// CUSTOM CONFIRM MODAL - REPLACES confirm()
function showConfirmModal(message, onConfirm) {
    // Remove old modal if exists
    const old = document.querySelector(".confirm-overlay");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
        <div class="confirm-box">
            <h3>Log Out?</h3>
            <p>${message}</p>
            <div class="confirm-actions">
                <button class="confirm-cancel">Cancel</button>
                <button class="confirm-ok">Yes, Log Out</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Animate in
    setTimeout(() => overlay.classList.add("show"), 10);

    overlay.querySelector(".confirm-cancel").onclick = () => {
        overlay.remove();
    };

    overlay.querySelector(".confirm-ok").onclick = () => {
        overlay.remove();
        onConfirm();
    };

    // Close if tap outside box
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
}

// UPDATE LOGIN / LOGOUT LINK
function UpdateLoginLink() {

    let LoginLink = document.getElementById("Logged");
    let LoginText = document.getElementById("LoginText");
    let LoginIcon = document.getElementById("LoginIcon");

    if (!LoginLink || !LoginText || !LoginIcon) {
        return;
    }

    isLogged = sessionStorage.getItem("isLogged") === "true";

    if (isLogged) {
        // CHANGE TEXT
        LoginText.textContent = "Log Out";
        // CHANGE LINK
        LoginLink.href = "#";
        // CHANGE ICON 
        LoginIcon.innerHTML = `
            <path d="M10 17l5-5-5-5"/>
            <path d="M15 12H3"/>
            <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>
        `;
    } else {
        // CHANGE TEXT
        LoginText.textContent = "Log In";
        // CHANGE LINK
        LoginLink.href = "Login.html";
        // CHANGE ICON
        LoginIcon.innerHTML = `
            <path d="M15 17l5-5-5-5"/>
            <path d="M20 12H9"/>
            <path d="M13 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/>
        `;
    }
}

// LOGOUT FUNCTION
function Logout(event) {
    // PREVENT DEFAULT LINK ACTION
    event.preventDefault();

    // PHONE FRIENDLY - NO confirm()
    showConfirmModal("You are logging out now, do you wish to proceed?", () => {

        // RESET LOGIN STATUS
        isLogged = false;

        // REMOVE LOGIN STATUS
        sessionStorage.removeItem("isLogged");

        // UPDATE LOGIN TEXT AND ICON
        UpdateLoginLink();

        showToast("You have successfully logged out!");
    });
}

// CHECK LOGIN STATUS WHEN PAGE LOADS
document.addEventListener("DOMContentLoaded", function() {

    // UPDATE LOGIN TEXT AND SVG
    UpdateLoginLink();

    let LoginLink = document.getElementById("Logged");

    if (LoginLink) {
        LoginLink.addEventListener("click", function(event) {
            // ONLY LOG OUT IF USER IS LOGGED IN
            if (sessionStorage.getItem("isLogged") === "true") {
                Logout(event);
            }
        });
    }
});