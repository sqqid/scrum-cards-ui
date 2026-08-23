export const conf = {
  API_URL: import.meta.env.VITE_API_URL || window.location.host + "/api",
  MAX_REJOIN_ATTEMPTS: 3,
};

export default conf;
