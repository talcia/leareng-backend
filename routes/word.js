const express = require("express");
const { body } = require("express-validator/check");

const isAuth = require("../middleware/is-auth");
const wordController = require("../controllers/word");

const router = express.Router();

router.post(
	"/",
	isAuth,
	[
		body("word").trim().not().isEmpty(),
		body("translation").trim().not().isEmpty(),
		body("fromLang").trim().not().isEmpty(),
		body("toLang").trim().not().isEmpty(),
	],
	wordController.createWord
);

router.get("/", isAuth, wordController.getWords);

router.get("/:id", isAuth, wordController.getWord);

router.patch("/:id", isAuth, wordController.updateWord);

router.delete("/:id", isAuth, wordController.deleteWord);

router.get("/:fromLang/:toLang", wordController.getWordFromLangToLang);

router.get("/:fromLang/:toLang/:randomNumber", wordController.getRandomWords);

module.exports = router;
