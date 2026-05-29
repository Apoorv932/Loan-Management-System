import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/rbac.middleware.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/admin", allowRoles("ADMIN"), (_req, res) => {
  res.json({ module: "admin", message: "Admin dashboard access granted." });
});

dashboardRouter.get("/sales", allowRoles("ADMIN", "SALES"), (_req, res) => {
  res.json({ module: "sales", message: "Sales dashboard access granted." });
});

dashboardRouter.get("/sanction", allowRoles("ADMIN", "SANCTION"), (_req, res) => {
  res.json({ module: "sanction", message: "Sanction dashboard access granted." });
});

dashboardRouter.get("/disbursement", allowRoles("ADMIN", "DISBURSEMENT"), (_req, res) => {
  res.json({ module: "disbursement", message: "Disbursement dashboard access granted." });
});

dashboardRouter.get("/collection", allowRoles("ADMIN", "COLLECTION"), (_req, res) => {
  res.json({ module: "collection", message: "Collection dashboard access granted." });
});
