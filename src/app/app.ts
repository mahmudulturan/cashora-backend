import express, { Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import envConfig from './configs/env.config';
import swaggerDocs from './docs';
import globalErrorHandler from './middlewares/globalErrorHandler';
import notFoundErrorHandler from './middlewares/notFoundErrorHandler';
import router from './routes/v1.routes';


const app = express();
app.set('trust proxy', 1);

app.use(express.json());
app.use(cors({
    origin: [envConfig.client.liveUrl!, envConfig.client.localUrl || "http://localhost:3000"],
    credentials: true
}));
app.use(cookieParser());


app.use('/api/v1', router);


// root route
app.get('/', (req: Request, res: Response) => {
    res.send(`${envConfig.app.name} Backend is Running`);
})


// swagger docs
swaggerDocs(app);


// global error handler
app.use(globalErrorHandler);

// not found route error handler
app.use(notFoundErrorHandler);

export default app;
