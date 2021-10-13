const express = require('express');
const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const cors = require('cors');
const multer = require('multer');
var multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const aws = require('aws-sdk');

const authRoutes = require('./routes/auth');
const wordRoutes = require('./routes/word');
const userRoutes = require('./routes/user');
const unitRoutes = require('./routes/unit');
const favRoutes = require('./routes/favourites');

const MONGODB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.8ypuv.mongodb.net/leareng?retryWrites=true&w=majority`;

const allowedOrigins = '*';
// [
// 	'http://localhost:3000',
// 	'https://sendgrid.api-docs.io',
// 	'https://leareng.netlify.app',
// ];

const options = {
	origin: allowedOrigins,
};

aws.config.update({
	secretAccessKey: process.env.AWS_SECRETACCESSKEY,
	accessKeyId: process.env.AWS_ACCESSKEYID,
	region: process.env.AWS_REGION,
});

const app = express();
app.use(cors(options));
app.use(express.json({ limit: '50mb' }));

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: 'leareng-bucket/images',
		acl: 'public-read',
		key: function (req, file, cb) {
			const extension = file.originalname.split('.').pop();
			cb(null, uuidv4() + '.' + extension);
		},
		fileFilter: fileFilter,
	}),
});

app.use(upload.single('image'));

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
