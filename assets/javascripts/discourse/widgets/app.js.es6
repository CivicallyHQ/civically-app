import { createWidget } from 'discourse/widgets/widget';
import baseApp from './base-app';

export function createApp(id, opts) {
  let app = Object.assign({}, opts, baseApp(id));
  return createWidget(id, app);
}
