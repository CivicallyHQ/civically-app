import DiscoveryController from 'discourse/controllers/discovery';
import TopicController from 'discourse/controllers/topic';
import AppMixin from '../mixins/app';
import { addCustomWidget } from 'discourse/plugins/discourse-layouts/discourse/widgets/sidebar';

export default {
  name: 'add-edits',
  initialize(container) {
    const siteSettings = container.lookup('site-settings:main');
    const user = container.lookup('current-user:main');

    if (siteSettings.app_store_enabled) {
      TopicController.reopen(AppMixin, {});
      DiscoveryController.reopen(AppMixin, {});
    }

    const apps = user.get('apps');
    Object.keys(apps).map(name => Object.assign({}, { name }, apps[name])).forEach((app) => {
      addCustomWidget(app);
    })
  }
};
