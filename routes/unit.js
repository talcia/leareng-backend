const express = require("express");
const { body } = require("express-validator/check");

const isAuth = require("../middleware/is-auth");
const isEmailConfirm = require("../middleware/is-email-confirm");
const isBlocked = require("../middleware/is-user-blocked");
const unitController = require("../controllers/unit");

const router = express.Router();

router.post(
	"/",
	isAuth,
	isEmailConfirm,
	isBlocked,
	[
		body("name").trim().not().isEmpty(),
		body("fromLang").trim().not().isEmpty(),
		body("toLang").trim().not().isEmpty(),
	],
	unitController.createUnit
);

router.get("/", isAuth, unitController.getUnits);

router.get("/:id", isAuth, isEmailConfirm, unitController.getUnit);

router.patch(
	"/:id",
	[
		body("name").trim().not().isEmpty(),
		body("fromLang").trim().not().isEmpty(),
		body("toLang").trim().not().isEmpty(),
	],
	isAuth,
	isBlocked,
	isEmailConfirm,
	unitController.updateUnit
);

router.delete(
	"/:id",
	isAuth,
	isEmailConfirm,
	isBlocked,
	unitController.deleteUnit
);

router.post(
	"/:id/words",
	isAuth,
	isEmailConfirm,
	isBlocked,
	[
		body("word").trim().not().isEmpty(),
		body("translation").trim().not().isEmpty(),
		body("fromLang").trim().not().isEmpty(),
		body("toLang").trim().not().isEmpty(),
	],
	unitController.addWordToUnit
);

router.get(
	"/:id/words",
	isAuth,
	isEmailConfirm,
	isBlocked,
	unitController.getWordsFromUnit
);

module.exports = router;
