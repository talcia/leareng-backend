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
	role: {
		type: Number,
		default: 1,
	},
	active: {
		type: Boolean,
		default: false,
	},
	tokenToSignup: {
		type: Schema.Types.ObjectId,
		ref: "TokenSignup",
	},
	tokenToResetPw: {
		type: Schema.Types.ObjectId,
		ref: "TokenReset",
	},
	blocked: {
		type: Boolean,
		default: false,
	},
	words: [
		{
			type: Schema.Types.ObjectId,
			ref: "Word",
		},
	],
	units: [
		{
			type: Schema.Types.ObjectId,
			ref: "Unit",
		},
	],
});

module.exports = mongoose.model("User", userSchema);
