import {
  buildWidgetList,
  getPositionWidgets,
  updateWidgetOrder,
  updateClientWidgetData,
  applyAppWidgets
} from '../lib/app-utilities';

import { createWidget } from 'discourse/widgets/widget';

const isNumeric = function(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
};

export default createWidget('app-widget-edit', {
  tagName: 'div.app-widget-edit',
  buildKey: (attrs) => `${attrs.app.name}-widget-edit`,

  defaultState(attrs) {
    return {
      index: null
    }
  },

  buildClasses(attrs) {
    return attrs.side;
  },

  getCurrentWidgetList(user, side) {
    const appData = user.get('app_data');
    const widgetList = buildWidgetList(appData);
    return getPositionWidgets(widgetList, side);
  },

  html(attrs, state) {
    const { app, side } = attrs;
    const user = this.currentUser;

    const widgets = this.getCurrentWidgetList(user, side);

    if (!widgets || widgets.length < 1) return;

    let index = state.index = widgets.indexOf(app.name);

    let html = [];

    if (widgets.length > 1) {
      if (index !== 0) {
        html.push(this.attach('button', {
          className: 'btn btn-primary action app-widget-up',
          icon: 'arrow-up',
          action: 'moveUp'
        }));
      }

      if (index !== widgets.length - 1) {
        html.push(this.attach('button', {
          className: 'btn btn-primary action app-widget-down',
          icon: 'arrow-down',
          action: 'moveDown'
        }));
      }
    }

    return html;
  },

  changeWidgetOrder(currentIndex, targetIndex) {
    const user = this.currentUser;
    const { side } = this.attrs;

    let appData = user.get('app_data');

    let widgetList = buildWidgetList(appData);

    widgetList = updateWidgetOrder(widgetList, side, currentIndex, targetIndex);

    appData = updateClientWidgetData(widgetList, appData);

    user.set('app_data', appData);

    applyAppWidgets(user);
  },

  moveUp() {
    const { index } = this.state;
    this.changeWidgetOrder(index, index - 1);
  },

  moveDown() {
    const { index } = this.state;
    this.changeWidgetOrder(index, index + 1);
  }
});
