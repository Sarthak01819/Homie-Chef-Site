import AuditLog from "../models/AuditLog.js";

export const logAudit = async ({
  event,
  userId = null,
  role = "user",
  severity = "info",
  req,
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      event,
      userId,
      performedBy: userId,
      role,
      severity,
      ip: req?.ip,
      userAgent: req?.headers?.["user-agent"],
      metadata,
    });
  } catch (err) {
    console.error("AUDIT LOG FAILED:", err.message);
  }
};
