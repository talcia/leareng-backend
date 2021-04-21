const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/user");
const Uuid = require("../models/uuid");

// sgMail.setApiKey(
// 	"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"
// );

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
		const uuidCode = uuidv4();
		const uuId = new Uuid({
			code: uuidCode,
		});
		const user = new User({
			email: email,
			password: hashedPassword,
			name: name,
			avatarUrl: avatarUrl,
			uuid: uuId._id,
		});
		console.log(`chce wyslac do ${email}`);
		const msg = {
			to: email,
			from: "natalianews12@gmail.com",
			subject: "Complete the singup",
			html: `<h1>You successfully signed up!</h1>
					<br>
					<p>Let's confirm your email address</p>
					<p>Click this <a href="http://localhost:8080/auth/${uuId.code}">link</a> to confim email</p>`,
		};

		transporter.sendMail(msg, (err, info) => {
			if (err) {
				const error = new Error("Can't send email");
				error.statusCode = 422;
				error.data = err;
				throw error;
			}
			console.log("Email sent");
		});

		const result = await user.save();
		await uuId.save();
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

exports.confirmEmail = async (req, res, next) => {
	try {
		const uuidFromLink = req.params.uuid;
		if (!uuidFromLink) {
			const error = new Error("Link is not valid");
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		console.log(uuidFromLink);
		const uuid = await Uuid.findOne({ code: uuidFromLink });
		console.log(uuid);

		if (!uuid) {
			const error = new Error("Uuid not found");
			error.statusCode = 404;
			throw error;
		}
		const user = await User.findOne({ uuid: uuid._id });
		console.log(user);
		await Uuid.findByIdAndRemove(uuid._id);
		user.code = "";
		user.active = true;
		await user.save();
		// mozna zrobi logowanie od razu
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
