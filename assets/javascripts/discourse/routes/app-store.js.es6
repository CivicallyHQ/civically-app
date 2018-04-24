import { ajax } from 'discourse/lib/ajax';

export default Ember.Route.extend({
  redirect() {
    if (!Discourse.SiteSettings.app_store_enabled) {
      const url = Discourse.SiteSettings.app_store_redirect_url;
      return DiscourseURL.routeTo(url, { replaceURL: true });
    }
  },

  model() {
    let hash = { general: ajax('/app/store/general') };

    if (this.get('currentUser') && this.get('currentUser.place_category_id')) {
      hash['place'] = ajax('/app/store/place');
    }

    return Ember.RSVP.hash(hash);
  },

  setupController(controller, model) {
    controller.setProperties({
      placeApps: model.place,
      generalApps: model.general
    });
  }
});
