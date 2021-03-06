const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wordSchema = new Schema(
	{
		word: [
			{
				type: String,
			},
		],
		fromLang: {
			type: String,
			require: true,
		},
		translation: [
			{
				type: String,
			},
		],
		toLang: {
			type: String,
			require: true,
		},
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
		unit: {
			type: Schema.Types.ObjectId,
			ref: 'Unit',
			require: true,
		},
		difficulty: {
			type: Number,
			default: 20,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Word', wordSchema);
