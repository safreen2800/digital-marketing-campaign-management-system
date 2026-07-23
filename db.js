const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "SAFREEN@2800ALLAH&0000",   // MySQL root password irundha inga podunga
    database: "campaign_db"
});

db.connect((err) => {
    if (err) {
        console.log("Database Connection Failed!");
        console.log(err);
    } else {
        console.log("Database Connected Successfully!");
    }
});

module.exports = db;