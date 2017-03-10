(function() {
  var BrowserPlus, BrowserPlusModel, CompositeDisposable, uuid;

  CompositeDisposable = require('atom').CompositeDisposable;

  BrowserPlusModel = require('./browser-plus-model');

  require('JSON2');

  require('jstorage');

  uuid = require('node-uuid');

  module.exports = BrowserPlus = {
    browserPlusView: null,
    subscriptions: null,
    config: {
      fav: {
        title: 'No of Favorites',
        type: 'number',
        "default": 10
      },
      homepage: {
        title: 'HomePage',
        type: 'string',
        "default": 'browser-plus://blank'
      },
      live: {
        title: 'Live Refresh in ',
        type: 'number',
        "default": 500
      },
      currentFile: {
        title: 'Show Current File',
        type: 'boolean',
        "default": true
      },
      openInSameWindow: {
        title: 'Open URLs in Same Window',
        type: 'array',
        "default": ['www.google.com', 'www.stackoverflow.com', 'google.com', 'stackoverflow.com']
      }
    },
    activate: function(state) {
      if (!state.noReset) {
        state.favIcon = {};
        state.title = {};
        state.fav = [];
      }
      this.resources = (atom.packages.getPackageDirPaths()[0]) + "/browser-plus/resources/";
      if (!window.$.jStorage.get('bp.fav')) {
        window.$.jStorage.set('bp.fav', []);
      }
      if (!window.$.jStorage.get('bp.history')) {
        window.$.jStorage.set('bp.history', []);
      }
      if (!window.$.jStorage.get('bp.favIcon')) {
        window.$.jStorage.set('bp.favIcon', {});
      }
      if (!window.$.jStorage.get('bp.title')) {
        window.$.jStorage.set('bp.title', {});
      }
      atom.workspace.addOpener((function(_this) {
        return function(url, opt) {
          var editor, localhostPattern, pane, path;
          if (opt == null) {
            opt = {};
          }
          path = require('path');
          if (url.indexOf('http:') === 0 || url.indexOf('https:') === 0 || url.indexOf('localhost') === 0 || url.indexOf('file:') === 0 || url.indexOf('browser-plus:') === 0 || url.indexOf('browser-plus~') === 0) {
            localhostPattern = /^(http:\/\/)?localhost/i;
            if (!BrowserPlusModel.checkUrl(url)) {
              return false;
            }
            if (!(url === 'browser-plus://blank' || url.startsWith('file:///') || !opt.openInSameWindow)) {
              editor = BrowserPlusModel.getEditorForURI(url, opt.openInSameWindow);
              if (editor) {
                editor.setText(opt.src);
                if (!opt.src) {
                  editor.refresh(url);
                }
                pane = atom.workspace.paneForItem(editor);
                pane.activateItem(editor);
                return editor;
              }
            }
            url = url.replace(localhostPattern, 'http://127.0.0.1');
            return new BrowserPlusModel({
              browserPlus: _this,
              url: url,
              opt: opt
            });
          }
        };
      })(this));
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:open': (function(_this) {
          return function() {
            return _this.open();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:openCurrent': (function(_this) {
          return function() {
            return _this.open(true);
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:history': (function(_this) {
          return function() {
            return _this.history(true);
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:deleteHistory': (function(_this) {
          return function() {
            return _this["delete"](true);
          };
        })(this)
      }));
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:fav': (function(_this) {
          return function() {
            return _this.favr();
          };
        })(this)
      }));
    },
    favr: function() {
      var favList;
      favList = require('./fav-view');
      return new favList(window.$.jStorage.get('bp.fav'));
    },
    "delete": function() {
      return $.jStorage.set('bp.history', []);
    },
    history: function() {
      return atom.workspace.open("browser-plus://history", {
        split: 'left',
        searchAllPanes: true
      });
    },
    open: function(url, opt) {
      var editor, ref;
      if (opt == null) {
        opt = {};
      }
      if (url === true || atom.config.get('browser-plus.currentFile')) {
        editor = atom.workspace.getActiveTextEditor();
        if (url = editor != null ? (ref = editor.buffer) != null ? ref.getUri() : void 0 : void 0) {
          url = "file:///" + url;
        }
      }
      if (!url) {
        url = atom.config.get('browser-plus.homepage');
      }
      if (!opt.split) {
        opt.split = this.getPosition();
      }
      return atom.workspace.open(url, opt);
    },
    getPosition: function() {
      var activePane, orientation, paneAxis, paneIndex, ref;
      activePane = atom.workspace.paneForItem(atom.workspace.getActiveTextEditor());
      if (!activePane) {
        return;
      }
      paneAxis = activePane.getParent();
      if (!paneAxis) {
        return;
      }
      paneIndex = paneAxis.getPanes().indexOf(activePane);
      orientation = (ref = paneAxis.orientation) != null ? ref : 'horizontal';
      if (orientation === 'horizontal') {
        if (paneIndex === 0) {
          return 'right';
        } else {
          return 'left';
        }
      } else {
        if (paneIndex === 0) {
          return 'down';
        } else {
          return 'up';
        }
      }
    },
    deactivate: function() {
      var ref;
      if ((ref = this.browserPlusView) != null) {
        if (typeof ref.destroy === "function") {
          ref.destroy();
        }
      }
      return this.subscriptions.dispose();
    },
    serialize: function() {
      return {
        noReset: true
      };
    },
    getBrowserPlusUrl: function(url) {
      if (url.startsWith('browser-plus://history')) {
        return url = this.resources + "history.html";
      } else {
        return url = '';
      }
    },
    addPlugin: function(requires) {
      var error, key, menu, pkg, pkgPath, pkgs, results, script, val;
      if (this.plugins == null) {
        this.plugins = {};
      }
      results = [];
      for (key in requires) {
        val = requires[key];
        try {
          switch (key) {
            case 'onInit' || 'onExit':
              results.push(this.plugins[key] = (this.plugins[key] || []).concat("(" + (val.toString()) + ")()"));
              break;
            case 'js' || 'css':
              if (!pkgPath) {
                pkgs = Object.keys(atom.packages.activatingPackages).sort();
                pkg = pkgs[pkgs.length - 1];
                pkgPath = atom.packages.activatingPackages[pkg].path + "/";
              }
              if (Array.isArray(val)) {
                results.push((function() {
                  var i, len, results1;
                  results1 = [];
                  for (i = 0, len = val.length; i < len; i++) {
                    script = val[i];
                    if (!script.startsWith('http')) {
                      results1.push(this.plugins[key + "s"] = (this.plugins[key] || []).concat('file:///' + atom.packages.activatingPackages[pkg].path.replace(/\\/g, "/") + "/" + script));
                    } else {
                      results1.push(void 0);
                    }
                  }
                  return results1;
                }).call(this));
              } else {
                if (!val.startsWith('http')) {
                  results.push(this.plugins[key + "s"] = (this.plugins[key] || []).concat('file:///' + atom.packages.activatingPackages[pkg].path.replace(/\\/g, "/") + "/" + val));
                } else {
                  results.push(void 0);
                }
              }
              break;
            case 'menus':
              if (Array.isArray(val)) {
                results.push((function() {
                  var i, len, results1;
                  results1 = [];
                  for (i = 0, len = val.length; i < len; i++) {
                    menu = val[i];
                    menu._id = uuid.v1();
                    results1.push(this.plugins[key] = (this.plugins[key] || []).concat(menu));
                  }
                  return results1;
                }).call(this));
              } else {
                val._id = uuid.v1();
                results.push(this.plugins[key] = (this.plugins[key] || []).concat(val));
              }
              break;
            default:
              results.push(void 0);
          }
        } catch (error1) {
          error = error1;
        }
      }
      return results;
    },
    provideService: function() {
      return {
        model: require('./browser-plus-model'),
        addPlugin: this.addPlugin.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9FOi9zb2Z0cy9hdG9tLy5hdG9tL3BhY2thZ2VzL2Jyb3dzZXItcGx1cy9saWIvYnJvd3Nlci1wbHVzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixnQkFBQSxHQUFtQixPQUFBLENBQVEsc0JBQVI7O0VBQ25CLE9BQUEsQ0FBUSxPQUFSOztFQUNBLE9BQUEsQ0FBUSxVQUFSOztFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsV0FBUjs7RUFDUCxNQUFNLENBQUMsT0FBUCxHQUFpQixXQUFBLEdBQ2Y7SUFBQSxlQUFBLEVBQWlCLElBQWpCO0lBQ0EsYUFBQSxFQUFlLElBRGY7SUFFQSxNQUFBLEVBQ0U7TUFBQSxHQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8saUJBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGVDtPQURGO01BSUEsUUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLFVBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsc0JBRlQ7T0FMRjtNQVFBLElBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxrQkFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxHQUZUO09BVEY7TUFZQSxXQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sbUJBQVA7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFGVDtPQWJGO01BZ0JBLGdCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sMEJBQVA7UUFDQSxJQUFBLEVBQU0sT0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FBQyxnQkFBRCxFQUFrQix1QkFBbEIsRUFBMEMsWUFBMUMsRUFBdUQsbUJBQXZELENBRlQ7T0Fq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QUF0QixDQUE2QixHQUE3QixHQU5sQjs7QUFERztBQWhCUDs7QUFBQSxXQURGO1NBQUEsY0FBQTtVQTBCTSxlQTFCTjs7QUFERjs7SUFGUyxDQXJIWDtJQXNKQSxjQUFBLEVBQWdCLFNBQUE7YUFDZDtRQUFBLEtBQUEsRUFBTSxPQUFBLENBQVEsc0JBQVIsQ0FBTjtRQUNBLFNBQUEsRUFBVyxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsSUFBaEIsQ0FEWDs7SUFEYyxDQXRKaEI7O0FBTkYiLCJzb3VyY2VzQ29udGVudCI6WyIjIGF0b20ucHJvamVjdC5yZXNvbHZlUGF0aFxue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbkJyb3dzZXJQbHVzTW9kZWwgPSByZXF1aXJlICcuL2Jyb3dzZXItcGx1cy1tb2RlbCdcbnJlcXVpcmUgJ0pTT04yJ1xucmVxdWlyZSAnanN0b3JhZ2UnXG51dWlkID0gcmVxdWlyZSAnbm9kZS11dWlkJ1xubW9kdWxlLmV4cG9ydHMgPSBCcm93c2VyUGx1cyA9XG4gIGJyb3dzZXJQbHVzVmlldzogbnVsbFxuICBzdWJzY3JpcHRpb25zOiBudWxsXG4gIGNvbmZpZzpcbiAgICBmYXY6XG4gICAgICB0aXRsZTogJ05vIG9mIEZhdm9yaXRlcydcbiAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICBkZWZhdWx0OiAxMFxuICAgIGhvbWVwYWdlOlxuICAgICAgdGl0bGU6ICdIb21lUGFnZSdcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnYnJvd3Nlci1wbHVzOi8vYmxhbmsnXG4gICAgbGl2ZTpcbiAgICAgIHRpdGxlOiAnTGl2ZSBSZWZyZXNoIGluICdcbiAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICBkZWZhdWx0OiA1MDBcbiAgICBjdXJyZW50RmlsZTpcbiAgICAgIHRpdGxlOiAnU2hvdyBDdXJyZW50IEZpbGUnXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBvcGVuSW5TYW1lV2luZG93OlxuICAgICAgdGl0bGU6ICdPcGVuIFVSTHMgaW4gU2FtZSBXaW5kb3cnXG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbJ3d3dy5nb29nbGUuY29tJywnd3d3LnN0YWNrb3ZlcmZsb3cuY29tJywnZ29vZ2xlLmNvbScsJ3N0YWNrb3ZlcmZsb3cuY29tJ11cblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIHVubGVzcyBzdGF0ZS5ub1Jlc2V0XG4gICAgICBzdGF0ZS5mYXZJY29uID0ge31cbiAgICAgIHN0YXRlLnRpdGxlID0ge31cbiAgICAgIHN0YXRlLmZhdiA9IFtdXG4gICAgQHJlc291cmNlcyA9IFwiI3thdG9tLnBhY2thZ2VzLmdldFBhY2thZ2VEaXJQYXRocygpWzBdfS9icm93c2VyLXBsdXMvcmVzb3VyY2VzL1wiXG4gICAgd2luZG93LiQualN0b3JhZ2Uuc2V0KCdicC5mYXYnLFtdKSB1bmxlc3Mgd2luZG93LiQualN0b3JhZ2UuZ2V0KCdicC5mYXYnKVxuICAgIHdpbmRvdy4kLmpTdG9yYWdlLnNldCgnYnAuaGlzdG9yeScsW10pICB1bmxlc3Mgd2luZG93LiQualN0b3JhZ2UuZ2V0KCdicC5oaXN0b3J5JylcbiAgICB3aW5kb3cuJC5qU3RvcmFnZS5zZXQoJ2JwLmZhdkljb24nLHt9KSAgdW5sZXNzIHdpbmRvdy4kLmpTdG9yYWdlLmdldCgnYnAuZmF2SWNvbicpXG4gICAgd2luZG93LiQualN0b3JhZ2Uuc2V0KCdicC50aXRsZScse30pICB1bmxlc3Mgd2luZG93LiQualN0b3JhZ2UuZ2V0KCdicC50aXRsZScpXG5cbiAgICBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIgKHVybCxvcHQ9e30pPT5cbiAgICAgIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuICAgICAgaWYgKCB1cmwuaW5kZXhPZignaHR0cDonKSBpcyAwIG9yIHVybC5pbmRleE9mKCdodHRwczonKSBpcyAwIG9yXG4gICAgICAgICAgdXJsLmluZGV4T2YoJ2xvY2FsaG9zdCcpIGlzIDAgb3IgdXJsLmluZGV4T2YoJ2ZpbGU6JykgaXMgMCBvclxuICAgICAgICAgIHVybC5pbmRleE9mKCdicm93c2VyLXBsdXM6JykgaXMgMCAgIG9yICNvciBvcHQuc3JjXG4gICAgICAgICAgdXJsLmluZGV4T2YoJ2Jyb3dzZXItcGx1c34nKSBpcyAwIClcbiAgICAgICAgIGxvY2FsaG9zdFBhdHRlcm4gPSAvLy9eXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaHR0cDovLyk/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbGhvc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL2lcbiAgICAgICAgIHJldHVybiBmYWxzZSB1bmxlc3MgQnJvd3NlclBsdXNNb2RlbC5jaGVja1VybCh1cmwpXG4gICAgICAgICAjICBjaGVjayBpZiBpdCBuZWVkIHRvIGJlIG9wZW4gaW4gc2FtZSB3aW5kb3dcbiAgICAgICAgIHVubGVzcyB1cmwgaXMgJ2Jyb3dzZXItcGx1czovL2JsYW5rJyBvciB1cmwuc3RhcnRzV2l0aCgnZmlsZTovLy8nKSBvciBub3Qgb3B0Lm9wZW5JblNhbWVXaW5kb3dcbiAgICAgICAgICAgZWRpdG9yID0gQnJvd3NlclBsdXNNb2RlbC5nZXRFZGl0b3JGb3JVUkkodXJsLG9wdC5vcGVuSW5TYW1lV2luZG93KVxuICAgICAgICAgICBpZiBlZGl0b3JcbiAgICAgICAgICAgICBlZGl0b3Iuc2V0VGV4dChvcHQuc3JjKVxuICAgICAgICAgICAgIGVkaXRvci5yZWZyZXNoKHVybCkgdW5sZXNzIG9wdC5zcmNcbiAgICAgICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yKVxuICAgICAgICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKGVkaXRvcilcbiAgICAgICAgICAgICByZXR1cm4gZWRpdG9yXG5cbiAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKGxvY2FsaG9zdFBhdHRlcm4sJ2h0dHA6Ly8xMjcuMC4wLjEnKVxuICAgICAgICAgbmV3IEJyb3dzZXJQbHVzTW9kZWwge2Jyb3dzZXJQbHVzOkAsdXJsOnVybCxvcHQ6b3B0fVxuXG4gICAgIyBFdmVudHMgc3Vic2NyaWJlZCB0byBpbiBhdG9tJ3Mgc3lzdGVtIGNhbiBiZSBlYXNpbHkgY2xlYW5lZCB1cCB3aXRoIGEgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgICMgUmVnaXN0ZXIgY29tbWFuZCB0aGF0IHRvZ2dsZXMgdGhpcyB2aWV3XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdicm93c2VyLXBsdXM6b3Blbic6ID0+IEBvcGVuKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2Jyb3dzZXItcGx1czpvcGVuQ3VycmVudCc6ID0+IEBvcGVuKHRydWUpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdicm93c2VyLXBsdXM6aGlzdG9yeSc6ID0+IEBoaXN0b3J5KHRydWUpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdicm93c2VyLXBsdXM6ZGVsZXRlSGlzdG9yeSc6ID0+IEBkZWxldGUodHJ1ZSlcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2Jyb3dzZXItcGx1czpmYXYnOiA9PiBAZmF2cigpXG5cbiAgZmF2cjogLT5cbiAgICBmYXZMaXN0ID0gcmVxdWlyZSAnLi9mYXYtdmlldydcbiAgICBuZXcgZmF2TGlzdCB3aW5kb3cuJC5qU3RvcmFnZS5nZXQoJ2JwLmZhdicpXG5cbiAgZGVsZXRlOiAtPlxuICAgICQualN0b3JhZ2Uuc2V0KCdicC5oaXN0b3J5JyxbXSlcblxuICBoaXN0b3J5OiAtPlxuICAgICMgZmlsZTovLy8je0ByZXNvdXJjZXN9aGlzdG9yeS5odG1sXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbiBcImJyb3dzZXItcGx1czovL2hpc3RvcnlcIiAsIHtzcGxpdDogJ2xlZnQnLHNlYXJjaEFsbFBhbmVzOnRydWV9XG5cbiAgb3BlbjogKHVybCxvcHQgPSB7fSktPlxuICAgIGlmIHVybCBpcyB0cnVlIG9yIGF0b20uY29uZmlnLmdldCgnYnJvd3Nlci1wbHVzLmN1cnJlbnRGaWxlJylcbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgaWYgdXJsID0gZWRpdG9yPy5idWZmZXI/LmdldFVyaSgpXG4gICAgICAgIHVybCA9IFwiZmlsZTovLy9cIit1cmxcbiAgICB1bmxlc3MgdXJsXG4gICAgICB1cmwgPSBhdG9tLmNvbmZpZy5nZXQoJ2Jyb3dzZXItcGx1cy5ob21lcGFnZScpXG5cbiAgICBvcHQuc3BsaXQgPSBAZ2V0UG9zaXRpb24oKSB1bmxlc3Mgb3B0LnNwbGl0XG4gICAgIyB1cmwgPSBcImJyb3dzZXItcGx1czovL3ByZXZpZXd+I3t1cmx9XCIgaWYgc3JjXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbiB1cmwsIG9wdFxuXG4gIGdldFBvc2l0aW9uOiAtPlxuICAgIGFjdGl2ZVBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICByZXR1cm4gdW5sZXNzIGFjdGl2ZVBhbmVcbiAgICBwYW5lQXhpcyA9IGFjdGl2ZVBhbmUuZ2V0UGFyZW50KClcbiAgICByZXR1cm4gdW5sZXNzIHBhbmVBeGlzXG4gICAgcGFuZUluZGV4ID0gcGFuZUF4aXMuZ2V0UGFuZXMoKS5pbmRleE9mKGFjdGl2ZVBhbmUpXG4gICAgb3JpZW50YXRpb24gPSBwYW5lQXhpcy5vcmllbnRhdGlvbiA/ICdob3Jpem9udGFsJ1xuICAgIGlmIG9yaWVudGF0aW9uIGlzICdob3Jpem9udGFsJ1xuICAgICAgaWYgIHBhbmVJbmRleCBpcyAwIHRoZW4gJ3JpZ2h0JyBlbHNlICdsZWZ0J1xuICAgIGVsc2VcbiAgICAgIGlmICBwYW5lSW5kZXggaXMgMCB0aGVuICdkb3duJyBlbHNlICd1cCdcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBicm93c2VyUGx1c1ZpZXc/LmRlc3Ryb3k/KClcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICBzZXJpYWxpemU6IC0+XG4gICAgbm9SZXNldDogdHJ1ZVxuXG4gIGdldEJyb3dzZXJQbHVzVXJsOiAodXJsKS0+XG4gICAgaWYgdXJsLnN0YXJ0c1dpdGgoJ2Jyb3dzZXItcGx1czovL2hpc3RvcnknKVxuICAgICAgdXJsID0gXCIje0ByZXNvdXJjZXN9aGlzdG9yeS5odG1sXCJcbiAgICBlbHNlXG4gICAgICB1cmwgPSAnJ1xuXG4gIGFkZFBsdWdpbjogKHJlcXVpcmVzKS0+XG4gICAgQHBsdWdpbnMgPz0ge31cbiAgICBmb3Iga2V5LHZhbCBvZiByZXF1aXJlc1xuICAgICAgdHJ5XG4gICAgICAgIHN3aXRjaCBrZXlcbiAgICAgICAgICB3aGVuICdvbkluaXQnIG9yICdvbkV4aXQnXG4gICAgICAgICAgICBAcGx1Z2luc1trZXldID0gKEBwbHVnaW5zW2tleV0gb3IgW10pLmNvbmNhdCBcIigje3ZhbC50b1N0cmluZygpfSkoKVwiXG4gICAgICAgICAgd2hlbiAnanMnIG9yICdjc3MnXG4gICAgICAgICAgICB1bmxlc3MgIHBrZ1BhdGhcbiAgICAgICAgICAgICAgcGtncyA9IE9iamVjdC5rZXlzKGF0b20ucGFja2FnZXMuYWN0aXZhdGluZ1BhY2thZ2VzKS5zb3J0KClcbiAgICAgICAgICAgICAgcGtnID0gcGtnc1twa2dzLmxlbmd0aCAtIDFdXG4gICAgICAgICAgICAgIHBrZ1BhdGggPSBhdG9tLnBhY2thZ2VzLmFjdGl2YXRpbmdQYWNrYWdlc1twa2ddLnBhdGggKyBcIi9cIlxuICAgICAgICAgICAgaWYgQXJyYXkuaXNBcnJheSh2YWwpXG4gICAgICAgICAgICAgIGZvciBzY3JpcHQgaW4gdmFsXG4gICAgICAgICAgICAgICAgdW5sZXNzIHNjcmlwdC5zdGFydHNXaXRoKCdodHRwJylcbiAgICAgICAgICAgICAgICAgIEBwbHVnaW5zW2tleStcInNcIl0gPSAoQHBsdWdpbnNba2V5XSBvciBbXSkuY29uY2F0ICdmaWxlOi8vLycrYXRvbS5wYWNrYWdlcy5hY3RpdmF0aW5nUGFja2FnZXNbcGtnXS5wYXRoLnJlcGxhY2UoL1xcXFwvZyxcIi9cIikgKyBcIi9cIiArIHNjcmlwdFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICB1bmxlc3MgdmFsLnN0YXJ0c1dpdGgoJ2h0dHAnKVxuICAgICAgICAgICAgICAgIEBwbHVnaW5zW2tleStcInNcIl0gPSAoQHBsdWdpbnNba2V5XSBvciBbXSkuY29uY2F0ICdmaWxlOi8vLycrIGF0b20ucGFja2FnZXMuYWN0aXZhdGluZ1BhY2thZ2VzW3BrZ10ucGF0aC5yZXBsYWNlKC9cXFxcL2csXCIvXCIpICsgXCIvXCIgKyB2YWxcblxuICAgICAgICAgIHdoZW4gJ21lbnVzJ1xuICAgICAgICAgICAgaWYgQXJyYXkuaXNBcnJheSh2YWwpXG4gICAgICAgICAgICAgIGZvciBtZW51IGluIHZhbFxuICAgICAgICAgICAgICAgIG1lbnUuX2lkID0gdXVpZC52MSgpXG4gICAgICAgICAgICAgICAgQHBsdWdpbnNba2V5XSA9IChAcGx1Z2luc1trZXldIG9yIFtdKS5jb25jYXQgbWVudVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICB2YWwuX2lkID0gdXVpZC52MSgpXG4gICAgICAgICAgICAgIEBwbHVnaW5zW2tleV0gPSAoQHBsdWdpbnNba2V5XSBvciBbXSkuY29uY2F0IHZhbFxuXG4gICAgICBjYXRjaCBlcnJvclxuXG5cblxuICBwcm92aWRlU2VydmljZTogLT5cbiAgICBtb2RlbDpyZXF1aXJlICcuL2Jyb3dzZXItcGx1cy1tb2RlbCdcbiAgICBhZGRQbHVnaW46IEBhZGRQbHVnaW4uYmluZChAKVxuIl19
