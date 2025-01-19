import nodemailer from "nodemailer";
import dotenv from "dotenv";

/**
 * @link https://www.nodemailer.com/smtp/oauth2/
 * @link https://console.developers.google.com/
 */

dotenv.config();

const {
    EMAIL_OUT_PORT = 465,
    EMAIL_OUT_HOST = "smtp.gmail.com",
    EMAIL_OUT_SSL = true,
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_TOKEN,
    EMAIL_TYPE = "OAuth2",
    EMAIL_SRV = "gmail"
} = process.env;

export async function send({ to, subject = "Notification", body = "Hello!" }) {
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
        const transporter = nodemailer.createTransport(transport);
        const options = {
            to,
            from: process.env.EMAIL_USER,
            subject,
            html: body
            // text: body,
        };
        const info = await transporter.sendMail(options);
        return { status: "success", message: "Email sent successfully!", info };
    } catch (error) {
        return { status: "error", message: error.message };
    }
}