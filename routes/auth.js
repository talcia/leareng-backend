const express = require('express');
const { body } = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

router.post(
	'/signup',
	[
		body('email').isEmail().withMessage('Please enter a valid email'),
		body('password')
			.trim()
			.isLength({ min: 8 })
			.withMessage('Password must be at least 8 character long'),
		body('name')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Please enter your name'),
	],
	authController.signup
);

router.get('/confirmEmail/:token', authController.confirmEmail);

router.post('/sendConfirmEmailAgain', authController.sendConfrimEmailAgain);

router.post(
	'/login',
	[
		body('email').not().isEmpty().withMessage('Invalid data'),
		body('password').not().isEmpty().withMessage('Invalid data'),
	],
	authController.login
);

router.post('/resetPassword', authController.tokenToResetPassword);

router.post(
	'/resetPassword/:token',
	[
		body('password')
			.trim()
			.isLength({ min: 8 })
			.withMessage('Password must be at least 8 character long'),
	],
	authController.resetPassword
);

module.exports = router;
