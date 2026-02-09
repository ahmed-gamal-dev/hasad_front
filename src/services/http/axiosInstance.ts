import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://hasad-api.terzoomedia.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
