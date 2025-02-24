import z from 'zod';

const updateUserValidationSchema = z.object({
    body: z.object({
        name: z.object({
            firstName: z.string({
                invalid_type_error: 'First name must be a string'
            }).optional(),
            lastName: z.string({
                invalid_type_error: 'Last name must be a string'
            }).optional()
        }, {
            invalid_type_error: 'Name must be an object'
        }).optional(),
        dateOfBirth: z.string({
            invalid_type_error: 'Date of birth must be a date'
        }).date().optional(),
        gender: z.enum(['male', 'female', 'other'], {
            invalid_type_error: 'Gender must be "male", "female" or "other"',
        }).optional(),
        profileImg: z.string({
            invalid_type_error: 'Profile image must be a string'
        }).optional()
    })
})

const updateUserStatusValidationSchema = z.object({
    body: z.object({
        status: z.enum(['active', 'blocked'], {
            invalid_type_error: 'Status must be "active" or "inactive"',
            required_error: 'Status is required'
        })
    })
})


export const userValidation = {
    updateUserValidationSchema,
    updateUserStatusValidationSchema
}