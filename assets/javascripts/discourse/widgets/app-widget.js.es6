import { createWidget } from 'discourse/widgets/widget';
import appWidgetBase from './app-widget-base';

export function createAppWidget(name, app) {
  const base = appWidgetBase(name);
  const keys = _.union(Object.keys(app), Object.keys(base));
  let widget = {};

  keys.forEach((k) => {
    if (base[k] && app[k]) {
      if (_.isFunction(base[k])) {
        widget[k] = function() {
          let result = base[k].call(this, arguments);

          let appResult = null;
          if (_.isFunction(app[k])) {
            appResult = app[k].call(this, arguments);
          }

          if (result === null && appResult === null) return;

          if (typeof result === "string" && typeof appResult === "string") {
            result += appResult;
          }

          if (typeof result === "object" && typeof appResult === "object") {
            if ($.isArray(result)) {
              result = result.concat(appResult);
            } else {
              result = Object.assign({}, result, appResult);
            }
          }

          if (typeof result === "boolean") {
            result = appResult;
          }

          if (typeof result === "number") {
            result = appResult;
          }

          return result;
        };
      } else if (typeof base[k] === "object") {
        widget[k] = base[k];

        if (typeof app[k] === "object") {
          if ($.isArray(widget[k])) {
            widget[k] = widget[k].concat(app[k]);
          } else {
            widget[k] = Object.assign({}, widget[k], app[k]);
          }
        }
      } else if (typeof base[k] === "string") {
        widget[k] = base[k];

        if (typeof app[k] === "string") {
          widget[k] += app[k];
        }
      } else if (typeof base[k] === 'boolean' && typeof app[k] === 'boolean') {
        widget[k] = app[k];
      }
    } else if (base[k]) {
      widget[k] = base[k];
    } else if (app[k]) {
      widget[k] = app[k];
    }
  });

  return createWidget(name, widget);
}
