import showModal from 'discourse/lib/show-modal';
import { appProps } from '../lib/app-utilities';
import { h } from 'virtual-dom';

export default function(appName) {
  return {
    tagName: 'div',
    buildKey: () => appName.dasherize(),

    defaultState() {
      const user = this.currentUser;
      const userApp = user.get(`apps_user.${appName}`);
      const locked = !userApp || !userApp.widget_enabled;

      return {
        locked,
        mouseover: false
      };
    },

    buildClasses() {
      let classes = `${appName.dasherize()} app-widget `;
      if (this.state.locked) {
        classes += 'locked ';
      }
      return classes;
    },

    html(attrs, state) {
      const category = attrs.category;
      const isUser = attrs.isUser;
      const locked = state.locked;
      const mouseover = state.mouseover;
      const props = appProps(appName);

      let contents = [this.attach('app-widget-header', {
        category,
        appName,
        isUser,
        locked
      })];

      let content = [];

      if (locked && mouseover) {
        content.push(props.locked);
      } else if (!locked) {
        content.push(this.content(attrs, state));
      }

      contents.push(h('div.app-widget-content', content));

      let html = [h('div.app-widget-container', contents)];

      if (attrs.editing) {
        html.push(this.attach('app-widget-edit', {
          side: attrs.side,
          index: attrs.index,
          appName
        }));
      }

      return html;
    },

    setupMouseEvents() {
      Ember.run.scheduleOnce('afterRender', () => {
        const $app = $(`.${appName.dasherize()}.app-widget`);
        $app.on('mouseenter', () => this.mouseEnter());
        $app.on('mouseleave', () => this.mouseLeave());
      });
    },

    teardownMouseEvents() {
      const $app = $(`.${appName.dasherize()}.app-widget`);
      $app.off('mouseenter', () => this.mouseEnter());
      $app.off('mouseleave', () => this.mouseLeave());
    },

    transform() {
      this.setupMouseEvents();
    },

    destroy() {
      this.teardownMouseEvents();
    },

    mouseEnter() {
      this.state.mouseover = true;
      this.scheduleRerender();
    },

    mouseLeave() {
      this.state.mouseover = false;
      this.scheduleRerender();
    },

    removeApp() {
      let controller = showModal('remove-app-widget', { model: {
        appName,
        side: this.attrs.side
      }});

      controller.addObserver('removed', () => {
        if (controller.get('removed')) {
          controller.set('removed', null);
          controller.send('closeModal');
          this.scheduleRerender();
        }
      });
    },
  };
}
