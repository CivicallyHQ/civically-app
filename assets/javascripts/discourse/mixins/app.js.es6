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
    editPositionbars(position) {
      if (this.get(`editing_${position}`)) {

        const user = this.get('currentUser');
        let data = {};
        data[`${position}_apps`] = user.get(`${position}_apps`);

        App.save(data).then(() => this.set(`editing_${position}`, false));
      } else {
        this.set(`editing_${position}`, true);
      }
    },

    addToPositionbars() {
      this.transitionToRoute('app.store');
    }
  }
});
