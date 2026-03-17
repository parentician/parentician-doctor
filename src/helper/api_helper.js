import axios from "axios";

// Apply base URL for axios using Vite env
const API_URL = import.meta.env.VITE_APP_AUTHDOMAIN;

function getAccessToken() {
    const token = localStorage.getItem("doctorToken");
    return token ? `Bearer ${token}` : "";
}

function logoutAndRedirect(message = "") {
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctorData");
    if (message) {
        localStorage.setItem("logoutMessage", message);
    }
    if (window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
}

const axiosApi = axios.create({
    baseURL: API_URL,
});

axiosApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const msg = error.response.data?.message || "Session expired";
            logoutAndRedirect(msg);
        }
        return Promise.reject(error);
    }
);

export async function get(url, config = {}) {
    // Mocking behavior if needed, otherwise use axios
    return await axiosApi
        .get(url, {
            ...config,
            headers: {
                Authorization: getAccessToken(),
            },
        })
        .then((response) => response.data);
}

export async function post(url, data, config = {}) {
    return axiosApi
        .post(url, data, {
            ...config,
            headers: {
                Authorization: getAccessToken(),
            },
        })
        .then((response) => response.data);
}

export async function put(url, data, config = {}) {
    return axiosApi
        .put(url, data, {
            ...config,
            headers: {
                Authorization: getAccessToken(),
            },
        })
        .then((response) => response.data);
}

export async function del(url, config = {}) {
    return await axiosApi
        .delete(url, {
            ...config,
            headers: {
                Authorization: getAccessToken(),
            },
        })
        .then((response) => response.data);
}
