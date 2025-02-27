import { Router } from "express";
import { statsController } from "./stats.controller";
import verifyUser from "../../middlewares/verifyUser";

const router = Router();

router.get("/admin", verifyUser("admin"), statsController.getAdminStats);

export default router;