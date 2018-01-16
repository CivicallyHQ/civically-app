import showModal from 'discourse/lib/show-modal';
import { appKey } from '../lib/app-utilities';
import { h } from 'virtual-dom';

export default function(id) {
  let title = `${appKey(id)}.title`;

  return {
    html(attrs, state) {
      let contents = [ h('div.widget-container.app', [
        this.attach('app-header', {
          category: attrs.category,
          id,
          title,
          isUser: attrs.isUser,
        }),
        h('div.app-content', this.content(attrs, state))
      ])];

      if (attrs.editing) {
        contents.push(this.attach('app-edit', {
          side: attrs.side,
          index: attrs.index,
          id,
          title
        }));
      }

      return contents;
    },

    removeApp() {
      let controller = showModal('remove-app', { model: {
        id,
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
