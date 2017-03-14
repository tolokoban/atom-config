(function() {
  var CodeView, CompositeDisposable, ItemView, ShowTodoView, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('atom').CompositeDisposable;

  View = require('atom-space-pen-views').View;

  ItemView = (function(superClass) {
    extend(ItemView, superClass);

    function ItemView() {
      return ItemView.__super__.constructor.apply(this, arguments);
    }

    ItemView.content = function(item) {
      return this.span({
        "class": 'badge badge-large',
        'data-id': item
      }, item);
    };

    return ItemView;

  })(View);

  CodeView = (function(superClass) {
    extend(CodeView, superClass);

    function CodeView() {
      return CodeView.__super__.constructor.apply(this, arguments);
    }

    CodeView.content = function(item) {
      return this.code(item);
    };

    return CodeView;

  })(View);

  module.exports = ShowTodoView = (function(superClass) {
    extend(ShowTodoView, superClass);

    function ShowTodoView() {
      this.updateShowInTable = bind(this.updateShowInTable, this);
      return ShowTodoView.__super__.constructor.apply(this, arguments);
    }

    ShowTodoView.content = function() {
      return this.div({
        outlet: 'todoOptions',
        "class": 'todo-options'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'option'
          }, function() {
            _this.h2('On Table');
            return _this.div({
              outlet: 'itemsOnTable',
              "class": 'block items-on-table'
            });
          });
          _this.div({
            "class": 'option'
          }, function() {
            _this.h2('Off Table');
            return _this.div({
              outlet: 'itemsOffTable',
              "class": 'block items-off-table'
            });
          });
          _this.div({
            "class": 'option'
          }, function() {
            _this.h2('Find Todos');
            return _this.div({
              outlet: 'findTodoDiv'
            });
          });
          _this.div({
            "class": 'option'
          }, function() {
            _this.h2('Find Regex');
            return _this.div({
              outlet: 'findRegexDiv'
            });
          });
          _this.div({
            "class": 'option'
          }, function() {
            _this.h2('Ignore Paths');
            return _this.div({
              outlet: 'ignorePathDiv'
            });
          });
          return _this.div({
            "class": 'option'
          }, function() {
            _this.h2('');
            return _this.div({
              "class": 'btn-group'
            }, function() {
              _this.button({
                outlet: 'configButton',
                "class": 'btn'
              }, "Go to Config");
              return _this.button({
                outlet: 'closeButton',
                "class": 'btn'
              }, "Close Options");
            });
          });
        };
      })(this));
    };

    ShowTodoView.prototype.initialize = function(collection) {
      this.collection = collection;
      this.disposables = new CompositeDisposable;
      this.handleEvents();
      return this.updateUI();
    };

    ShowTodoView.prototype.handleEvents = function() {
      this.configButton.on('click', function() {
        return atom.workspace.open('atom://config/packages/todo-show');
      });
      return this.closeButton.on('click', (function(_this) {
        return function() {
          return _this.parent().slideToggle();
        };
      })(this));
    };

    ShowTodoView.prototype.detach = function() {
      return this.disposables.dispose();
    };

    ShowTodoView.prototype.updateShowInTable = function() {
      var showInTable;
      showInTable = this.sortable.toArray();
      return atom.config.set('todo-show.showInTable', showInTable);
    };

    ShowTodoView.prototype.updateUI = function() {
      var Sortable, i, item, j, k, len, len1, len2, path, ref, ref1, ref2, regex, results, tableItems, todo, todos;
      tableItems = atom.config.get('todo-show.showInTable');
      ref = this.collection.getAvailableTableItems();
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        if (tableItems.indexOf(item) === -1) {
          this.itemsOffTable.append(new ItemView(item));
        } else {
          this.itemsOnTable.append(new ItemView(item));
        }
      }
      Sortable = require('sortablejs');
      this.sortable = Sortable.create(this.itemsOnTable.context, {
        group: 'tableItems',
        ghostClass: 'ghost',
        onSort: this.updateShowInTable
      });
      Sortable.create(this.itemsOffTable.context, {
        group: 'tableItems',
        ghostClass: 'ghost'
      });
      ref1 = todos = atom.config.get('todo-show.findTheseTodos');
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        todo = ref1[j];
        this.findTodoDiv.append(new CodeView(todo));
      }
      regex = atom.config.get('todo-show.findUsingRegex');
      this.findRegexDiv.append(new CodeView(regex.replace('${TODOS}', todos.join('|'))));
      ref2 = atom.config.get('todo-show.ignoreThesePaths');
      results = [];
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        path = ref2[k];
        results.push(this.ignorePathDiv.append(new CodeView(path)));
      }
      return results;
    };

    return ShowTodoView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG9sb2tvYmFuL0NvZGUvZ2l0aHViL2F0b20tY29uZmlnL3BhY2thZ2VzL3RvZG8tc2hvdy9saWIvdG9kby1vcHRpb25zLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyREFBQTtJQUFBOzs7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN2QixPQUFRLE9BQUEsQ0FBUSxzQkFBUjs7RUFFSDs7Ozs7OztJQUNKLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxJQUFEO2FBQ1IsSUFBQyxDQUFBLElBQUQsQ0FBTTtRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sbUJBQVA7UUFBNEIsU0FBQSxFQUFXLElBQXZDO09BQU4sRUFBbUQsSUFBbkQ7SUFEUTs7OztLQURXOztFQUlqQjs7Ozs7OztJQUNKLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxJQUFEO2FBQ1IsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOO0lBRFE7Ozs7S0FEVzs7RUFJdkIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozs7SUFDSixZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsTUFBQSxFQUFRLGFBQVI7UUFBdUIsQ0FBQSxLQUFBLENBQUEsRUFBTyxjQUE5QjtPQUFMLEVBQW1ELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNqRCxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO1dBQUwsRUFBc0IsU0FBQTtZQUNwQixLQUFDLENBQUEsRUFBRCxDQUFJLFVBQUo7bUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLE1BQUEsRUFBUSxjQUFSO2NBQXdCLENBQUEsS0FBQSxDQUFBLEVBQU8sc0JBQS9CO2FBQUw7VUFGb0IsQ0FBdEI7VUFJQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEs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WjNCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5jbGFzcyBJdGVtVmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IChpdGVtKSAtPlxuICAgIEBzcGFuIGNsYXNzOiAnYmFkZ2UgYmFkZ2UtbGFyZ2UnLCAnZGF0YS1pZCc6IGl0ZW0sIGl0ZW1cblxuY2xhc3MgQ29kZVZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAoaXRlbSkgLT5cbiAgICBAY29kZSBpdGVtXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFNob3dUb2RvVmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBvdXRsZXQ6ICd0b2RvT3B0aW9ucycsIGNsYXNzOiAndG9kby1vcHRpb25zJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdvcHRpb24nLCA9PlxuICAgICAgICBAaDIgJ09uIFRhYmxlJ1xuICAgICAgICBAZGl2IG91dGxldDogJ2l0ZW1zT25UYWJsZScsIGNsYXNzOiAnYmxvY2sgaXRlbXMtb24tdGFibGUnXG5cbiAgICAgIEBkaXYgY2xhc3M6ICdvcHRpb24nLCA9PlxuICAgICAgICBAaDIgJ09mZiBUYWJsZSdcbiAgICAgICAgQGRpdiBvdXRsZXQ6ICdpdGVtc09mZlRhYmxlJywgY2xhc3M6ICdibG9jayBpdGVtcy1vZmYtdGFibGUnXG5cbiAgICAgIEBkaXYgY2xhc3M6ICdvcHRpb24nLCA9PlxuICAgICAgICBAaDIgJ0ZpbmQgVG9kb3MnXG4gICAgICAgIEBkaXYgb3V0bGV0OiAnZmluZFRvZG9EaXYnXG5cbiAgICAgIEBkaXYgY2xhc3M6ICdvcHRpb24nLCA9PlxuICAgICAgICBAaDIgJ0ZpbmQgUmVnZXgnXG4gICAgICAgIEBkaXYgb3V0bGV0OiAnZmluZFJlZ2V4RGl2J1xuXG4gICAgICBAZGl2IGNsYXNzOiAnb3B0aW9uJywgPT5cbiAgICAgICAgQGgyICdJZ25vcmUgUGF0aHMnXG4gICAgICAgIEBkaXYgb3V0bGV0OiAnaWdub3JlUGF0aERpdidcblxuICAgICAgQGRpdiBjbGFzczogJ29wdGlvbicsID0+XG4gICAgICAgIEBoMiAnJ1xuICAgICAgICBAZGl2IGNsYXNzOiAnYnRuLWdyb3VwJywgPT5cbiAgICAgICAgICBAYnV0dG9uIG91dGxldDogJ2NvbmZpZ0J1dHRvbicsIGNsYXNzOiAnYnRuJywgXCJHbyB0byBDb25maWdcIlxuICAgICAgICAgIEBidXR0b24gb3V0bGV0OiAnY2xvc2VCdXR0b24nLCBjbGFzczogJ2J0bicsIFwiQ2xvc2UgT3B0aW9uc1wiXG5cbiAgaW5pdGlhbGl6ZTogKEBjb2xsZWN0aW9uKSAtPlxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGhhbmRsZUV2ZW50cygpXG4gICAgQHVwZGF0ZVVJKClcblxuICBoYW5kbGVFdmVudHM6IC0+XG4gICAgQGNvbmZpZ0J1dHRvbi5vbiAnY2xpY2snLCAtPlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbiAnYXRvbTovL2NvbmZpZy9wYWNrYWdlcy90b2RvLXNob3cnXG4gICAgQGNsb3NlQnV0dG9uLm9uICdjbGljaycsID0+IEBwYXJlbnQoKS5zbGlkZVRvZ2dsZSgpXG5cbiAgZGV0YWNoOiAtPlxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICB1cGRhdGVTaG93SW5UYWJsZTogPT5cbiAgICBzaG93SW5UYWJsZSA9IEBzb3J0YWJsZS50b0FycmF5KClcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ3RvZG8tc2hvdy5zaG93SW5UYWJsZScsIHNob3dJblRhYmxlKVxuXG4gIHVwZGF0ZVVJOiAtPlxuICAgIHRhYmxlSXRlbXMgPSBhdG9tLmNvbmZpZy5nZXQoJ3RvZG8tc2hvdy5zaG93SW5UYWJsZScpXG4gICAgZm9yIGl0ZW0gaW4gQGNvbGxlY3Rpb24uZ2V0QXZhaWxhYmxlVGFibGVJdGVtcygpXG4gICAgICBpZiB0YWJsZUl0ZW1zLmluZGV4T2YoaXRlbSkgaXMgLTFcbiAgICAgICAgQGl0ZW1zT2ZmVGFibGUuYXBwZW5kIG5ldyBJdGVtVmlldyhpdGVtKVxuICAgICAgZWxzZVxuICAgICAgICBAaXRlbXNPblRhYmxlLmFwcGVuZCBuZXcgSXRlbVZpZXcoaXRlbSlcblxuICAgIFNvcnRhYmxlID0gcmVxdWlyZSAnc29ydGFibGVqcydcblxuICAgIEBzb3J0YWJsZSA9IFNvcnRhYmxlLmNyZWF0ZShcbiAgICAgIEBpdGVtc09uVGFibGUuY29udGV4dFxuICAgICAgZ3JvdXA6ICd0YWJsZUl0ZW1zJ1xuICAgICAgZ2hvc3RDbGFzczogJ2dob3N0J1xuICAgICAgb25Tb3J0OiBAdXBkYXRlU2hvd0luVGFibGVcbiAgICApXG5cbiAgICBTb3J0YWJsZS5jcmVhdGUoXG4gICAgICBAaXRlbXNPZmZUYWJsZS5jb250ZXh0XG4gICAgICBncm91cDogJ3RhYmxlSXRlbXMnXG4gICAgICBnaG9zdENsYXNzOiAnZ2hvc3QnXG4gICAgKVxuXG4gICAgZm9yIHRvZG8gaW4gdG9kb3MgPSBhdG9tLmNvbmZpZy5nZXQoJ3RvZG8tc2hvdy5maW5kVGhlc2VUb2RvcycpXG4gICAgICBAZmluZFRvZG9EaXYuYXBwZW5kIG5ldyBDb2RlVmlldyh0b2RvKVxuXG4gICAgcmVnZXggPSBhdG9tLmNvbmZpZy5nZXQoJ3RvZG8tc2hvdy5maW5kVXNpbmdSZWdleCcpXG4gICAgQGZpbmRSZWdleERpdi5hcHBlbmQgbmV3IENvZGVWaWV3KHJlZ2V4LnJlcGxhY2UoJyR7VE9ET1N9JywgdG9kb3Muam9pbignfCcpKSlcblxuICAgIGZvciBwYXRoIGluIGF0b20uY29uZmlnLmdldCgndG9kby1zaG93Lmlnbm9yZVRoZXNlUGF0aHMnKVxuICAgICAgQGlnbm9yZVBhdGhEaXYuYXBwZW5kIG5ldyBDb2RlVmlldyhwYXRoKVxuIl19
