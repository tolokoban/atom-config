(function() {
  var AutoEncoding, CompositeDisposable, Main;

  CompositeDisposable = require('atom').CompositeDisposable;

  AutoEncoding = require('./auto-encoding');

  module.exports = Main = {
    subscriptions: null,
    enc: null,
    config: {
      alwaysAutoDetect: {
        title: 'Always auto detect',
        description: 'enabled from startup',
        type: 'boolean',
        "default": true
      },
      divideSize: {
        title: 'The number of the consideration.',
        description: 'divide size of buffer',
        type: 'number',
        "default": 1,
        minimum: 1
      },
      disallowEncTypes: {
        title: 'Disallow some encoding types',
        description: 'example: windows1252, iso88591',
        type: 'string',
        "default": ''
      },
      ignorePattern: {
        title: 'Ignore Pattern',
        description: 'example: (txt|js)$',
        type: 'string',
        "default": ''
      },
      forceEncTypes: {
        title: 'Force some encoding types',
        description: 'example: windows1252:windows1251, iso88591:windows1251',
        type: 'string',
        "default": ''
      }
    },
    activate: function() {
      atom.commands.add('atom-workspace', {
        'auto-encoding:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      });
      if (atom.config.get('auto-encoding.alwaysAutoDetect')) {
        return this.enabled();
      }
    },
    enabled: function() {
      if (this.subscriptions == null) {
        this.subscriptions = new CompositeDisposable;
      }
      if (this.enc == null) {
        this.enc = new AutoEncoding();
      }
      this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function() {
          return _this.enc.fire();
        };
      })(this)));
      return this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          return _this.enc.fire();
        };
      })(this)));
    },
    disabled: function() {
      var ref;
      if ((ref = this.subscriptions) != null) {
        ref.dispose();
      }
      this.subscriptions = null;
      return this.enc = null;
    },
    toggle: function() {
      var ref, ref1;
      if (this.subscriptions == null) {
        this.enabled();
        return (ref = atom.notifications) != null ? ref.addSuccess('auto-encoding: on') : void 0;
      } else {
        this.disabled();
        return (ref1 = atom.notifications) != null ? ref1.addSuccess('auto-encoding: off') : void 0;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9FOi9Db2RlL2dpdGh1Yi9hdG9tLWNvbmZpZy9wYWNrYWdlcy9hdXRvLWVuY29kaW5nL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUVmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUEsR0FDZjtJQUFBLGFBQUEsRUFBZSxJQUFmO0lBQ0EsR0FBQSxFQUFLLElBREw7SUFHQSxNQUFBLEVBQ0U7TUFBQSxnQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLG9CQUFQO1FBQ0EsV0FBQSxFQUFhLHNCQURiO1FBRUEsSUFBQSxFQUFNLFNBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7T0FERjtNQU1BLFVBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxrQ0FBUDtRQUNBLFdBQUEsRUFBYSx1QkFEYjtRQUVBLElBQUEsRUFBTSxRQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUhUO1FBSUEsT0FBQSxFQUFTLENBSlQ7T0FQRjtNQVlBLGdCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sOEJBQVA7UUFDQSxXQUFBLEVBQWEsZ0NBRGI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtPQWJGO01BaUJBLGFBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxnQkFBUDtRQUNBLFdBQUEsRUFBYSxvQkFEYjtRQUVBLElBQUEsRUFBTSxRQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUhUO09BbEJGO01Bc0JBLGFBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTywyQkFBUDtRQUNBLFdBQUEsRUFBYSx3REFEYjtRQUVBLElBQUEsRUFBTSxRQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUhUO09BdkJGO0tBSkY7SUFnQ0EsUUFBQSxFQUFVLFNBQUE7TUFFUixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO1FBQUEsc0JBQUEsRUFBd0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDMUQsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUQwRDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7T0FBcEM7TUFJQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsQ0FBSDtlQUNFLElBQUMsQ0FBQSxPQUFELENBQUEsRUFERjs7SUFOUSxDQWhDVjtJQXlDQSxPQUFBLEVBQVMsU0FBQTs7UUFDUCxJQUFDLENBQUEsZ0JBQWlCLElBQUk7OztRQUN0QixJQUFDLENBQUEsTUFBVyxJQUFBLFlBQUEsQ0FBQTs7TUFHWixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FBbkI7YUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBZixDQUF5QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekMsQ0FBbkI7SUFQTyxDQXpDVDtJQWtEQSxRQUFBLEVBQVUsU0FBQTtBQUNSLFVBQUE7O1dBQWMsQ0FBRSxPQUFoQixDQUFBOztNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO2FBQ2pCLElBQUMsQ0FBQSxHQUFELEdBQU87SUFIQyxDQWxEVjtJQXVEQSxNQUFBLEVBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxJQUFPLDBCQUFQO1FBQ0UsSUFBQyxDQUFBLE9BQUQsQ0FBQTt1REFDa0IsQ0FBRSxVQUFwQixDQUErQixtQkFBL0IsV0FGRjtPQUFBLE1BQUE7UUFJRSxJQUFDLENBQUEsUUFBRCxDQUFBO3lEQUNrQixDQUFFLFVBQXBCLENBQStCLG9CQUEvQixXQUxGOztJQURNLENBdkRSOztBQUpGIiwic291cmNlc0NvbnRlbnQiOlsiIyBhdXRvLWVuY29kaW5nOiB1dGY4XG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuQXV0b0VuY29kaW5nID0gcmVxdWlyZSAnLi9hdXRvLWVuY29kaW5nJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1haW4gPVxuICBzdWJzY3JpcHRpb25zOiBudWxsXG4gIGVuYzogbnVsbFxuXG4gIGNvbmZpZzpcbiAgICBhbHdheXNBdXRvRGV0ZWN0OlxuICAgICAgdGl0bGU6ICdBbHdheXMgYXV0byBkZXRlY3QnXG4gICAgICBkZXNjcmlwdGlvbjogJ2VuYWJsZWQgZnJvbSBzdGFydHVwJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgIyBkaXZpZGUgYnVmZmVyIG9wdGlvblxuICAgIGRpdmlkZVNpemU6XG4gICAgICB0aXRsZTogJ1RoZSBudW1iZXIgb2YgdGhlIGNvbnNpZGVyYXRpb24uJ1xuICAgICAgZGVzY3JpcHRpb246ICdkaXZpZGUgc2l6ZSBvZiBidWZmZXInXG4gICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgZGVmYXVsdDogMVxuICAgICAgbWluaW11bTogMVxuICAgIGRpc2FsbG93RW5jVHlwZXM6XG4gICAgICB0aXRsZTogJ0Rpc2FsbG93IHNvbWUgZW5jb2RpbmcgdHlwZXMnXG4gICAgICBkZXNjcmlwdGlvbjogJ2V4YW1wbGU6IHdpbmRvd3MxMjUyLCBpc284ODU5MSdcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgIGlnbm9yZVBhdHRlcm46XG4gICAgICB0aXRsZTogJ0lnbm9yZSBQYXR0ZXJuJ1xuICAgICAgZGVzY3JpcHRpb246ICdleGFtcGxlOiAodHh0fGpzKSQnXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICBmb3JjZUVuY1R5cGVzOlxuICAgICAgdGl0bGU6ICdGb3JjZSBzb21lIGVuY29kaW5nIHR5cGVzJ1xuICAgICAgZGVzY3JpcHRpb246ICdleGFtcGxlOiB3aW5kb3dzMTI1Mjp3aW5kb3dzMTI1MSwgaXNvODg1OTE6d2luZG93czEyNTEnXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcblxuICBhY3RpdmF0ZTogLT5cblxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdhdXRvLWVuY29kaW5nOnRvZ2dsZSc6ID0+XG4gICAgICBAdG9nZ2xlKClcblxuICAgICMgYWx3YXlzIGF1dG8tZGV0ZWN0XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0ICdhdXRvLWVuY29kaW5nLmFsd2F5c0F1dG9EZXRlY3QnXG4gICAgICBAZW5hYmxlZCgpXG5cbiAgZW5hYmxlZDogLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA/PSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBlbmMgPz0gbmV3IEF1dG9FbmNvZGluZygpXG5cbiAgICAjIGV2ZW50OiBvcGVuIGZpbGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzID0+IEBlbmMuZmlyZSgpXG4gICAgIyBldmVudDogY2hhbmdlZCBhY3RpdmUgcGFuZVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtID0+IEBlbmMuZmlyZSgpXG5cbiAgZGlzYWJsZWQ6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbnVsbFxuICAgIEBlbmMgPSBudWxsXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGlmIG5vdCBAc3Vic2NyaXB0aW9ucz9cbiAgICAgIEBlbmFibGVkKClcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucz8uYWRkU3VjY2VzcyAnYXV0by1lbmNvZGluZzogb24nXG4gICAgZWxzZVxuICAgICAgQGRpc2FibGVkKClcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucz8uYWRkU3VjY2VzcyAnYXV0by1lbmNvZGluZzogb2ZmJ1xuIl19
