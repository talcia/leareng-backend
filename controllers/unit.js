const { validationResult } = require('express-validator/check');

const Unit = require('../models/Unit');
const User = require('../models/User');
const Word = require('../models/Word');

exports.createUnit = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error('Validation faild');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}

		const user = await User.findById(req.userId);

		const unitName = req.body.name;
		const fromLang = req.body.fromLang;
		const toLang = req.body.toLang;
		const isPrivate = req.body.private;
		let creator;

		if (fromLang === toLang) {
			const error = new Error("From lang and to lang can't be the same");
			error.statusCode = 422;
			throw error;
		}

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

		res.status(201).json({
			message: 'Unit created',
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
		const unit = await Unit.find({ private: false }).sort({
			createdAt: -1,
		});
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
			const error = new Error('unit with this id not find');
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
			const error = new Error('Validation faild');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const updatedUnit = await Unit.findById(req.params.id);
		if (!updatedUnit) {
			const error = new Error("Unit with this id don't exists");
			error.statusCode = 404;
			throw error;
		}

		if (
			updatedUnit.creator._id.toString() !== req.userId &&
			+req.userRole !== 0
		) {
			const error = new Error('Not Authorized');
			error.statusCode = 401;
			throw error;
		}
		updatedUnit.name = req.body.name;
		updatedUnit.fromLang = req.body.fromLang;
		updatedUnit.toLang = req.body.toLang;
		updatedUnit.private = req.body.private;
		updatedUnit.score = req.body.score ? req.body.score : updatedUnit.score;
		const result = await updatedUnit.save();
		res.status(201).json({ unit: result });
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
		const unit = await Unit.findById(unitId).populate('creator');
		if (!unit) {
			const error = new Error('Could not find unit');
			error.statusCode = 404;
			throw error;
		}
		const user = await User.findById(req.userId);
		if (unit.creator._id.toString() !== req.userId && +req.userRole !== 0) {
			const error = new Error('Not Authorized');
			error.statusCode = 401;
			throw error;
		}
		const words = await Word.find({ unit: unit._id });
		words.forEach((word) => {
			user.words.pull(word._id);
		});

		user.units.pull(unitId);

		await user.save();
		await Unit.findByIdAndRemove(unitId);
		await Word.deleteMany({ unit: unit._id });
		res.status(200).json({ unit: 'Unit deleted' });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.addWordToUnit = async (req, res, next) => {
	try {
		// const errors = validationResult(req);
		// if (!errors.isEmpty()) {
		// 	const error = new Error('Validation faild');
		// 	error.statusCode = 422;
		// 	error.data = errors.array();
		// 	throw error;
		// }
		const user = await User.findById(req.userId);

		const unit = await Unit.findById(req.params.id);
		if (!unit) {
			const error = new Error('Unit with this id is not find');
			error.statusCode = 401;
			throw error;
		}

		const word = req.body.word.map((item) => item.toLowerCase());
		const translation = req.body.translation.map((item) =>
			item.toLowerCase()
		);
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

		console.log(createdWord);

		await createdWord.save();
		creator = user;
		user.words.push(createdWord._id);
		await user.save();
		unit.words.push(createdWord._id);
		await unit.save();

		res.status(201).json({
			message: 'Word succesfully added to unit',
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
		const unit = await Unit.findById(req.params.id);
		if (!unit) {
			const error = new Error('Unit with this id is not find');
			error.statusCode = 404;
			throw error;
		}

		if (
			unit.creator._id.toString() !== req.userId &&
			+req.userRole !== 0 &&
			unit.private !== false
		) {
			const error = new Error('Not Authorized');
			error.statusCode = 401;
			throw error;
		}

		const words = await Word.find({
			unit: unit._id,
		}).sort({ createdAt: -1 });

		res.status(200).json({
			unitId: unit._id,
			name: unit.name,
			words: words,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getUnitFromLangToLang = async (req, res, next) => {
	try {
		const fromLang = req.params.fromLang;
		const toLang = req.params.toLang;

		const units = await Unit.find({ fromLang: fromLang, toLang: toLang });

		if (units.length === 0) {
			const error = new Error('Could not find units for this language');
			error.statusCode = 404;
			throw error;
		}

		const modifyUnits = [...units].map((unit) => ({
			_id: unit._id,
			name: unit.name,
			creator: unit.creator,
			fromLang: unit.fromLang,
			toLang: unit.toLang,
			popularity: unit.popularity,
			words: unit.words,
		}));

		res.status(200).json({ units: modifyUnits });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getUnitByKeyWord = async (req, res, next) => {
	try {
		const keyWord = req.params.keyWord;
		console.log(keyWord);
		const units = await Unit.find({
			name: { $regex: keyWord, $options: 'i' },
		});

		console.log(units);

		if (units.length === 0) {
			const error = new Error('Could not find units for this key word');
			error.statusCode = 404;
			throw error;
		}

		const modifyUnits = [...units].map((unit) => ({
			_id: unit._id,
			name: unit.name,
			creator: unit.creator,
			fromLang: unit.fromLang,
			toLang: unit.toLang,
			popularity: unit.popularity,
			words: unit.words,
		}));

		res.status(200).json({ units: modifyUnits });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getRandomWordsFromUnit = async (req, res, next) => {
	try {
		const unitId = req.params.unitId;
		const numberOfRandomWords = req.params.randomNumber;
		const reverseLang = req.params.reverseLang;

		console.log(numberOfRandomWords);

		if (numberOfRandomWords <= 0) {
			const error = new Error(
				'Number must be a positive number greater than zero'
			);
			error.statusCode = 404;
			throw error;
		}

		const unit = await Unit.findById(unitId);

		if (!unit) {
			const error = new Error('Unit with this id is not find');
			error.statusCode = 404;
			throw error;
		}

		if (unit.words.length === 0) {
			const error = new Error('Could not find words for this unit');
			error.statusCode = 404;
			throw error;
		}

		const randomWords = unit.words.sort(() => 0.5 - Math.random());

		const wordsIds = randomWords.slice(0, numberOfRandomWords);

		const words = [];

		for (let wordId of wordsIds) {
			console.log(wordId);
			const word = await Word.findById(wordId);
			words.push(word);
		}

		const modifyWords = [...words].map((word) => ({
			_id: word._id,
			word: reverseLang ? word.word : word.translation,
			translation: reverseLang ? word.translation : word.word,
			fromLang: word.fromLang,
			toLang: word.toLang,
		}));

		console.log(modifyWords);

		res.status(200).json({ words: modifyWords });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
