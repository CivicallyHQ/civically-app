import { default as computed, on } from 'ember-addons/ember-computed-decorators';

export default Ember.Component.extend({
  classNames: ['app-card', 'user'],
  canRemove: true,
  canMove: true,
  storeApp: Ember.computed.equal('app.type', 'store'),
  canRemove: Ember.computed.equal('app.type', 'store'),
  updated: false,

  @on('init')
  setupObservers() {
    const name = this.get('app.name');
    const user = this.get('currentUser');
    const self = this;

    const setAppWithData = () => {
      if (self._state === 'destroying') return;
      let appData = user.get('app_data');
      self.set('appWithData', Object.assign({}, { name }, appData[name]));
    }

    setAppWithData();
    user.addObserver(`app_data.${name}`, () => setAppWithData());
  },

  actions: {
    removeApp() {
      this.sendAction('removeApp', this.get('app'));
    },

    updateApp() {
      this.sendAction('updateApp', this.get('appWithData'));
    }
  }
});
