import { addCustomWidget } from 'discourse/plugins/discourse-layouts/discourse/widgets/sidebar';
import { getOwner } from 'discourse-common/lib/get-owner';

const buildWidgetList = function(appData) {
  return _.sortBy(Object.keys(appData).reduce(function(ws, name){
    if (appData[name] && appData[name].widget) {
      ws.push($.extend({}, { name }, appData[name].widget));
    };
    return ws;
  }, []), 'order');
}

const getPositionWidgets = function(widgetList, position) {
  return _.sortBy(widgetList.filter((w) => w.position === position), 'order')
    .map((w) => w.name);
}

const updateWidgetOrder = function(widgetList, position, order, targetOrder) {
  let widgets = getPositionWidgets(widgetList, position);

  let temp = widgets[targetOrder];
  widgets[targetOrder] = widgets[order];
  widgets[order] = temp;

  return widgets.map((name, order) => {
    return { name, position, order };
  })
}

const updateClientWidgetData = function(widgetList, appData) {
  Object.keys(appData).forEach((appName) => {
    let updatedWidget = widgetList.find((w) => w.name === appName);
    if (updatedWidget) {
      delete updatedWidget.name;
      appData[appName]['widget'] = updatedWidget;
      appData[appName]['unsaved'] = true;
    }
  });

  return appData;
}

const getUnsavedAppList = function(appData) {
  return Object.keys(appData).filter(appName => {
    return appData[appName].unsaved
  }).map(appName => {
    delete appData[appName].unsaved
    appData[appName]['name'] = appName;
    return appData[appName];
  });
}

const applyAppWidgets = function(user) {
  const appData = user.get('app_data');
  const widgetList = buildWidgetList(appData);

  widgetList.forEach((widget) => addCustomWidget(widget));

  const appEvents = getOwner(user).lookup('app-events:main');
  appEvents.trigger('sidebars:rerender');
}

const updateAppData = function(user, appName, newData) {
  const existingData = user.get('app_data');
  const appData = JSON.parse(JSON.stringify(existingData));
  appData[appName] = newData;
  user.set('app_data', appData);
  user.notifyPropertyChange(`app_data.${appName}`);
}

const removeAppData = function(user, appName) {
  const existingData = user.get('app_data');
  const appData = JSON.parse(JSON.stringify(existingData));
  delete appData[appName];
  user.set('app_data', appData);
  user.notifyPropertyChange(`app_data.${appName}`);
}

export {
  buildWidgetList,
  getPositionWidgets,
  updateWidgetOrder,
  updateClientWidgetData,
  applyAppWidgets,
  getUnsavedAppList,
  updateAppData,
  removeAppData
};
