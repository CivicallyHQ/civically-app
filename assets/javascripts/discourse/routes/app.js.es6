import DiscourseURL from 'discourse/lib/url';

export default Ember.Route.extend({
  redirect() {
    if (window.location.path === '/app') {
      DiscourseURL.routeTo('/app/store', { replaceURL: true });
    }
  }
});
