class AppError extends Error {
    public statusCode: number;

    constructor(statusCode = 400, message: string, stack = '') {
        super(message);
        this.statusCode = statusCode;

        // if stack is passed, use it, otherwise use default
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default AppError;