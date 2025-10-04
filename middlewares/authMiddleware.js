const jwt = require("jsonwebtoken");

exports.verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      isSuccess: false,
      status: 401,
      message: "No token provided",
      data: null,
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // attach admin info to request
    next();
  } catch (err) {
    return res.status(401).json({
      isSuccess: false,
      status: 401,
      message: "Invalid or expired token",
      data: null,
    });
  }
};
