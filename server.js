const express = require('express');
const path = require('path');
require('dotenv').config();
const router = require('./routes/router');

const PORT = process.env.PORT || 8080
const app = express()
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.use(router)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})