import { default as computed } from 'ember-addons/ember-computed-decorators';

export default Ember.Component.extend({
  classNames: ['app-card', 'user'],

  @computed('app.app')
  canRemove(app) {
    return app !== 'default';
  },

  actions: {
    removeApp() {
      this.sendAction('removeApp', this.get('app'));
    }
  }
});
