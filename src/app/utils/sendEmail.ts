import envConfig from "../configs/env.config"
import nodemailer from 'nodemailer'
import pug from 'pug'
import path from 'path'


interface EmailOptions {
    to: string | string[]
    subject: string
    template: string
    context?: Record<string, any>
    attachments?: Array<{
        filename: string
        path: string
        cid?: string
    }>
    priority?: 'high' | 'normal' | 'low'
}

const transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 5,
    service: 'gmail',
    auth: {
        user: envConfig.email.gmailId,
        pass: envConfig.email.gmailAppPassword
    }
})

// Cache compiled templates
const templateCache = new Map<string, pug.compileTemplate>();
const getCompiledTemplate = (templatePath: string) => {
    if (!templateCache.has(templatePath)) {
        templateCache.set(templatePath, pug.compileFile(templatePath))
    }
    return templateCache.get(templatePath)!
}


const sendEmail = async (options: EmailOptions): Promise<void> => {
    const { to, subject, template, context = {}, attachments = []} = options

    const enrichedContext = {
        title: subject,
        currentYear: new Date().getFullYear(),
        supportLink: `${envConfig.app.nodeEnv === 'production' ? envConfig.client.liveUrl : envConfig.client.localUrl}/support`,
        userDashboardLink: `${envConfig.app.nodeEnv === 'production' ? envConfig.client.liveUrl : envConfig.client.localUrl}/dashboard`,
        ...context
    }

    try {
        const templatePath = path.join(__dirname, '../views/emails', `${template}.pug`)
        const compiledTemplate = getCompiledTemplate(templatePath)
        const html = compiledTemplate(enrichedContext)

        await transporter.sendMail({
            from: envConfig.email.gmailId,
            to,
            subject,
            html,
            attachments
        })
    } catch (error) {
        throw error
    }
}

export default sendEmail