const pool = require("../mysqlConnector");


exports.userById = (req,res,next,id) =>{
    pool.query(`select * from users where user_id = ${id}`,(err, rows) =>{
        if(err || rows.length === 0){
            return res.status(400).json({
                error:'User not found'
            })
        }
        req.profile = rows[0];
        next();
    })
}

exports.accountById = (req, res, next, id) => {
    pool.query(`select * from users where user_id = ${id}`,(err, rows) =>{
        if(err || rows.length === 0){
            return res.status(400).json({
                error:'Account not found'
            })
        }
        req.account = rows[0];
        next();
    })
}

exports.read = (req,res) => {
    req.profile.password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile)
}

exports.getTransaction = (req, res) => {
    const {user_id} = req.account;
    pool.query(`select * from accounts where u_id = ${user_id}`,(err,rows)=> {
        if(err || rows.length === 0){
            return res.status(400).json({
                error:'accounts not found'
            })
        }
        return res.status(200).json(rows);

    })
}

exports.accounts = (req, res) => {
    const {user_id} = req.profile;
    pool.query(`select * from accounts where u_id = ${user_id}`,(err,rows)=> {
        if(err || rows.length === 0){
            return res.status(400).json({
                error:'accounts not found'
            })
        }
        return res.status(200).json(rows);

    })
}



exports.addTransaction = (req, res) => {
    const {action, amount} = req.body;
    const {user_id} = req.profile;
    const c_a = (current_amount) => {
        if(current_amount >= 0){
            let c_amount=0
            if(action=='deposite'){
                c_amount = current_amount + amount
            }
            if(action=='withdraw'){
                if(amount <= current_amount){
                    c_amount = current_amount - amount
                }
             else {
                return res.json({message:'please check your balance'})
            }
        }
            pool.query(`INSERT INTO accounts(action, amount, created_at, u_id, current_amount) 
        values('${action}',${amount},now(),${user_id},${c_amount}) `,(err,rows)=> {
            if(err || rows.length === 0){
                return res.status(400).json({
                    error:'accounts not found'
                })
            }
            console.log(c_amount)
            return res.status(200).json({
                message:'Transaction successfull'
            });
            
        })
    } else {
        return res.json({message:'Transaction Cancelled, Please Check Your Balance'})
    }
}
    pool.query(`select current_amount from accounts where u_id = ${user_id} order by created_at desc`,(err, rows) => {
        if(err || rows.length === 0){
            console.log(err)
            return c_a(0);
        }
        return c_a(rows[0].current_amount)
    })
}

exports.listUsers = (req, res, next) => {
    pool.query('select * from users where role = 0',(err, rows) => {
        if(err || rows.length === 0){
            console.log(err)
            return res.status(400).json({
                error:'Users not found'
            })
        }
        return res.json(rows)
    })
}