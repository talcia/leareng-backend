const { validationResult } = require("express-validator/check");
const { isUserBlocked } = require("../utils/isUserBlocked");

const Unit = require("../models/unit");
const User = require("../models/user");
const Word = require("../models/word");

exports.createUnit = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error("Validation faild");
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const user = await User.findById(req.userId);

		if (await isUserBlocked(req.userId)) {
			const error = new Error("User is blocked");
			error.status = 403;
			throw error;
		}

		const unitName = req.body.name;
		const fromLang = req.body.fromLang;
		const toLang = req.body.toLang;
		const isPrivate = req.body.private;
		let creator;

		const createdUnit = new Unit({
			name: unitName,
			fromLang: fromLang,
			toLang: toLang,
			private: isPrivate,
			creator: req.userId,
		});

		await createdUnit.save();
		creator = user;
		user.units.push(createdUnit._id);
		await user.save();

		res.status(200).json({
			message: "Unit created",
			unit: createdUnit,
			creator: { _id: creator._id, name: creator.name },
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
		const unit = await Unit.find({ private: false });
		res.status(200).json({ units: unit });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getUnit = async (req, res, next) => {
	try {
		const unitId = req.params.id;
		const unit = await Unit.findById(unitId);
		if (!unit) {
			const error = new Error("unit with this id not find");
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json({ unit: unit });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.updateUnit = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error("Validation faild");
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const updatedUnit = await Unit.findById(req.params.id);
		if (!updatedUnit) {
			const error = new Error("Unit with this id don't exists");
			error.status = 404;
			throw error;
		}
		if (await isUserBlocked(req.userId)) {
			const error = new Error("User is blocked");
			error.status = 403;
			throw error;
		}

		if (
			updatedUnit.creator._id.toString() !== req.userId &&
			+req.userRole !== 0
		) {
			const error = new Error("Not Authorized");
			error.status = 403;
			throw error;
		}
		updatedUnit.name = req.body.name;
		updatedUnit.fromLang = req.body.fromLang;
		updatedUnit.toLang = req.body.toLang;
		updatedUnit.private = req.body.private;
		updatedUnit.score = req.body.score ? req.body.score : updatedUnit.score;
		const result = await updatedUnit.save();
		res.status(200).json({ unit: result });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.deleteUnit = async (req, res, next) => {
	try {
		const unitId = req.params.id;
		const updatedUnit = await Unit.findById(unitId).populate("creator");
		if (!updatedUnit) {
			const error = new Error("Could not find unit");
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
			updatedUnit.creator._id.toString() !== req.userId &&
			+req.userRole !== 0
		) {
			const error = new Error("Not Authorized");
			error.status = 403;
			throw error;
		}
		await Unit.findByIdAndRemove(unitId);

		user.units.pull(unitId);
		await user.save();
		res.status(200).json({ unit: "Unit deleted" });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.addWordToUnit = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error("Validation faild");
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const user = await User.findById(req.userId);
		if (user.blocked) {
			const error = new Error("User is blocked");
			error.status = 403;
			throw error;
		}

		const unit = await Unit.findById(req.params.id);
		if (!unit) {
			const error = new Error("Unit with this id is not find");
			error.status = 403;
			throw error;
		}

		const word = req.body.word;
		const translation = req.body.translation;
		const fromLang = req.body.fromLang;
		const toLang = req.body.toLang;
		let creator;

		const createdWord = new Word({
			word: word,
			fromLang: fromLang,
			translation: translation,
			toLang: toLang,
			creator: req.userId,
			unit: unit._id,
		});

		await createdWord.save();
		creator = user;
		user.words.push(createdWord._id);
		await user.save();
		unit.words.push(createdWord._id);
		await unit.save();

		res.status(200).json({
			message: "Word succesfully added to unit",
			word: createdWord,
			creator: { _id: creator._id, name: creator.name },
			unit: { _id: unit._id, name: unit.name },
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getWordsFromUnit = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId);
		if (user.blocked) {
			const error = new Error("User is blocked");
			error.status = 403;
			throw error;
		}

		const unit = await Unit.findById(req.params.id);
		if (!unit) {
			const error = new Error("Unit with this id is not find");
			error.status = 403;
			throw error;
		}

		if (
			updatedUnit.creator._id.toString() !== req.userId &&
			+req.userRole !== 0 &&
			unit.private !== false
		) {
			const error = new Error("Not Authorized");
			error.status = 403;
			throw error;
		}

		const words = await Word.find({
			creator: req.userId,
			unit: unit._id,
		});
		res.status(200).json({ words: words });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
