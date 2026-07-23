let campaigns = [];

// Load campaigns
fetch("/campaigns")
    .then(response => response.json())
    .then(data => {

        campaigns = data;

        displayCampaigns(campaigns);

    })
    .catch(error => {
        console.error(error);
    });

// Display campaigns
function displayCampaigns(data) {

  const tableBody = document.getElementById("campaignTable");

    tableBody.innerHTML = "";

    data.forEach(campaign => {

        
        tableBody.innerHTML += `
<tr>
    <td>${campaign.id}</td>
    <td>${campaign.campaign_name}</td>
    <td>${campaign.platform}</td>
    <td>${campaign.budget}</td>
    <td>${campaign.target_audience} People</td>
    <td>${campaign.status}</td>
    <td>
${
campaign.ad_file
?
(
campaign.ad_file.endsWith(".mp4")
?
`<video width="150" controls>
   <source src="${campaign.ad_file}" type="video/mp4">
</video>`
:
`<img src="${campaign.ad_file}" width="150">`
)
:
"No Media"
}
</td>
    

<td>
<progress value="${campaign.progress || 0}" max="100"></progress>
${campaign.progress || 0}%
</td>
<td>${campaign.impressions || 0}</td>
<td>${campaign.clicks || 0}</td>
<td>${campaign.views || 0}</td>
<td>${campaign.reach || 0}</td>

<td>${campaign.start_date}</td>
    <td>
        <button onclick="editCampaign(${campaign.id})">✏️ Edit</button>
        <button onclick="deleteCampaign(${campaign.id})">🗑️ Delete</button>
        <button onclick="launchCampaign(${campaign.id})">🚀 Launch</button>

    </td>
   
    <td>
        <button onclick="payNow(${campaign.id})">💳 Pay Now</button>
    

    </td>
</tr>
`;

    });

}

// Edit Campaign
function editCampaign(id) {
    window.location.href = `/edit-campaign.html?id=${id}`;
}

// Delete Campaign
function deleteCampaign(id) {

    if (confirm("Are you sure you want to delete this campaign?")) {

        fetch(`/campaign/${id}`, {
            method: "DELETE"
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            location.reload();
        })
        .catch(error => console.log(error));

    }

}
function payNow(id) {
    window.location.href = `payment.html?campaignId=${id}`;

}
// Launch Campaign
function launchCampaign(id) {

    fetch(`/campaign/${id}/launch`, {
        method: "PUT"
    })
    .then(response => response.text())
    .then(data => {

        alert("🚀 Campaign Started");

       fetch(`/campaign/${id}/analytics`, {
    method:"PUT"
});


setTimeout(() => {

    fetch(`/campaign/${id}/complete`, {
        method: "PUT"
    })
            .then(response => response.text())
            .then(result => {

                alert("✅ Campaign Completed");

                location.reload();

            });

        }, 10000);

    })
    .catch(error => {

        console.log(error);
        alert("Launch Failed");

    });

}
// Search Campaign
document.getElementById("searchInput").addEventListener("keyup", function () {

    const searchText = this.value.toLowerCase();


    const filteredCampaigns = campaigns.filter(campaign =>

        (campaign.campaign_name || "")
        .toLowerCase()
        .includes(searchText)

        ||

        (campaign.platform || "")
        .toLowerCase()
        .includes(searchText)

    );


    displayCampaigns(filteredCampaigns);

});
// Platform Filter
document.getElementById("platformFilter").addEventListener("change", function () {

    const selectedPlatform = this.value;

    if (selectedPlatform === "All") {

        displayCampaigns(campaigns);
        return;

    }


    const filteredCampaigns = campaigns.filter(campaign =>

        campaign.platform === selectedPlatform

    );


    displayCampaigns(filteredCampaigns);

});