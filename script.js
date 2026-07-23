function validateCampaign() {

    let campaign = document.getElementById("campaign").value;
    let budget = document.getElementById("budget").value;
    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;


    if (campaign == "" || budget == "" || startDate == "" || endDate == "") {

        alert("Please fill all campaign details.");

        return false;
    }


    if (startDate > endDate) {

        alert("End date should be after start date.");

        return false;
    }


    return true;
}
function validateRegister() {

    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Password does not match!");
        return false;
    }

    
}
function validateLogin() {

    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    fetch("/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email: email,
        password: password
    })
})
.then(response => {

    if (response.ok) {
        return response.text();
    } else {
        throw new Error("Invalid Email or Password");
    }

})
.then(data => {

    alert(data);

    localStorage.setItem("isLoggedIn", "true");

    window.location.href = "dashboard.html";

})
.catch(error => {

    alert(error.message);

});
    return false;
}
const chartElement = document.getElementById("campaignChart");

if(chartElement){

fetch("/report-data")

.then(response => response.json())

.then(data => {

    let platforms = [];
    let counts = [];

    data.forEach(item => {

        platforms.push(item.platform);
        counts.push(item.total);

    });


    new Chart(chartElement, {

        type:"bar",

        data:{

            labels: platforms,

            datasets:[{

                label:"Campaign Count",

                data: counts

            }]

        },

        options:{

            responsive:true

        }

    });


})

.catch(error => console.log(error));

}
function checkLogin(){

    let loginStatus = localStorage.getItem("isLoggedIn");

    if(loginStatus !== "true"){

        window.location.href = "login.html";

    }

}
function editProfile() {

    alert("Edit Profile feature will be added in the next step.");

}
function calculateBudget(){

    let expenseName = document.getElementById("expenseName").value;
    let expenseAmount = document.getElementById("expenseAmount").value;

    if(expenseName === "" || expenseAmount === ""){
        alert("Please fill all details");
        return false;
    }

    alert("Expense Added Successfully!\n\n" + expenseName + " - ₹" + expenseAmount);

    return false;
}
// Advertisement Preview

const fileInput = document.getElementById("adFile");

if (fileInput) {

    fileInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        const url = URL.createObjectURL(file);

        const preview = document.getElementById("preview");

        if (file.type.startsWith("image")) {

            preview.innerHTML = `
                <img src="${url}" width="300">
            `;

        } else if (file.type.startsWith("video")) {

            preview.innerHTML = `
                <video width="350" controls>
                    <source src="${url}">
                </video>
            `;

        }

    });

}