import App from '../models/app';

export default Ember.Controller.extend({
  title: 'app.remove.title',
  removed: null,

  actions: {
    cancel() {
      this.send('closeModal');
    },

    removeApp() {
      const id = this.get('model.id');
      const side = this.get('model.side');
      const user = this.get('currentUser');

      App.remove(id, side).then(() => {
        let apps = user.get(`${side}_apps`);
        apps.splice(apps.indexOf(id), 1);

        user.set(`${side}_apps`, apps);
        this.set('removed', true);
      });
    }
  }
});
