const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const wordRoutes = require("./routes/word");
const userRoutes = require("./routes/user");
const unitRoutes = require("./routes/unit");

const MONGODB_URI =
	"mongodb+srv://adminek:qXPWEvsqnqDEEYcR@cluster0.8ypuv.mongodb.net/leareng?retryWrites=true&w=majority";

const app = express();

app.use(bodyParser.json());

app.use("/auth", authRoutes);

app.use("/words", wordRoutes);

app.use("/users", userRoutes);

app.use("/units", unitRoutes);

app.use((err, req, res, next) => {
	console.log(err);
	const status = err.statusCode || 500;
	const message = err.message;
	const data = err.data;
	res.status(status).json({
		message: message,
		status: status,
		data: data,
	});
});

mongoose
	.connect(MONGODB_URI)
	.then(() => {
		console.log("database connected");
		app.listen(8080, () => {
			console.log("app listening on port 8080");
		});
	})
	.catch((err) => {
		console.log(err);
	});
