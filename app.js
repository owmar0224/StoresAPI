require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./connection/database');
const mainRoutes = require('./routes/main-route');

const app = express();

app.use(bodyParser.json());
app.use('/api/v1', mainRoutes);

module.exports = app;

sequelize.sync()
    .then(() => {
        console.log('Database synchronized');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });
