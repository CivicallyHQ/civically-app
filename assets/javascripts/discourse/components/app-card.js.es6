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
      const appName = this.get('app.name');
      const user = this.get('currentUser');
      let controller = showModal('add-app', {
        model: { appName },
        added: (appData) => {
          const position = appData.widget.position;
          const widgetsProp = `app_widgets_${position}`;
          let widgets = user.get(widgetsProp);

          widgets.push(appName);

          let props = {};
          props[appName] = appData;
          props[widgetsProp] = widgets;
          user.setProperties(props);

          controller.send('closeModal');
        }
      });
    }
  }
});
