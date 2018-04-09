import { createWidget } from 'discourse/widgets/widget';

var isNumeric = function(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
};

export default createWidget('app-widget-edit', {
  tagName: 'div.app-widget-edit',

  buildClasses(attrs) {
    return attrs.side;
  },

  html(attrs) {
    const userApps = this.currentUser.get('apps');
    const { app } = attrs;
    const order = app.order;
    let html = [];

    if (!isNumeric(order) || !userApps) return;

    if (userApps.length > 1) {
      if (order !== 1) {
        html.push(this.attach('button', {
          className: 'btn btn-primary action app-widget-up',
          icon: 'arrow-up',
          action: 'moveUp'
        }));
      }

      if (order !== userApps.length - 1) {
        html.push(this.attach('button', {
          className: 'btn btn-primary action app-widget-down',
          icon: 'arrow-down',
          action: 'moveDown'
        }));
      }
    }

    if (!attrs.noRemove) {
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
    const user = this.currentUser;
    const side = this.attrs.side;
    const currentIndex = this.attrs.index;

    let targetIndex = up ? currentIndex - 1 : currentIndex + 1;
    let userApps = user.get(`${side}_apps`);

    let tmp = userApps[targetIndex];
    userApps[targetIndex] = userApps[currentIndex];
    userApps[currentIndex] = tmp;

    user.set(`${side}_apps`, userApps);
    this.scheduleRerender();
  },

  moveUp() {
    this.moveAppWidget(true);
  },

  moveDown() {
    this.moveAppWidget(false);
  }
});
