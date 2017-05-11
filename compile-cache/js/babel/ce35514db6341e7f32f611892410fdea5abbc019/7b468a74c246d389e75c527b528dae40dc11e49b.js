Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _toloframeworkView = require('./toloframework-view');

var _toloframeworkView2 = _interopRequireDefault(_toloframeworkView);

var _atom = require('atom');

'use babel';

exports['default'] = {

  toloframeworkView: null,
  modalPanel: null,
  subscriptions: null,

  activate: function activate(state) {
    var _this = this;

    this.toloframeworkView = new _toloframeworkView2['default'](state.toloframeworkViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.toloframeworkView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new _atom.CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'toloframework:toggle': function toloframeworkToggle() {
        return _this.toggle();
      }
    }));
  },

  deactivate: function deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.toloframeworkView.destroy();
  },

  serialize: function serialize() {
    return {
      toloframeworkViewState: this.toloframeworkView.serialize()
    };
  },

  toggle: function toggle() {
    console.log('Toloframework was toggled!');
    return this.modalPanel.isVisible() ? this.modalPanel.hide() : this.modalPanel.show();
  },

  switchToCss: function switchToCss() {}
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vRTovQ29kZS9naXRodWIvYXRvbS1jb25maWcvcGFja2FnZXMvdG9sb2ZyYW1ld29yay9saWIvdG9sb2ZyYW1ld29yay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7aUNBRThCLHNCQUFzQjs7OztvQkFDaEIsTUFBTTs7QUFIMUMsV0FBVyxDQUFDOztxQkFLRzs7QUFFYixtQkFBaUIsRUFBRSxJQUFJO0FBQ3ZCLFlBQVUsRUFBRSxJQUFJO0FBQ2hCLGVBQWEsRUFBRSxJQUFJOztBQUVuQixVQUFRLEVBQUEsa0JBQUMsS0FBSyxFQUFFOzs7QUFDZCxRQUFJLENBQUMsaUJBQWlCLEdBQUcsbUNBQXNCLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQzdFLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7QUFDN0MsVUFBSSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUU7QUFDekMsYUFBTyxFQUFFLEtBQUs7S0FDZixDQUFDLENBQUM7OztBQUdILFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7OztBQUcvQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCw0QkFBc0IsRUFBRTtlQUFNLE1BQUssTUFBTSxFQUFFO09BQUE7S0FDNUMsQ0FBQyxDQUFDLENBQUM7R0FDTDs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0IsUUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQ2xDOztBQUVELFdBQVMsRUFBQSxxQkFBRztBQUNWLFdBQU87QUFDTCw0QkFBc0IsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFO0tBQzNELENBQUM7R0FDSDs7QUFFRCxRQUFNLEVBQUEsa0JBQUc7QUFDUCxXQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDMUMsV0FDRSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxHQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxHQUN0QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUN0QjtHQUNIOztBQUVELGFBQVcsRUFBQSx1QkFBRyxFQUViO0NBQ0YiLCJmaWxlIjoiZmlsZTovLy9FOi9Db2RlL2dpdGh1Yi9hdG9tLWNvbmZpZy9wYWNrYWdlcy90b2xvZnJhbWV3b3JrL2xpYi90b2xvZnJhbWV3b3JrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBUb2xvZnJhbWV3b3JrVmlldyBmcm9tICcuL3RvbG9mcmFtZXdvcmstdmlldyc7XG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICB0b2xvZnJhbWV3b3JrVmlldzogbnVsbCxcbiAgbW9kYWxQYW5lbDogbnVsbCxcbiAgc3Vic2NyaXB0aW9uczogbnVsbCxcblxuICBhY3RpdmF0ZShzdGF0ZSkge1xuICAgIHRoaXMudG9sb2ZyYW1ld29ya1ZpZXcgPSBuZXcgVG9sb2ZyYW1ld29ya1ZpZXcoc3RhdGUudG9sb2ZyYW1ld29ya1ZpZXdTdGF0ZSk7XG4gICAgdGhpcy5tb2RhbFBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7XG4gICAgICBpdGVtOiB0aGlzLnRvbG9mcmFtZXdvcmtWaWV3LmdldEVsZW1lbnQoKSxcbiAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfSk7XG5cbiAgICAvLyBFdmVudHMgc3Vic2NyaWJlZCB0byBpbiBhdG9tJ3Mgc3lzdGVtIGNhbiBiZSBlYXNpbHkgY2xlYW5lZCB1cCB3aXRoIGEgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICAvLyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICd0b2xvZnJhbWV3b3JrOnRvZ2dsZSc6ICgpID0+IHRoaXMudG9nZ2xlKClcbiAgICB9KSk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLm1vZGFsUGFuZWwuZGVzdHJveSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgdGhpcy50b2xvZnJhbWV3b3JrVmlldy5kZXN0cm95KCk7XG4gIH0sXG5cbiAgc2VyaWFsaXplKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0b2xvZnJhbWV3b3JrVmlld1N0YXRlOiB0aGlzLnRvbG9mcmFtZXdvcmtWaWV3LnNlcmlhbGl6ZSgpXG4gICAgfTtcbiAgfSxcblxuICB0b2dnbGUoKSB7XG4gICAgY29uc29sZS5sb2coJ1RvbG9mcmFtZXdvcmsgd2FzIHRvZ2dsZWQhJyk7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMubW9kYWxQYW5lbC5pc1Zpc2libGUoKSA/XG4gICAgICB0aGlzLm1vZGFsUGFuZWwuaGlkZSgpIDpcbiAgICAgIHRoaXMubW9kYWxQYW5lbC5zaG93KClcbiAgICApO1xuICB9LFxuXG4gIHN3aXRjaFRvQ3NzKCkge1xuICAgIFxuICB9XG59O1xuIl19