const { validationResult } = require("express-validator/check");

const User = require("../models/user");
const Word = require("../models/word");

exports.createWord = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error("Validation faild");
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const word = req.body.word;
		const translation = req.body.translation;
		let creator;

		const createdWord = new Word({
			word: word,
			translation: translation,
			creator: req.userId,
		});

		await createdWord.save();

		const user = await User.findById(req.userId);
		creator = user;
		user.words.push(createdWord._id);
		await user.save();

		res.status(200).json({
			message: "Word created",
			word: createdWord,
			creator: { _id: creator._id, name: creator.name },
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

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
		console.log(req.params);
		const word = await Word.findById(req.params.id);
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
		if (updatedWord.creator._id.toString() !== req.userId) {
			const error = new Error("Not Authorized");
			error.status = 403;
			throw error;
		}
		console.log(updatedWord);
		console.log(req.params);
		updatedWord.word = req.body.word;
		updatedWord.translation = req.body.translation;
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
		if (updatedWord.creator._id.toString() !== req.userId) {
			const error = new Error("Not Authorized");
			error.status = 403;
			throw error;
		}
		await Word.findByIdAndRemove(wordId);
		console.log(req.userId);
		const user = await User.findById(req.userId);
		console.log(user);
		user.words.pull(wordId);
		await user.save();

		res.status(200).json({ word: "Word deleted" });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
