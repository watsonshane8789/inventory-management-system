require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors());
app.use(express.json);     // to parse the data in json from that we receive from the forms in the frontned


//healthcheck route
app.get('/api/v1/health', (req,res) => {
    res.json({status: 'ok', message: 'API is running'});
})

const PORT = process.env.PORT || 3133;
app.listen(PORT, () => {
    console.log(`server is running on PORT ${PORT}`);
})