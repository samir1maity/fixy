const config: any = {
    auth : {
        jwt : process.env.JWT_SECRET || 'fallback_jwt_secret_9adf2e1b7c4f8fixyv19e4f6a12ef',
        token_expiry : process.env.RESET_TOKEN_EXPIRY || 3600000
    }
} 

export default config;