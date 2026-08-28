export const getApiBaseUrl = () => {
    return import.meta.env.VITE_API_URL || "";
};

export const API_BASE_URL = getApiBaseUrl();
