import { registerUnbound } from 'discourse-common/lib/helpers';
import { appProps } from '../lib/app-utilities';

registerUnbound('app-title', function(app) {
  let title = appProps(app.name).title;
  let html = `<a href='/app/details/${app.name}' class='p-text p-link' target='_blank'>${title}</a>`;
  return new Handlebars.SafeString(html);
});

registerUnbound('app-about', function(app) {
  let about = appProps(app.name).about;
  return new Handlebars.SafeString(about);
});
