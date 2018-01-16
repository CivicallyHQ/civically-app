import { default as computed } from 'ember-addons/ember-computed-decorators';
import showModal from 'discourse/lib/show-modal';

export default Ember.Component.extend({
  classNames: ['app-card'],
  showAddApp: Ember.computed.alias('currentUser'),

  @computed('app.user_added')
  btnClasses(added) {
    let classes = 'btn';
    if (!added) classes += ' btn-primary';
    return classes;
  },

  @computed('app.user_added')
  btnLabel(added) {
    return added ? 'app.added.btn' : 'app.add.btn';
  },

  @computed('app.authors')
  authors(authors) {
    return authors.split(',');
  },

  actions: {
    addApp() {
      let controller = showModal('add-app', {model: {
        id: this.get('app.id'),
        title: this.get('app.title')
      }});

      controller.addObserver('added', () => {
        if (controller.get('added')) {
          this.set('app.user_added', true);

          const user = this.get('currentUser');
          const side = controller.get('side');
          const appId = this.get('app.id');

          let userApps = user.get(`${side}_apps`);
          userApps.push(appId);
          user.set(`${side}_apps`, userApps);

          controller.set('added', null);
          controller.send('closeModal');
        }
      });
    }
  }
});
