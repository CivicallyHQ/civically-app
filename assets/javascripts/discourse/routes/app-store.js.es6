import { ajax } from 'discourse/lib/ajax';

export default Ember.Route.extend({
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
