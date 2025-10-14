document.addEventListener("DOMContentLoaded", async function () {
    const API_BASE = config.API_BASE;

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


    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!email || !password || !confirmPassword) {
            showMessage("Please fill all fields!", "error", "register");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage("Please enter a valid email address!", "error", "register");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match!", "error", "register");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
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
            showMessage("Server error, please try again later", "error", "register");
        }
    });


    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            showMessage("Please fill in both email and password!", "error", "login");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage("Please enter a valid email address!", "error", "login");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    showMessage("Invalid email or password", "error", "login");
                } else if (response.status === 404) {
                    showMessage("User not found, please register first", "error", "login");
                } else {
                    showMessage(data.message || "Login failed", "error", "login");
                }
            } else {
                showMessage("Login successful!", "success", "login");
                setTimeout(() => {
                    window.location.href = "movies.html";
                }, 1000);
            }
        } catch (error) {
            showMessage("Server error, please try again later", "error", "login");
        }
    });


    const articleLinks = document.querySelectorAll(".sidebar-right .article-link");
    articleLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const description = link.nextElementSibling;
            const isVisible = description.classList.contains("show");
            document.querySelectorAll(".article-description").forEach(desc => {
                desc.classList.remove("show");
            });
            if (!isVisible) {
                description.classList.add("show");
            }
        });
    });

    const allLinks = document.querySelectorAll("a");
    allLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href && (href.includes("youtube.com") || href.includes("youtu.be"))) {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                window.open(href, "_blank");
            });
        }
    });

    const video = document.getElementById("bg-video");
    if (video) {
        video.play().catch(() => {
            document.body.addEventListener("touchstart", () => {
                video.play();
            }, { once: true });
        });
    }
    
    // Health check function
    async function checkServerHealth() {
        try {
            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(`${API_BASE}/health`, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId); // Clear timeout if request succeeds

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();
            if (data.status !== 'ok') {
                throw new Error('Server health check failed');
            }

            console.log('✅ Server health check passed');
        } catch (error) {
            console.error('❌ Server health check failed:', error.message);
            if (error.name === 'AbortError') {
                alert(`⚠️ Server connection timed out after 5 seconds. Please check your connection and try again.`);
            } else {
                alert(`⚠️ Unable to connect to server at ${API_BASE}. Please check your connection and try again.`);
            }
        }
    }

   
async function checkLoginStatus() {
    const showLoginBtn = document.getElementById("showLogin");
    const showRegisterBtn = document.getElementById("showRegister");
    const profileDropdown = document.getElementById("profileDropdown"); 

   
    showLoginBtn.style.display = 'block';
    showRegisterBtn.style.display = 'block';

    if (profileDropdown) profileDropdown.style.display = 'none';

    try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
        const data = await res.json();

        if (data.loggedIn === true || data.user) {
            showLoginBtn.style.display = 'none';
            showRegisterBtn.style.display = 'none';
            if (profileDropdown) profileDropdown.style.display = 'block';

          
            const logoutBtn = document.getElementById("logoutBtn");
            if (logoutBtn && !logoutBtn.hasAttribute('data-listener-added')) {  
                logoutBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
                    window.location.href = 'index.html';  
                });
                logoutBtn.setAttribute('data-listener-added', 'true');
            }
        }
    } catch (err) {
        console.error('An error when checking up:', err);
    }
}

await checkServerHealth();
await checkLoginStatus();

});
