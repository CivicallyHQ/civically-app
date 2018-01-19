import { createWidget } from 'discourse/widgets/widget';
import DiscourseURL from 'discourse/lib/url';
import { h } from 'virtual-dom';

export default createWidget('app-menu', {
  tagName: 'div.app-menu',
  buildKey: () => 'app_menu',

  defaultState() {
    return {
      showMenu: false
    };
  },

  html(attrs, state) {
    let contents = [
      this.attach('link', {
        icon: 'ellipsis-v',
        action: 'showMenu',
        className: 'app-menu-toggle'
      })
    ];

    if (state.showMenu) {
      contents.push(this.attach('app-menu-list', {
        category: attrs.category,
        id: attrs.id,
        title: I18n.t(attrs.title),
        isUser: attrs.isUser
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

createWidget('app-menu-item', {
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

createWidget('app-menu-list', {
  tagName: 'ul.app-menu-list',

  html(attrs) {
    let contents = [];

    if (attrs.isUser) {
      contents.push([
        h('li', this.attach('app-menu-item', {
          href: `/app/details/${attrs.id}`,
          label: 'app.store.page',
          icon: 'info'
        })),
        h('li', this.attach('app-menu-item', {
          action: 'removeApp',
          label: 'app.remove.title',
          icon: 'times'
        }))
      ]);
    }

    return contents;
  }
});
