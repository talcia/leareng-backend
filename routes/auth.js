const express = require("express");
const { body } = require("express-validator/check");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.post(
	"/signup",
	[
		body("email")
			.isEmail()
			.withMessage("Please enter a valid email")
			.custom((value, { req }) => {
				return User.findOne({ email: value }).then((userDoc) => {
					if (userDoc) {
						return Promise.reject("Email address already exists");
					}
				});
			}),
		body("password")
			.trim()
			.isLength({ min: 8 })
			.withMessage("Password must be at least 8 character long"),
		body("name")
			.trim()
			.not()
			.isEmpty()
			.withMessage("Please enter your name"),
	],
	authController.signup
);

router.get("/confirmEmail/:token", authController.confirmEmail);

router.post(
	"/login",
	[
		body("email").not().isEmpty().withMessage("Invalid data"),
		body("password").not().isEmpty().withMessage("Invalid data"),
	],
	authController.login
);

router.get("/resetPassword", authController.tokenToResetPassword);

router.post("/:id/reset/:token", authController.resetPassword);

module.exports = router;
