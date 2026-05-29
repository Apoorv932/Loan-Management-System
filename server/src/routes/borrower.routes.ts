import { Router } from "express";
import {
  applyLoanController,
  calculateLoanController,
  getMyApplicationController,
  submitPersonalDetailsController,
  uploadSalarySlipController
} from "../controllers/borrower.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/rbac.middleware.js";
import { salarySlipUpload } from "../middleware/upload.middleware.js";

export const borrowerRouter = Router();

borrowerRouter.use(requireAuth, allowRoles("BORROWER"));

borrowerRouter.get("/application", getMyApplicationController);
borrowerRouter.post("/personal-details", submitPersonalDetailsController);
borrowerRouter.post("/salary-slip", salarySlipUpload.single("salarySlip"), uploadSalarySlipController);
borrowerRouter.post("/loan/calculate", calculateLoanController);
borrowerRouter.post("/loan/apply", applyLoanController);
