const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const uuidSchema = new Schema({
	code: {
		type: String,
		require: true,
	},
});

module.exports = mongoose.model("Uuid", uuidSchema);
