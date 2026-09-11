const express = require("express");
const path = require("path");
const db = require("./db");
const bcrypt = require("bcrypt");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================================================
   MULTER - AD FILE UPLOAD
========================================================= */

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }

});

const upload = multer({ storage });


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(express.static(__dirname));

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

app.use("/uploads", express.static("uploads"));


/* =========================================================
   HOME PAGE
========================================================= */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


/* =========================================================
   DASHBOARD PAGE
========================================================= */

app.get("/dashboard.html", (req, res) => {

    res.sendFile(
        path.join(__dirname, "dashboard.html")
    );

});


/* =========================================================
   CAMPAIGN PAGE
========================================================= */

app.get("/campaign.html", (req, res) => {

    res.sendFile(
        path.join(__dirname, "campaign.html")
    );

});


/* =========================================================
   VIEW CAMPAIGN PAGE
========================================================= */

app.get("/view-campaign.html", (req, res) => {

    res.sendFile(
        path.join(__dirname, "view-campaign.html")
    );

});


/* =========================================================
   EDIT CAMPAIGN PAGE
========================================================= */

app.get("/edit-campaign.html", (req, res) => {

    res.sendFile(
        path.join(__dirname, "edit-campaign.html")
    );

});


/* =========================================================
   REGISTER API
========================================================= */

app.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password
        } = req.body;

        if (!name || !email || !phone || !password) {

            return res.status(400).send(
                "All fields are required!"
            );

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users
            (fullname, email, phone, password)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                name,
                email,
                phone,
                hashedPassword
            ],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).send(
                        "Registration Failed!"
                    );

                }

                res.send(
                    "Registration Successful!"
                );

            }
        );

    } catch (err) {

        console.log(err);

        res.status(500).send(
            "Server Error"
        );

    }

});


/* =========================================================
   LOGIN API
========================================================= */

app.post("/login", (req, res) => {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {

        return res.status(400).send(
            "Email and Password are required"
        );

    }

    const sql =
        "SELECT * FROM users WHERE email = ?";

    db.query(
        sql,
        [email],
        async (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).send(
                    "Database Error"
                );

            }

            if (result.length === 0) {

                return res.status(401).send(
                    "Invalid Email or Password"
                );

            }

            const user = result[0];

            try {

                const match =
                    await bcrypt.compare(
                        password,
                        user.password
                    );

                if (match) {

                    res.send(
                        "Login Successful"
                    );

                } else {

                    res.status(401).send(
                        "Invalid Email or Password"
                    );

                }

            } catch (error) {

                console.log(error);

                res.status(500).send(
                    "Login Error"
                );

            }

        }
    );

});


/* =========================================================
   CREATE CAMPAIGN API
========================================================= */

app.post(
    "/campaign",
    upload.single("adFile"),
    (req, res) => {

        const {
            campaign,
            platform,
            budget,
            targetAudience,
            status,
            progress,
            startDate,
            endDate,
            description
        } = req.body;

        console.log("Campaign Body:");
        console.log(req.body);

        console.log("Uploaded File:");
        console.log(req.file);

        const adFile = req.file
            ? "/uploads/" + req.file.filename
            : "";

        const sql = `
            INSERT INTO campaigns
            (
                campaign_name,
                platform,
                budget,
                target_audience,
                status,
                progress,
                start_date,
                end_date,
                description,
                ad_file
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                campaign,
                platform,
                budget,
                targetAudience,
                status,
                progress,
                startDate,
                endDate,
                description,
                adFile
            ],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).send(
                        "Campaign Creation Failed!"
                    );

                }

                res.redirect(
                    "/view-campaign.html"
                );

            }
        );

    }
);


/* =========================================================
   EXPENSE API
========================================================= */

app.post("/expense", (req, res) => {

    const expenseName =
        req.body.expenseName;

    const expenseAmount =
        req.body.expenseAmount;

    const sql = `
        INSERT INTO expenses
        (expense_name, amount)
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [
            expenseName,
            expenseAmount
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).send(
                    "Expense Add Failed"
                );

            }

            res.send(
                "Expense Added Successfully"
            );

        }
    );

});


/* =========================================================
   GET ALL EXPENSES
========================================================= */

app.get("/expenses", (req, res) => {

    const sql =
        "SELECT * FROM expenses";

    db.query(
        sql,
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).send(
                    "Database Error"
                );

            }

            res.json(result);

        }
    );

});


/* =========================================================
   GET ALL CAMPAIGNS
========================================================= */

