import { addCustomWidget } from 'discourse/plugins/discourse-layouts/discourse/widgets/sidebar';
import { getOwner } from 'discourse-common/lib/get-owner';

const buildWidgetList = function(appData) {
  return _.sortBy(Object.keys(appData).reduce(function(ws, name){
    if (appData[name].widget) {
      ws.push(Object.assign({}, { name }, appData[name].widget));
    };
    return ws;
  }, []), 'order');
}

const applyAppWidgets = function(user) {
  const appData = user.get('app_data');
  const widgetList = buildWidgetList(appData);

  widgetList.forEach((widget) => {
    addCustomWidget(widget);
  });

  const appEvents = getOwner(user).lookup('app-events:main');
  appEvents.trigger('sidebars:rerender');
}

const updateAppWidgets = function(widgetList, appData) {
  return appData.forEach((app) => {
    const updatedWidget = widgetList.find((w) => w.name === app.name);
    if (updatedWidget) {
      appData[app.name].widget = updatedWidget;
      appData['updated'] = true;
    }
  });
}

const updatedApps = function(appData) {
  return Object.keys(appData).filter((appName) => {
    return appData[appName].updated;
  }).map((appName) => appData[appName]);
}

export { buildWidgetList, applyAppWidgets, updateAppWidgets, updatedApps };
