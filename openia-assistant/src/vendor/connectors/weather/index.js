import { Connector } from "../../../common/plugin/connector.js";

class Weather extends Connector {

    /**
     * @description Service to get information about an address
     * @param {String} address Address dails in CSV format 
     * @returns {Array<Object>} info
     * @example [{"place_id":76094835,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"relation","osm_id":347950,"lat":"41.3828939","lon":"2.1774322","class":"boundary","type":"administrative","place_rank":16,"importance":0.7941955033182714,"addresstype":"city","name":"Barcelona","display_name":"Barcelona, Barcelonés, Barcelona, Cataluña, España","boundingbox":["41.3170353","41.4679135","2.0524977","2.2283555"]}]
     */
    async getCoordinates(address) {
        try {
            return await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
        }
        catch (error) {
            console.log({ src: "Connector:Weather:getCoordinates", error, data: address });
        }
    }


    /**
     * @description Tool Call Action
     * @param {{latitude: string, longitude: string}} options 
     * @returns {[{"time":"2025-01-18T17:15","interval":900,"temperature_2m":13.1,"wind_speed_10m":7.7}]} result
     */
    async get(options, task, profile) {
        options = options || {};
        try {
            let { latitude, longitude, ...address } = options;

            if (!latitude && !longitude) {
                let inf = Object.values(address).join(",")
                if (inf.length) {
                    let res = await getCoordinates(inf);
                    options.extra = res.data[0];
                    latitude = options.extra.lat;
                    longitude = options.extra.lon;
                }
            }

            if (!latitude && !longitude) {
                throw Error("Bad request: latitude and longitude, city, country, or address are required")
            }

            let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`);
            let data = await response.json();

            console.log({
                src: "Connector:Weather:send",
                data: data.current
            });

            return { current: data.current, options };
        }
        catch (error) {
            console.log({ src: "Connector:Weather:send", error, data: options });
            return null;
        }
    }
}

export default Weather;