import { ZodError } from "zod";
import { TErrorSources } from "../interfaces/error";

const handleZodError = (err: ZodError) => {
    // error sources
    const errorSources: TErrorSources = err.issues.map(issue => {
        return {
            path: issue.path[issue.path.length - 1],
            message: issue.message,
        }
    })

    return { statusCode: 400, errorSources, message: "Validation Error" }
}

export default handleZodError;