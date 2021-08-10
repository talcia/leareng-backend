const { validationResult } = require('express-validator/check');

const User = require('../models/User');
const Word = require('../models/Word');
const Unit = require('../models/Unit');

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
			unit: user.unit,
			blocked: user.blocked,
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
			const error = new Error('User with this id not find');
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
			const error = new Error('Validation faild');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const userId = req.params.id;
		const updatedUser = await User.findById(userId);
		if (!updatedUser) {
			const error = new Error('Could not find user');
			error.statusCode = 404;
			throw error;
		}
		if (updatedUser._id.toString() !== req.userId) {
			const error = new Error('Not Authorized');
			error.statusCode = 401;
			throw error;
		}
		updatedUser.email = updatedUser.email;
		updatedUser.name = req.body.name;
		updatedUser.avatarUrl = req.body.avatarUrl;
		updatedUser.role = updatedUser.role;
		updatedUser.password = updatedUser.password;
		updatedUser.words = updatedUser.words;
		updatedUser.score = updatedUser.score;

		await updatedUser.save();
		res.status(201).json({
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
			const error = new Error('Could not find user');
			error.statusCode = 404;
			throw error;
		}
		if (user._id.toString() !== req.userId && +req.userRole !== 0) {
			const error = new Error('Not Authorized');
			error.statusCode = 401;
			throw error;
		}
		await User.findByIdAndRemove(userId);
		res.status(200).json({ user: 'User deleted' });
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
			const error = new Error('User with this id not find');
			error.statusCode = 404;
			throw error;
		}

		if (
			user._id.toString() !== req.userId.toString() &&
			+req.userRole !== 0
		) {
			const error = new Error('Not authorized');
			error.statusCode = 401;
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
			const error = new Error('User with this id not find');
			error.statusCode = 404;
			throw error;
		}
		if (
			user._id.toString() !== req.userId.toString() &&
			+req.userRole !== 0
		) {
			const error = new Error('Not authorized');
			error.statusCode = 401;
			throw error;
		}
		const wordId = req.params.wordId;

		const word = await Word.findById(wordId);
		if (!word) {
			const error = new Error('Word with this id not find');
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

exports.getUnits = async (req, res, next) => {
	try {
		const userId = req.params.id;
		const user = await User.findById(userId);
		if (!user) {
			const error = new Error('User with this id not find');
			error.statusCode = 404;
			throw error;
		}
		if (
			user._id.toString() !== req.userId.toString() &&
			+req.userRole !== 0
		) {
			const error = new Error('Not authorized');
			error.statusCode = 401;
			throw error;
		}
		const userUnits = await Unit.find({ creator: userId }).sort({
			createdAt: -1,
		});

		const modifyUserUnits = [...userUnits].map((unit) => ({
			_id: unit._id,
			name: unit.name,
			words: unit.words,
			fromLang: unit.fromLang,
			toLang: unit.toLang,
			popularity: unit.popularity,
			creator: unit.creator,
		}));
		res.status(200).json({
			user: {
				_id: user._id,
				units: modifyUserUnits,
			},
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getUnit = async (req, res, next) => {
	try {
		const userId = req.params.id;
		const user = await User.findById(userId);
		if (!user) {
			const error = new Error('User with this id not find');
			error.statusCode = 404;
			throw error;
		}
		if (
			user._id.toString() !== req.userId.toString() &&
			+req.userRole !== 0
		) {
			const error = new Error('Not authorized');
			error.statusCode = 401;
			throw error;
		}
		const unitId = req.params.unitId;

		const unit = await Unit.findById(unitId);
		if (!unit) {
			const error = new Error('Unit with this id not find');
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json({
			user: {
				_id: user._id,
				unit: {
					_id: unitId,
					name: unit.name,
					fromLang: unit.fromLang,
					toLang: unit.toLang,
					score: unit.score,
					private: unit.private,
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

exports.blockUser = async (req, res, next) => {
	try {
		const userId = req.params.id;
		const user = await User.findById(userId);
		if (!user) {
			const error = new Error('User with this id not find');
			error.statusCode = 404;
			throw error;
		}

		if (user.role === 0) {
			const error = new Error("Admin can't be blocked");
			error.statusCode = 403;
			throw error;
		}

		if (user.blocked) {
			const error = new Error('User with this id is already blocked');
			error.statusCode = 403;
			throw error;
		}

		user.blocked = true;
		user.save();

		res.status(200).json({
			message: 'User has been blocked',
			user: {
				_id: user._id,
				blocked: user.blocked,
			},
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.unblockUser = async (req, res, next) => {
	try {
		const userId = req.params.id;
		const user = await User.findById(userId);
		if (!user) {
			const error = new Error('User with this id not find');
			error.statusCode = 404;
			throw error;
		}
		if (!user.blocked) {
			const error = new Error('User with this id is not blocked');
			error.statusCode = 422;
			throw error;
		}

		user.blocked = false;
		user.save();

		res.status(200).json({
			message: 'User has been unblocked',
			user: {
				_id: user._id,
				blocked: user.blocked,
			},
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getFavouritesUnits = async (req, res, next) => {
	try {
		const userId = req.userId;
		const user = await User.findById(userId);
		const favUnitsUser = user.favouritesUnits;

		const favUnits = await Unit.find({ _id: { $in: favUnitsUser } });
		res.status(200).json({
			user: {
				_id: user._id,
				favouritesUnits: favUnits,
			},
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.addFavouritesUnits = async (req, res, next) => {
	try {
		const userId = req.userId;
		const user = await User.findById(userId);
		const unitId = req.params.unitId;
		const unit = await Unit.findById(unitId);
		if (!unit) {
			const error = new Error('Unit with this id not find');
			error.statusCode = 404;
			throw error;
		}
		if (unit.creator.toString() === req.userId.toString()) {
			const error = new Error("Can't add own unit to favourites");
			error.statusCode = 401;
			throw error;
		}
		if (unit.private) {
			const error = new Error('Not authorized');
			error.statusCode = 401;
			throw error;
		}
		if (user.favouritesUnits.includes(unitId)) {
			const error = new Error(
				'Unit has been already added to favourties'
			);
			error.statusCode = 401;
			throw error;
		}
		user.favouritesUnits.push(unit._id);
		console.log(unit.popularity);
		unit.popularity = +unit.popularity + 1;
		await unit.save();
		await user.save();
		res.status(200).json({
			status: 200,
			message: 'Unit succesfully added to favourites units',
			user: {
				_id: user._id,
				favouritesUnits: user.favouritesUnits,
			},
			unit: {
				popularity: unit.popularity,
			},
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.deleteFavouritesUnits = async (req, res, next) => {
	try {
		const userId = req.userId;
		const user = await User.findById(userId);
		const unitId = req.params.unitId;

		const unit = await Unit.findById(unitId);
		if (!unit) {
			const error = new Error('Unit with this id not find');
			error.statusCode = 404;
			throw error;
		}
		if (!user.favouritesUnits.includes(unitId)) {
			const error = new Error(
				'Unit with this id is not liked by this user'
			);
			error.statusCode = 404;
			throw error;
		}
		user.favouritesUnits.pull(unit._id);
		unit.popularity = +unit.popularity - 1;
		await unit.save();
		await user.save();
		res.status(200).json({
			status: 200,
			message: 'Unit succesfully deleted from favourites units',
			user: {
				_id: user._id,
				favouritesUnits: user.favouritesUnits,
			},
			unit: {
				popularity: unit.popularity,
			},
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
