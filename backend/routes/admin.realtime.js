import express from "express";
import { protect, adminProtect } from "../middleware/auth.js";

const router = express.Router();

let clients = [];

router.get("/stream", protect, adminProtect, (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    const clientId = Date.now();
    const client = { id: clientId, res };
    clients.push(client);

    res.write(`event: connected\ndata: connected\n\n`);

    req.on("close", () => {
        clients = clients.filter(c => c.id !== clientId);
    });
});

// helper
export const sendAdminEvent = (event, payload) => {
    clients.forEach(client => {
        client.res.write(
            `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`
        );
    });
};

export default router;
