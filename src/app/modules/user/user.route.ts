import { Router } from "express";
import { userController } from "./user.controller";
import requestValidation from "../../middlewares/requestValidation";
import { userValidation } from "./user.validation";
import verifyUser from "../../middlewares/verifyUser";

const router = Router();

// get all users route
router.get('/all',
    verifyUser("admin"),
    userController.getUsers);


// get user by id route
router.get('/me',
    userController.getCurrentUser);


// update user
router.put('/me',
    requestValidation(userValidation.updateUserValidationSchema),
    verifyUser("user", "admin"),
    userController.updateUser);


// update user status route
router.patch('/status/:id',
    requestValidation(userValidation.updateUserStatusValidationSchema),
    verifyUser("admin"),
    userController.updateUserStatus);


// delete user route
router.delete('/:id', verifyUser("admin"), userController.deleteUser);


export default router;