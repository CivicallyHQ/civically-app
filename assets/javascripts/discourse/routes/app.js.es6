import DiscourseURL from 'discourse/lib/url';

export default Ember.Route.extend({
  redirect() {
    if (!Discourse.SiteSettings.app_store_enabled) {
      const url = Discourse.SiteSettings.app_store_redirect_url;
      return DiscourseURL.routeTo(url, { replaceURL: true });
    }

    if (window.location.path === '/app') {
      DiscourseURL.routeTo('/app/store', { replaceURL: true });
    }
  }
});
