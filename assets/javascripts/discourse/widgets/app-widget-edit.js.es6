import { createWidget } from 'discourse/widgets/widget';

var isNumeric = function(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
};

export default createWidget('app-widget-edit', {
  tagName: 'div.app-widget-edit',

  buildClasses(attrs) {
    return attrs.side;
  },

  html(attrs, state) {
    const user = this.currentUser;
    const { app, side } = attrs;

    const widgets = user.get(`app_widgets_${side}`);
    if (!widgets || widgets.length < 1) return;

    const index = widgets.indexOf(app.name);

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

    if (app.type !== 'system') {
      html.push(this.attach('button', {
        className: 'btn btn-primary action app-widget-remove',
        icon: 'times',
        action: 'removeAppWidget',
      }));
    }

    return html;
  },

  pinnedTip() {
    return null;
  },

  moveAppWidget(up) {
    const { app, side } = this.attrs;
    const user = this.currentUser;
    let appData = user.get('app_data');

    const currentIndex = widgets.findIndex(w => w.name === app.name);
    const targetIndex = up ? currentIndex - 1 : currentIndex + 1;
    let widgetList = buildWidgetList(appData);

    let temp = widgetList[targetIndex];
    widgetList[targetIndex] = widgetList[currentIndex];
    widgetList[currentIndex] = temp;

    widgetList = widgetList.map((w, i) => {
      return {
        name: w.name,
        position: w.position,
        order: i
      }
    })

    appData = updateAppWidgets(widgetList, appData);

    user.set('app_data', appData);
  },

  moveUp() {
    this.moveAppWidget(true);
  },

  moveDown() {
    this.moveAppWidget(false);
  }
});
