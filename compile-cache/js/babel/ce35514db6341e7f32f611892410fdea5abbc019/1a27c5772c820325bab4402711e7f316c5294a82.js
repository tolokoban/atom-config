function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var linterUiDefault = {
  instances: new Set(),
  signalRegistry: null,
  statusBarRegistry: null,
  activate: function activate() {
    if (!atom.inSpecMode()) {
      // eslint-disable-next-line global-require
      require('atom-package-deps').install('linter-ui-default', true);
    }
  },
  deactivate: function deactivate() {
    for (var entry of this.instances) {
      entry.dispose();
    }
    this.instances.clear();
  },
  provideUI: function provideUI() {
    var instance = new _main2['default']();
    this.instances.add(instance);
    if (this.signalRegistry) {
      instance.signal.attach(this.signalRegistry);
    }
    return instance;
  },
  provideIntentions: function provideIntentions() {
    return Array.from(this.instances).map(function (entry) {
      return entry.intentions;
    });
  },
  consumeSignal: function consumeSignal(signalRegistry) {
    this.signalRegistry = signalRegistry;
    this.instances.forEach(function (instance) {
      instance.signal.attach(signalRegistry);
    });
  },
  consumeStatusBar: function consumeStatusBar(statusBarRegistry) {
    this.statusBarRegistry = statusBarRegistry;
    this.instances.forEach(function (instance) {
      instance.statusBar.attach(statusBarRegistry);
    });
  }
};

module.exports = linterUiDefault;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RvbG9rb2Jhbi9Db2RlL2dpdGh1Yi9hdG9tLWNvbmZpZy9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7b0JBRXFCLFFBQVE7Ozs7QUFHN0IsSUFBTSxlQUFlLEdBQUc7QUFDdEIsV0FBUyxFQUFFLElBQUksR0FBRyxFQUFFO0FBQ3BCLGdCQUFjLEVBQUUsSUFBSTtBQUNwQixtQkFBaUIsRUFBRSxJQUFJO0FBQ3ZCLFVBQVEsRUFBQSxvQkFBRztBQUNULFFBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7O0FBRXRCLGFBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQTtLQUNoRTtHQUNGO0FBQ0QsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsU0FBSyxJQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2xDLFdBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUNoQjtBQUNELFFBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUE7R0FDdkI7QUFDRCxXQUFTLEVBQUEscUJBQWE7QUFDcEIsUUFBTSxRQUFRLEdBQUcsdUJBQWMsQ0FBQTtBQUMvQixRQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM1QixRQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDdkIsY0FBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFBO0tBQzVDO0FBQ0QsV0FBTyxRQUFRLENBQUE7R0FDaEI7QUFDRCxtQkFBaUIsRUFBQSw2QkFBc0I7QUFDckMsV0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2FBQUksS0FBSyxDQUFDLFVBQVU7S0FBQSxDQUFDLENBQUE7R0FDakU7QUFDRCxlQUFhLEVBQUEsdUJBQUMsY0FBc0IsRUFBRTtBQUNwQyxRQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQTtBQUNwQyxRQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFTLFFBQVEsRUFBRTtBQUN4QyxjQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQTtLQUN2QyxDQUFDLENBQUE7R0FDSDtBQUNELGtCQUFnQixFQUFBLDBCQUFDLGlCQUF5QixFQUFFO0FBQzFDLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQTtBQUMxQyxRQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFTLFFBQVEsRUFBRTtBQUN4QyxjQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0tBQzdDLENBQUMsQ0FBQTtHQUNIO0NBQ0YsQ0FBQTs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQSIsImZpbGUiOiIvaG9tZS90b2xva29iYW4vQ29kZS9naXRodWIvYXRvbS1jb25maWcvcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IExpbnRlclVJIGZyb20gJy4vbWFpbidcbmltcG9ydCB0eXBlIEludGVudGlvbnMgZnJvbSAnLi9pbnRlbnRpb25zJ1xuXG5jb25zdCBsaW50ZXJVaURlZmF1bHQgPSB7XG4gIGluc3RhbmNlczogbmV3IFNldCgpLFxuICBzaWduYWxSZWdpc3RyeTogbnVsbCxcbiAgc3RhdHVzQmFyUmVnaXN0cnk6IG51bGwsXG4gIGFjdGl2YXRlKCkge1xuICAgIGlmICghYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBnbG9iYWwtcmVxdWlyZVxuICAgICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXItdWktZGVmYXVsdCcsIHRydWUpXG4gICAgfVxuICB9LFxuICBkZWFjdGl2YXRlKCkge1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhpcy5pbnN0YW5jZXMpIHtcbiAgICAgIGVudHJ5LmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLmluc3RhbmNlcy5jbGVhcigpXG4gIH0sXG4gIHByb3ZpZGVVSSgpOiBMaW50ZXJVSSB7XG4gICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgTGludGVyVUkoKVxuICAgIHRoaXMuaW5zdGFuY2VzLmFkZChpbnN0YW5jZSlcbiAgICBpZiAodGhpcy5zaWduYWxSZWdpc3RyeSkge1xuICAgICAgaW5zdGFuY2Uuc2lnbmFsLmF0dGFjaCh0aGlzLnNpZ25hbFJlZ2lzdHJ5KVxuICAgIH1cbiAgICByZXR1cm4gaW5zdGFuY2VcbiAgfSxcbiAgcHJvdmlkZUludGVudGlvbnMoKTogQXJyYXk8SW50ZW50aW9ucz4ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuaW5zdGFuY2VzKS5tYXAoZW50cnkgPT4gZW50cnkuaW50ZW50aW9ucylcbiAgfSxcbiAgY29uc3VtZVNpZ25hbChzaWduYWxSZWdpc3RyeTogT2JqZWN0KSB7XG4gICAgdGhpcy5zaWduYWxSZWdpc3RyeSA9IHNpZ25hbFJlZ2lzdHJ5XG4gICAgdGhpcy5pbnN0YW5jZXMuZm9yRWFjaChmdW5jdGlvbihpbnN0YW5jZSkge1xuICAgICAgaW5zdGFuY2Uuc2lnbmFsLmF0dGFjaChzaWduYWxSZWdpc3RyeSlcbiAgICB9KVxuICB9LFxuICBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0JhclJlZ2lzdHJ5OiBPYmplY3QpIHtcbiAgICB0aGlzLnN0YXR1c0JhclJlZ2lzdHJ5ID0gc3RhdHVzQmFyUmVnaXN0cnlcbiAgICB0aGlzLmluc3RhbmNlcy5mb3JFYWNoKGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gICAgICBpbnN0YW5jZS5zdGF0dXNCYXIuYXR0YWNoKHN0YXR1c0JhclJlZ2lzdHJ5KVxuICAgIH0pXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGludGVyVWlEZWZhdWx0XG4iXX0=