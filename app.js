const express = require("express");
const app = express();
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
require('dotenv').config();
const cors = require('cors');
const pool = require("./mysqlConnector");
const authRoutes = require('./routes/auth');
const users = require('./routes/user');
const db = require("./db/db");

//checking database connection 
pool.getConnection((err,connection) => {
    if(err){
        console.log(err)
    }
    if(connection.state == 'connected'){
        console.log('Database connected successfully')
    }
})


app.get('/',(req,res)=>{
    res.send('hello world');
    
})

const a = async() => {
    const output = await db.select('*').from('users').where('user_id',1)
    console.log(output)
}
a();

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