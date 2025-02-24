import mongoose from "mongoose";
import { TErrorSources, TGenericErrorResponse } from "../interfaces/error";

const handleValidationError = (err: mongoose.Error.ValidationError): TGenericErrorResponse => {
    const errorSources: TErrorSources = Object.values(err.errors)?.map(
        (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
            return {
                path: val.path,
                message: val?.message,
            }
        });

    return {
        errorSources,
        message: 'Validation Error',
        statusCode: 400
    }
};

export default handleValidationError;