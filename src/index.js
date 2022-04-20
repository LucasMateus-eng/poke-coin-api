const express = require('express');
const cors = require('cors');
const db = require('./database/config');
require('dotenv').config();

const app = express();
app.use(cors());

const port = process.env.PORT || 8080;

app.use(express.json());

const userRoutes = require('./routes/routes');
app.use('/api', userRoutes);

db.on('connected', () => {
  console.log('Mongoose default connection is open');
  app.listen(port, () => console.log(`Express started on http://localhost:${port}; `
    + `press Crtl-C to terminate.`))
});

db.on('error', err => {
  console.log(`Mongoose default connection has occured \n${err}`);
});

db.on('disconnected', () => {
  console.log('Mongoose default connection is disconnected');
});

process.on('SIGINT', () => {
  db.close(() => {
    console.log(
      'Mongoose default connection is disconnected due to application termination'
    );
    process.exit(0);
  });
});

module.exports = app;