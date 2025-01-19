/**
 * get Weather 
 * @param {{latitude: string, longitude: string}} options 
 * @returns {[{"time":"2025-01-18T17:15","interval":900,"temperature_2m":13.1,"wind_speed_10m":7.7}]} result
 */
export async function get({ latitude, longitude }) {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`);
    const data = await response.son();
    // return data.current.temperature_2m;
    return data.current;
}
