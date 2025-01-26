import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { getFromMeta, path } from '../../../common/polyfill.js';
import { Connector } from "../../../common/connector.js";

/**
 * @link https://www.nodemailer.com/smtp/oauth2/
 * @link https://console.developers.google.com/
 */

dotenv.config();
const { __dirname } = getFromMeta(import.meta);
const {
    EMAIL_IN_HOST,
    EMAIL_IN_PORT,
    EMAIL_IN_SSL,
    EMAIL_IN_USER,
    EMAIL_IN_PASS,
    EMAIL_IN_TOKEN,
    EMAIL_IN_TYPE,
    EMAIL_IN_SRV,

    EMAIL_OUT_PORT,
    EMAIL_OUT_SSL,
    EMAIL_OUT_HOST,
    EMAIL_OUT_USER,
    EMAIL_OUT_PASS,
    EMAIL_OUT_TOKEN,
    EMAIL_OUT_TYPE,
    EMAIL_OUT_SRV,

    EMAIL_PATH
} = process.env;

export class Email extends Connector {

    configure(options = null) {
        return {
            path: options?.type || EMAIL_PATH || path.resolve(__dirname, "../../public"),
            output: {
                service: options?.output?.service || EMAIL_OUT_SRV || "gmail",
                secure: options?.output?.secure ?? EMAIL_OUT_SSL ?? false,
                type: options?.output?.type || EMAIL_OUT_TYPE || "basic",
                host: options?.output?.host || EMAIL_OUT_HOST || "smtp.gmail.com",
                port: options?.output?.port || EMAIL_OUT_PORT || 587, // 465 if SSL in true
                user: options?.output?.user || EMAIL_OUT_USER,
                pass: options?.output?.pass || EMAIL_OUT_PASS,
                token: options?.output?.token || EMAIL_OUT_TOKEN,
            },
            input: {
                service: options?.input?.service || EMAIL_IN_SRV || "gmail",
                secure: options?.input?.secure ?? EMAIL_IN_SSL ?? true,
                type: options?.input?.type || EMAIL_IN_TYPE || "basic",
                host: options?.input?.host || EMAIL_IN_HOST || "imap.gmail.com", // pop.gmail.com
                port: options?.input?.port || EMAIL_IN_PORT || 993, // 995 for POP3
                user: options?.input?.user || EMAIL_IN_USER,
                pass: options?.input?.pass || EMAIL_IN_PASS,
                token: options?.input?.token || EMAIL_IN_TOKEN,
            }
        }
    }

    /**
     * Public action definition 
     */
    get definition() {
        return [
            {
                "type": "function",
                "function": {
                    "name": "send",
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
            },
            {
                "type": "function",
                "function": {
                    "name": "read",
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
        ]
    }

    /**
     * @description Send email action 
     * @param {*} options 
     * @param {*} task 
     * @param {*} profile 
     * @returns {{ status: String, message: String, data: Object }}
     */
    async send(options, task, profile) {
        const connector = this.find(task, profile);
        const config = this.configure(connector?.config);
        const {
            to = config.output.user,
            from = config.output.user,
            subject = "Notification",
            body = "Hello!",
            attachments
        } = options || {};

        try {

            const auth = config.output.type === "OAuth2" ? {
                type: "OAuth2",
                user: config.output.user,
                accessToken: config.output.token,
            } : {
                user: config.output.user,
                pass: config.output.pass
            };

            const transport = {
                auth,
                host: config.output.host,
                port: config.output.port,
                secure: config.output.secure,
                service: config.output.service,
            };

            if (Array.isArray(attachments)) {
                attachments = attachments.map(att => {
                    return {
                        fileName: att.fileName,
                        path: att.path || path.resolve(config.path, att.fileName),
                        contentType: att.contentType || "application/pdf"
                    }
                })
            }

            const transporter = nodemailer.createTransport(transport);
            const emailOptions = {
                to,
                from,
                subject,
                html: body, // text: body,
                attachments
            };
            const info = await transporter.sendMail(emailOptions);
            const data = {
                to,
                from,
                subject,
                messageSize: info?.messageSize,
                messageTime: info?.messageTime,
                accepted: info?.accepted,
                rejected: info?.rejected,
            };

            this.logger?.log({ src: "Connector:Email:Send", data });
            return { status: "success", message: "Email sent successfully!", data };
        } catch (error) {
            this.logger?.error({ src: "Connector:Email:Send", error });
            return {
                status: "error",
                message: error.message,
                data: { options, profile: profile?.name }
            };
        }
    }

    /**
     * @description Read email action 
     * @param {*} options 
     * @param {*} task 
     * @param {*} profile 
     * @returns {{ status: String, message: String, data: Object }}
     */
    async read(options, task, profile) {
        console.log({ options, task, profile })
    }
}

export default Email;