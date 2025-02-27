import app from "./app"
import mongoose from 'mongoose'
import envConfig from "./configs/env.config";
import { seeding } from "./utils/seeding";

async function main() {
    try {
        // Connect MongoDB
        await mongoose.connect(envConfig.database.url as string);
        console.log('MongoDB Connected Successfully');

        // Seeding
        await seeding();

        app.listen(envConfig.app.port, () => {
            console.log(`${envConfig.app.name} Server is running on ${envConfig.app.port}`)
        });
    } catch (error) {
        console.error('Error starting server:', error);
        await cleanup();
        process.exit(1);
    }
}

// Cleanup function
async function cleanup() {
    console.log('Cleaning up connections...');
    try {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

// Handle process termination
process.on('SIGTERM', async () => {
    console.log('SIGTERM received');
    await cleanup();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received');
    await cleanup();
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    await cleanup();
    process.exit(1);
});

main();