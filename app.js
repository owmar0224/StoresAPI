require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./connection/database');
const mainRoutes = require('./routes/main-route');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');
const passport = require('passport');
require('./middlewares/passport')(passport);
require('./models/association/associations');

const app = express();

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ],
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(bodyParser.json());
app.use(morgan('logs/combined', { stream: { write: message => logger.info(message.trim()) }}));
app.use(passport.initialize());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Endpoint routing
app.use('/api/v1', mainRoutes);

const PORT = process.env.PORT || 3000;

sequelize
  .sync({
    alter: true     // Alter Database Tables to Updated Models
    // force: true  // Delete and Recreate Database Tables
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    logger.error('Unable to connect to the database:', error);
    console.error('Unable to connect to the database:', error);
  });
