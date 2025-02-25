import dotenv from 'dotenv'
import path from 'path';

dotenv.config({ path: path.join((process.cwd(), '.env')) });

const requiredEnvVars = {
    app_name: process.env.APP_NAME,
    port: process.env.PORT,
    db_url: process.env.DB_URL,
    local_client_url: process.env.LOCAL_CLIENT_URL,
    live_client_url: process.env.LIVE_CLIENT_URL,
    node_env: process.env.NODE_ENV,
    salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    reset_pin_token_secret: process.env.RESET_PIN_TOKEN_SECRET,
    email_verification_token_secret: process.env.EMAIL_VERIFICATION_TOKEN_SECRET,
    gmail_id: process.env.GMAIL_USER,
    gmail_app_password: process.env.GMAIL_APP_PASSWORD,
    admin_email: process.env.ADMIN_EMAIL,
    admin_phone: process.env.ADMIN_PHONE,
    admin_first_name: process.env.ADMIN_FIRST_NAME,
    admin_last_name: process.env.ADMIN_LAST_NAME,
    admin_pin: process.env.ADMIN_PIN,
    admin_nid: process.env.ADMIN_NID
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => value === undefined)
    .map(([key]) => key);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const envConfig = {
    app: {
        name: requiredEnvVars.app_name,
        port: requiredEnvVars.port,
        nodeEnv: requiredEnvVars.node_env
    },
    database: {
        url: requiredEnvVars.db_url
    },
    client: {
        localUrl: requiredEnvVars.local_client_url,
        liveUrl: requiredEnvVars.live_client_url
    },
    security: {
        saltRounds: requiredEnvVars.salt_rounds,
        accessTokenSecret: requiredEnvVars.access_token_secret,
        refreshTokenSecret: requiredEnvVars.refresh_token_secret,
        resetPinTokenSecret: requiredEnvVars.reset_pin_token_secret,
        emailVerificationTokenSecret: requiredEnvVars.email_verification_token_secret
    },
    email: {
        gmailId: requiredEnvVars.gmail_id,
        gmailAppPassword: requiredEnvVars.gmail_app_password
    },
    admin: {
        email: requiredEnvVars.admin_email,
        pin: requiredEnvVars.admin_pin,
        nid: requiredEnvVars.admin_nid,
        phone: requiredEnvVars.admin_phone,
        firstName: requiredEnvVars.admin_first_name,
        lastName: requiredEnvVars.admin_last_name,
    }
}

export default envConfig;