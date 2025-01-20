import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const { client_id, client_secret, refresh_token } = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
};

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret);
oAuth2Client.setCredentials({ refresh_token });

const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

export const create = async (eventDetails) => {
    try {
        const response = await calendar.events.insert({
            calendarId: "primary",
            resource: eventDetails,
        });
        console.log({
            src: "Plugin:Calendar:create",
            data: { options: eventDetails, data: response.data }
        });
        return response.data;
    } catch (error) {
        console.log({ src: "Plugin:Calendar:create", error });
        return null;
    }
};
