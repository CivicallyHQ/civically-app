const appProps = function(appName) {
  return I18n.t(`app.${appName.underscore()}`);
};

export { appProps };
