const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

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
		const user = new User({
			email: email,
			password: hashedPassword,
			name: name,
			avatarUrl: avatarUrl,
		});
		const result = await user.save();
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
