import showModal from 'discourse/lib/show-modal';
import { h } from 'virtual-dom';

export default function(appName) {
  const dasherizedAppName = appName.dasherize();
  const underscoreAppName = appName.underscore();

  return {
    tagName: 'div',
    buildKey: () => `${dasherizedAppName}-widget`,

    getAppData() {
      const user = this.currentUser;
      const userAppData = user.get('app_data');
      return userAppData[dasherizedAppName];
    },

    defaultState(attrs) {
      const apps = this.site.get('apps');
      const app = apps.find(a => a.name === dasherizedAppName);

      const appData = this.getAppData();
      const locked = !appData || !appData.enabled;

      return {
        locked,
        mouseover: false,
        appData,
        app
      };
    },

    buildClasses() {
      const appData = this.getAppData();
      const locked = !appData || !appData.enabled;

      let classes = `${appName} app-widget `;

      if (locked) classes += 'locked ';

      return classes;
    },

    header() {
      const category = this.attrs.category;
      const app = this.state.app;
      const appData = this.state.appData;

      return this.attach('app-widget-header', {
        category,
        appData,
        app
      })
    },

    html(attrs, state) {
      const { category, editing, side } = attrs;

      // state is null sometimes;
      if (!state) {
        state = this.defaultState(attrs);
      }

      const mouseover = state.mouseover;
      const locked = state.locked;
      const app = state.app;
      const appData = state.appData;

      let contents = [];

      if ((app && app.widget && !app.widget.no_header) || locked) {
        contents.push(this.header());
      }

      let content = [];

      if (locked) {
        content.push(I18n.t(`app.${underscoreAppName}.locked`));
      } else if (!locked) {
        content.push(this.contents());
      }

      contents.push(h('div.app-widget-content', content));

      let html = [h('div.app-widget-container', contents)];

      if (editing) {
        html.push(this.attach('app-widget-edit', { app, side }));
      }

      return html;
    },

    setupMouseEvents() {
      Ember.run.scheduleOnce('afterRender', () => {
        const $app = $(`.${dasherizedAppName}.app-widget`);
        $app.on('mouseenter', () => this.mouseEnter());
        $app.on('mouseleave', () => this.mouseLeave());
      });
    },

    teardownMouseEvents() {
      const $app = $(`.${dasherizedAppName}.app-widget`);
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

    removeAppWidget() {
      let controller = showModal('remove-app-widget', { model: {
        appName,
        position: this.attrs.position
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
