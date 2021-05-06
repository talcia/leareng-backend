const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const unitSchema = new Schema(
	{
		name: {
			type: String,
			require: true,
		},
		fromLang: {
			type: String,
			require: true,
		},
		toLang: {
			type: String,
			require: true,
		},
		score: {
			type: Number,
			default: 0,
		},
		private: {
			type: Boolean,
			default: false,
		},
		words: [
			{
				type: Schema.Types.ObjectId,
				ref: "Word",
			},
		],
		creator: {
			type: Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Unit", unitSchema);
