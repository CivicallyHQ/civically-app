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

    if (user) {
      const userAppData = user.get('app_data');
      const widgetSides = ['left', 'right'];
      let widgets = [];

      widgetSides.forEach((side) => {
        const widgetList = user.get(`app_widgets_${side}`);
        const sideWidgets = widgetList.map(function(name, i) {
          return {
            name,
            position: side,
            order: i + 1
          }
        });

        widgets = widgets.concat(sideWidgets);
      })

      widgets.forEach((widget) => {
        addCustomWidget(widget);
      })
    }
  }
};
