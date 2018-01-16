const appKey = function(appId) {
  return appId.replace(/-/g, '_');
};

export { appKey };
