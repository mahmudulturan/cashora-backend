import { z } from "zod";


const transferAmountValidationSchema = z.object({
    body: z.object({
        receiver: z.string(),
        amount: z.number(),
    })
}); 


export const transactionValidation = {
    transferAmountValidationSchema
}

