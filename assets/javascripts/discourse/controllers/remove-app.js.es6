import App from '../models/app';

export default Ember.Controller.extend({
  title: 'app.remove.title',
  removed: null,

  actions: {
    cancel() {
      this.send('closeModal');
    },

    removeApp() {
      const name = this.get('model.name');
      const position = this.get('model.position');
      const user = this.get('currentUser');

      App.remove(name, position).then(() => {
        let apps = user.get(`${position}_apps`);
        apps.splice(apps.indexOf(name), 1);

        user.set(`${position}_apps`, apps);
        this.set('removed', true);
      });
    }
  }
});
