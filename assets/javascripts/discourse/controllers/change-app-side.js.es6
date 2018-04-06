import { default as computed } from 'ember-addons/ember-computed-decorators';
import App from '../models/app';

export default Ember.Controller.extend({
  title: 'app.side.change.title',
  side: null,

  setup() {
    const currentSide = this.get('model.side');
    this.set('side', currentSide);
  },

  @computed('side', 'model.side')
  changeDisabled(side, oldSide) {
    return side === oldSide;
  },

  @computed('side')
  leftSideClass(side) {
    return side === 'left' ? 'enabled' : '';
  },

  @computed('side')
  rightSideClass(side) {
    return side === 'right' ? 'enabled' : '';
  },

  actions: {
    cancel() {
      this.send('closeModal');
    },

    changeSide() {
      const changeDisabled = this.get('changeDisabled');

      if (changeDisabled) return;

      const appName = this.get('model.name');
      const user = this.get('currentUser');
      const addSide = this.get('side');
      const removeSide = this.get('model.side');

      App.changeSide(appName, addSide).then(() => {
        const removeSideApps = user.get(`${removeSide}_apps`);
        removeSideApps.splice(removeSideApps.indexOf(appName), 1);

        const addSideApps = user.get(`${addSide}_apps`);
        addSideApps.push(appName);
        user.set(`${addSide}_apps`, addSideApps);

        this.set('model.side', addSide);
        this.send('closeModal');
      });
    },

    toggleSide() {
      const current = this.get('side');
      this.set('side', current === 'left' ? 'right' : 'left');
    }
  }
});
