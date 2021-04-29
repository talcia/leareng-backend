const { validationResult } = require("express-validator/check");
const { isUserBlocked } = require("../utils/isUserBlocked");

const User = require("../models/user");
const Word = require("../models/word");

exports.getWords = async (req, res, next) => {
	try {
		const words = await Word.find();
		res.status(200).json({ words: words });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getWord = async (req, res, next) => {
	try {
		const wordId = req.params.id;
		const word = await Word.findById(wordId);
		if (!word) {
			const error = new Error("Word with this id not find");
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json({ word: word });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.updateWord = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error("Validation faild");
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const updatedWord = await Word.findById(req.params.id);
		if (!updatedWord) {
			const error = new Error("Could not find word");
			error.status = 404;
			throw error;
		}
		if (await isUserBlocked(req.userId)) {
			const error = new Error("User is blocked");
			error.status = 403;
			throw error;
		}

		if (
			updatedWord.creator._id.toString() !== req.userId &&
			+req.userRole !== 0
		) {
			const error = new Error("Not Authorized");
			error.status = 403;
			throw error;
		}
		updatedWord.word = req.body.word;
		updatedWord.fromLang = req.body.fromLang;
		updatedWord.translation = req.body.translation;
		updatedWord.toLang = req.body.toLang;
		const result = await updatedWord.save();
		res.status(200).json({ word: result });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.deleteWord = async (req, res, next) => {
	try {
		const wordId = req.params.id;
		const updatedWord = await Word.findById(wordId).populate("creator");
		if (!updatedWord) {
			const error = new Error("Could not find word");
			error.status = 404;
			throw error;
		}
		const user = await User.findById(req.userId);
		if (await isUserBlocked(req.userId)) {
			const error = new Error("User is blocked");
			error.status = 403;
			throw error;
		}
		if (
			updatedWord.creator._id.toString() !== req.userId &&
			+req.userRole !== 0
		) {
			const error = new Error("Not Authorized");
			error.status = 403;
			throw error;
		}

		const unit = Unit.findById(word.block);
		if (unit) {
			const error = new Error("This word isn't in any unit");
			error.status = 404;
			throw error;
		}

		await Word.findByIdAndRemove(wordId);
		user.words.pull(wordId);
		await user.save();
		unit.words.pull(wordId);
		await unit.save();

		res.status(200).json({ word: "Word deleted" });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getWordFromLangToLang = async (req, res, next) => {
	try {
		const fromLang = req.params.fromLang;
		const toLang = req.params.toLang;

		const words = await Word.find({ fromLang: fromLang, toLang: toLang });

		if (words.length === 0) {
			const error = new Error("Could not find words for this language");
			error.status = 404;
			throw error;
		}

		const modifyWords = [...words].map((word) => ({
			_id: word._id,
			word: word.word,
			translation: word.translation,
			fromLang: word.fromLang,
			toLang: word.toLang,
		}));

		res.status(200).json({ words: modifyWords });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getRandomWords = async (req, res, next) => {
	try {
		const fromLang = req.params.fromLang;
		const toLang = req.params.toLang;
		const numberOfRandomWords = req.params.randomNumber;

		if (numberOfRandomWords <= 0) {
			const error = new Error(
				"Number must be a positive number greater than zero"
			);
			error.status = 404;
			throw error;
		}

		const words = await Word.aggregate([
			{
				$match: {
					fromLang: fromLang,
					toLang: toLang,
				},
			},
			{ $sample: { size: numberOfRandomWords * 1 } },
		]);

		if (words.length === 0) {
			const error = new Error("Could not find words for this language");
			error.status = 404;
			throw error;
		}

		const modifyWords = [...words].map((word) => ({
			_id: word._id,
			word: word.word,
			translation: word.translation,
			fromLang: word.fromLang,
			toLang: word.toLang,
		}));

		res.status(200).json({ words: modifyWords });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
