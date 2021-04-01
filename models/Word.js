const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wordSchema = new Schema({
	word: {
		type: String,
		require: true,
	},
	fromLang: {
		type: String,
		require: true,
	},
	translation: {
		type: String,
		require: true,
	},
	toLang: {
		type: String,
		require: true,
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: "User",
		require: true,
	},
});

module.exports = mongoose.model("Word", wordSchema);
