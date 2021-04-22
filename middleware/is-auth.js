const jwt = require("jsonwebtoken");
const { decodeToken } = require("../utils/decodeToken");

module.exports = (req, res, next) => {
	const decodedToken = decodeToken(req, res, next);
	req.userId = decodedToken.userId;
	req.userRole = decodedToken.role;
	next();
};
