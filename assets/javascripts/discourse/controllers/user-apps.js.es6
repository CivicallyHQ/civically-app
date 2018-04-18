import showModal from 'discourse/lib/show-modal';
import DiscourseURL from 'discourse/lib/url';

export default Ember.Controller.extend({
  actions: {
    removeApp(app) {
      const controller = showModal('remove-app', { model: app });

      controller.addObserver('removed', () => {
        if (controller.get('removed')) {
          let apps = this.get('apps');
          let newApps = apps.filter((a) => a.name !== app.name);
          this.set('apps', newApps);
          controller.set('removed', null);
        }
        controller.send('closeModal');
      });
    },

    updateData(app) {
      const user = this.get('currentUser');
      const controller = showModal('update-app-data', {
        model: app,
        updated: (appData) => {
          user.set(app.name, appData);
        }
      });
      controller.setup();
    },

    goToStore() {
      DiscourseURL.routeTo('/app/store');
    }
  }
});
