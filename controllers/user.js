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
    pool.query(`select * from accounts where u_id = ${user_id} order by transaction_id desc`,(err,rows)=> {
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
    pool.query(`select * from accounts where u_id = ${user_id} order by transaction_id desc`,(err,rows)=> {
        if(err || rows.length === 0){
            return res.status(400).json({
                error:'accounts not found'
            })
        }
        return res.status(200).json(rows);

    })
}



exports.addTransaction = (req, res) => {
    const {action} = req.body;
    const amount = parseInt(req.body.amount);
    const {user_id} = req.profile;
    if(amount==0){
        return res.json({error:'please enter valid amount'})
    }
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
                return res.json({error:'please check your balance'})
            }
        }
        if(action !== 'deposite' && action !=='withdraw'){
            return res.json({error:'Please select Action to perform'})
        }
        console.log(action, amount, user_id)
            pool.query(`INSERT INTO accounts(action, amount, created_at, u_id, current_amount) 
        values('${action}',${amount},now(),${user_id},${c_amount}) `,(err,rows)=> {
            console.log(c_amount)
            if(err || rows.length === 0){
                return res.status(400).json({
                    error:'Transaction cancelled'
                })
            }
            return res.status(200).json({
                amount
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
    pool.query('select a.user_id,a.username,b.current_amount,b.u_id,b.transaction_id from users a, accounts b where a.role = 0 and a.user_id=b.u_id order by transaction_id desc',(err, rows) => {
        if(err || rows.length === 0){
            console.log(err)
            return res.status(400).json({
                error:'Users not found'
            })
        }

        const groupBy = (array, key) => {
            return array.reduce((result, currentValue)=>{
                (result[currentValue[key]]= result[currentValue[key]] || []).push(
                    currentValue
                );
                return result;
            },{});
        }
        const rowsGroupedByUserId = groupBy(rows, 'user_id')
        const users = Object.entries(rowsGroupedByUserId).map((v,k)=>{
            return v[1][0]
        })
        res.status(200).json(users)
    })
}