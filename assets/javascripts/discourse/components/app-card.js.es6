import { default as computed } from 'ember-addons/ember-computed-decorators';
import showModal from 'discourse/lib/show-modal';

export default Ember.Component.extend({
  classNames: ['app-card'],
  showAddApp: Ember.computed.alias('currentUser'),

  @computed('app.added')
  btnClasses(added) {
    let classes = 'btn';
    if (!added) classes += ' btn-primary';
    return classes;
  },

  @computed('app.added')
  btnLabel(added) {
    return added ? 'app.added.btn' : 'app.add.btn';
  },

  @computed('app.authors')
  authors(authors) {
    return authors.split(',');
  },

  actions: {
    addApp() {
      const name = this.get('app.name');
      let controller = showModal('add-app', { model: { name }});

      controller.addObserver('added', () => {
        if (controller.get('added')) {
          this.set('app.added', true);

          const user = this.get('currentUser');
          const side = controller.get('side');
          const appName = this.get('app.name');

          let apps = user.get('apps');
          apps.push(appName);
          user.set('apps', apps);
          user.set(`${appName}`, { side });

          controller.set('added', null);
          controller.send('closeModal');
        }
      });
    }
  }
});
