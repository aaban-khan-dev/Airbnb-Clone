// Change the name in one place and it updates everywhere (logo, page titles, footer)
export const APP_NAME = "Airbnb";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
