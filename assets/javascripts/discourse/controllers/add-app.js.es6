import { default as computed } from 'ember-addons/ember-computed-decorators';
import App from '../models/app';

export default Ember.Controller.extend({
  title: 'app.add.title',
  added: null,
  sideToggle: true,

  @computed('sideToggle')
  side(toggle) {
    return toggle ? 'right' : 'left';
  },

  @computed('sideToggle')
  leftSideClass(toggle) {
    return toggle ? '' : 'enabled';
  },

  @computed('sideToggle')
  rightSideClass(toggle) {
    return toggle ? 'enabled' : '';
  },

  actions: {
    cancel() {
      this.send('closeModal');
    },

    addApp() {
      App.add(this.get('model.id'), this.get('side')).then(() => {
        this.set('added', true);
      });
    },

    toggleSide() {
      this.toggleProperty('sideToggle');
    }
  }
});
