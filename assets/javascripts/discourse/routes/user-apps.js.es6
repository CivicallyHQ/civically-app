import { ajax } from 'discourse/lib/ajax';
import DiscourseURL from 'discourse/lib/url';

export default Ember.Route.extend({
  model() {
    return ajax('/app/user');
  },

  setupController(controller, model) {
    controller.set('apps', model);
  }
});
