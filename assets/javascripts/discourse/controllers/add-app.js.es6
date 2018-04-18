import { default as computed } from 'ember-addons/ember-computed-decorators';
import App from '../models/app';

export default Ember.Controller.extend({
  title: 'app.add.title',
  added: null,
  positionToggle: true,

  @computed('positionToggle')
  widgetPosition(toggle) {
    return toggle ? 'right' : 'left';
  },

  @computed('positionToggle')
  leftPositionClass(toggle) {
    return toggle ? '' : 'enabled';
  },

  @computed('positionToggle')
  rightPositionClass(toggle) {
    return toggle ? 'enabled' : '';
  },

  actions: {
    cancel() {
      this.send('closeModal');
    },

    addApp() {
      const userId = this.get('currentUser.id');
      const widgetPosition = this.get('widgetPosition');

      const app = {
        name: appName,
        widget: {
          position: widgetPosition
        }
      }

      App.add(userId, app).then((result) => {
        if (result.app_data) {
          this.get('added')(result.app_data);
        }
      });
    },

    togglePosition() {
      this.toggleProperty('positionToggle');
    }
  }
});
