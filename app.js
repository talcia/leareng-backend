const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const MONGODB_URI =
	"mongodb+srv://adminek:qXPWEvsqnqDEEYcR@cluster0.8ypuv.mongodb.net/leareng?retryWrites=true&w=majority";

const app = express();

app.use(bodyParser.json());

mongoose
	.connect(MONGODB_URI)
	.then(() => {
		console.log("database connected");
		app.listen(8080, () => {
			console.log("app listening on port 8080");
		});
	})
	.then((err) => {
		console.log(err);
	});
