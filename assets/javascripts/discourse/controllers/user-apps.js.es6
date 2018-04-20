import showModal from 'discourse/lib/show-modal';
import DiscourseURL from 'discourse/lib/url';

export default Ember.Controller.extend({
  actions: {
    removeApp(app) {
      const user = this.get('currentUser');
      const controller = showModal('remove-app', {
        model: app
      });
    },

    updateApp(appWithData) {
      const user = this.get('currentUser');
      const controller = showModal('update-app-data', {
        model: appWithData
      });
      controller.setup();
    },

    goToStore() {
      DiscourseURL.routeTo('/app/store');
    }
  }
});
