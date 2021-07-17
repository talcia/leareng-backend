const express = require('express');
const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const cors = require('cors');

const authRoutes = require('./routes/auth');
const wordRoutes = require('./routes/word');
const userRoutes = require('./routes/user');
const unitRoutes = require('./routes/unit');
const favRoutes = require('./routes/favourites');

const MONGODB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.8ypuv.mongodb.net/leareng?retryWrites=true&w=majority`;

const allowedOrigins = [
	'http://localhost:3000',
	'https://sendgrid.api-docs.io',
	'https://leareng.netlify.app/',
];

const options = {
	origin: allowedOrigins,
};

const app = express();

app.use(cors(options));
app.use(express.json());

app.use('/auth', authRoutes);

app.use('/words', wordRoutes);

app.use('/users', userRoutes);

app.use('/units', unitRoutes);

app.use('/favourites', favRoutes);

app.route('/').get(function (req, res) {
	res.sendFile(process.cwd() + '/index.html');
});

app.use((err, req, res, next) => {
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
		const port = process.env.PORT || 5000;
		console.log('database connected');
		app.listen(port, () => {
			console.log(`app listening on port ${port}`);
		});
	})
	.catch((err) => {
		console.log(err);
	});

module.exports = app; // for testing
