const express = require('express');
const path = require('path');
require('dotenv').config();
const router = require('./routes/router');
const auth = require('./routes/auth');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const expressSession = require('express-session');

const DB_URL = process.env.DB_URL

mongoose.connect(DB_URL, {
    serverSelectionTimeoutMS: 30000,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

const PORT = process.env.PORT || 8080
const app = express()
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.use(expressSession({ 
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  cookie: { maxAge: 3600000 }
}));

app.use(router)
app.use(auth)
app.use('/api', router);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})