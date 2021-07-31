const db = require("../db/db");


exports.userById = (req, res, next, id) => {
    db.select('*').from('users').where('user_id', id)
        .then((rows) => {
            if (rows.length === 0) {
                return res.status(400).json({
                    error: 'User not found'
                })
            }
            req.profile = rows[0];
            next();
        })
        .catch((err) => {
            if (err) {
                return res.status(400).json({
                    error: 'Something happend in our side'
                })
            }
        })

}

exports.accountById = (req, res, next, id) => {
    db.select('*').from('users').where('user_id', id)
        .then((rows) => {
            if (rows.length === 0) {
                return res.status(400).json({
                    error: 'User not found'
                })
            }
            req.account = rows[0];
            next();
        })
        .catch((err) => {
            return res.status(400).json({
                error: 'Something happend in our side'
            })
        })
}

exports.read = (req, res) => {
    req.profile.password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile)
}

exports.getTransaction = (req, res) => {
    const { user_id } = req.account;
    db.select('*').from('accounts').where('u_id', user_id).orderBy('transaction_id', 'desc')
        .then((rows) => {
            if (rows.length === 0) {
                return res.status(400).json({
                    error: 'accounts not found'
                })
            }
            return res.status(200).json(rows);
        })
        .catch((err) => {
            return res.status(400).json({
                error: 'accounts not found'
            })
        })
}

exports.accounts = (req, res) => {
    const { user_id } = req.profile;
    db.select('*').from('accounts').where('u_id', user_id).orderBy('transaction_id', 'desc')
        .then((rows) => {
            if (rows.length === 0) {
                return res.status(400).json({
                    error: 'accounts not found'
                })
            }
            return res.status(200).json(rows);
        })
        .catch((err) => {
            return res.status(400).json({
                error: 'accounts not found'
            })
        })
}



exports.addTransaction = (req, res) => {
    const { action } = req.body;
    const amount = parseInt(req.body.amount);
    const { user_id } = req.profile;
    if (amount == 0) {
        return res.json({ error: 'please enter valid amount' })
    }
    const c_a = (current_amount) => {
        if (current_amount >= 0) {
            let c_amount = 0
            if (action == 'deposite') {
                c_amount = current_amount + amount
            }
            if (action == 'withdraw') {
                if (amount <= current_amount) {
                    c_amount = current_amount - amount
                }
                else {
                    return res.json({ error: 'please check your balance' })
                }
            }
            if (action !== 'deposite' && action !== 'withdraw') {
                return res.json({ error: 'Please select Action to perform' })
            }


            db('accounts').insert({ action, amount, u_id: user_id, current_amount: c_amount })
                .then((rows) => {
                    if (rows.length === 0) {
                        return res.status(400).json({
                            error: 'Transaction cancelled'
                        })
                    }
                    return res.status(200).json({
                        amount
                    });
                })
                .catch((err) => {
                    return res.status(400).json({
                        error: 'Transaction cancelled'
                    })
                })
        } else {
            return res.json({ message: 'Transaction Cancelled, Please Check Your Balance' })
        }
    }
    db.select('current_amount').from('accounts').where('u_id', user_id).orderBy('created_at', 'desc')
        .then((rows) => {
            if (rows.length === 0) {
                return c_a(0);
            }
            return c_a(rows[0].current_amount)
        })
        .catch((err) => {
            return c_a(0);
        })
}

exports.listUsers = (req, res, next) => {

    db({ a: 'users', b: 'accounts' })
        .select('a.user_id', 'a.username', 'b.current_amount', 'b.u_id', 'b.transaction_id')
        .where('a.role', 0)
        .where('a.user_id', db.raw('??', ['b.u_id']))
        .orderBy('b.transaction_id', 'desc')
        .then((rows) => {
            if (rows.length === 0) {
                console.log(err)
                return res.status(400).json({
                    error: 'Users not found'
                })
            }
            const groupBy = (array, key) => {
                return array.reduce((result, currentValue) => {
                    (result[currentValue[key]] = result[currentValue[key]] || []).push(
                        currentValue
                    );
                    return result;
                }, {});
            }
            const rowsGroupedByUserId = groupBy(rows, 'user_id')
            const users = Object.entries(rowsGroupedByUserId).map((v, k) => {
                return v[1][0]
            })
            console.log(users)
            res.status(200).json(users)
        })
        .catch((rows) => {
            return res.status(400).json({
                error: 'Users not found'
            })
        })

}