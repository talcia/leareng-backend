const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const mailjet = require('node-mailjet').connect(
	process.env.API_KEY_MAIL,
	process.env.API_PASS_MAIL
);

const User = require('../models/User');
const TokenSignup = require('../models/TokenSignup');
const TokenReset = require('../models/TokenReset');

exports.signup = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error('Validation faild');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const email = req.body.email;

		const existingUser = await User.findOne({ email: email });
		if (existingUser) {
			console.log('tutaj');
			const error = new Error('User with this email already exisits');
			error.statusCode = 409;
			throw error;
		}

		const name = req.body.name;
		const password = req.body.password;
		const hashedPassword = await bcrypt.hash(password, 12);
		const avatarUrl = '';

		const tokenSignup = new TokenSignup({
			token: crypto.randomBytes(32).toString('hex'),
		});
		const user = new User({
			email: email,
			password: hashedPassword,
			name: name,
			avatarUrl: avatarUrl,
			tokenToSignup: tokenSignup._id,
		});

		const msg = {
			From: {
				Email: process.env.MAIL_FROM_MAIL,
				Name: 'Leareng App',
			},
			To: [
				{
					Email: email,
				},
			],
			Subject: 'Complete the singup',
			TextPart: 'You successfully signed up!',
			HTMLPart: `<h1>You successfully signed up!</h1>
			<br>
			<p>Let's confirm your email address</p>
			<p>Click this <a href="${process.env.FRONTEND_URL}/${
				'confirme' + tokenSignup.token
			}">link</a> to confim email</p>`,
		};

		sendEmail(msg);

		const result = await user.save();
		await tokenSignup.save();
		res.status(201).json({
			message: 'User created',
			userId: result._id,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.sendConfrimEmailAgain = async (req, res, next) => {
	try {
		const email = req.body.email;
		const user = await User.findOne({ email: email });
		if (!user) {
			const error = new Error('User with this email not find');
			error.statusCode = 404;
			throw error;
		}

		const tokenSignup = new TokenSignup({
			token: crypto.randomBytes(32).toString('hex'),
		});

		const msg = {
			From: {
				Email: process.env.MAIL_FROM_MAIL,
				Name: 'Leareng App',
			},
			To: [
				{
					Email: email,
				},
			],
			Subject: 'Complete the singup',
			TextPart: 'You successfully signed up!',
			HTMLPart: `<h1>You successfully signed up!</h1>
			<br>
			<p>Let's confirm your email address</p>
			<p>Click this <a href="${process.env.FRONTEND_URL}/${
				'confirme' + tokenSignup.token
			}">link</a> to confim email</p>`,
		};

		sendEmail(msg);
		user.tokenToSignup = tokenSignup;
		await user.save();
		await tokenSignup.save();

		res.status(200).json({
			message: 'Email sent',
			email: email,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.confirmEmail = async (req, res, next) => {
	try {
		const tokenFromLink = req.params.token;
		if (!tokenFromLink) {
			const error = new Error('Link is not valid');
			error.statusCode = 400;
			throw error;
		}
		const token = await TokenSignup.findOne({ token: tokenFromLink });
		if (!token) {
			const error = new Error('Token not found');
			error.statusCode = 404;
			throw error;
		}
		const updatedUser = await User.findOne({
			tokenToSignup: token._id.toString(),
		});

		updatedUser.tokenToSignup = null;
		updatedUser.active = true;

		await updatedUser.save();
		await TokenSignup.findByIdAndRemove(token._id);

		const tokenLogin = jwt.sign(
			{
				email: updatedUser.email,
				userId: updatedUser._id.toString(),
				role: updatedUser.role.toString(),
				blocked: updatedUser.blocked,
				emailConfirm: updatedUser.active,
			},
			`${process.env.MAILTRAP_USER}`,
			{ expiresIn: '1h' }
		);

		res.status(200).json({ email: 'Email confirmed', token: tokenLogin });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error('Invalid data');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const email = req.body.email;
		const password = req.body.password;
		const user = await User.findOne({ email: email });
		if (!user) {
			const error = new Error('Invalid user data');
			error.statusCode = 422;
			throw error;
		}
		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			const error = new Error('Invalid user data');
			error.statusCode = 422;
			throw error;
		}
		const token = jwt.sign(
			{
				email: user.email,
				userId: user._id.toString(),
				role: user.role.toString(),
				blocked: user.blocked,
				emailConfirm: user.active,
			},
			`${process.env.MAILTRAP_USER}`
		);

		res.status(200).json({
			token: token,
			userId: user._id.toString(),
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.tokenToResetPassword = async (req, res, next) => {
	try {
		const email = req.body.email;
		const user = await User.findOne({ email: email });
		if (!user) {
			const error = new Error('No user found with that email address');
			error.statusCode = 404;
			throw error;
		}
		if (user.tokenToResetPw) {
			TokenReset.findByIdAndRemove(user.tokenToResetPw);
			user.tokenToResetPw = null;
			await user.save();
		}
		const tokenReset = new TokenReset({
			token: crypto.randomBytes(32).toString('hex'),
		});
		tokenReset.save();
		user.tokenToResetPw = tokenReset._id;
		user.save();

		const msg = {
			From: {
				Email: process.env.MAIL_FROM_MAIL,
				Name: 'Leareng App',
			},
			To: [
				{
					Email: email,
				},
			],
			Subject: 'Reset your password',
			TextPart: 'You asked to password change',
			HTMLPart: `<h1>You asked to password change</h1>
			<p>To reset your password click this <a href="${process.env.FRONTEND_URL}/${
				'password' + tokenReset.token
			}">link</a></p>`,
		};
		sendEmail(msg);
		res.status(200).json({
			message: 'Link to reset password was sent to email',
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.resetPassword = async (req, res, next) => {
	try {
		const tokenReset = req.params.token;
		console.log(tokenReset);
		const token = await TokenReset.findOne({ token: tokenReset });
		if (!token) {
			const error = new Error('Token not found');
			error.statusCode = 404;
			throw error;
		}

		if (token.hasExpired()) {
			const error = new Error('Token expired');
			error.statusCode = 422;
			throw error;
		}
		const user = await User.findOne({ tokenToResetPw: token._id });
		console.log(user);
		if (!user) {
			const error = new Error('No user found with that email');
			error.statusCode = 404;
			throw error;
		}
		if (user.tokenToResetPw.toString() !== token._id.toString()) {
			const error = new Error('Invalid token');
			error.statusCode = 422;
			throw error;
		}

		const newPassword = req.body.password;
		const hashedPassword = await bcrypt.hash(newPassword, 12);

		user.tokenToResetPw = null;
		user.password = hashedPassword;

		user.save();
		await TokenReset.findByIdAndRemove(token._id);

		const msg = {
			From: {
				Email: process.env.MAIL_FROM_MAIL,
				Name: 'Leareng App',
			},
			To: [
				{
					Email: user.email,
				},
			],
			Subject: 'Your password was successfully reset',
			TextPart: 'Congrats, your password was successfully reset',
			HTMLPart: '<h1>Congrats, your password was successfully reset</h1>',
		};
		sendEmail(msg);
		res.status(200).json({
			message: 'Password was restarted',
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

const sendEmail = (msg) => {
	const request = mailjet
		.post('send', { version: 'v3.1' })
		.request({ Messages: [msg] });
	request
		.then((result) => {
			console.log('Email sent');
		})
		.catch((err) => {
			console.log(err);
			const error = new Error("Can't send email");
			error.statusCode = 500;
			error.data = err;
			throw error;
		});
};
