import { ajax } from 'discourse/lib/ajax';

const App = Discourse.Model.extend();

App.reopenClass({
  add(userId, app) {
    return ajax('/app/add', { type: 'POST', data: {
      user_id: userId,
      app
    }});
  },

  remove(userId, name) {
    return ajax('/app/remove', { type: 'POST', data: {
      user_id: userId,
      app: {
        name
      }
    }});
  },

  update(userId, app) {
    return ajax('/app/update', { type: 'POST', data: {
      user_id: userId,
      app
    }});
  },

  batchUpdate(userId, apps) {
    return ajax('/app/batch-update', {
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        user_id: userId,
        apps
      })
    });
  }
});

export default App;
