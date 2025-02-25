import z from 'zod';

const updateUserValidationSchema = z.object({
    body: z.object({
        name: z.object({
            firstName: z.string({
                invalid_type_error: 'First name must be a string'
            }),
            lastName: z.string({
                invalid_type_error: 'Last name must be a string'
            })
        }, {
            invalid_type_error: 'Name must be an object'
        })
    })
})

const updateUserStatusValidationSchema = z.object({
    body: z.object({
        status: z.enum(['active', 'blocked'], {
            invalid_type_error: 'Status must be "active" or "blocked"',
            required_error: 'Status is required'
        })
    })
})


export const userValidation = {
    updateUserValidationSchema,
    updateUserStatusValidationSchema
}