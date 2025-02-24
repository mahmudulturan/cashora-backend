import z from 'zod';

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
        password: z.string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string'
        }),
        profileImg: z.string({
            invalid_type_error: 'Profile image must be a url'
        }).optional(),
        dateOfBirth: z.string({
            invalid_type_error: 'Date of birth must be a date'
        }).date().optional(),
        gender: z.enum(['male', 'female', 'other'], {
            invalid_type_error: 'Gender must be "male", "female" or "other"',
        }).optional(),
    })
})

// login validation schema
const loginUserValidationSchema = z.object({
    body: z.object({
        email: z.string({
            required_error: 'Email is required',
        }).refine(value => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const mobileRegex = /^[0-9]{10,10}$/;
            return emailRegex.test(value) || mobileRegex.test(value);
        }, {
            message: 'Must be a valid email',
        }),
        password: z.string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        })
    }),
});

// change password validation schema
const changePasswordValidationSchema = z.object({
    body: z.object({
        oldPassword: z.string({
            required_error: 'Old password is required',
            invalid_type_error: 'Old password must be a string'
        }),
        newPassword: z.string({
            required_error: 'New password is required',
            invalid_type_error: 'New password must be a string'
        })
    })
})

// reset password validation schema
const resetPasswordValidationSchema = z.object({
    body: z.object({
        newPassword: z.string({
            required_error: 'New password is required',
            invalid_type_error: 'New password must be a string'
        })
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

// verify email validation schema 
const verifyEmailValidationSchema = z.object({
    body: z.object({
        email: z.string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string'
        }).optional(),
        verificationCode: z.string({
            required_error: 'Verification code is required',
            invalid_type_error: 'Verification code must be a string'
        }).optional()
    })
})

export const authValidation = {
    registerUserValidationSchema,
    loginUserValidationSchema,
    changePasswordValidationSchema,
    resetPasswordValidationSchema,
    verifyOtpValidationSchema,
    verifyEmailValidationSchema
}   