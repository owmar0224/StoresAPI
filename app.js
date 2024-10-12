require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./connection/database');
const mainRoutes = require('./routes/main-route');

const app = express();

app.use(bodyParser.json());
app.use('/api/v1', mainRoutes);

const PORT = process.env.PORT || 3000;
sequelize.sync()
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });