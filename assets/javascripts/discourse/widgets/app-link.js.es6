import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

export default createWidget('app', {
  tagName: 'li.app-link',

  html(attrs) {
    return [
      h('a', { href: `/t/${attrs.appTopic.slug}` }, attrs.appTopic.title)
    ];
  }
});
