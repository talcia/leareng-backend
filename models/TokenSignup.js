const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tokenSignupSchema = new Schema({
	token: {
		type: String,
		require: true,
	},
});

module.exports = mongoose.model("TokenSignup", tokenSignupSchema);
