const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/user");
const TokenSignup = require("../models/TokenSignup");
const TokenReset = require("../models/TokenReset");

const transporter = nodemailer.createTransport({
	host: "smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: "3678d87d1812fd",
		pass: "9a50b4cb9bad77",
	},
});

exports.signup = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error("Validation faild");
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const email = req.body.email;
		const name = req.body.name;
		const password = req.body.password;
		const hashedPassword = await bcrypt.hash(password, 12);
		const avatarUrl = req.body.avatarUrl || "";

		const tokenSignup = new TokenSignup({
			token: crypto.randomBytes(32).toString("hex"),
		});
		const user = new User({
			email: email,
			password: hashedPassword,
			name: name,
			avatarUrl: avatarUrl,
			tokenToSignup: tokenSignup._id,
		});

		const msg = {
			to: email,
			from: "natalianews12@gmail.com",
			subject: "Complete the singup",
			html: `<h1>You successfully signed up!</h1>
					<br>
					<p>Let's confirm your email address</p>
					<p>Click this <a href="http://localhost:8080/auth/confirmEmail/${tokenSignup.token}">link</a> to confim email</p>`,
		};

		sendEmail(msg);

		const result = await user.save();
		await tokenSignup.save();
		res.status(200).json({
			message: "User created",
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
			const error = new Error("User with this email not find");
			error.statusCode = 404;
			throw error;
		}

		const tokenSignup = new TokenSignup({
			token: crypto.randomBytes(32).toString("hex"),
		});

		const msg = {
			to: email,
			from: "natalianews12@gmail.com",
			subject: "Complete the singup",
			html: `<h1>You successfully signed up!</h1>
				<br>
				<p>Let's confirm your email address</p>
				<p>Click this <a href="http://localhost:8080/auth/confirmEmail/${tokenSignup.token}">link</a> to confim email</p>`,
		};

		sendEmail(msg);
		user.tokenToSignup = tokenSignup;
		await user.save();
		await tokenSignup.save();

		res.status(200).json({
			message: "Email sent",
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
			const error = new Error("Link is not valid");
			error.statusCode = 422;
			throw error;
		}
		const token = await TokenSignup.findOne({ token: tokenFromLink });
		console.log(token._id);
		if (!token) {
			const error = new Error("Token not found");
			error.statusCode = 404;
			throw error;
		}
		const updatedUser = await User.findOne({
			tokenToSignup: token._id.toString(),
		});
		updatedUser.tokenToSignup = null;
		updatedUser.active = true;
		updatedUser.email = updatedUser.email;
		updatedUser.name = updatedUser.name;
		updatedUser.avatarUrl = updatedUser.avatarUrl;
		updatedUser.role = updatedUser.role;
		updatedUser.password = updatedUser.password;
		updatedUser.words = updatedUser.words;
		updatedUser.units = updatedUser.units;
		await updatedUser.save();
		await TokenSignup.findByIdAndRemove(token._id);

		res.status(200).json({ email: "Email confirmed" });
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
			const error = new Error("Invalid data");
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const email = req.body.email;
		const password = req.body.password;
		const user = await User.findOne({ email: email });
		if (!user) {
			const error = new Error("Invalid data");
			error.statusCode = 422;
			throw error;
		}
		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			const error = new Error("Invalid data");
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
			"secretsecret",
			{ expiresIn: "1h" }
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
			const error = new Error("No user found with that email address");
			error.statusCode = 404;
			throw error;
		}
		if (user.tokenToResetPw) {
			TokenReset.findByIdAndRemove(user.tokenToResetPw);
			user.tokenToResetPw = null;
			await user.save();
		}
		const tokenReset = new TokenReset({
			token: crypto.randomBytes(32).toString("hex"),
		});
		tokenReset.save();
		user.tokenToResetPw = tokenReset._id;
		user.save();

		const msg = {
			to: email,
			from: "natalianews12@gmail.com",
			subject: "Reset your password",
			html: `<h1>You asked to password change</h1>
					<p>To reset your password click this <a href="http://localhost:8080/auth/resetPassword/${tokenReset.token}">link</a></p>`,
		};
		sendEmail(msg);
		res.status(200).json({
			message: "Link to reset password was sent to email",
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
		const email = req.body.email;
		const tokenReset = req.params.token;
		const token = await TokenReset.findOne({ token: tokenReset });
		if (!token) {
			const error = new Error("Token don't exists");
			error.statusCode = 404;
			throw error;
		}

		if (token.hasExpired()) {
			const error = new Error("Token expired");
			error.statusCode = 422;
			throw error;
		}
		const user = await User.findOne({ tokenToResetPw: token._id });
		if (!user) {
			const error = new Error("No user found with that email");
			error.statusCode = 404;
			throw error;
		}
		if (user.tokenToResetPw.toString() !== token._id.toString()) {
			const error = new Error("Invalid token ");
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
			to: email,
			from: "natalianews12@gmail.com",
			subject: "Your password was successfully reset",
			html: `<h1>Congrats, your password was successfully reset</h1>`,
		};
		sendEmail(msg);
		res.status(200).json({
			message: "Password was reset",
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

const sendEmail = (msg) => {
	transporter.sendMail(msg, (err, info) => {
		if (err) {
			const error = new Error("Can't send email");
			error.statusCode = 422;
			error.data = err;
			throw error;
		}
		console.log("Email sent");
	});
};
