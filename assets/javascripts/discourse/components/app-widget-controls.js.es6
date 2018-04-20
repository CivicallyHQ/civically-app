import { default as computed, observes, on } from 'ember-addons/ember-computed-decorators';
import { applyAppWidgets, updatedApps } from '../lib/app-utilities';
import App from '../models/app';

export default Ember.Component.extend({
  classNameBindings: [':app-widget-controls', 'side'],
  router: Ember.inject.service('-routing'),
  editing: false,

  @computed('editing')
  editText(editing) {
    return `app.widget.position.${editing ? 'save' : 'edit'}`;
  },

  @observes('path')
  teardownEditing() {
    this.set('editing', false);
  },

  actions: {
    editSidebars() {
      const editing = this.get('editing');
      const user = this.get('currentUser');

      if (editing) {
        let appData = user.get('app_data');

        App.batchUpdate(user.id, updatedApps(appData)).then((result) => {
          if (result.apps) {
            const apps = result.apps;
            apps.forEach((app) => appData[app.name] = app);
            user.set('app_data', appData);
            applyAppWidgets(user);
          } else {
            user.set('app_data', this.get('existingData'));
          }
        });
      } else {
        this.set('existingData', user.get('app_data'));
      }

      this.toggleProperty('editing');
      this.appEvents.trigger('sidebars:rerender');
    },

    addToSidebars() {
      this.get('router').transitionTo('app.store');
    }
  }
});
