import { Router } from "express";
import {
  approveLoanController,
  disburseLoanController,
  getCollectionLoansController,
  getDashboardSummaryController,
  getDisbursementLoansController,
  getLoanPaymentsController,
  getSalesLeadsController,
  getSanctionLoansController,
  recordPaymentController,
  rejectLoanController
} from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/rbac.middleware.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", allowRoles("ADMIN"), getDashboardSummaryController);

dashboardRouter.get("/sales", allowRoles("ADMIN", "SALES"), getSalesLeadsController);

dashboardRouter.get("/sanction", allowRoles("ADMIN", "SANCTION"), getSanctionLoansController);
dashboardRouter.post("/sanction/:loanId/approve", allowRoles("ADMIN", "SANCTION"), approveLoanController);
dashboardRouter.post("/sanction/:loanId/reject", allowRoles("ADMIN", "SANCTION"), rejectLoanController);

dashboardRouter.get("/disbursement", allowRoles("ADMIN", "DISBURSEMENT"), getDisbursementLoansController);
dashboardRouter.post("/disbursement/:loanId/disburse", allowRoles("ADMIN", "DISBURSEMENT"), disburseLoanController);

dashboardRouter.get("/collection", allowRoles("ADMIN", "COLLECTION"), getCollectionLoansController);
dashboardRouter.get("/collection/:loanId/payments", allowRoles("ADMIN", "COLLECTION"), getLoanPaymentsController);
dashboardRouter.post("/collection/:loanId/payments", allowRoles("ADMIN", "COLLECTION"), recordPaymentController);
