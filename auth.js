/* =========================================================
   DigiMarket Authentication System
   ========================================================= */

/*
   Check whether user is logged in
*/
function isUserLoggedIn() {

    return localStorage.getItem("isLoggedIn") === "true";

}


/*
   Protect a page

   If user is NOT logged in:
   → redirect to login.html
*/
function protectPage() {

    if (!isUserLoggedIn()) {

        alert("🔐 Please login first to access this page.");

        window.location.href = "login.html";

        return false;
    }

    return true;
}


/*
   Check login before opening a protected page
*/
function requireLogin(page) {

    if (isUserLoggedIn()) {

        window.location.href = page;

    } else {

        alert("🔐 Please login first.");

        window.location.href = "login.html";
    }

}


/*
   Logout
*/
function logoutUser() {

    localStorage.removeItem("isLoggedIn");

    localStorage.removeItem("user");

    alert("👋 You have been logged out successfully.");

    window.location.href = "login.html";

}


/*
   Update navbar depending on login status
*/
function updateNavbar() {

    const loggedIn = isUserLoggedIn();

    const loginBtn = document.getElementById("loginBtn");

    const logoutBtn = document.getElementById("logoutBtn");

    const userBtn = document.getElementById("userBtn");


    if (loggedIn) {

        if (loginBtn) {

            loginBtn.style.display = "none";

        }

        if (logoutBtn) {

            logoutBtn.style.display = "inline-block";

        }

        if (userBtn) {

            userBtn.style.display = "inline-block";

        }

    } else {

        if (loginBtn) {

            loginBtn.style.display = "inline-block";

        }

        if (logoutBtn) {

            logoutBtn.style.display = "none";

        }

        if (userBtn) {

            userBtn.style.display = "none";

        }

    }

}


/*
   Automatically update navbar
*/
document.addEventListener("DOMContentLoaded", function () {

    updateNavbar();

});