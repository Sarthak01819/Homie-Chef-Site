import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    logger.error({
        message: err.message,
        statusCode,
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        stack: err.stack,
    });

    const response = {
        success: false,
        message: err.message || "Something went wrong",
    };

    if (process.env.APP_MODE !== "production") {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};
