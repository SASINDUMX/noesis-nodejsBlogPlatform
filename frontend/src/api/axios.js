import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000", // your backend URL
  withCredentials: true, // to send cookies/session
});

export default instance;
