import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const {
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_SRV = "gmail"
} = process.env;

export async function send({ to, subject, body }) {
    try {
        const transporter = nodemailer.createTransport({
            service: EMAIL_SRV,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            },
        });

        const options = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text: body,
        };

        const info = await transporter.sendMail(options);
        return { status: "success", message: "Email sent successfully!", info };
    } catch (error) {
        return { status: "error", message: error.message };
    }
}