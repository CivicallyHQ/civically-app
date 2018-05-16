import DiscourseURL from 'discourse/lib/url';
import { default as computed } from 'ember-addons/ember-computed-decorators';

export default Ember.Component.extend({
  classNames: 'app-store-btn-wrapper',

  @computed
  storeBtnImg() {
    return '/plugins/civically-app/images/app-store-small-white.png';
  },

  actions: {
    goToStore() {
      DiscourseURL.routeTo('/app/store');
    }
  }
});
