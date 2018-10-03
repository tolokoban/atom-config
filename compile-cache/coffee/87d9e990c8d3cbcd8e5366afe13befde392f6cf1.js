(function() {
  var CompositeDisposable, ScrollView, ShowTodoView, TextBuffer, TextEditorView, TodoOptions, TodoTable, deprecatedTextEditor, fs, path, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, TextBuffer = ref.TextBuffer;

  ref1 = require('atom-space-pen-views'), ScrollView = ref1.ScrollView, TextEditorView = ref1.TextEditorView;

  path = require('path');

  fs = require('fs-plus');

  TodoTable = require('./todo-table-view');

  TodoOptions = require('./todo-options-view');

  deprecatedTextEditor = function(params) {
    var TextEditor;
    if (atom.workspace.buildTextEditor != null) {
      return atom.workspace.buildTextEditor(params);
    } else {
      TextEditor = require('atom').TextEditor;
      return new TextEditor(params);
    }
  };

  module.exports = ShowTodoView = (function(superClass) {
    extend(ShowTodoView, superClass);

    ShowTodoView.content = function(collection, filterBuffer) {
      return this.div({
        "class": 'show-todo-preview',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'input-block'
          }, function() {
            _this.div({
              "class": 'input-block-item input-block-item--flex'
            });
            return _this.div({
              "class": 'input-block-item'
            }, function() {
              return _this.div({
                "class": 'btn-group'
              }, function() {
                _this.button({
                  outlet: 'scopeButton',
                  "class": 'btn'
                });
                _this.button({
                  outlet: 'optionsButton',
                  "class": 'btn icon-gear'
                });
                _this.button({
                  outlet: 'exportButton',
                  "class": 'btn icon-cloud-download'
                });
                return _this.button({
                  outlet: 'refreshButton',
                  "class": 'btn icon-sync'
                });
              });
            });
          });
          _this.div({
            "class": 'input-block todo-info-block'
          }, function() {
            return _this.div({
              "class": 'input-block-item'
            }, function() {
              return _this.span({
                outlet: 'todoInfo'
              });
            });
          });
          _this.div({
            outlet: 'optionsView'
          });
          _this.div({
            outlet: 'todoLoading',
            "class": 'todo-loading'
          }, function() {
            _this.div({
              "class": 'markdown-spinner'
            });
            return _this.h5({
              outlet: 'searchCount',
              "class": 'text-center'
            }, "Loading Todos...");
          });
          return _this.subview('todoTable', new TodoTable(collection));
        };
      })(this));
    };

    function ShowTodoView(collection1, uri) {
      this.collection = collection1;
      this.uri = uri;
      this.toggleOptions = bind(this.toggleOptions, this);
      this.setScopeButtonState = bind(this.setScopeButtonState, this);
      this.toggleSearchScope = bind(this.toggleSearchScope, this);
      this["export"] = bind(this["export"], this);
      this.stopLoading = bind(this.stopLoading, this);
      this.startLoading = bind(this.startLoading, this);
      ShowTodoView.__super__.constructor.call(this, this.collection, this.filterBuffer = new TextBuffer);
    }

    ShowTodoView.prototype.initialize = function() {
      this.disposables = new CompositeDisposable;
      this.handleEvents();
      this.setScopeButtonState(this.collection.getSearchScope());
      this.onlySearchWhenVisible = true;
      this.notificationOptions = {
        detail: 'Atom todo-show package',
        dismissable: true,
        icon: this.getIconName()
      };
      this.checkDeprecation();
      this.disposables.add(atom.tooltips.add(this.scopeButton, {
        title: "What to Search"
      }));
      this.disposables.add(atom.tooltips.add(this.optionsButton, {
        title: "Show Todo Options"
      }));
      this.disposables.add(atom.tooltips.add(this.exportButton, {
        title: "Export Todos"
      }));
      return this.disposables.add(atom.tooltips.add(this.refreshButton, {
        title: "Refresh Todos"
      }));
    };

    ShowTodoView.prototype.handleEvents = function() {
      this.disposables.add(atom.commands.add(this.element, {
        'core:export': (function(_this) {
          return function(event) {
            event.stopPropagation();
            return _this["export"]();
          };
        })(this),
        'core:refresh': (function(_this) {
          return function(event) {
            event.stopPropagation();
            return _this.search(true);
          };
        })(this)
      }));
      this.disposables.add(this.collection.onDidStartSearch(this.startLoading));
      this.disposables.add(this.collection.onDidFinishSearch(this.stopLoading));
      this.disposables.add(this.collection.onDidFailSearch((function(_this) {
        return function(err) {
          _this.searchCount.text("Search Failed");
          if (err) {
            console.error(err);
          }
          if (err) {
            return _this.showError(err);
          }
        };
      })(this)));
      this.disposables.add(this.collection.onDidChangeSearchScope((function(_this) {
        return function(scope) {
          _this.setScopeButtonState(scope);
          return _this.search(true);
        };
      })(this)));
      this.disposables.add(this.collection.onDidSearchPaths((function(_this) {
        return function(nPaths) {
          return _this.searchCount.text(nPaths + " paths searched...");
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          if (_this.collection.setActiveProject(item != null ? typeof item.getPath === "function" ? item.getPath() : void 0 : void 0) || ((item != null ? item.constructor.name : void 0) === 'TextEditor' && _this.collection.scope === 'active')) {
            return _this.search();
          }
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidAddTextEditor((function(_this) {
        return function(arg) {
          var textEditor;
          textEditor = arg.textEditor;
          if (_this.collection.scope === 'open') {
            return _this.search();
          }
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidDestroyPaneItem((function(_this) {
        return function(arg) {
          var item;
          item = arg.item;
          if (_this.collection.scope === 'open') {
            return _this.search();
          }
        };
      })(this)));
      this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.disposables.add(editor.onDidSave(function() {
            return _this.search();
          }));
        };
      })(this)));
      this.scopeButton.on('click', this.toggleSearchScope);
      this.optionsButton.on('click', this.toggleOptions);
      this.exportButton.on('click', this["export"]);
      return this.refreshButton.on('click', (function(_this) {
        return function() {
          return _this.search(true);
        };
      })(this));
    };

    ShowTodoView.prototype.destroy = function() {
      this.collection.cancelSearch();
      this.disposables.dispose();
      return this.detach();
    };

    ShowTodoView.prototype.serialize = function() {
      return {
        deserializer: 'todo-show/todo-view',
        scope: this.collection.scope,
        customPath: this.collection.getCustomPath()
      };
    };

    ShowTodoView.prototype.getTitle = function() {
      return "Todo Show";
    };

    ShowTodoView.prototype.getIconName = function() {
      return "checklist";
    };

    ShowTodoView.prototype.getURI = function() {
      return this.uri;
    };

    ShowTodoView.prototype.getDefaultLocation = function() {
      return 'right';
    };

    ShowTodoView.prototype.getAllowedLocations = function() {
      return ['left', 'right', 'bottom'];
    };

    ShowTodoView.prototype.getProjectName = function() {
      return this.collection.getActiveProjectName();
    };

    ShowTodoView.prototype.getProjectPath = function() {
      return this.collection.getActiveProject();
    };

    ShowTodoView.prototype.getTodos = function() {
      return this.collection.getTodos();
    };

    ShowTodoView.prototype.getTodosCount = function() {
      return this.collection.getTodosCount();
    };

    ShowTodoView.prototype.isSearching = function() {
      return this.collection.getState();
    };

    ShowTodoView.prototype.search = function(force) {
      var ref2;
      if (force == null) {
        force = false;
      }
      if (this.onlySearchWhenVisible) {
        if (!((ref2 = atom.workspace.paneContainerForItem(this)) != null ? ref2.isVisible() : void 0)) {
          return;
        }
      }
      return this.collection.search(force);
    };

    ShowTodoView.prototype.startLoading = function() {
      this.todoLoading.show();
      return this.updateInfo();
    };

    ShowTodoView.prototype.stopLoading = function() {
      this.todoLoading.hide();
      return this.updateInfo();
    };

    ShowTodoView.prototype.updateInfo = function() {
      return this.todoInfo.html((this.getInfoText()) + " " + (this.getScopeText()));
    };

    ShowTodoView.prototype.getInfoText = function() {
      var count;
      if (this.isSearching()) {
        return "Found ... results";
      }
      switch (count = this.getTodosCount()) {
        case 1:
          return "Found " + count + " result";
        default:
          return "Found " + count + " results";
      }
    };

    ShowTodoView.prototype.getScopeText = function() {
      switch (this.collection.scope) {
        case 'active':
          return "in active file";
        case 'open':
          return "in open files";
        case 'project':
          return "in project <code>" + (this.getProjectName()) + "</code>";
        case 'custom':
          return "in <code>" + this.collection.customPath + "</code>";
        default:
          return "in workspace";
      }
    };

    ShowTodoView.prototype.showError = function(message) {
      if (message == null) {
        message = '';
      }
      return atom.notifications.addError(message.toString(), this.notificationOptions);
    };

    ShowTodoView.prototype.showWarning = function(message) {
      if (message == null) {
        message = '';
      }
      return atom.notifications.addWarning(message.toString(), this.notificationOptions);
    };

    ShowTodoView.prototype["export"] = function() {
      var filePath, projectPath;
      if (this.isSearching()) {
        return;
      }
      filePath = (this.getProjectName() || 'todos') + ".md";
      if (projectPath = this.getProjectPath()) {
        filePath = path.join(projectPath, filePath);
      }
      if (fs.existsSync(filePath)) {
        filePath = void 0;
      }
      return atom.workspace.open(filePath).then((function(_this) {
        return function(textEditor) {
          return textEditor.setText(_this.collection.getMarkdown());
        };
      })(this));
    };

    ShowTodoView.prototype.toggleSearchScope = function() {
      var scope;
      scope = this.collection.toggleSearchScope();
      return this.setScopeButtonState(scope);
    };

    ShowTodoView.prototype.setScopeButtonState = function(state) {
      switch (state) {
        case 'project':
          return this.scopeButton.text('Project');
        case 'open':
          return this.scopeButton.text('Open Files');
        case 'active':
          return this.scopeButton.text('Active File');
        case 'custom':
          return this.scopeButton.text('Custom');
        default:
          return this.scopeButton.text('Workspace');
      }
    };

    ShowTodoView.prototype.toggleOptions = function() {
      if (!this.todoOptions) {
        this.optionsView.hide();
        this.todoOptions = new TodoOptions(this.collection);
        this.optionsView.html(this.todoOptions);
      }
      return this.optionsView.slideToggle();
    };

    ShowTodoView.prototype.filter = function() {
      return this.collection.filterTodos(this.filterBuffer.getText());
    };

    ShowTodoView.prototype.checkDeprecation = function() {
      if (atom.config.get('todo-show.findTheseRegexes')) {
        return this.showWarning('Deprecation Warning:\n\n`findTheseRegexes` config is deprecated, please use `findTheseTodos` and `findUsingRegex` for custom behaviour.\nSee https://github.com/mrodalgaard/atom-todo-show#config for more information.');
      }
    };

    return ShowTodoView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG9sb2tvYmFuL0NvZGUvZ2l0aHViL2F0b20tY29uZmlnL3BhY2thZ2VzL3RvZG8tc2hvdy9saWIvdG9kby12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNElBQUE7SUFBQTs7OztFQUFBLE1BQW9DLE9BQUEsQ0FBUSxNQUFSLENBQXBDLEVBQUMsNkNBQUQsRUFBc0I7O0VBQ3RCLE9BQStCLE9BQUEsQ0FBUSxzQkFBUixDQUEvQixFQUFDLDRCQUFELEVBQWE7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFFTCxTQUFBLEdBQVksT0FBQSxDQUFRLG1CQUFSOztFQUNaLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVI7O0VBRWQsb0JBQUEsR0FBdUIsU0FBQyxNQUFEO0FBQ3JCLFFBQUE7SUFBQSxJQUFHLHNDQUFIO2FBQ0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFmLENBQStCLE1BQS9CLEVBREY7S0FBQSxNQUFBO01BR0UsVUFBQSxHQUFhLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQzthQUM3QixJQUFJLFVBQUosQ0FBZSxNQUFmLEVBSkY7O0VBRHFCOztFQU92QixNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFDSixZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsVUFBRCxFQUFhLFlBQWI7YUFXUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxtQkFBUDtRQUE0QixRQUFBLEVBQVUsQ0FBQyxDQUF2QztPQUFMLEVBQStDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUM3QyxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQO1dBQUwsRUFBMkIsU0FBQTtZQUN6QixLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FB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QTthQUNOLElBQUMsQ0FBQSxVQUFVLENBQUMsV0FBWixDQUF3QixJQUFDLENBQUEsWUFBWSxDQUFDLE9BQWQsQ0FBQSxDQUF4QjtJQURNOzsyQkFHUixnQkFBQSxHQUFrQixTQUFBO01BQ2hCLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixDQUFIO2VBQ0UsSUFBQyxDQUFBLFdBQUQsQ0FBYSx5TkFBYixFQURGOztJQURnQjs7OztLQTFNTztBQWhCM0IiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZSwgVGV4dEJ1ZmZlcn0gPSByZXF1aXJlICdhdG9tJ1xue1Njcm9sbFZpZXcsIFRleHRFZGl0b3JWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5cblRvZG9UYWJsZSA9IHJlcXVpcmUgJy4vdG9kby10YWJsZS12aWV3J1xuVG9kb09wdGlvbnMgPSByZXF1aXJlICcuL3RvZG8tb3B0aW9ucy12aWV3J1xuXG5kZXByZWNhdGVkVGV4dEVkaXRvciA9IChwYXJhbXMpIC0+XG4gIGlmIGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcj9cbiAgICBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IocGFyYW1zKVxuICBlbHNlXG4gICAgVGV4dEVkaXRvciA9IHJlcXVpcmUoJ2F0b20nKS5UZXh0RWRpdG9yXG4gICAgbmV3IFRleHRFZGl0b3IocGFyYW1zKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTaG93VG9kb1ZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3XG4gIEBjb250ZW50OiAoY29sbGVjdGlvbiwgZmlsdGVyQnVmZmVyKSAtPlxuICAgICMgRklYTUU6IENyZWF0aW5nIHRleHQgZWRpdG9yIHRoaXMgd2F5IHJlc3VsdHMgaW4gd2VpcmQgZ2V0U2NvcGVDaGFpbiBlcnJvciBpbiBBdG9tIGNvcmUgLSBkZXByZWNhdGVkXG4gICAgIyBmaWx0ZXJFZGl0b3IgPSBkZXByZWNhdGVkVGV4dEVkaXRvcihcbiAgICAjICAgbWluaTogdHJ1ZVxuICAgICMgICB0YWJMZW5ndGg6IDJcbiAgICAjICAgc29mdFRhYnM6IHRydWVcbiAgICAjICAgc29mdFdyYXBwZWQ6IGZhbHNlXG4gICAgIyAgIGJ1ZmZlcjogZmlsdGVyQnVmZmVyXG4gICAgIyAgIHBsYWNlaG9sZGVyVGV4dDogJ1NlYXJjaCBUb2RvcydcbiAgICAjIClcblxuICAgIEBkaXYgY2xhc3M6ICdzaG93LXRvZG8tcHJldmlldycsIHRhYmluZGV4OiAtMSwgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdpbnB1dC1ibG9jaycsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdpbnB1dC1ibG9jay1pdGVtIGlucHV0LWJsb2NrLWl0ZW0tLWZsZXgnXG4gICAgICAgICAgIyBAc3VidmlldyAnZmlsdGVyRWRpdG9yVmlldycsIG5ldyBUZXh0RWRpdG9yVmlldyhlZGl0b3I6IGZpbHRlckVkaXRvcilcbiAgICAgICAgQGRpdiBjbGFzczogJ2lucHV0LWJsb2NrLWl0ZW0nLCA9PlxuICAgICAgICAgIEBkaXYgY2xhc3M6ICdidG4tZ3JvdXAnLCA9PlxuICAgICAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdzY29wZUJ1dHRvbicsIGNsYXNzOiAnYnRuJ1xuICAgICAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdvcHRpb25zQnV0dG9uJywgY2xhc3M6ICdidG4gaWNvbi1nZWFyJ1xuICAgICAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdleHBvcnRCdXR0b24nLCBjbGFzczogJ2J0biBpY29uLWNsb3VkLWRvd25sb2FkJ1xuICAgICAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdyZWZyZXNoQnV0dG9uJywgY2xhc3M6ICdidG4gaWNvbi1zeW5jJ1xuXG4gICAgICBAZGl2IGNsYXNzOiAnaW5wdXQtYmxvY2sgdG9kby1pbmZvLWJsb2NrJywgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ2lucHV0LWJsb2NrLWl0ZW0nLCA9PlxuICAgICAgICAgIEBzcGFuIG91dGxldDogJ3RvZG9JbmZvJ1xuXG4gICAgICBAZGl2IG91dGxldDogJ29wdGlvbnNWaWV3J1xuXG4gICAgICBAZGl2IG91dGxldDogJ3RvZG9Mb2FkaW5nJywgY2xhc3M6ICd0b2RvLWxvYWRpbmcnLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnbWFya2Rvd24tc3Bpbm5lcidcbiAgICAgICAgQGg1IG91dGxldDogJ3NlYXJjaENvdW50JywgY2xhc3M6ICd0ZXh0LWNlbnRlcicsIFwiTG9hZGluZyBUb2Rvcy4uLlwiXG5cbiAgICAgIEBzdWJ2aWV3ICd0b2RvVGFibGUnLCBuZXcgVG9kb1RhYmxlKGNvbGxlY3Rpb24pXG5cbiAgY29uc3RydWN0b3I6IChAY29sbGVjdGlvbiwgQHVyaSkgLT5cbiAgICBzdXBlciBAY29sbGVjdGlvbiwgQGZpbHRlckJ1ZmZlciA9IG5ldyBUZXh0QnVmZmVyXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBoYW5kbGVFdmVudHMoKVxuICAgIEBzZXRTY29wZUJ1dHRvblN0YXRlKEBjb2xsZWN0aW9uLmdldFNlYXJjaFNjb3BlKCkpXG5cbiAgICBAb25seVNlYXJjaFdoZW5WaXNpYmxlID0gdHJ1ZVxuICAgIEBub3RpZmljYXRpb25PcHRpb25zID1cbiAgICAgIGRldGFpbDogJ0F0b20gdG9kby1zaG93IHBhY2thZ2UnXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgaWNvbjogQGdldEljb25OYW1lKClcblxuICAgIEBjaGVja0RlcHJlY2F0aW9uKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQHNjb3BlQnV0dG9uLCB0aXRsZTogXCJXaGF0IHRvIFNlYXJjaFwiXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAb3B0aW9uc0J1dHRvbiwgdGl0bGU6IFwiU2hvdyBUb2RvIE9wdGlvbnNcIlxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGV4cG9ydEJ1dHRvbiwgdGl0bGU6IFwiRXhwb3J0IFRvZG9zXCJcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEByZWZyZXNoQnV0dG9uLCB0aXRsZTogXCJSZWZyZXNoIFRvZG9zXCJcblxuICBoYW5kbGVFdmVudHM6IC0+XG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBAZWxlbWVudCxcbiAgICAgICdjb3JlOmV4cG9ydCc6IChldmVudCkgPT5cbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgQGV4cG9ydCgpXG4gICAgICAnY29yZTpyZWZyZXNoJzogKGV2ZW50KSA9PlxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBAc2VhcmNoKHRydWUpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBjb2xsZWN0aW9uLm9uRGlkU3RhcnRTZWFyY2ggQHN0YXJ0TG9hZGluZ1xuICAgIEBkaXNwb3NhYmxlcy5hZGQgQGNvbGxlY3Rpb24ub25EaWRGaW5pc2hTZWFyY2ggQHN0b3BMb2FkaW5nXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAY29sbGVjdGlvbi5vbkRpZEZhaWxTZWFyY2ggKGVycikgPT5cbiAgICAgIEBzZWFyY2hDb3VudC50ZXh0IFwiU2VhcmNoIEZhaWxlZFwiXG4gICAgICBjb25zb2xlLmVycm9yIGVyciBpZiBlcnJcbiAgICAgIEBzaG93RXJyb3IgZXJyIGlmIGVyclxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAY29sbGVjdGlvbi5vbkRpZENoYW5nZVNlYXJjaFNjb3BlIChzY29wZSkgPT5cbiAgICAgIEBzZXRTY29wZUJ1dHRvblN0YXRlKHNjb3BlKVxuICAgICAgQHNlYXJjaCh0cnVlKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAY29sbGVjdGlvbi5vbkRpZFNlYXJjaFBhdGhzIChuUGF0aHMpID0+XG4gICAgICBAc2VhcmNoQ291bnQudGV4dCBcIiN7blBhdGhzfSBwYXRocyBzZWFyY2hlZC4uLlwiXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gKGl0ZW0pID0+XG4gICAgICBpZiBAY29sbGVjdGlvbi5zZXRBY3RpdmVQcm9qZWN0KGl0ZW0/LmdldFBhdGg/KCkpIG9yXG4gICAgICAoaXRlbT8uY29uc3RydWN0b3IubmFtZSBpcyAnVGV4dEVkaXRvcicgYW5kIEBjb2xsZWN0aW9uLnNjb3BlIGlzICdhY3RpdmUnKVxuICAgICAgICBAc2VhcmNoKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS53b3Jrc3BhY2Uub25EaWRBZGRUZXh0RWRpdG9yICh7dGV4dEVkaXRvcn0pID0+XG4gICAgICBAc2VhcmNoKCkgaWYgQGNvbGxlY3Rpb24uc2NvcGUgaXMgJ29wZW4nXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20ud29ya3NwYWNlLm9uRGlkRGVzdHJveVBhbmVJdGVtICh7aXRlbX0pID0+XG4gICAgICBAc2VhcmNoKCkgaWYgQGNvbGxlY3Rpb24uc2NvcGUgaXMgJ29wZW4nXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBlZGl0b3Iub25EaWRTYXZlID0+XG4gICAgICAgIEBzZWFyY2goKVxuXG4gICAgIyBAZmlsdGVyRWRpdG9yVmlldy5nZXRNb2RlbCgpLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgIyAgIEBmaWx0ZXIoKSBpZiBAZmlyc3RUaW1lRmlsdGVyXG4gICAgIyAgIEBmaXJzdFRpbWVGaWx0ZXIgPSB0cnVlXG5cbiAgICBAc2NvcGVCdXR0b24ub24gJ2NsaWNrJywgQHRvZ2dsZVNlYXJjaFNjb3BlXG4gICAgQG9wdGlvbnNCdXR0b24ub24gJ2NsaWNrJywgQHRvZ2dsZU9wdGlvbnNcbiAgICBAZXhwb3J0QnV0dG9uLm9uICdjbGljaycsIEBleHBvcnRcbiAgICBAcmVmcmVzaEJ1dHRvbi5vbiAnY2xpY2snLCA9PiBAc2VhcmNoKHRydWUpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAY29sbGVjdGlvbi5jYW5jZWxTZWFyY2goKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAZGV0YWNoKClcblxuICBzZXJpYWxpemU6IC0+XG4gICAgZGVzZXJpYWxpemVyOiAndG9kby1zaG93L3RvZG8tdmlldydcbiAgICBzY29wZTogQGNvbGxlY3Rpb24uc2NvcGVcbiAgICBjdXN0b21QYXRoOiBAY29sbGVjdGlvbi5nZXRDdXN0b21QYXRoKClcblxuICBnZXRUaXRsZTogLT4gXCJUb2RvIFNob3dcIlxuICBnZXRJY29uTmFtZTogLT4gXCJjaGVja2xpc3RcIlxuICBnZXRVUkk6IC0+IEB1cmlcbiAgZ2V0RGVmYXVsdExvY2F0aW9uOiAtPiAncmlnaHQnXG4gIGdldEFsbG93ZWRMb2NhdGlvbnM6IC0+IFsnbGVmdCcsICdyaWdodCcsICdib3R0b20nXVxuICBnZXRQcm9qZWN0TmFtZTogLT4gQGNvbGxlY3Rpb24uZ2V0QWN0aXZlUHJvamVjdE5hbWUoKVxuICBnZXRQcm9qZWN0UGF0aDogLT4gQGNvbGxlY3Rpb24uZ2V0QWN0aXZlUHJvamVjdCgpXG5cbiAgZ2V0VG9kb3M6IC0+IEBjb2xsZWN0aW9uLmdldFRvZG9zKClcbiAgZ2V0VG9kb3NDb3VudDogLT4gQGNvbGxlY3Rpb24uZ2V0VG9kb3NDb3VudCgpXG4gIGlzU2VhcmNoaW5nOiAtPiBAY29sbGVjdGlvbi5nZXRTdGF0ZSgpXG4gIHNlYXJjaDogKGZvcmNlID0gZmFsc2UpIC0+XG4gICAgaWYgQG9ubHlTZWFyY2hXaGVuVmlzaWJsZVxuICAgICAgcmV0dXJuIHVubGVzcyBhdG9tLndvcmtzcGFjZS5wYW5lQ29udGFpbmVyRm9ySXRlbSh0aGlzKT8uaXNWaXNpYmxlKClcbiAgICBAY29sbGVjdGlvbi5zZWFyY2goZm9yY2UpXG5cbiAgc3RhcnRMb2FkaW5nOiA9PlxuICAgIEB0b2RvTG9hZGluZy5zaG93KClcbiAgICBAdXBkYXRlSW5mbygpXG5cbiAgc3RvcExvYWRpbmc6ID0+XG4gICAgQHRvZG9Mb2FkaW5nLmhpZGUoKVxuICAgIEB1cGRhdGVJbmZvKClcblxuICB1cGRhdGVJbmZvOiAtPlxuICAgIEB0b2RvSW5mby5odG1sKFwiI3tAZ2V0SW5mb1RleHQoKX0gI3tAZ2V0U2NvcGVUZXh0KCl9XCIpXG5cbiAgZ2V0SW5mb1RleHQ6IC0+XG4gICAgcmV0dXJuIFwiRm91bmQgLi4uIHJlc3VsdHNcIiBpZiBAaXNTZWFyY2hpbmcoKVxuICAgIHN3aXRjaCBjb3VudCA9IEBnZXRUb2Rvc0NvdW50KClcbiAgICAgIHdoZW4gMSB0aGVuIFwiRm91bmQgI3tjb3VudH0gcmVzdWx0XCJcbiAgICAgIGVsc2UgXCJGb3VuZCAje2NvdW50fSByZXN1bHRzXCJcblxuICBnZXRTY29wZVRleHQ6IC0+XG4gICAgIyBUT0RPOiBBbHNvIHNob3cgbnVtYmVyIG9mIGZpbGVzXG5cbiAgICBzd2l0Y2ggQGNvbGxlY3Rpb24uc2NvcGVcbiAgICAgIHdoZW4gJ2FjdGl2ZSdcbiAgICAgICAgXCJpbiBhY3RpdmUgZmlsZVwiXG4gICAgICB3aGVuICdvcGVuJ1xuICAgICAgICBcImluIG9wZW4gZmlsZXNcIlxuICAgICAgd2hlbiAncHJvamVjdCdcbiAgICAgICAgXCJpbiBwcm9qZWN0IDxjb2RlPiN7QGdldFByb2plY3ROYW1lKCl9PC9jb2RlPlwiXG4gICAgICB3aGVuICdjdXN0b20nXG4gICAgICAgIFwiaW4gPGNvZGU+I3tAY29sbGVjdGlvbi5jdXN0b21QYXRofTwvY29kZT5cIlxuICAgICAgZWxzZVxuICAgICAgICBcImluIHdvcmtzcGFjZVwiXG5cbiAgc2hvd0Vycm9yOiAobWVzc2FnZSA9ICcnKSAtPlxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBtZXNzYWdlLnRvU3RyaW5nKCksIEBub3RpZmljYXRpb25PcHRpb25zXG5cbiAgc2hvd1dhcm5pbmc6IChtZXNzYWdlID0gJycpIC0+XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgbWVzc2FnZS50b1N0cmluZygpLCBAbm90aWZpY2F0aW9uT3B0aW9uc1xuXG4gIGV4cG9ydDogPT5cbiAgICByZXR1cm4gaWYgQGlzU2VhcmNoaW5nKClcblxuICAgIGZpbGVQYXRoID0gXCIje0BnZXRQcm9qZWN0TmFtZSgpIG9yICd0b2Rvcyd9Lm1kXCJcbiAgICBpZiBwcm9qZWN0UGF0aCA9IEBnZXRQcm9qZWN0UGF0aCgpXG4gICAgICBmaWxlUGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgZmlsZVBhdGgpXG5cbiAgICAjIERvIG5vdCBvdmVycmlkZSBpZiBkZWZhdWx0IGZpbGUgcGF0aCBhbHJlYWR5IGV4aXN0c1xuICAgIGZpbGVQYXRoID0gdW5kZWZpbmVkIGlmIGZzLmV4aXN0c1N5bmMoZmlsZVBhdGgpXG5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKS50aGVuICh0ZXh0RWRpdG9yKSA9PlxuICAgICAgdGV4dEVkaXRvci5zZXRUZXh0KEBjb2xsZWN0aW9uLmdldE1hcmtkb3duKCkpXG5cbiAgdG9nZ2xlU2VhcmNoU2NvcGU6ID0+XG4gICAgc2NvcGUgPSBAY29sbGVjdGlvbi50b2dnbGVTZWFyY2hTY29wZSgpXG4gICAgQHNldFNjb3BlQnV0dG9uU3RhdGUoc2NvcGUpXG5cbiAgc2V0U2NvcGVCdXR0b25TdGF0ZTogKHN0YXRlKSA9PlxuICAgIHN3aXRjaCBzdGF0ZVxuICAgICAgd2hlbiAncHJvamVjdCcgdGhlbiBAc2NvcGVCdXR0b24udGV4dCAnUHJvamVjdCdcbiAgICAgIHdoZW4gJ29wZW4nIHRoZW4gQHNjb3BlQnV0dG9uLnRleHQgJ09wZW4gRmlsZXMnXG4gICAgICB3aGVuICdhY3RpdmUnIHRoZW4gQHNjb3BlQnV0dG9uLnRleHQgJ0FjdGl2ZSBGaWxlJ1xuICAgICAgd2hlbiAnY3VzdG9tJyB0aGVuIEBzY29wZUJ1dHRvbi50ZXh0ICdDdXN0b20nXG4gICAgICBlbHNlIEBzY29wZUJ1dHRvbi50ZXh0ICdXb3Jrc3BhY2UnXG5cbiAgdG9nZ2xlT3B0aW9uczogPT5cbiAgICB1bmxlc3MgQHRvZG9PcHRpb25zXG4gICAgICBAb3B0aW9uc1ZpZXcuaGlkZSgpXG4gICAgICBAdG9kb09wdGlvbnMgPSBuZXcgVG9kb09wdGlvbnMoQGNvbGxlY3Rpb24pXG4gICAgICBAb3B0aW9uc1ZpZXcuaHRtbCBAdG9kb09wdGlvbnNcbiAgICBAb3B0aW9uc1ZpZXcuc2xpZGVUb2dnbGUoKVxuXG4gIGZpbHRlcjogLT5cbiAgICBAY29sbGVjdGlvbi5maWx0ZXJUb2RvcyBAZmlsdGVyQnVmZmVyLmdldFRleHQoKVxuXG4gIGNoZWNrRGVwcmVjYXRpb246IC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCd0b2RvLXNob3cuZmluZFRoZXNlUmVnZXhlcycpXG4gICAgICBAc2hvd1dhcm5pbmcgJycnXG4gICAgICBEZXByZWNhdGlvbiBXYXJuaW5nOlxcblxuICAgICAgYGZpbmRUaGVzZVJlZ2V4ZXNgIGNvbmZpZyBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIGBmaW5kVGhlc2VUb2Rvc2AgYW5kIGBmaW5kVXNpbmdSZWdleGAgZm9yIGN1c3RvbSBiZWhhdmlvdXIuXG4gICAgICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21yb2RhbGdhYXJkL2F0b20tdG9kby1zaG93I2NvbmZpZyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICAgICcnJ1xuIl19
