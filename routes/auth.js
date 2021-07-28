const express = require('express');
const { signin ,signup, signout} = require('../controllers/auth');
const { checkSchema } = require('express-validator');
const { userSignupValidator } = require('../utils/validator');
const router = express.Router();

router.post('/signin',signin);
router.post('/signup',checkSchema(userSignupValidator),signup);
router.get('/signout',signout);



module.exports = router;