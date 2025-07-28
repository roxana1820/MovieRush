document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const showLoginBtn = document.getElementById("showLogin");
    const showRegisterBtn = document.getElementById("showRegister");
    const guestLoginBtn = document.getElementById("moviesBtn");

    const loginMessageDiv = document.getElementById("loginMessage");
    const registerMessageDiv = document.getElementById("registerMessage");


    showLoginBtn.addEventListener("click", () => {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
    });

    showRegisterBtn.addEventListener("click", () => {
        registerForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
    });

    guestLoginBtn.addEventListener("click", () => {
        window.location.href = "movies.html"; 
    });

    function showMessage(message, type, formType) {
        const messageDiv = formType === "register" ? registerMessageDiv : loginMessageDiv;
        messageDiv.textContent = message;
        messageDiv.style.color = type === "success" ? "lightgreen" : "red";
        messageDiv.style.fontWeight = "bold";
        messageDiv.style.marginTop = "10px";
    }

    // 🟢 Регистрация
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!email || !password || !confirmPassword) {
            showMessage("Please, fill all of the fields!", "error", "register");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("The passwords don't match!", "error", "register");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: email.split("@")[0],
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage(data.message || "Registration failed", "error", "register");
            } else {
                showMessage(data.message || "Registered successfully!", "success", "register");
                registerForm.reset();
            }
        } catch (error) {
            showMessage("Server error", "error", "register");
        }
    });

    // 🔐 Вход
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage(data.message || "Login failed", "error", "login");
            } else {
                showMessage("Login successful!", "success", "login");
                setTimeout(() => {
                    window.location.href = "movies.html";
                }, 1000);
            }
        } catch (error) {
            showMessage("Server error", "error", "login");
        }
    });
});
