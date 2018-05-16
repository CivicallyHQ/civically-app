import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import { iconNode } from 'discourse-common/lib/icon-library';
import { avatarFor } from 'discourse/widgets/post';
import { userPath } from 'discourse/lib/url';

export default createWidget('app-widget-header', {
  tagName: 'div.app-widget-header',

  html(attrs) {
    const { category, appData, app } = attrs;

    const underscoreName = app.name.underscore();
    const user = this.currentUser;
    let contents = [];

    // image to left of title

    let image = null;

    if (app.name === 'civically-user') {
      image = avatarFor('tiny', {
        username: user.username,
        template: user.avatar_template,
        name: user.name,
        url: userPath(user.username)
      });
    } else {
      const icon = I18n.t(`app.${underscoreName}.icon`);

      if (icon.indexOf('fa-') > -1) {
        image = iconNode(icon.replace('fa-', ''));
      } else if (icon.charAt(0) === ':' && icon.charAt(icon.length - 1) === ':') {
        image = this.attach('emoji', { name: icon.substring(1, icon.length - 1) });
      } else if (icon.indexOf('.png') > -1 || icon.indexOf('.jpg') > -1) {
        image = h('img', { attributes: { src: icon, width: 20, height: 20 }});
      }
    }

    if (image) {
      contents.push(image);
    }

    // title
    let title;

    if (app.name === 'civically-user') {
      title = h('a.mention', `@${user.username}`);
    } else {
      title = I18n.t(`app.${underscoreName}.title`);
    }

    contents.push(h('div.app-widget-title', title));

    // right icon or button

    if (appData && appData.enabled) {
      contents.push(this.attach('app-widget-menu', {
        category,
        app
      }));
    } else {
      contents.push(iconNode('lock'));
    }

    return contents;
  }
});
