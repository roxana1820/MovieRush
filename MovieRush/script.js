document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const registerMessageDiv = document.getElementById("registerMessage");
    const loginMessageDiv = document.getElementById("loginMessage");
    const modal = document.getElementById("authModal");
    const showLoginBtn = document.getElementById("showLoginBtn");
    const showRegisterBtn = document.getElementById("showRegisterBtn");
    const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

    // Показване на popup модала
    showLoginBtn.addEventListener("click", () => {
        modal.classList.add("active");
    });

    showRegisterBtn.addEventListener("click", () => {
        modal.classList.add("active");
    });

    // Скриване на popup при клик извън него
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });

    function showMessage(message, type, formType) {
        const messageDiv = formType === "register" ? registerMessageDiv : loginMessageDiv;
        messageDiv.textContent = message;
        messageDiv.style.color = type === "success" ? "green" : "red";
        messageDiv.style.fontSize = "16px";
        messageDiv.style.fontWeight = "bold";
        messageDiv.style.marginTop = "10px";
    }

    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!email || !password || !confirmPassword) {
            showMessage("Please, fill all of the fields!", "error", "register");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("The passwords dont match!", "error", "register");
            return;
        }

        if (localStorage.getItem(email)) {
            showMessage("This email is already registered!", "error", "register");
            return;
        }

        localStorage.setItem(email, JSON.stringify({ password }));
        localStorage.removeItem("favoriteMovies");
        localStorage.removeItem("watchedMovies");

        showMessage("The registration is successful!", "success", "register");
        registerForm.reset();
    });

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        const user = JSON.parse(localStorage.getItem(email));

        if (!user || user.password !== password) {
            showMessage("Wrong email or password!", "error", "login");
            return;
        }

        localStorage.removeItem("favoriteMovies");
        localStorage.removeItem("watchedMovies");

        showMessage("Login successful!", "success", "login");
        localStorage.setItem("loggedInUser", email);

        setTimeout(() => {
            window.location.href = "movies.html";
        }, 1000);
    });

    forgotPasswordBtn.addEventListener("click", function () {
        const email = prompt("Enter your email to reset the password:");
        if (!email || !localStorage.getItem(email)) {
            alert("Email not found!");
            return;
        }

        const newPassword = prompt("Enter your new password:");
        const confirmPassword = prompt("Confirm your new password:");

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        localStorage.setItem(email, JSON.stringify({ password: newPassword }));
        alert("Password reset successful! Please log in with your new password.");
    });
});
