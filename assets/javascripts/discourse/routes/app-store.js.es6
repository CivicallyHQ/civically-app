import { ajax } from 'discourse/lib/ajax';

export default Ember.Route.extend({
  model() {
    let hash = { general: ajax('/app/store/general') };

    if (this.get('currentUser') && this.get('currentUser.town_category_id')) {
      hash['town'] = ajax('/app/store/town');
    }

    return Ember.RSVP.hash(hash);
  },

  setupController(controller, model) {
    controller.setProperties({
      townApps: model.town,
      generalApps: model.general
    });
  }
});
