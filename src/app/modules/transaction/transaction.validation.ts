import { z } from "zod";


const sendMoneyValidationSchema = z.object({
    body: z.object({
        sender: z.string(),
        receiver: z.string(),
        amount: z.number(),
    })
}); 


export const transactionValidation = {
    sendMoneyValidationSchema
}

