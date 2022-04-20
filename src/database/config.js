const mongoose = require('mongoose');
require('dotenv').config();


const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;


const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.es7cp.mongodb.net/pokecoin?retryWrites=true&w=majority`

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

mongoose.connect(uri, options);

const db = mongoose.connection;

module.exports = db;