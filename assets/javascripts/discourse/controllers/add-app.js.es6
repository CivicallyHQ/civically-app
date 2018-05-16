import { default as computed } from 'ember-addons/ember-computed-decorators';
import ModalFunctionality from 'discourse/mixins/modal-functionality';
import { extractError } from 'discourse/lib/ajax-error';
import { updateAppData, applyAppWidgets } from '../lib/app-utilities';
import App from '../models/app';

export default Ember.Controller.extend(ModalFunctionality, {
  title: 'app.add.title',
  added: null,
  positionToggle: true,

  @computed('positionToggle')
  widgetPosition(toggle) {
    return toggle ? 'left' : 'right';
  },

  @computed('positionToggle')
  leftPositionClass(toggle) {
    return toggle ? 'enabled' : '';
  },

  @computed('positionToggle')
  rightPositionClass(toggle) {
    return toggle ? '' : 'enabled';
  },

  actions: {
    cancel() {
      this.send('closeModal');
    },

    addApp() {
      const user = this.get('currentUser');
      const position = this.get('widgetPosition');
      const name = this.get('model.appName');

      const app = {
        name,
        enabled: true,
        widget: {
          position
        }
      }

      App.add(user.id, app).then((result) => {
        if (result.app_data) {
          updateAppData(user, name, result.app_data);
          applyAppWidgets(user);
        }
        this.send('closeModal');
      }).catch(err => this.flash(extractError(err), 'error'));
    },

    togglePosition() {
      this.toggleProperty('positionToggle');
    }
  }
});
