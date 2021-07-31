const express = require("express");
const app = express();
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
require('dotenv').config();
const cors = require('cors');
const authRoutes = require('./routes/auth');
const users = require('./routes/user');
const db = require("./db/db");


app.get('/',(req,res)=>{
    res.send('hello world');
    
})


//middlewares

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//Routes middleware
app.use('/api',authRoutes)
app.use('/api',users)



const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})