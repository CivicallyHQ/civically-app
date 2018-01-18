import { ajax } from 'discourse/lib/ajax';

const App = Discourse.Model.extend();

App.reopenClass({
  add(app, side) {
    return ajax('/app/add', { type: 'POST', data: { app, side }}).then(function(result) {
      return result;
    });
  },

  remove(app, side) {
    return ajax('/app/remove', { type: 'POST', data: { app, side }}).then(function(result) {
      return result;
    });
  },

  changeSide(app, side) {
    return ajax('/app/change_side', { type: 'POST', data: { app, side }}).then(function(result) {
      return result;
    });
  },

  save(data) {
    return ajax('/app/save', { type: 'POST', data }).then(function(result) {
      return result;
    });
  }
});

export default App;
