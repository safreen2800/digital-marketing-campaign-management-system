const express = require("express");
const path = require("path");
const db = require("./db");
const bcrypt = require("bcrypt");
const multer = require("multer");

const app = express();
const PORT = 3000;
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }

});

const upload = multer({ storage });

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Dashboard Page
app.get("/dashboard.html", (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Campaign Page
app.get("/campaign.html", (req, res) => {
    res.sendFile(path.join(__dirname, "campaign.html"));
});

// View Campaign Page
app.get("/view-campaign.html", (req, res) => {
    res.sendFile(path.join(__dirname, "view-campaign.html"));
});

// Edit Campaign Page
app.get("/edit-campaign.html", (req, res) => {
    res.sendFile(path.join(__dirname, "edit-campaign.html"));
});

// Register API
app.post("/register", async (req, res) => {

    try {

        const { name, email, phone, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users(fullname, email, phone, password) VALUES (?, ?, ?, ?)";

        db.query(sql, [name, email, phone, hashedPassword], (err, result) => {

            if (err) {
                console.log(err);
                return res.send("Registration Failed!");
            }

            res.send("Registration Successful!");

        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }

});

// Login API
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Database Error");
        }

        if (result.length === 0) {
            return res.status(401).send("Invalid Email or Password");
        }

        const user = result[0];

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            res.send("Login Successful");
        } else {
            res.status(401).send("Invalid Email or Password");
        }

    });

});
// Create Campaign API
app.post("/campaign", upload.single("adFile"), (req, res) => {

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
console.log(req.body);
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
                return res.status(500).send("Campaign Creation Failed!");
            }

            res.redirect("/view-campaign.html");

        }
    );

});

    

// Add Expense API

app.post("/expense", (req, res) => {

    const expenseName = req.body.expenseName;
    const expenseAmount = req.body.expenseAmount;

    let sql = "INSERT INTO expenses(expense_name, amount) VALUES (?, ?)";

    db.query(sql, [expenseName, expenseAmount], (err, result) => {

        if (err) {
            console.log(err);
            res.send("Expense Add Failed");
        } 
        else {
            res.send("Expense Added Successfully");
        }

    });

});
// Get All Expenses API
app.get("/expenses", (req, res) => {
    const sql = "SELECT * FROM expenses";

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Database Error");
        }

        res.json(result);
    });
});
// View Campaign API
app.get("/campaigns", (req, res) => {

    const sql = "SELECT * FROM campaigns";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.json([]);
        }

        res.json(result);

    });

});

// Get Single Campaign API
app.get("/campaign/:id", (req, res) => {

    const id = req.params.id;

    const sql = "SELECT * FROM campaigns WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Database Error");
        }

        res.json(result[0]);

    });

});

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
        SET campaign_name = ?,
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
                return res.status(500).send("Update Failed");
            }

            res.send("Campaign Updated Successfully");

        }
    );

});

