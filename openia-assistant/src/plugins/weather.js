/**
 * get Weather 
 * @param {{latitude: string, longitude: string}} options 
 * @returns {[{"time":"2025-01-18T17:15","interval":900,"temperature_2m":13.1,"wind_speed_10m":7.7}]} result
 */
export async function get(options) {
    try {
        const { latitude, longitude, city, country } = options || {};
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`);
        const data = await response.json();
        console.log({
            src: "Plugin:Weather:send",
            data: data.current
        });
        return { current: data.current, options };
    }
    catch (error) {
        console.log({ src: "Plugin:Weather:send", error });
        return null;
    }

}
