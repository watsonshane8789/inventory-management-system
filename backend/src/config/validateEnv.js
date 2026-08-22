const requiredEnvVars = ['MONGODB_URI', 'PORT'];

const validateEnv = () => {
    const missing = requiredEnvVars.filter((key) => !process.env[key]);
    if(missing.length > 0) {
        console.log(`Missing required .env variables: ${missing.join(',')}`);
        process.exit(1);
    }
}

module.exports = validateEnv;