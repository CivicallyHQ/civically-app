import { ajax } from 'discourse/lib/ajax';

const App = Discourse.Model.extend();

App.reopenClass({
  update(name, data) {
    return ajax('/a/:name/update', { type: 'POST', data: { name, data }}).then(function(result) {
      return result;
    });
  }
});

export default App;
