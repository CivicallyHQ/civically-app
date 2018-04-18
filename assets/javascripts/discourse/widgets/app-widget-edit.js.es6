import { createWidget } from 'discourse/widgets/widget';

var isNumeric = function(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
};

export default createWidget('app-widget-edit', {
  tagName: 'div.app-widget-edit',

  buildClasses(attrs) {
    return attrs.position;
  },

  html(attrs, state) {
    const user = this.currentUser;
    const { app, side } = attrs;

    const widgets = user.get(`app_widgets_${side}`);
    if (!widgets || widget.length < 1) return;

    const order = widgets.indexOf(app.name) + 1;

    let html = [];

    if (widgets.length > 1) {
      if (order !== 1) {
        html.push(this.attach('button', {
          className: 'btn btn-primary action app-widget-up',
          icon: 'arrow-up',
          action: 'moveUp'
        }));
      }

      if (order !== widgets.length - 1) {
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

  moveAppWiget(up) {
    const { app, side } = attrs;
    const user = this.currentUser;
    const widgetsProp = `app_widgets_${side}`;
    const widgets = user.get(widgetsProp);
    const index = widgets.indexOf(app.name);
    let targetIndex = 0;

    if (up || index > 0) {
      targetIndex = up ? currentIndex - 1 : currentIndex + 1;
    }

    let tmp = widgets[targetIndex];
    widgets[targetIndex] = widgets[currentIndex];
    widgets[currentIndex] = tmp;

    user.set(widgetsProp, widgets);

    this.scheduleRerender();
  },

  moveUp() {
    this.moveAppWidget(true);
  },

  moveDown() {
    this.moveAppWidget(false);
  }
});
