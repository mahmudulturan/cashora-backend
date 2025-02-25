import { Router } from "express";
import { transactionController } from "./transaction.controller";
import { transactionValidation } from "./transaction.validation";
import requestValidation from "../../middlewares/requestValidation";
import verifyUser from "../../middlewares/verifyUser";

const router = Router();

router.post('/send-money',
    verifyUser("user"),
    requestValidation(transactionValidation.sendMoneyValidationSchema),
    transactionController.sendMoney);


router.post('/cash-in',
    verifyUser("agent"),
    requestValidation(transactionValidation.cashInValidationSchema),
    transactionController.cashIn);

export default router;