import { default as computed, observes, on } from 'ember-addons/ember-computed-decorators';
import { buildWidgetList, getPositionWidgets, applyAppWidgets, getUnsavedAppList } from '../lib/app-utilities';
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

  @computed('currentUser.app_data')
  userWidgetList(appData) {
    return buildWidgetList(appData);
  },

  @computed('userWidgetList', 'side')
  positionWidgets(userWidgetList, side) {
    return getPositionWidgets(userWidgetList, side);
  },

  @computed('responsiveView', 'positionWidgets.[]')
  showControls(responsiveView, positionWidgets) {
    return positionWidgets.length > 1 && !this.site.mobileView && !responsiveView;
  },

  actions: {
    editSidebars() {
      const editing = this.get('editing');
      const user = this.get('currentUser');

      if (editing) {
        let appData = JSON.parse(JSON.stringify(user.get('app_data')));
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
    }
  }
});
