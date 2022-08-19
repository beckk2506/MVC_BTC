const db = require("./server");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { DOUBLE, FLOAT } = require("mysql/lib/protocol/constants/types");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  
  try {
    db.query("SELECT fiat,btc,total,status FROM btctb ", (err, results) => {
      const Fiat = results[results.length - 1].fiat;
      const Btc = results[results.length - 1].btc;
      
      res.render("View", { Fiat: Fiat, BTC: Btc, data: results });
      
      return res.status(200).send();
      
    });
  } catch (err) {
    
    return res.status(500).send();
  }
});

app.post("/sell", async (req, res) => {
  const { satoshi } = req.body;

  let oldfiat;
  let oldBtc;
  let btc = satoshi / 10000000;
  let status = "sell";

  try {
    db.query("SELECT * FROM btctb ", (err, results) => {
      for (let i = 0; i < results.length; i++) {
        oldfiat = results[i].fiat;
        oldBtc = results[i].btc;
      }
      let totalBtc = oldBtc - btc;
      let totalFiat = oldfiat + satoshi;

      if (btc > 0.000001) {
        if (oldBtc <= 0 || oldBtc < btc) {
          return res.status(400).send("You don't have btc enough");
        } else
          db.query(
            "INSERT INTO btctb (fiat, btc ,total,status) VALUES ( ?, ? , ? , ?)",
            [totalFiat, totalBtc.toFixed(10), satoshi, status]
          );
          // res.render("View", { Sato: satoshi });
        return res
          .status(200)
          .send("You can sell " + satoshi + " satoshi successfully");
      } else return res.status(400).send("You can not sell");
    });
  } catch (error) {
    return res.status(500).send("Not response");
  }
});

app.post("/buy", async (req, res) => {
  const { satoshi } = req.body;

  let oldfiat;
  let oldbtc;
  let btc = satoshi / 10000000;

  try {
    db.query("SELECT * FROM btctb ", (err, results) => {
      for (let i = 0; i < results.length; i++) {
        oldfiat = results[i].fiat;
        oldbtc = results[i].btc;
      }
      let totalbtc = oldbtc + btc;
      let status = "Buy";
      let totalFiat = oldfiat - satoshi;

      if (oldbtc !== 0 || oldbtc == 0) {
        if (oldfiat < satoshi) {
          return res.status(400).send("you can't buy");
        } else {
          db.query(
            "INSERT INTO btctb (fiat, btc ,total ,status) VALUES ( ?, ? , ? , ?)",
            [totalFiat, totalbtc.toFixed(10), satoshi, status]
          );
          return res
            .status(200)
            .send("You can buy " + satoshi + " satoshi successfully");
        }
      } else {
        return res.status(400).send("You can not buy");
      }
    });
  } catch (err) {
    return res.status(500).send("Not response");
  }
});

//Deposit
app.post("/deposit", async (req, res) => {
  const { newfiat } = req.body;
  // console.log(newfiat);
  let oldfiat;
  let oldBtc;
  try {
    db.query("SELECT * FROM btctb ", (err, results) => {
      // console.log(results);

      // console.log(results.length);
      if (results.length == 0) {
        oldfiat = 0;
        oldBtc = 0;
      } else {
        oldfiat = results[results.length - 1].fiat;
        oldBtc = results[results.length - 1].btc;
      }
      if (oldfiat >= 0) {
        let totalfiat = newfiat + oldfiat;
        let status = "deposit";
        db.query(
          "INSERT INTO btctb (fiat, btc, total, status) VALUES (?, ?, ? , ?)",
          [totalfiat, oldBtc.toFixed(10), newfiat, status]
        );
        console.log("You can deposit sucessfully");
        return res.status(200).send("You can deposit sucessfully");
      } else {
        return res.status(400).send("You can't deposit");
      }
    });
  } catch (err) {
    return res.status(500).send("Not response");
  }
});

//Withdraw
app.post("/withdraw", async (req, res) => {
  const { fiat } = req.body;
  // console.log(fiat);

  try {
    db.query("SELECT * FROM btctb ", (err, results) => {
      // console.log(results);
      let oldBtc;
      let oldfiat;
      for (let i = 0; i < results.length; i++) {
        oldfiat = results[i].fiat;
        oldBtc = results[i].btc;
      }
      let newfiat = fiat;
      let TotalFiat = oldfiat - fiat;
      let status = "Withdraw";

      if (newfiat === oldfiat) {
        db.query(
          "INSERT INTO btctb (fiat, btc, total,status) VALUES (0 ,?,?, ?)",
          [oldBtc, fiat, status]
        );
        return res.status(200).send("You can withdraw successfully");
      } else if (newfiat < oldfiat) {
        db.query(
          "INSERT INTO btctb (fiat, btc ,total ,status) VALUES (?, ? , ? , ?)",
          [TotalFiat, oldBtc.toFixed(10), , status]
        );
        // console.log(TotalFiat);
        return res.status(200).send("You can withdraw successfully");
      } else {
        return res.status(400).send("You can't withdraw");
      }
    });
  } catch (err) {
    return res.status(500).send();
  }
});

app.listen(8000, () => console.log("Server is running"));
module.exports = db;
