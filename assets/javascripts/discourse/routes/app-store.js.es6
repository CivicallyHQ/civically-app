import { ajax } from 'discourse/lib/ajax';

export default Ember.Route.extend({
  model() {
    const user = this.get('currentUser');
    let hash = { general: ajax('/app/store/general') };

    if (user) {
      if (user.town_category_id) {
        hash['town'] = ajax('/app/store/town');
      }

      if (user.town_category_id) {
        hash['neighbourhood'] = ajax('/app/store/neighbourhood');
      }
    }

    return Ember.RSVP.hash(hash);
  },

  setupController(controller, model) {
    controller.setProperties({
      neighbourhoodApps: model.neighbourhood,
      townApps: model.town,
      generalApps: model.general
    });
  }
});
