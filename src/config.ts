const configuredBase = import.meta.env.VITE_API_BASE_URL || "";
export const API_BASE_URL = configuredBase.replace(/\/$/, "");
export const PREFILLED_TOKEN = import.meta.env.VITE_LOCAL_JWT_TOKEN || "";
