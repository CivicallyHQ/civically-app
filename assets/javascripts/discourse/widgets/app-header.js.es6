import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

export default createWidget('app-header', {
  tagName: 'div.app-header',

  html(attrs) {
    let contents = [];

    if (attrs.title) {
      contents.push(h('div.widget-title', I18n.t(attrs.title)));
    }

    contents.push(this.attach('app-menu', {
      category: attrs.category,
      id: attrs.id,
      isUser: attrs.isUser
    }));

    return contents;
  }
});
