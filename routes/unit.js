const express = require("express");
const { body } = require("express-validator/check");

const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");
const unitController = require("../controllers/unit");

const router = express.Router();

router.post(
	"/",
	isAuth,
	[
		body("name").trim().not().isEmpty(),
		body("fromLang").trim().not().isEmpty(),
		body("toLang").trim().not().isEmpty(),
	],
	unitController.createUnit
);

router.get("/", isAuth, isAdmin, unitController.getUnits);

router.get("/:id", isAuth, unitController.getUnit);

router.patch(
	"/:id",
	[
		body("name").trim().not().isEmpty(),
		body("fromLang").trim().not().isEmpty(),
		body("toLang").trim().not().isEmpty(),
	],
	isAuth,
	unitController.updateUnit
);

router.delete("/:id", isAuth, unitController.deleteUnit);

router.post(
	"/:id/words",
	isAuth,
	[
		body("word").trim().not().isEmpty(),
		body("translation").trim().not().isEmpty(),
		body("fromLang").trim().not().isEmpty(),
		body("toLang").trim().not().isEmpty(),
	],
	unitController.addWordToUnit
);

router.get("/:id/words", isAuth, unitController.getWordsFromUnit);

// router.get("/:fromLang/:toLang/:randomNumber", unitController.getRandomWords);

module.exports = router;
