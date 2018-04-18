import { default as computed } from 'ember-addons/ember-computed-decorators';
import App from '../models/app';

export default Ember.Controller.extend({
  title: 'app.position.change.title',
  updateDisabled: Ember.computed.alias('positionUnchanged'),
  position: null,

  setup() {
    const position = this.get('appData.position');
    this.set('position', position);
  },

  @computed('position', 'appData.position')
  positionUnchanged(position, oldPosition) {
    return position === oldPosition;
  },

  @computed('position')
  leftPositionClass(position) {
    return position === 'left' ? 'enabled' : '';
  },

  @computed('position')
  rightPositionClass(position) {
    return position === 'right' ? 'enabled' : '';
  },

  actions: {
    cancel() {
      this.send('closeModal');
    },

    changePosition() {
      const updateDisabled = this.get('updateDisabled');
      if (updateDisabled) return;

      const appName = this.get('model.name');
      const position = this.get('position');

      Apps.update_data(appName, position).then((result) => {
        if (result.app_data) {
          this.get('updated')(result.app_data);
        }
      });
    },

    togglePosition() {
      const current = this.get('position');
      this.set('position', current === 'left' ? 'right' : 'left');
    }
  }
});
