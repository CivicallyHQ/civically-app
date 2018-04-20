import { default as computed } from 'ember-addons/ember-computed-decorators';
import ModalFunctionality from 'discourse/mixins/modal-functionality';
import { extractError } from 'discourse/lib/ajax-error';
import { applyAppWidgets } from '../lib/app-utilities';
import App from '../models/app';

export default Ember.Controller.extend(ModalFunctionality, {
  title: 'app.data.edit.title',
  position: null,

  setup() {
    const position = this.get('model.widget.position');
    this.set('position', position);
  },

  @computed('position', 'model.position')
  positionChanged(position, oldPosition) {
    return position !== oldPosition;
  },

  @computed('position')
  leftPositionClass(position) {
    return position === 'left' ? 'enabled' : '';
  },

  @computed('position')
  rightPositionClass(position) {
    return position === 'right' ? 'enabled' : '';
  },

  @computed('positionChanged')
  updateDisabled(positionChanged) {
    return !positionChanged;
  },

  actions: {
    cancel() {
      this.send('closeModal');
    },

    update() {
      const updateDisabled = this.get('updateDisabled');
      if (updateDisabled) return;

      const user = this.get('currentUser');
      const app = JSON.parse(JSON.stringify(this.get('model')));

      if (this.get('positionChanged')) {
        app.widget.position = this.get('position');
      }

      App.update(user.id, app).then((result) => {
        if (result.app_data) {
          const appData = JSON.parse(JSON.stringify(user.get('app_data')));
          appData[app.name] = result.app_data;
          user.set('app_data', appData);
          user.notifyPropertyChange(`app_data.${app.name}`);
          applyAppWidgets(user);
        }
        this.send('closeModal');
      }).catch(err => this.flash(extractError(err), 'error'));
    },

    togglePosition() {
      const current = this.get('position');
      this.set('position', current === 'left' ? 'right' : 'left');
    }
  }
});
