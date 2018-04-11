import showModal from 'discourse/lib/show-modal';
import { h } from 'virtual-dom';

export default function(appName) {
  return {
    tagName: 'div',
    buildKey: () => appName.dasherize(),

    defaultState() {
      const user = this.currentUser;
      const dasherizedAppName = appName.dasherize();
      const userApps = user.get('apps');
      const userApp = userApps[dasherizedAppName];
      const apps = this.site.get('apps');
      const app = apps.find(a => a.name === dasherizedAppName);
      const locked = !userApp || !userApp.enabled;

      return {
        locked,
        mouseover: false,
        userApp,
        app
      };
    },

    buildClasses() {
      const app = this.state.app;
      const locked = this.state.locked;

      let classes = `${app.name} app-widget `;

      if (locked) {
        classes += 'locked ';
      }

      return classes;
    },

    html(attrs, state) {
      const { category, editing, side } = attrs;
      const mouseover = state.mouseover;
      const locked = state.locked;
      const app = state.app;
      const userApp = state.userApp;

      let contents = [];

      if (!app.widget.no_header || locked) {
        contents.push(this.attach('app-widget-header', {
          category,
          userApp,
          app
        }));
      }

      let content = [];

      if (locked) {
        content.push(I18n.t(`app.${app.name.underscore()}.locked`));
      } else if (!locked) {
        content.push(this.contents());
      }

      contents.push(h('div.app-widget-content', content));

      let html = [h('div.app-widget-container', contents)];

      if (editing) {
        html.push(this.attach('app-widget-edit', { app }));
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
