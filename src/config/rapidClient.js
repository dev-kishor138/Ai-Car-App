import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


const rapid = axios.create({
    baseURL: `https://${process.env.RAPIDAPI_HOST}`,
    headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
    },
    timeout: 20000,
});

export default rapid;