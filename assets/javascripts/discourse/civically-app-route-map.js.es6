export default function() {
  this.route('app', {path: '/app'}, function() {
    this.route('store', {path: '/store'});
    this.route('storeGeneral', {path: '/store/general'});
    this.route('storeplace', {path: '/store/place'});
    this.route('add', {path: '/add'});
    this.route('details', {path: '/details/:id'});
    this.route('submit', {path: '/submit'});
  });
}
