import ModalFunctionality from 'discourse/mixins/modal-functionality';
import { extractError } from 'discourse/lib/ajax-error';
import App from '../models/app';

export default Ember.Controller.extend(ModalFunctionality, {
  title: 'app.remove.title',

  actions: {
    cancel() {
      this.send('closeModal');
    },

    removeApp() {
      const name = this.get('model.name');
      const user = this.get('currentUser');

      App.remove(user.id, name).then((result) => {
        if (result.app_name) {
          delete user.get(appName);
          applyAppWidgets(user);
        }
      }).catch(err => this.flash(extractError(err), 'error'));
    }
  }
});
