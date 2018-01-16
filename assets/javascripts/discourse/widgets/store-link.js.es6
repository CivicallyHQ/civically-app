import { createWidget } from 'discourse/widgets/widget';
import DiscourseURL from 'discourse/lib/url';
import { h } from 'virtual-dom';

export default createWidget('store-link', {
  tagName: 'div.store-link.widget-container',

  html() {
    return this.attach('link', {
      icon: 'plus',
      label: 'app.store.link',
      href: '/app/store'
    })
  },

  click() {
    DiscourseURL.routeTo('/app/store');
  }
})
