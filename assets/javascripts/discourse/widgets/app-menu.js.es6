import { createWidget } from 'discourse/widgets/widget';
import { appKey } from '../lib/app-utilities';
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


createWidget('app-menu-list', {
  tagName: 'ul.app-menu-list',

  html(attrs) {
    let contents = [];

    if (attrs.isUser) {
      contents.push([
        h('li', this.attach('link', {
          href: `/app/details/${attrs.id}`,
          label: 'app.store.page',
          icon: 'info'
        })),
        h('li', this.attach('link', {
          action: 'removeApp',
          label: 'app.remove.title',
          icon: 'times'
        }))
      ]);
    }

    return contents;
  }
});
