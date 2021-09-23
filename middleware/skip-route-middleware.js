const { decodeToken } = require('../utils/decodeToken');

module.exports = async (req, res, next) => {
	const decodedToken = decodeToken(req, res, next);
	const userId = req.params.id;
	if (decodedToken.userId !== userId && +decodedToken.role === 0) {
		next('route');
	} else {
		next();
	}
};
