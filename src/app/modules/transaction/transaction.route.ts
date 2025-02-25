import { Router } from "express";
import { transactionController } from "./transaction.controller";
import { transactionValidation } from "./transaction.validation";
import requestValidation from "../../middlewares/requestValidation";
import verifyUser from "../../middlewares/verifyUser";

const router = Router();

router.post('/send-money',
    verifyUser("user"),
    requestValidation(transactionValidation.transferAmountValidationSchema),
    transactionController.sendMoney);


router.post('/cash-in',
    verifyUser("agent"),
    requestValidation(transactionValidation.transferAmountValidationSchema),
    transactionController.cashIn);

router.post('/cash-out',
    verifyUser("user"),
    requestValidation(transactionValidation.transferAmountValidationSchema),
    transactionController.cashOut);

router.get('/history',
    verifyUser("user", "agent"),
    transactionController.getHistory);


router.get('/all-history',
    verifyUser("admin"),
    transactionController.getAllHistory);


export default router;