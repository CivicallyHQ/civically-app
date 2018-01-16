import { ajax } from 'discourse/lib/ajax';
import DiscourseURL from 'discourse/lib/url';

export default Ember.Route.extend({
  redirect() {
    if (!Discourse.SiteSettings.app_store_enabled) {
      const url = Discourse.SiteSettings.app_store_redirect_url;
      return DiscourseURL.routeTo(url, { replaceURL: true });
    }
  },

  model() {
    return ajax('/app/user');
  },

  setupController(controller, model) {
    controller.set('apps', model);
  }
});
