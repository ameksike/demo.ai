import axios from "axios";

export const executeExternalTask = async (taskUrl, payload) => {
    try {
        const response = await axios.post(taskUrl, payload);
        console.log("Task executed: ", response.data);
    } catch (error) {
        console.error("Error executing task: ", error);
    }
};
