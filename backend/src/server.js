require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/db');
const validateEnv = require('./config/validateEnv');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const productRoutes = require('./routes/productRoutes');

validateEnv();
connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(compression());
app.use(express.json({ limit: '10kb' }));   // <- note the () here, was missing
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

app.use('/api/v1', apiLimiter);

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

app.use('/api/v1/products', productRoutes);   // <- this line was missing entirely

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});