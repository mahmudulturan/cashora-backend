import { TErrorSources, TGenericErrorResponse } from "../interfaces/error";

const handleDuplicateError = (err: any): TGenericErrorResponse => {

    // sperate error message
    const match = err.message.match(/"([^"]*)"/);
    const errorMessage = match && match[1];

    const errorSources: TErrorSources = [
        {
            path: '',
            message: `${errorMessage} is already exists in db`,
        },
    ];


    return {
        statusCode: 400,
        message: 'Duplicate Error',
        errorSources,
    };
};

export default handleDuplicateError;