const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		require: true,
	},
	name: {
		type: String,
		require: true,
	},
	password: {
		type: String,
		require: true,
	},
	avatarUrl: {
		type: String,
	},
	words: [
		{
			type: Schema.Types.ObjectId,
			ref: "Word",
		},
	],
});

module.exports = mongoose.model("User", userSchema);
