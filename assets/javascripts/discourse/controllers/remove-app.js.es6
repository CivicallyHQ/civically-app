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
      const side = this.get('model.side');
      const user = this.get('currentUser');

      App.remove(name, side).then(() => {
        let apps = user.get(`${side}_apps`);
        apps.splice(apps.indexOf(name), 1);

        user.set(`${side}_apps`, apps);
        this.set('removed', true);
      });
    }
  }
});
