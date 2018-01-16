import DiscoveryController from 'discourse/controllers/discovery';
import TopicController from 'discourse/controllers/topic';
import AppMixin from '../mixins/app';

export default {
  name: 'add-edits',
  initialize(container) {
    const siteSettings = container.lookup('site-settings:main');

    if (siteSettings.app_store_enabled) {
      TopicController.reopen(AppMixin, {});
      DiscoveryController.reopen(AppMixin, {});
    }
  }
};
