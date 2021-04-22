const { validationResult } = require("express-validator/check");
const { update } = require("../models/user");

const User = require("../models/user");
const Word = require("../models/word");

exports.getUsers = async (req, res, next) => {
	try {
		const users = await User.find();
		const modifyUsers = [...users].map((user) => ({
			_id: user._id,
			email: user.email,
			name: user.name,
			avatarUrl: user.avatarUrl,
			role: user.role,
			words: user.words,
		}));
		res.status(200).json({ users: modifyUsers });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getUser = async (req, res, next) => {
	try {
		const userId = req.params.id;
		const user = await User.findById(userId);
		if (!user) {
			const error = new Error("User with this id not find");
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json({
			user: {
				_id: user._id,
				email: user.email,
				name: user.name,
				avatarUrl: user.avatarUrl,
				role: user.role,
				words: user.words,
			},
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.updateUser = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error("Validation faild");
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const userId = req.params.id;
		const updatedUser = await User.findById(userId);
		if (!updatedUser) {
			const error = new Error("Could not find user");
			error.status = 404;
			throw error;
		}
		if (updatedUser._id.toString() !== req.userId) {
			const error = new Error("Not Authorized");
			error.status = 403;
			throw error;
		}
		updatedUser.email = updatedUser.email;
		updatedUser.name = req.body.name;
		updatedUser.avatarUrl = req.body.avatarUrl;
		updatedUser.role = updatedUser.role;
		updatedUser.password = updatedUser.password;
		updatedUser.words = updatedUser.words;

		await updatedUser.save();
		res.status(200).json({
			user: {
				_id: updatedUser._id,
				email: updatedUser.email,
				name: updatedUser.name,
				avatarUrl: updatedUser.avatarUrl,
				role: updatedUser.role,
				words: updatedUser.words,
			},
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.deleteUser = async (req, res, next) => {
	try {
		const userId = req.params.id;
		const user = await User.findById(userId);
		if (!user) {
			const error = new Error("Could not find user");
			error.status = 404;
			throw error;
		}
		if (user._id.toString() !== req.userId && req.userRole * 1 !== 0) {
			const error = new Error("Not Authorized");
			error.status = 403;
			throw error;
		}
		await User.findByIdAndRemove(userId);
		res.status(200).json({ user: "User deleted" });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getWords = async (req, res, next) => {
	try {
		const userId = req.params.id;
		const user = await User.findById(userId);
		if (!user) {
			const error = new Error("User with this id not find");
			error.statusCode = 404;
			throw error;
		}
		const userWords = await Word.find({ creator: userId });
		const modifyUserWords = [...userWords].map((word) => ({
			_id: word._id,
			word: word.word,
			translation: word.translation,
			fromLang: word.fromLang,
			toLang: word.toLang,
		}));
		res.status(200).json({
			user: {
				_id: user._id,
				words: modifyUserWords,
			},
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getWord = async (req, res, next) => {
	try {
		const userId = req.params.id;
		const user = await User.findById(userId);
		if (!user) {
			const error = new Error("User with this id not find");
			error.statusCode = 404;
			throw error;
		}
		const wordId = req.params.wordId;

		const word = await Word.findById(wordId);
		if (!word) {
			const error = new Error("Word with this id not find");
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json({
			user: {
				_id: user._id,
				word: {
					_id: wordId,
					word: word.word,
					translation: word.translation,
					fromLang: word.fromLang,
					toLang: word.toLang,
				},
			},
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