app.get("/campaigns", (req, res) => {

    const sql =
        "SELECT * FROM campaigns";

    db.query(
        sql,
        (err, result) => {

            if (err) {

                console.log(err);

                return res.json([]);

            }

            res.json(result);

        }
    );

});


/* =========================================================
   GET SINGLE CAMPAIGN
========================================================= */

app.get("/campaign/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT *
        FROM campaigns
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).send(
                    "Database Error"
                );

            }

            if (result.length === 0) {

                return res.status(404).json({
                    error: "Campaign Not Found"
                });

            }

            res.json(result[0]);

        }
    );

});


/* =========================================================
   UPDATE CAMPAIGN
========================================================= */

app.put("/campaign/:id", (req, res) => {

    const id = req.params.id;

    const {
        campaign,
        platform,
        budget,
        targetAudience,
        status,
        progress,
        startDate,
        endDate,
        description
    } = req.body;

    const sql = `
        UPDATE campaigns
        SET
            campaign_name = ?,
            platform = ?,
            budget = ?,
            target_audience = ?,
            status = ?,
            start_date = ?,
            end_date = ?,
            description = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            campaign,
            platform,
            budget,
            targetAudience,
            status,
            startDate,
            endDate,
            description,
            id
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).send(
                    "Update Failed"
                );

            }

            res.send(
                "Campaign Updated Successfully"
            );

        }
    );

});


/* =========================================================
   UPDATE CAMPAIGN ANALYTICS
========================================================= */

app.put(
    "/campaign/:id/analytics",
    (req, res) => {

        const id = req.params.id;

        const sql = `
            UPDATE campaigns
            SET
                impressions = impressions + 500,
                clicks = clicks + 20,
                views = views + 300,
                reach = reach + 200
            WHERE id = ?
        `;

        db.query(
            sql,
            [id],
            (err) => {

                if (err) {

                    console.log(err);

                    return res.status(500).send(
                        "Analytics Error"
                    );

                }

                res.send(
                    "Analytics Updated"
                );

            }
        );

    }
);


/* =========================================================
   DELETE CAMPAIGN
========================================================= */

app.delete("/campaign/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM campaigns
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).send(
                    "Delete Failed"
                );

            }

            res.send(
                "Campaign Deleted"
            );

        }
    );

});


/* =========================================================
   GET CAMPAIGN PAYMENT STATUS
========================================================= */

app.get(
    "/campaign-payment/:id",
    (req, res) => {

        const campaignId =
            req.params.id;

        // Get campaign budget
        const campaignSql = `
            SELECT
                id,
                campaign_name,
                budget,
                status
            FROM campaigns
            WHERE id = ?
        `;

        db.query(
            campaignSql,
            [campaignId],
            (campaignErr, campaignResult) => {

                if (campaignErr) {

                    console.log(campaignErr);

                    return res.status(500).json({
                        success: false,
                        message: "Database Error"
                    });

                }

                if (
                    campaignResult.length === 0
                ) {

                    return res.status(404).json({
                        success: false,
                        message: "Campaign Not Found"
                    });

                }

                const campaign =
                    campaignResult[0];

                const totalAmount =
                    Number(campaign.budget) || 0;


                // Get total payment
                const paymentSql = `
                    SELECT
                        IFNULL(SUM(amount), 0)
                        AS totalPaid
                    FROM payments
                    WHERE campaign_id = ?
                `;

                db.query(
                    paymentSql,
                    [campaignId],
                    (paymentErr, paymentResult) => {

                        if (paymentErr) {

                            console.log(
                                paymentErr
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Payment Database Error"
                            });

                        }

                        const totalPaid =
                            Number(
                                paymentResult[0]
                                    .totalPaid
                            ) || 0;

                        const remainingAmount =
                            Math.max(
                                totalAmount -
                                totalPaid,
                                0
                            );

                        const paymentComplete =
                            remainingAmount <= 0;

                        res.json({

                            success: true,

                            campaignId:
                                campaign.id,

                            campaignName:
                                campaign.campaign_name,

                            totalAmount:
                                totalAmount,

                            totalPaid:
                                totalPaid,

                            remainingAmount:
                                remainingAmount,

                            paymentComplete:
                                paymentComplete,

                            status:
                                campaign.status

                        });

                    }
                );

            }
        );

    }
);


/* =========================================================
   🔴 LAUNCH CAMPAIGN API
   PAYMENT MUST BE COMPLETED
========================================================= */

app.put(
    "/campaign/:id/launch",
    (req, res) => {

        const id = req.params.id;


        /* -------------------------------------------------
           STEP 1
           GET CAMPAIGN
        ------------------------------------------------- */

        const campaignSql = `
            SELECT
                id,
                campaign_name,
                budget,
                status
            FROM campaigns
            WHERE id = ?
        `;

        db.query(
            campaignSql,
            [id],
            (campaignErr, campaignResult) => {

                if (campaignErr) {

                    console.log(
                        campaignErr
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database Error"

                    });

                }


                /* -------------------------------------------------
                   CAMPAIGN NOT FOUND
                ------------------------------------------------- */

                if (
                    campaignResult.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Campaign Not Found"

                    });

                }


                const campaign =
                    campaignResult[0];


                const totalAmount =
                    Number(
                        campaign.budget
                    ) || 0;


                /* -------------------------------------------------
                   STEP 2
                   GET TOTAL PAYMENT
                ------------------------------------------------- */

                const paymentSql = `
                    SELECT
                        IFNULL(SUM(amount), 0)
                        AS totalPaid
                    FROM payments
                    WHERE campaign_id = ?
                `;

                db.query(
                    paymentSql,
                    [id],
                    (paymentErr, paymentResult) => {

                        if (paymentErr) {

                            console.log(
                                paymentErr
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Payment Database Error"

                            });

                        }


                        const totalPaid =
                            Number(
                                paymentResult[0]
                                    .totalPaid
                            ) || 0;


                        /* -------------------------------------------------
                           STEP 3
                           CALCULATE REMAINING
                        ------------------------------------------------- */

                        const remainingAmount =
                            Math.max(
                                totalAmount -
                                totalPaid,
                                0
                            );


                        console.log(
                            "================================"
                        );

                        console.log(
                            "CAMPAIGN LAUNCH CHECK"
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
                            "Remaining:",
                            remainingAmount
                        );

                        console.log(
                            "================================"
                        );


                        /* -------------------------------------------------
                           🔴 PAYMENT NOT COMPLETED
                        ------------------------------------------------- */

                        if (
                            remainingAmount > 0
                        ) {

                            return res.status(400).json({

                                success: false,

                                paymentRequired: true,

                                message:
                                    "Payment required before launching this campaign.",

                                campaignId:
                                    id,

                                totalAmount:
                                    totalAmount,

                                totalPaid:
                                    totalPaid,

                                remainingAmount:
                                    remainingAmount

                            });

                        }


                        /* -------------------------------------------------
                           🟢 FULL PAYMENT COMPLETED
                        ------------------------------------------------- */

                        const launchSql = `
                            UPDATE campaigns
                            SET status = 'Running'
                            WHERE id = ?
                        `;

                        db.query(
                            launchSql,
                            [id],
                            (launchErr, launchResult) => {

                                if (launchErr) {

                                    console.log(
                                        launchErr
                                    );

                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Campaign Launch Failed"

                                    });

                                }


                                /* -------------------------------------------------
                                   SUCCESS
                                ------------------------------------------------- */

                                return res.json({

                                    success: true,

                                    message:
                                        "Campaign Launched Successfully",

                                    campaignId:
                                        id,

                                    totalAmount:
                                        totalAmount,

                                    totalPaid:
                                        totalPaid,

                                    remainingAmount:
                                        0,

                                    status:
                                        "Running"

                                });

                            }
                        );

                    }
                );

            }
        );

    }
);


/* =========================================================
   COMPLETE CAMPAIGN
========================================================= */

app.put(
    "/campaign/:id/complete",
    (req, res) => {

        const id = req.params.id;

        const sql = `
            UPDATE campaigns
            SET status = 'Completed'
            WHERE id = ?
        `;

        db.query(
            sql,
            [id],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).send(
                        "Database Error"
                    );

                }

                res.send(
                    "Campaign Completed"
                );

            }
        );

    }
);


/* =========================================================
   💰 PAYMENT API
   PARTIAL PAYMENT SUPPORTED
========================================================= */

app.post(
    "/payment",
    (req, res) => {

        const {
            campaignId,
            amount,
            paymentMethod
        } = req.body;


        if (
            !campaignId ||
            !amount ||
            !paymentMethod
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Campaign ID, Amount and Payment Method are required."

            });

        }


        const paymentAmount =
            Number(amount);


        if (
            isNaN(paymentAmount) ||
            paymentAmount <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment amount."

            });

        }


        /* -------------------------------------------------
           GET CAMPAIGN BUDGET
        ------------------------------------------------- */

        const campaignSql = `
            SELECT
                id,
                campaign_name,
                budget
            FROM campaigns
            WHERE id = ?
        `;

        db.query(
            campaignSql,
            [campaignId],
            (campaignErr, campaignResult) => {

                if (campaignErr) {

                    console.log(
                        campaignErr
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database Error"

                    });

                }


                if (
                    campaignResult.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Campaign Not Found"

                    });

                }


                const campaign =
                    campaignResult[0];


                const totalAmount =
                    Number(
                        campaign.budget
                    ) || 0;


                /* -------------------------------------------------
                   GET ALREADY PAID
                ------------------------------------------------- */

                const paidSql = `
                    SELECT
                        IFNULL(SUM(amount), 0)
                        AS totalPaid
                    FROM payments
                    WHERE campaign_id = ?
                `;

                db.query(
                    paidSql,
                    [campaignId],
                    (paidErr, paidResult) => {

                        if (paidErr) {

                            console.log(
                                paidErr
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Payment Database Error"

                            });

                        }


                        const previouslyPaid =
                            Number(
                                paidResult[0]
                                    .totalPaid
                            ) || 0;


                        const remainingBeforePayment =
                            Math.max(
                                totalAmount -
                                previouslyPaid,
                                0
                            );


                        /* -------------------------------------------------
                           ALREADY FULLY PAID
                        ------------------------------------------------- */

                        if (
                            remainingBeforePayment <= 0
                        ) {

                            return res.status(400).json({

                                success: false,

                                message:
                                    "This campaign is already fully paid.",

                                totalAmount:
                                    totalAmount,

                                totalPaid:
                                    previouslyPaid,

                                remainingAmount:
                                    0

                            });

                        }


                        /* -------------------------------------------------
                           PREVENT OVER PAYMENT
                        ------------------------------------------------- */

                        if (
                            paymentAmount >
                            remainingBeforePayment
                        ) {

                            return res.status(400).json({

                                success: false,

                                message:
                                    `Maximum payment allowed is ₹${remainingBeforePayment.toFixed(2)}.`,

                                totalAmount:
                                    totalAmount,

                                previouslyPaid:
                                    previouslyPaid,

                                requestedPayment:
                                    paymentAmount,

                                remainingAmount:
                                    remainingBeforePayment

                            });

                        }


                        /* -------------------------------------------------
                           INSERT PAYMENT
                        ------------------------------------------------- */

                        const insertSql = `
                            INSERT INTO payments
                            (
                                campaign_id,
                                amount,
                                payment_method
                            )
                            VALUES (?, ?, ?)
                        `;

                        db.query(
                            insertSql,
                            [
                                campaignId,
                                paymentAmount,
                                paymentMethod
                            ],
                            (insertErr, result) => {

                                if (insertErr) {

                                    console.log(
                                        insertErr
                                    );

                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Payment Failed!"

                                    });

                                }


                                /* -------------------------------------------------
                                   CALCULATE NEW TOTAL
                                ------------------------------------------------- */

                                const totalPaid =
                                    previouslyPaid +
                                    paymentAmount;


                                const remainingAmount =
                                    Math.max(
                                        totalAmount -
                                        totalPaid,
                                        0
                                    );


                                res.json({

                                    success: true,

                                    message:
                                        "Payment Successful!",

                                    paymentId:
                                        result.insertId,

                                    campaignId:
                                        campaignId,

                                    totalAmount:
                                        totalAmount,

                                    previouslyPaid:
                                        previouslyPaid,

                                    currentPayment:
                                        paymentAmount,

                                    totalPaid:
                                        totalPaid,

                                    remainingAmount:
                                        remainingAmount,

                                    paymentComplete:
                                        remainingAmount === 0,

                                    paymentMethod:
                                        paymentMethod

                                });

                            }
                        );

                    }
                );

            }
        );

    }
);


/* =========================================================
   PAYMENT HISTORY API
========================================================= */

app.get(
    "/payments",
    (req, res) => {

        const sql = `
            SELECT
                payments.id,
                payments.campaign_id,
                campaigns.campaign_name,
                campaigns.budget AS total_campaign_amount,
                payments.amount,
                payments.payment_method,
                payments.payment_status,
                payments.payment_date
            FROM payments
            JOIN campaigns
                ON payments.campaign_id =
                   campaigns.id
            ORDER BY
                payments.payment_date DESC
        `;

        db.query(
            sql,
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).send(
                        "Error fetching payments!"
                    );

                }

                res.json(result);

            }
        );

    }
);


/* =========================================================
   DELETE EXPENSE
========================================================= */

app.delete(
    "/expense/:id",
    (req, res) => {

        const id = req.params.id;

        const sql = `
            DELETE FROM expenses
            WHERE id = ?
        `;

        db.query(
            sql,
            [id],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).send(
                        "Delete Failed"
                    );

                }

                res.send(
                    "Expense Deleted Successfully"
                );

            }
        );

    }
);


/* =========================================================
   REMAINING BUDGET
========================================================= */

app.get(
    "/remaining-budget",
    (req, res) => {

        const sql = `
            SELECT

                (
                    SELECT
                        SUM(budget)
                    FROM campaigns
                ) AS totalBudget,

                (
                    SELECT
                        SUM(amount)
                    FROM expenses
                ) AS totalExpense
        `;

        db.query(
            sql,
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).send(
                        "Database Error"
                    );

                }

                const totalBudget =
                    Number(
                        result[0].totalBudget
                    ) || 0;

                const totalExpense =
                    Number(
                        result[0].totalExpense
                    ) || 0;


                res.json({

                    totalBudget:
                        totalBudget,

                    totalExpense:
                        totalExpense,

                    remainingBudget:
                        totalBudget -
                        totalExpense

                });

            }
        );

    }
);


/* =========================================================
   REPORT DATA
========================================================= */

app.get(
    "/report-data",
    (req, res) => {

        const sql = `
            SELECT
                platform,
                COUNT(*) AS total
            FROM campaigns
            GROUP BY platform
        `;

        db.query(
            sql,
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).send(
                        err
                    );

                }

                res.json(result);

            }
        );

    }
);


/* =========================================================
   BUDGET DATA
========================================================= */

app.get(
    "/budget-data",
    (req, res) => {

        const sql = `
            SELECT

                SUM(budget)
                    AS totalBudget,

                AVG(budget)
                    AS avgBudget

            FROM campaigns
        `;

        db.query(
            sql,
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).send(
                        err
                    );

                }

                res.json(
                    result[0]
                );

            }
        );

    }
);


/* =========================================================
   DASHBOARD API
========================================================= */

app.get(
    "/dashboard",
    (req, res) => {

        const sql = `

            SELECT

                COUNT(*)
                    AS totalCampaigns,

                IFNULL(
                    SUM(budget),
                    0
                )
                    AS totalBudget,

                SUM(
                    CASE
                        WHEN status = 'Active'
                        THEN 1
                        ELSE 0
                    END
                )
                    AS activeCampaigns,

                SUM(
                    CASE
                        WHEN status = 'Completed'
                        THEN 1
                        ELSE 0
                    END
                )
                    AS completedCampaigns,

                (
                    SELECT
                        IFNULL(
                            SUM(amount),
                            0
                        )
                    FROM payments
                )
                    AS amountPaid,

                IFNULL(
                    SUM(impressions),
                    0
                )
                    AS totalImpressions,

                IFNULL(
                    SUM(clicks),
                    0
                )
                    AS totalClicks,

                IFNULL(
                    SUM(views),
                    0
                )
                    AS totalViews,

                IFNULL(
                    SUM(reach),
                    0
                )
                    AS totalReach

            FROM campaigns

        `;

        db.query(
            sql,
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        error:
                            "Database Error"

                    });

                }


                const data =
                    result[0];


                const totalBudget =
                    Number(
                        data.totalBudget
                    ) || 0;

                const amountPaid =
                    Number(
                        data.amountPaid
                    ) || 0;


                res.json({

                    totalCampaigns:
                        data.totalCampaigns ||
                        0,

                    totalBudget:
                        totalBudget,

                    activeCampaigns:
                        data.activeCampaigns ||
                        0,

                    completedCampaigns:
                        data.completedCampaigns ||
                        0,

                    amountPaid:
                        amountPaid,

                    remainingBudget:
                        totalBudget -
                        amountPaid,

                    totalImpressions:
                        data.totalImpressions ||
                        0,

                    totalClicks:
                        data.totalClicks ||
                        0,

                    totalViews:
                        data.totalViews ||
                        0,

                    totalReach:
                        data.totalReach ||
                        0

                });

            }
        );

    }
);


/* =========================================================
   ADMIN - GET ALL USERS
========================================================= */

app.get(
    "/users",
    (req, res) => {

        const sql = `
            SELECT
                id,
                fullname,
                email,
                phone
            FROM users
        `;

        db.query(
            sql,
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        error:
                            "Database Error"

                    });

                }

                res.json(result);

            }
        );

    }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            `✅ Server is running at http://localhost:${PORT}`
        );

    }
);