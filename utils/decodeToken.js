const jwt = require('jsonwebtoken');

exports.decodeToken = (req, res, next) => {
	const authHeader = req.get('Authorization');
	if (!authHeader) {
		const error = new Error('Not authorizated');
		error.statusCode = 401;
		next(error);
	}
	const token = authHeader.split(' ')[1];
	let decodedToken;
	try {
		decodedToken = jwt.verify(token, `${process.env.MAILTRAP_USER}`);
	} catch (err) {
		err.statusCode = 500;
		next(err);
	}
	return decodedToken;
};
