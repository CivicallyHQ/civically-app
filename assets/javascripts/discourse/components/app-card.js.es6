import { default as computed, on } from 'ember-addons/ember-computed-decorators';
import showModal from 'discourse/lib/show-modal';

export default Ember.Component.extend({
  classNames: ['app-card'],
  added: false,

  @on('init')
  setup() {
    const user = this.get('currentUser');
    if (!user) return;

    this.setAdded(user);
    user.addObserver(`app_data.${this.get('app.name')}`, () => this.setAdded(user));
  },

  @on('willDestroy')
  teardown() {
    const user = this.get('currentUser');
    if (!user) return;

    user.removeObsever(`app_data.${this.get('app.name')}`, () => this.setAdded(user));
  },

  setAdded(user) {
    if (this._state === 'destroying') return;
    this.set('added', user.get(`app_data.${this.get('app.name')}`));
  },

  @computed('added')
  btnClasses(added) {
    let classes = 'btn';
    if (!added) classes += ' btn-primary';
    return classes;
  },

  @computed('added')
  btnLabel(added) {
    return added ? 'app.added.btn' : 'app.add.btn';
  },

  @computed('app.authors')
  authors(authors) {
    return authors.split(',');
  },

  actions: {
    addApp() {
      if (this.get('added')) return;

      const appName = this.get('app.name');

      let controller = showModal('add-app', {
        model: {
          appName
        }
      });
    }
  }
});
