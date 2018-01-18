import { registerUnbound } from 'discourse-common/lib/helpers';
import { appKey } from '../lib/app-utilities';

registerUnbound('app-title', function(app) {
  let title = I18n.t(`${appKey(app.id)}.title`);
  let html = `<a href='/app/details/${app.id}' class='p-text p-link' target='_blank'>${title}</a>`;
  return new Handlebars.SafeString(html);
});

registerUnbound('app-about', function(app) {
  let about = I18n.t(`${appKey(app.id)}.about`);
  return new Handlebars.SafeString(about);
});
