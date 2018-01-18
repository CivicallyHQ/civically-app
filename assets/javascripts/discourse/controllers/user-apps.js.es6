import showModal from 'discourse/lib/show-modal';
import DiscourseURL from 'discourse/lib/url';

export default Ember.Controller.extend({
  actions: {
    removeApp(app) {
      const controller = showModal('remove-app', { model: app });

      controller.addObserver('removed', () => {
        if (controller.get('removed')) {
          let apps = this.get('apps');
          let newApps = apps.filter((a) => a.id !== app.id);
          this.set('apps', newApps);
          controller.set('removed', null);
        }
        controller.send('closeModal');
      });
    },

    changeSide(app) {
      const controller = showModal('change-app-side', { model: app });
      controller.setup();
    },

    goToStore() {
      DiscourseURL.routeTo('/app/store');
    }
  }
});
