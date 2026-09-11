let campaigns = [];

// Prevent multiple launch clicks
let launchingCampaigns = new Set();


/* =========================================================
   LOAD CAMPAIGNS
========================================================= */

function loadCampaigns() {

    fetch("/campaigns")
        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load campaigns");
            }

            return response.json();

        })
        .then(data => {

            campaigns = data;

            displayCampaigns(campaigns);

        })
        .catch(error => {

            console.error("Campaign Load Error:", error);

        });

}

loadCampaigns();


/* =========================================================
   DISPLAY CAMPAIGNS
========================================================= */

function displayCampaigns(data) {

    const tableBody =
        document.getElementById("campaignTable");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";


    if (!data || data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="16" style="text-align:center;">
                    No Campaigns Found
                </td>
            </tr>
        `;

        return;
    }


    data.forEach(campaign => {

        const progress =
            campaign.progress || 0;

        const impressions =
            campaign.impressions || 0;

        const clicks =
            campaign.clicks || 0;

        const views =
            campaign.views || 0;

        const reach =
            campaign.reach || 0;


        /* -------------------------------------------------
           MEDIA
        ------------------------------------------------- */

        let mediaHTML = "No Media";

        if (campaign.ad_file) {

            if (
                campaign.ad_file
                    .toLowerCase()
                    .endsWith(".mp4")
            ) {

                mediaHTML = `
                    <video
                        width="150"
                        controls
                    >
                        <source
                            src="${campaign.ad_file}"
                            type="video/mp4"
                        >
                    </video>
                `;

            } else {

                mediaHTML = `
                    <img
                        src="${campaign.ad_file}"
                        width="150"
                        alt="Campaign Media"
                    >
                `;

            }

        }


        /* -------------------------------------------------
           STATUS
        ------------------------------------------------- */

        let statusClass = "";

        if (campaign.status === "Running") {

            statusClass = "running";

        } else if (campaign.status === "Completed") {

            statusClass = "completed";

        } else if (campaign.status === "Active") {

            statusClass = "active";

        }


        /* -------------------------------------------------
           TABLE ROW
        ------------------------------------------------- */

        tableBody.innerHTML += `

            <tr>

                <td>
                    ${campaign.id}
                </td>

                <td>
                    ${campaign.campaign_name || ""}
                </td>

                <td>
                    ${campaign.platform || ""}
                </td>

                <td>
                    ₹${Number(campaign.budget || 0).toFixed(2)}
                </td>

                <td>
                    ${campaign.target_audience || 0}
                    People
                </td>

                <td class="${statusClass}">
                    ${campaign.status || "Active"}
                </td>

                <td>
                    ${mediaHTML}
                </td>

                <td>

                    <progress
                        value="${progress}"
                        max="100"
                    ></progress>

                    <br>

                    ${progress}%

                </td>

                <td>
                    ${impressions}
                </td>

                <td>
                    ${clicks}
                </td>

                <td>
                    ${views}
                </td>

                <td>
                    ${reach}
                </td>

                <td>
                    ${campaign.start_date || ""}
                </td>


                <!-- ACTIONS -->

                <td>

                    <button
                        onclick="editCampaign(${campaign.id})"
                    >
                        ✏️ Edit
                    </button>


                    <button
                        onclick="deleteCampaign(${campaign.id})"
                    >
                        🗑️ Delete
                    </button>


                    <button
                        id="launchBtn-${campaign.id}"
                        onclick="launchCampaign(${campaign.id})"
                    >
                        🚀 Launch
                    </button>

                </td>


                <!-- PAYMENT -->

                <td>

                    <button
                        onclick="payNow(${campaign.id})"
                    >
                        💳 Pay Now
                    </button>

                </td>

            </tr>

        `;

    });

}


/* =========================================================
   EDIT CAMPAIGN
========================================================= */

function editCampaign(id) {

    window.location.href =
        `/edit-campaign.html?id=${id}`;

}


/* =========================================================
   DELETE CAMPAIGN
========================================================= */

function deleteCampaign(id) {

    if (
        !confirm(
            "Are you sure you want to delete this campaign?"
        )
    ) {

        return;

    }


    fetch(`/campaign/${id}`, {

        method: "DELETE"

    })

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Delete failed"
                );

            }

            return response.text();

        })

        .then(data => {

            alert(data);

            loadCampaigns();

        })

        .catch(error => {

            console.error(
                "Delete Error:",
                error
            );

            alert(
                "❌ Campaign Delete Failed"
            );

        });

}


/* =========================================================
   PAY NOW
========================================================= */

function payNow(id) {

    window.location.href =
        `payment.html?campaignId=${id}`;

}


/* =========================================================
   🔴 CHECK PAYMENT BEFORE LAUNCH
========================================================= */

async function launchCampaign(id) {

    /*
       Prevent double / triple click
    */

    if (launchingCampaigns.has(id)) {

        return;

    }


    launchingCampaigns.add(id);


    const launchButton =
        document.getElementById(
            `launchBtn-${id}`
        );


    if (launchButton) {

        launchButton.disabled = true;

        launchButton.innerHTML =
            "⏳ Checking Payment...";

    }


    try {

        /* =====================================================
           STEP 1
           CHECK PAYMENT STATUS
        ===================================================== */

        const paymentResponse =
            await fetch(
                `/campaign-payment/${id}`
            );


        const paymentData =
            await paymentResponse.json();


        if (!paymentResponse.ok) {

            throw new Error(
                paymentData.message ||
                "Unable to check payment"
            );

        }


        const totalAmount =
            Number(
                paymentData.totalAmount
            ) || 0;


        const totalPaid =
            Number(
                paymentData.totalPaid
            ) || 0;


        const remainingAmount =
            Math.max(
                totalAmount - totalPaid,
                0
            );


        console.log(
            "Campaign Payment Check"
        );

        console.log(
            "Campaign ID:",
            id
        );

        console.log(
            "Total Amount:",
            totalAmount
        );

        console.log(
            "Total Paid:",
            totalPaid
        );

        console.log(
            "Remaining Amount:",
            remainingAmount
        );


        /* =====================================================
           🔴 PAYMENT NOT COMPLETED
        ===================================================== */

        if (remainingAmount > 0) {

            if (launchButton) {

                launchButton.disabled =
                    false;

                launchButton.innerHTML =
                    "🚀 Launch";

            }


            launchingCampaigns.delete(id);


            alert(
                "⚠️ PAYMENT REQUIRED\n\n" +

                "Campaign Amount : ₹" +
                totalAmount.toFixed(2) +

                "\n\nPaid Amount : ₹" +
                totalPaid.toFixed(2) +

                "\n\nRemaining Amount : ₹" +
                remainingAmount.toFixed(2) +

                "\n\nPlease complete the payment before launching this campaign."
            );


            return;

        }


        /* =====================================================
           🟢 FULL PAYMENT COMPLETED
        ===================================================== */

        if (
            totalAmount <= 0
        ) {

            launchingCampaigns.delete(id);


            if (launchButton) {

                launchButton.disabled =
                    false;

                launchButton.innerHTML =
                    "🚀 Launch";

            }


            alert(
                "⚠️ Invalid campaign amount."
            );

            return;

        }


        /* =====================================================
           STEP 2
           PAYMENT COMPLETE
           NOW CALL LAUNCH API
        ===================================================== */

        if (launchButton) {

            launchButton.innerHTML =
                "🚀 Launching...";

        }


        const launchResponse =
            await fetch(
                `/campaign/${id}/launch`,
                {
                    method: "PUT"
                }
            );


        const launchData =
            await launchResponse.json();


        /* =====================================================
           BACKEND PAYMENT PROTECTION
        ===================================================== */

        if (!launchResponse.ok) {

            /*
               Backend says payment is not complete
            */

            if (
                launchData.paymentRequired
            ) {

                const remaining =
                    Number(
                        launchData.remainingAmount
                    ) || 0;


                alert(
                    "⚠️ PAYMENT REQUIRED\n\n" +

                    "Please pay ₹" +
                    remaining.toFixed(2) +

                    " before launching this campaign."
                );

            } else {

                alert(
                    "❌ " +
                    (
                        launchData.message ||
                        "Campaign Launch Failed"
                    )
                );

            }


            if (launchButton) {

                launchButton.disabled =
                    false;

                launchButton.innerHTML =
                    "🚀 Launch";

            }


            launchingCampaigns.delete(id);

            return;

        }


        /* =====================================================
           🟢 CAMPAIGN SUCCESSFULLY LAUNCHED
        ===================================================== */

        alert(
            "🚀 Campaign Started Successfully!"
        );


        /* =====================================================
           UPDATE ANALYTICS
        ===================================================== */

        try {

            await fetch(
                `/campaign/${id}/analytics`,
                {
                    method: "PUT"
                }
            );

        } catch (analyticsError) {

            console.error(
                "Analytics Error:",
                analyticsError
            );

        }


        /* =====================================================
           AUTO COMPLETE AFTER 10 SECONDS
        ===================================================== */

        setTimeout(
            async () => {

                try {

                    const completeResponse =
                        await fetch(
                            `/campaign/${id}/complete`,
                            {
                                method: "PUT"
                            }
                        );


                    if (
                        !completeResponse.ok
                    ) {

                        throw new Error(
                            "Complete failed"
                        );

                    }


                    const completeResult =
                        await completeResponse.text();


                    alert(
                        "✅ Campaign Completed"
                    );


                    loadCampaigns();


                } catch (completeError) {

                    console.error(
                        "Complete Error:",
                        completeError
                    );

                    alert(
                        "❌ Campaign completion failed"
                    );

                }


            },
            10000
        );


    } catch (error) {

        console.error(
            "Launch Error:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "Launch Failed"
            )
        );


        if (launchButton) {

            launchButton.disabled =
                false;

            launchButton.innerHTML =
                "🚀 Launch";

        }


    }


    launchingCampaigns.delete(id);

}


/* =========================================================
   SEARCH CAMPAIGN
========================================================= */

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "keyup",
        function () {

            const searchText =
                this.value
                    .toLowerCase()
                    .trim();


            const filteredCampaigns =
                campaigns.filter(
                    campaign => {

                        const name =
                            (
                                campaign
                                    .campaign_name ||
                                ""
                            )
                                .toLowerCase();


                        const platform =
                            (
                                campaign
                                    .platform ||
                                ""
                            )
                                .toLowerCase();


                        return (
                            name.includes(
                                searchText
                            ) ||

                            platform.includes(
                                searchText
                            )
                        );

                    }
                );


            displayCampaigns(
                filteredCampaigns
            );

        }
    );

}


/* =========================================================
   PLATFORM FILTER
========================================================= */

const platformFilter =
    document.getElementById(
        "platformFilter"
    );


if (platformFilter) {

    platformFilter.addEventListener(
        "change",
        function () {

            const selectedPlatform =
                this.value;


            if (
                selectedPlatform ===
                "All"
            ) {

                displayCampaigns(
                    campaigns
                );

                return;

            }


            const filteredCampaigns =
                campaigns.filter(
                    campaign =>
                        campaign.platform ===
                        selectedPlatform
                );


            displayCampaigns(
                filteredCampaigns
            );

        }
    );

}