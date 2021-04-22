const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tokenResetSchema = new Schema({
	token: {
		type: String,
		require: true,
	},
	createDate: { type: Date, default: Date.now() },
});

tokenResetSchema.methods.hasExpired = function () {
	return Date.now() - Date.parse(this.createDate) > 86400000; // 24 hours * 60 minutes * 60 seconds *1000 milliseconds = 86400000
};

module.exports = mongoose.model("TokenReset", tokenResetSchema);
