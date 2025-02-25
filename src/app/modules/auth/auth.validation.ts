import z from 'zod';

const pinValidationSchema = z.string({
    required_error: 'Pin is required',
    invalid_type_error: 'Pin must be a string'
}).min(5, { message: 'Pin must be 5 digits' }).max(5, { message: 'Pin must be 5 digits' });

// register user validation schema
const registerUserValidationSchema = z.object({
    body: z.object({
        name: z.object({
            firstName: z.string({
                required_error: 'First name is required',
                invalid_type_error: 'First name must be a string'
            }),
            lastName: z.string({
                required_error: 'Last name is required',
                invalid_type_error: 'Last name must be a string'
            })
        }, {
            required_error: 'Name is required',
            invalid_type_error: 'Name must be an object'
        }),
        email: z.string({
            required_error: 'Email is required'
        }).email({
            message: 'Invalid email address'
        }),
        phone: z.string({
            required_error: 'Phone number is required',
            invalid_type_error: 'Phone number must be a string'
        }).max(11, {
            message: 'Phone number must be 11 digits'
        }).min(11, {
            message: 'Phone number must be 11 digits'
        }),
        role: z.enum(['user', 'agent'], {
            invalid_type_error: 'Role must be "user" or "agent"'
        }),
        pin: pinValidationSchema,
        nid: z.string({
            required_error: 'NID is required',
            invalid_type_error: 'NID must be a string'
        }).max(10, {
            message: 'NID must be 10 digits'
        }).min(10, {
            message: 'NID must be 10 digits'
        })
    })
})

// login validation schema
const loginUserValidationSchema = z.object({
    body: z.object({
        emailOrPhone: z.string({
            required_error: 'Email or phone number is required',
        }).refine(value => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const mobileRegex = /^[0-9]{10,10}$/;
            return emailRegex.test(value) || mobileRegex.test(value);
        }, {
            message: 'Must be a valid email or phone number',
        }),
        pin: pinValidationSchema
    }),
});

// change password validation schema
const changePasswordValidationSchema = z.object({
    body: z.object({
        oldPin: pinValidationSchema,
        newPin: pinValidationSchema
    })
})

// reset password validation schema
const resetPasswordValidationSchema = z.object({
    body: z.object({
        newPin: pinValidationSchema
    })
})

// verify otp validation schema 
const verifyOtpValidationSchema = z.object({
    body: z.object({
        otp: z.string({
            required_error: 'OTP is required',
            invalid_type_error: 'OTP must be a string'
        }).min(6, { message: 'OTP must be 6 digits' }).max(6, { message: 'OTP must be 6 digits' }),
        email: z.string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string'
        })
    })
})


export const authValidation = {
    registerUserValidationSchema,
    loginUserValidationSchema,
    changePasswordValidationSchema,
    resetPasswordValidationSchema,
    verifyOtpValidationSchema
}   