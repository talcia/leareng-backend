const { decodeToken } = require('../utils/decodeToken');

module.exports = async (req, res, next) => {
	const decodedToken = decodeToken(req, res, next);
	const userId = req.params.id;
	console.log(decodedToken);
	console.log(userId);
	console.log(decodedToken.userId !== userId);
	console.log(+decodedToken.role === 0);
	if (decodedToken.userId !== userId && +decodedToken.role === 0) {
		next('route');
	} else {
		next();
	}
};
