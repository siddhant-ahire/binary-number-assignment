const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken'); //to generate signed token
const expressjwt = require('express-jwt');// for authorization check
const crypto = require('crypto')
const { v1: uuidv1 } = require('uuid');
const db = require('../db/db');

const encryptPassword = (salt, password) => {
    if (!password) return '';
    try {
        return crypto.createHmac('sha1', salt)
            .update(password)
            .digest('hex')
    } catch (err) {
        return ''
    }
}

exports.signup = (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        let errorMessage = error.array();
        return res.status(400).json({ error: errorMessage[0].msg })
    }
    const salt = uuidv1();
    const hashed_password = encryptPassword(salt, req.body.password)
    db.select('*').from('users').where('username', req.body.username)
        .then((users) => {
            if (users.length !== 0) {
                return res.json({
                    error: 'user is already exitst!'
                })
            }
            db('users').insert({ username: req.body.username, password: hashed_password, role: req.body.role, salt: salt })
                .returning()
                .then((id) => {
                    db('accounts').insert({ action: 'initial', amount: 0, u_id: id, current_amount: 0 })
                        .then((rows) => {
                            if (rows.length === 0) {
                                return res.status(400).json({
                                    error: 'something went wrong'
                                })
                            }
                            return res.status(200).json({
                                message: 'account created successfully'
                            })
                        })
                        .catch((err) => {
                            return res.status(400).json({
                                error: 'something went wrong'
                            })
                        })
                })
                .catch((err) => {
                    return res.status(400).json({
                        error: 'account not created please signup again'
                    })
                })
        })
        .catch((err) => {
            console.log(err)
            return res.status(400).json({
                error: 'account not created please signup again'
            })
        })
}


exports.signin = (req, res, next) => {
    //find the user based on email
    const { username, password } = req.body;
    db.select('*').from('users').where('username',username)
    .then((row)=> {
        if (row.length === 0) {
            return res.status(400).json({
                error: 'User with that email does not exist.please signup'
            })
        }  
        //if user is found make sure the email and password match
        const hashed_password = encryptPassword(row[0].salt, password);
        console.log(row[0].salt, 'hsh', hashed_password)
        if (hashed_password !== row[0].password) {
            return res.status(401).json({
                error: 'Email and Password dont match'
            })
        }
        //generate a signed token with use id and secret
        const token = jwt.sign({ user_id: row[0].user_id }, process.env.JWT_SECRET)
        //persist the token as 't' in cookie with expiry date 
        res.cookie('t', token, { expire: new Date() + 9999 })
        // return response with use and token to fontend client
        const { user_id, username, role } = row[0];
        return res.status(200).json({ token, user: { user_id, username, role } })
    })
    .catch((err)=>{
        return res.status(400).json({
            error: 'User with that email does not exist.please signup'
        })
    })
}

exports.signout = (req, res) => {
    res.clearCookie('t');
    res.json({ message: 'Signedout successful' })
}

exports.requireSignin = expressjwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'auth',
    algorithms: ['HS256']

})

exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile.user_id == req.auth.user_id;
    if (!user) {
        return res.status(403).json({
            error: 'Access denied'
        });
    }
    next();
}

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: 'Admin resourse! Access denied'
        })
    }
    next();
}

exports.isNotAdmin = (req, res, next) => {
    if (req.profile.role === 1) {
        return res.status(403).json({
            error: 'Not a banker resourse! Access denied'
        })
    }
    next();
}