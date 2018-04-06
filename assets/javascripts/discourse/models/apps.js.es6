import { ajax } from 'discourse/lib/ajax';

const Apps = Discourse.Model.extend();

Apps.reopenClass({
  add(name, side) {
    return ajax('/apps/add', { type: 'POST', data: { name, side }}).then(function(result) {
      return result;
    });
  },

  remove(name, side) {
    return ajax('/apps/remove', { type: 'POST', data: { name, side }}).then(function(result) {
      return result;
    });
  },

  update(data) {
    return ajax('/apps/update', { type: 'POST', data }).then(function(result) {
      return result;
    });
  }
});

export default Apps;
