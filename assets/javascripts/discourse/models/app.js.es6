import { ajax } from 'discourse/lib/ajax';

const App = Discourse.Model.extend();

App.reopenClass({
  add(userId, app) {
    return ajax('/apps/add', { type: 'POST', data: {
      user_id: userId,
      app
    }}).then(function(result) {
      return result;
    });
  },

  remove(userId, name) {
    return ajax('/apps/remove', { type: 'POST', data: {
      user_id: userId,
      app: {
        name
      }
    }}).then(function(result) {
      return result;
    });
  },

  update_data(userId, app) {
    return ajax('/apps/update', { type: 'POST', data: {
      user_id: userId,
      app
    }}).then(function(result) {
      return result;
    });
  }
});

export default App;
