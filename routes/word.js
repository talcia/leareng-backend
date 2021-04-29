const express = require("express");
const { body } = require("express-validator/check");

const isAuth = require("../middleware/is-auth");
const isEmailConfirm = require("../middleware/is-email-confirm");
const isBlocked = require("../middleware/is-user-blocked");
const wordController = require("../controllers/word");

const router = express.Router();

router.get("/", isAuth, isEmailConfirm, wordController.getWords);

router.get("/recent/:number", isAuth, isBlocked, wordController.getRecentWords);

router.get("/:id", isAuth, isEmailConfirm, wordController.getWord);

router.patch(
	"/:id",
	isBlocked,
	[
		body("word").trim().not().isEmpty(),
		body("translation").trim().not().isEmpty(),
		body("fromLang").trim().not().isEmpty(),
		body("toLang").trim().not().isEmpty(),
	],
	isAuth,
	isEmailConfirm,
	wordController.updateWord
);

router.delete(
	"/:id",
	isAuth,
	isBlocked,
	isEmailConfirm,
	wordController.deleteWord
);

router.get(
	"/:fromLang/:toLang",
	isAuth,
	isBlocked,
	wordController.getWordFromLangToLang
);

router.get(
	"/:fromLang/:toLang/:randomNumber",
	isAuth,
	isBlocked,
	wordController.getRandomWords
);

module.exports = router;
