const express = require('express');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById,read,accounts, addTransaction, listUsers,accountById, getTransaction} = require('../controllers/user');
const router = express.Router();

router.get('/secret/:userId',requireSignin,isAuth,isAdmin,(req,res)=>{
    res.json({
        user:req.profile
    })
})
router.get('/users/:userId',requireSignin,isAuth,isAdmin,listUsers)
router.get('/transaction/:userId/:accountId',requireSignin,isAuth,isAdmin,getTransaction)
router.get('/user/:userId',requireSignin,isAuth,read)
router.get('/accounts/:userId',requireSignin,isAuth,accounts)
router.post('/transaction/:userId',requireSignin,isAuth,addTransaction)

router.param('userId',userById);
router.param('accountId',accountById);

module.exports = router;