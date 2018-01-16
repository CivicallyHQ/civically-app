import { default as computed } from 'ember-addons/ember-computed-decorators';

export default Ember.Controller.extend({
  @computed()
  showPlaceApps() {
    const user = this.get("currentUser");
    return user && user.get('place_category_id');
  }
});
