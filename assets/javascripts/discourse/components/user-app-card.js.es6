import { default as computed } from 'ember-addons/ember-computed-decorators';

export default Ember.Component.extend({
  classNames: ['app-card', 'user'],
  canRemove: true,
  canMove: true,
  storeApp: Ember.computed.equal('app.type', 'store'),

  @computed('currentUser.app_data', 'app.name')
  userAppData(userAppData, appName) {
    return userAppData[appName];
  },

  actions: {
    removeApp() {
      this.sendAction('removeApp', this.get('app'));
    },

    updateData() {
      this.sendAction('updateData', this.get('app'));
    }
  }
});
