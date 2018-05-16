import ModalFunctionality from 'discourse/mixins/modal-functionality';
import { extractError } from 'discourse/lib/ajax-error';
import { removeAppData, applyAppWidgets } from '../lib/app-utilities';
import App from '../models/app';

export default Ember.Controller.extend(ModalFunctionality, {
  title: 'app.remove.title',

  actions: {
    cancel() {
      this.send('closeModal');
    },

    removeApp() {
      const name = this.get('model.app.name');
      const user = this.get('currentUser');

      App.remove(user.id, name).then((result) => {
        if (result.app_name) {
          removeAppData(user, result.app_name);
          applyAppWidgets(user);
        }
        this.get("model.removedApp")(name);
        this.send('closeModal');
      }).catch(err => this.flash(extractError(err), 'error'));
    }
  }
});
