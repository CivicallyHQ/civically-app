import { default as computed, observes } from 'ember-addons/ember-computed-decorators';
import App from '../models/app';

export default Ember.Mixin.create({
  @computed()
  showUserControls() {
    return this.get('currentUser') && Discourse.SiteSettings.layouts_sidebar_user_selected_widgets;
  },

  @computed('editing_right')
  editRightText(editing) {
    return editing ? 'layout.save' : 'layout.edit';
  },

  @computed('editing_left')
  editLeftText(editing) {
    return editing ? 'layout.save' : 'layout.edit';
  },

  @observes('path')
  teardownEditing() {
    this.setProperties({
      'editing_right': false,
      'editing_left': false
    });
  },

  actions: {
    editSidebars(side) {
      if (this.get(`editing_${side}`)) {

        const user = this.get('currentUser');
        let data = {};
        data[`${side}_apps`] = user.get(`${side}_apps`);

        App.save(data).then(() => this.set(`editing_${side}`, false));
      } else {
        this.set(`editing_${side}`, true);
      }
    },

    addToSidebars() {
      this.transitionToRoute('app.store');
    }
  }
});
