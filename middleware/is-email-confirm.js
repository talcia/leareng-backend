const { decodeToken } = require("../utils/decodeToken");

module.exports = async (req, res, next) => {
	const decodedToken = decodeToken(req, res, next);
	try {
		if (!decodedToken.emailConfirm) {
			const error = new Error("Email is not confirm");
			error.statusCode = 401;
			next(error);
		}
	} catch (err) {
		err.statusCode = 500;
		next(err);
	}

	next();
};
