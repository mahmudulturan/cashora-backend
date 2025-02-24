import app from "./app"
import mongoose from 'mongoose'
import envConfig from "./configs/env.config";
import logger from "./utils/logger";
import { seeding } from "./utils/seeding";

async function main() {
    try {
        // Connect MongoDB
        await mongoose.connect(envConfig.database.url as string);
        logger.info('MongoDB Connected Successfully');

        // Seeding
        await seeding();

        app.listen(envConfig.app.port, () => {
            logger.info(`${envConfig.app.name} Server is running on ${envConfig.app.port}`)
        });
    } catch (error) {
        logger.error('Error starting server:', error);
        await cleanup();
        process.exit(1);
    }
}

// Cleanup function
async function cleanup() {
    logger.info('Cleaning up connections...');
    try {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed');
        }
    } catch (error) {
        logger.error('Error during cleanup:', error);
    }
}

// Handle process termination
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received');
    await cleanup();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received');
    await cleanup();
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    logger.error('Uncaught Exception:', error);
    await cleanup();
    process.exit(1);
});

main();