import { registerUnbound } from 'discourse-common/lib/helpers';

registerUnbound('app-title', function(appName) {
  return new Handlebars.SafeString(I18n.t(`app.${appName.underscore()}.title`));
});

registerUnbound('app-about', function(app) {
  let about = I18n.t(`app.${app.name.underscore()}.about`);
  return new Handlebars.SafeString(about);
});
