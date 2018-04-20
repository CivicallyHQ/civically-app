import { applyAppWidgets } from '../lib/app-utilities';

export default {
  name: 'add-edits',
  initialize(container) {
    const user = container.lookup('current-user:main');
    if (user) {
      applyAppWidgets(user);
    }
  }
};
