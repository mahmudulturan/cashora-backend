import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import userRoutes from "../modules/user/user.route";
import transactionRoutes from "../modules/transaction/transaction.route";
import statsRoutes from "../modules/stats/stats.route";
const router = Router();


const routes = [
    {
        path: '/auth',
        router: authRoutes
    },
    {
        path: '/user',
        router: userRoutes
    },
    {
        path: '/transaction',
        router: transactionRoutes
    },
    {
        path: '/stats',
        router: statsRoutes
    }
]

routes.forEach(route => {
    router.use(route.path, route.router)
});


export default router;