// Update Campaign Analytics
app.put("/campaign/:id/analytics", (req,res)=>{

    const id = req.params.id;

    const sql = `
    UPDATE campaigns
    SET 
    impressions = impressions + 500,
    clicks = clicks + 20,
    views = views + 300,
    reach = reach + 200
    WHERE id=?
    `;

    db.query(sql,[id],(err)=>{

        if(err){
            console.log(err);
            return res.status(500).send("Analytics Error");
        }

        res.send("Analytics Updated");

    });

});
// Delete Campaign API
app.delete("/campaign/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM campaigns WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Delete Failed");
        }

        res.send("Campaign Deleted");

    });

});
app.put("/campaign/:id/launch", (req, res) => {

    const id = req.params.id;

    const sql = "UPDATE campaigns SET status='Running' WHERE id=?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Database Error");
        }

        res.send("Campaign Launched Successfully");

    });

});
// Auto Complete Campaign API
app.put("/campaign/:id/complete", (req, res) => {

    const id = req.params.id;

    const sql = "UPDATE campaigns SET status='Completed' WHERE id=?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Database Error");
        }

        res.send("Campaign Completed");

    });

});
// Payment API
app.post("/payment", (req, res) => {

    const { campaignId, amount, paymentMethod } = req.body;

    const sql = `
        INSERT INTO payments
        (campaign_id, amount, payment_method)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [campaignId, amount, paymentMethod], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Payment Failed!");
        }

        res.send("Payment Successful!");

    });

});

// Payment History API
app.get("/payments", (req, res) => {

    const sql = `
        SELECT
            payments.id,
            campaigns.campaign_name,
            payments.amount,
            payments.payment_method,
            payments.payment_status,
            payments.payment_date
        FROM payments
        JOIN campaigns
        ON payments.campaign_id = campaigns.id
        ORDER BY payments.payment_date DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Error fetching payments!");
        }

        res.json(result);

    });

});
// Delete Expense API
app.delete("/expense/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM expenses WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Delete Failed");
        }

        res.send("Expense Deleted Successfully");

    });

});
app.get("/remaining-budget", (req, res) => {

    const sql = `
    SELECT
        (SELECT SUM(budget) FROM campaigns) AS totalBudget,
        (SELECT SUM(amount) FROM expenses) AS totalExpense
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Database Error");
        }

        const totalBudget = result[0].totalBudget || 0;
        const totalExpense = result[0].totalExpense || 0;

        res.json({
            totalBudget,
            totalExpense,
            remainingBudget: totalBudget - totalExpense
        });

    });

});


app.get("/report-data", (req,res)=>{

    const sql = `
    SELECT platform, COUNT(*) as total
    FROM campaigns
    GROUP BY platform
    `;

    db.query(sql,(err,result)=>{

        if(err){
            res.status(500).send(err);
        }
        else{
            res.json(result);
        }

    });

});
app.get("/budget-data", (req,res)=>{

    const sql = `
    SELECT 
    SUM(budget) AS totalBudget,
    AVG(budget) AS avgBudget
    FROM campaigns
    `;

    db.query(sql,(err,result)=>{

        if(err){
            res.status(500).send(err);
        }
        else{
            res.json(result[0]);
        }

    });

});

// Dashboard API
app.get("/dashboard", (req, res) => {

    const sql = `
        SELECT
            COUNT(*) AS totalCampaigns,
            IFNULL(SUM(budget), 0) AS totalBudget,
            SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) AS activeCampaigns,
            SUM(CASE WHEN status='Completed' THEN 1 ELSE 0 END) AS completedCampaigns,
            (SELECT IFNULL(SUM(amount), 0) FROM payments) AS amountPaid
             ,
IFNULL(SUM(impressions),0) AS totalImpressions,
IFNULL(SUM(clicks),0) AS totalClicks,
IFNULL(SUM(views),0) AS totalViews,
IFNULL(SUM(reach),0) AS totalReach
        FROM campaigns
       
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                error: "Database Error"
            });
        }

        const data = result[0];

        res.json({
            totalCampaigns: data.totalCampaigns || 0,
            totalBudget: data.totalBudget || 0,
            activeCampaigns: data.activeCampaigns || 0,
            completedCampaigns: data.completedCampaigns || 0,
            amountPaid: data.amountPaid || 0,
            remainingBudget: (data.totalBudget || 0) - (data.amountPaid || 0),
             totalImpressions: data.totalImpressions || 0,
    totalClicks: data.totalClicks || 0,
    totalViews: data.totalViews || 0,
    totalReach: data.totalReach || 0
        });

    });

});
// Admin - Get All Users API
app.get("/users", (req, res) => {

    const sql = "SELECT id, fullname, email, phone FROM users";

    db.query(sql, (err, result) => {

        if(err){
            console.log(err);
            return res.status(500).json({
                error:"Database Error"
            });
        }

        res.json(result);

    });

});
// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});