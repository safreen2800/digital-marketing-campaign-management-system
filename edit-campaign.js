const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Load campaign details
fetch(`/campaign/${id}`)
    .then(response => response.json())
    .then(campaign => {

        document.getElementById("id").value = campaign.id;
        document.getElementById("campaign").value = campaign.campaign_name;
        document.getElementById("platform").value = campaign.platform;
        document.getElementById("budget").value = campaign.budget;
        document.getElementById("startDate").value = campaign.start_date.split("T")[0];
        document.getElementById("endDate").value = campaign.end_date.split("T")[0];
        document.getElementById("description").value = campaign.description;

    })
    .catch(error => console.log(error));
    // Update Campaign
document.getElementById("editForm").addEventListener("submit", function(e) {

    e.preventDefault();

    fetch(`/campaign/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            campaign: document.getElementById("campaign").value,
            platform: document.getElementById("platform").value,
            budget: document.getElementById("budget").value,
            startDate: document.getElementById("startDate").value,
            endDate: document.getElementById("endDate").value,
            description: document.getElementById("description").value

        })

    })
    .then(response => response.text())
    .then(data => {

        alert(data);

        window.location.href = "/view-campaign.html";

    })
    .catch(error => console.log(error));

});