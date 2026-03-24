// cacheStore.js
let cachedData = {};
let lastFetchedTime = 0;

export default {
  getCache: () => cachedData,
  setCache: (key,data) => {
    cachedData[key] = data;
    lastFetchedTime = Date.now();
  },
  getLastFetchedTime: () => lastFetchedTime,
  clearCache: (key) => {
    cachedData[key] = null;
    lastFetchedTime = 0;
  }
};
