const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const morgan = require("morgan");
require("dotenv").config();

const logger = require("./utils/logger");
const errorHandler = require("./middlewares/errorHandler");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api/v1", routes);
app.use("/uploads", express.static("uploads")); 

// Error middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(
    `🚀 Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`
  );
});
