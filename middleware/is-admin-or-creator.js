const { decodeToken } = require('../utils/decodeToken');

module.exports = async (req, res, next) => {
	const decodedToken = decodeToken(req, res, next);
	const userId = req.params.id;
	console.log(decodedToken);
	try {
		if (decodedToken.userId !== userId && +decodedToken.role !== 0) {
			const error = new Error('Not authenticated');
			error.statusCode = 401;
			next(error);
		}
	} catch (err) {
		err.statusCode = 500;
		next(err);
	}

	next();
};
