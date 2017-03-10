Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _tolokobanTestView = require('./tolokoban-test-view');

var _tolokobanTestView2 = _interopRequireDefault(_tolokobanTestView);

var _atom = require('atom');

'use babel';

exports['default'] = {

  tolokobanTestView: null,
  modalPanel: null,
  subscriptions: null,

  activate: function activate(state) {
    var _this = this;

    this.tolokobanTestView = new _tolokobanTestView2['default'](state.tolokobanTestViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.tolokobanTestView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new _atom.CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tolokoban-test:toggle': function tolokobanTestToggle() {
        return _this.toggle();
      }
    }));
  },

  deactivate: function deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.tolokobanTestView.destroy();
  },

  serialize: function serialize() {
    return {
      tolokobanTestViewState: this.tolokobanTestView.serialize()
    };
  },

  toggle: function toggle() {
    console.log('TolokobanTest was toggled!');
    return this.modalPanel.isVisible() ? this.modalPanel.hide() : this.modalPanel.show();
  }

};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vRTovQ29kZS9naXRodWIvYXRvbS90b2xva29iYW4tdGVzdC9saWIvdG9sb2tvYmFuLXRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O2lDQUU4Qix1QkFBdUI7Ozs7b0JBQ2pCLE1BQU07O0FBSDFDLFdBQVcsQ0FBQzs7cUJBS0c7O0FBRWIsbUJBQWlCLEVBQUUsSUFBSTtBQUN2QixZQUFVLEVBQUUsSUFBSTtBQUNoQixlQUFhLEVBQUUsSUFBSTs7QUFFbkIsVUFBUSxFQUFBLGtCQUFDLEtBQUssRUFBRTs7O0FBQ2QsUUFBSSxDQUFDLGlCQUFpQixHQUFHLG1DQUFzQixLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUM3RSxRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDO0FBQzdDLFVBQUksRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFO0FBQ3pDLGFBQU8sRUFBRSxLQUFLO0tBQ2YsQ0FBQyxDQUFDOzs7QUFHSCxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFDOzs7QUFHL0MsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDekQsNkJBQXVCLEVBQUU7ZUFBTSxNQUFLLE1BQU0sRUFBRTtPQUFBO0tBQzdDLENBQUMsQ0FBQyxDQUFDO0dBQ0w7O0FBRUQsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsUUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMxQixRQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUNsQzs7QUFFRCxXQUFTLEVBQUEscUJBQUc7QUFDVixXQUFPO0FBQ0wsNEJBQXNCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRTtLQUMzRCxDQUFDO0dBQ0g7O0FBRUQsUUFBTSxFQUFBLGtCQUFHO0FBQ1AsV0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBQzFDLFdBQ0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsR0FDM0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsR0FDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FDdEI7R0FDSDs7Q0FFRiIsImZpbGUiOiJmaWxlOi8vL0U6L0NvZGUvZ2l0aHViL2F0b20vdG9sb2tvYmFuLXRlc3QvbGliL3RvbG9rb2Jhbi10ZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBUb2xva29iYW5UZXN0VmlldyBmcm9tICcuL3RvbG9rb2Jhbi10ZXN0LXZpZXcnO1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgdG9sb2tvYmFuVGVzdFZpZXc6IG51bGwsXG4gIG1vZGFsUGFuZWw6IG51bGwsXG4gIHN1YnNjcmlwdGlvbnM6IG51bGwsXG5cbiAgYWN0aXZhdGUoc3RhdGUpIHtcbiAgICB0aGlzLnRvbG9rb2JhblRlc3RWaWV3ID0gbmV3IFRvbG9rb2JhblRlc3RWaWV3KHN0YXRlLnRvbG9rb2JhblRlc3RWaWV3U3RhdGUpO1xuICAgIHRoaXMubW9kYWxQYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoe1xuICAgICAgaXRlbTogdGhpcy50b2xva29iYW5UZXN0Vmlldy5nZXRFbGVtZW50KCksXG4gICAgICB2aXNpYmxlOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgLy8gRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgLy8gUmVnaXN0ZXIgY29tbWFuZCB0aGF0IHRvZ2dsZXMgdGhpcyB2aWV3XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAndG9sb2tvYmFuLXRlc3Q6dG9nZ2xlJzogKCkgPT4gdGhpcy50b2dnbGUoKVxuICAgIH0pKTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMubW9kYWxQYW5lbC5kZXN0cm95KCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB0aGlzLnRvbG9rb2JhblRlc3RWaWV3LmRlc3Ryb3koKTtcbiAgfSxcblxuICBzZXJpYWxpemUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRvbG9rb2JhblRlc3RWaWV3U3RhdGU6IHRoaXMudG9sb2tvYmFuVGVzdFZpZXcuc2VyaWFsaXplKClcbiAgICB9O1xuICB9LFxuXG4gIHRvZ2dsZSgpIHtcbiAgICBjb25zb2xlLmxvZygnVG9sb2tvYmFuVGVzdCB3YXMgdG9nZ2xlZCEnKTtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5tb2RhbFBhbmVsLmlzVmlzaWJsZSgpID9cbiAgICAgIHRoaXMubW9kYWxQYW5lbC5oaWRlKCkgOlxuICAgICAgdGhpcy5tb2RhbFBhbmVsLnNob3coKVxuICAgICk7XG4gIH1cblxufTtcbiJdfQ==