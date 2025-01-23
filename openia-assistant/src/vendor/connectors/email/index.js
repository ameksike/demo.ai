import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { getFromMeta, path } from '../../../common/polyfill.js';

const { __dirname } = getFromMeta(import.meta);

/**
 * @link https://www.nodemailer.com/smtp/oauth2/
 * @link https://console.developers.google.com/
 */

dotenv.config();

const {
    EMAIL_OUT_PORT = 587, // 465
    EMAIL_OUT_SSL = false, // true
    EMAIL_OUT_HOST = "smtp.gmail.com",
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_TOKEN,
    EMAIL_TYPE = "basic",
    EMAIL_SRV = "gmail",
    EMAIL_PATH = path.resolve(__dirname, "../../public")
} = process.env;


/**
 * Tool Call Action
 */
export async function send(options, task, profile) {
    const { to = EMAIL_USER, from = EMAIL_USER, subject = "Notification", body = "Hello!", attachments } = options || {};
    try {
        const auth = EMAIL_TYPE === "OAuth2" ? {
            type: "OAuth2",
            user: EMAIL_USER,
            accessToken: EMAIL_TOKEN,
        } : {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        };
        const transport = {
            auth,
            host: EMAIL_OUT_HOST,
            port: EMAIL_OUT_PORT,
            secure: EMAIL_OUT_SSL,
            service: EMAIL_SRV,
        };
        if (Array.isArray(attachments)) {
            attachments = attachments.map(att => {
                return {
                    fileName: att.fileName,
                    path: att.path || path.resolve(EMAIL_PATH, att.fileName),
                    contentType: att.contentType || "application/pdf"
                }
            })
        }
        const transporter = nodemailer.createTransport(transport);
        const emailOptions = {
            to,
            from,
            subject,
            html: body,
            attachments
            // text: body,
        };
        const info = await transporter.sendMail(emailOptions);
        console.log({
            src: "Connector:Email:send",
            data: { to, from, subject, completed: info }
        });
        return { status: "success", message: "Email sent successfully!", info };
    } catch (error) {
        console.log({ src: "Connector:Email:send", error });
        return { status: "error", message: error.message, data: options };
    }
}


/**
 * Tool Call Definiton 
 */
export const definition = {
    "type": "function",
    "function": {
        "name": "email_send",
        "description": "Send an email to a given recipient with a subject and message.",
        "parameters": {
            "type": "object",
            "properties": {
                "to": {
                    "type": "string",
                    "description": "The recipient email address."
                },
                "subject": {
                    "type": "string",
                    "description": "Email subject line."
                },
                "body": {
                    "type": "string",
                    "description": "Body of the email message."
                }
            },
            "required": [
                "to",
                "subject",
                "body"
            ],
            "additionalProperties": false
        },
        "strict": true
    }
}