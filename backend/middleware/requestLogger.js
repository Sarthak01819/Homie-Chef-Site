import morgan from "morgan";
import logger from "../utils/logger.js";

/* =========================
   MORGAN STREAM
========================= */
const stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

/* =========================
   REQUEST LOGGER
========================= */
export const requestLogger = morgan(
    ":method :url :status :res[content-length] - :response-time ms",
    { stream }
);
