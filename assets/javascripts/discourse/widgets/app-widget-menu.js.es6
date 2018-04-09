import { createWidget } from 'discourse/widgets/widget';
import DiscourseURL from 'discourse/lib/url';
import { h } from 'virtual-dom';

export default createWidget('app-widget-menu', {
  tagName: 'div.app-widget-menu',
  buildKey: () => 'app_widget_menu',

  defaultState() {
    return {
      showMenu: false
    };
  },

  html(attrs, state) {
    const { category, app } = attrs;

    let contents = [
      this.attach('link', {
        icon: 'ellipsis-v',
        action: 'showMenu',
        className: 'app-widget-menu-toggle'
      })
    ];

    if (state.showMenu) {
      contents.push(this.attach('app-widget-menu-list', {
        category,
        app
      }));
    }

    return contents;
  },

  clickOutside() {
    this.sendWidgetAction('closeMenu');
  },

  showMenu() {
    this.state.showMenu = !this.state.showMenu;
    this.scheduleRerender();
  },

  closeMenu() {
    this.state.showMenu = false;
  }
});

createWidget('app-widget-menu-item', {
  html(attrs) {
    return [
      h(`i.fa.fa-${attrs.icon}`),
      h('span', I18n.t(attrs.label))
    ];
  },

  click() {
    const url = this.attrs.href;
    const action = this.attrs.action;
    if (action) {
      return this.sendWidgetAction(action);
    }
    if (url) {
      return DiscourseURL.routeTo(url);
    }
  }
});

createWidget('app-widget-menu-list', {
  tagName: 'ul.app-widget-menu-list',

  html(attrs) {
    const { category, app } = attrs;
    const isSystem = app.type === 'system';
    let contents = [];
    let aboutLink = isSystem ?
                    `/t/${app.name.dasherize()}` :
                    `/app/details/${app.name}`;

    contents.push(
      h('li', this.attach('app-widget-menu-item', {
        href: aboutLink,
        label: 'app.about',
        icon: 'info'
      }))
    );

    if (!isSystem) {
      contents.push(
        h('li', this.attach('app-widget-menu-item', {
          action: 'removeApp',
          label: 'app.remove.title',
          icon: 'times'
        }))
      )
    }

    return contents;
  }
});
