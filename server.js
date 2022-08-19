// const express = require('express')
const mysql = require('mysql')

// const app = express();
// app.use(express.json());

// MuSQL Connection
const Connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password : '',
    database: 'btcdb'
})

Connection.connect((err) => {
    if (err) {
        console.log('Error connecting to Mysql database = ', err);
        return;
    }
    console.log('connecting successfully!');
})

module.exports = Connection
