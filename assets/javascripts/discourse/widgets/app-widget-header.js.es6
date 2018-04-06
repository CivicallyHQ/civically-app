import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import { appProps } from '../lib/app-utilities';
import { iconNode } from 'discourse-common/lib/icon-library';
import { avatarImg } from 'discourse/widgets/post';

export default createWidget('app-widget-header', {
  tagName: 'div.app-widget-header',

  html(attrs) {
    const appName = attrs.appName;
    const user = this.currentUser;
    const props = appProps(appName);
    const icon = props.icon;
    let contents = [];

    // image to left of title

    let image = null;

    if (appName === 'civically-user') {
      image = avatarImg('tiny', {
        username: user.username,
        template: user.avatar_template,
        name: user.name
      });
    }

    if (icon) {
      if (icon.indexOf('fa-') > -1) {
        image = iconNode(icon.replace('fa-', ''));
      } else if (icon.charAt(0) === ':' && icon.charAt(icon.length-1) === ':') {
        image = this.attach('emoji', { name: props.icon.substring(1, props.icon.length-1) });
      } else if (icon.indexOf('.png') > -1 || icon.indexOf('.jpg') > -1) {
        image = h('img', { attributes: { src: icon, width: 20, height: 20 }});
      }
    }

    if (image) {
      contents.push(image);
    }

    // title

    let title = props.title;

    if (appName === 'civically-user') {
      title = user.username;
    }

    contents.push(h('div.app-widget-title', title));

    // right icon or button

    if (attrs.locked) {
      contents.push(iconNode('lock'));
    } else {
      contents.push(this.attach('app-widget-menu', {
        category: attrs.category,
        appName,
        isUser: attrs.isUser
      }));
    }

    return contents;
  }
});
