const { decodeToken } = require("../utils/decodeToken");

module.exports = async (req, res, next) => {
	const decodedToken = decodeToken(req, res, next);
	try {
		if (decodedToken.role * 1 !== 0) {
			const error = new Error("Not authenticated");
			error.statusCode = 401;
			next(error);
		}
	} catch (err) {
		err.statusCode = 500;
		next(err);
	}

	next();
};
