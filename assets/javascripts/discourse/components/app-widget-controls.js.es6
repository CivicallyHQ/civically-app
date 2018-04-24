import { default as computed, observes, on } from 'ember-addons/ember-computed-decorators';
import { applyAppWidgets, getUnsavedAppList } from '../lib/app-utilities';
import App from '../models/app';

const sidebarControlsBreakpoint = 900;

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

  @computed('responsiveView')
  showControls(responsiveView) {
    return !this.site.mobileView && !responsiveView;
  },

  actions: {
    editSidebars() {
      const editing = this.get('editing');
      const user = this.get('currentUser');

      if (editing) {
        let appData = user.get('app_data');
        let appList = getUnsavedAppList(appData);

        App.batchUpdate(user.id, appList).then((result) => {
          const apps = result.apps;

          if (apps) {
            Object.keys(apps).forEach((appName) => {
               let appResult = apps[appName];

               if (appResult.success) {
                 appData[appName] = appResult.app_data;
               }
            });

            user.set('app_data', appData);

            applyAppWidgets(user);
          } else {
            user.set('app_data', this.get('existingAppData'));
          }
        });
      } else {
        this.set('existingAppData', user.get('app_data'));
      }

      this.toggleProperty('editing');
      this.appEvents.trigger('sidebars:rerender');
    },

    addToSidebars() {
      this.get('router').transitionTo('app.store');
    }
  }
});
