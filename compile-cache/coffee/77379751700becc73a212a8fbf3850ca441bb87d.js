(function() {
  var TodosMarkdown;

  module.exports = TodosMarkdown = (function() {
    function TodosMarkdown() {
      this.showInTable = atom.config.get('todo-show.showInTable');
    }

    TodosMarkdown.prototype.getTable = function(todos) {
      var key, md, out, todo;
      md = "| " + (((function() {
        var i, len, ref, results;
        ref = this.showInTable;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          key = ref[i];
          results.push(key);
        }
        return results;
      }).call(this)).join(' | ')) + " |\n";
      md += "|" + (Array(md.length - 2).join('-')) + "|\n";
      return md + ((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = todos.length; i < len; i++) {
          todo = todos[i];
          out = '|' + todo.getMarkdownArray(this.showInTable).join(' |');
          results.push(out + " |\n");
        }
        return results;
      }).call(this)).join('');
    };

    TodosMarkdown.prototype.getList = function(todos) {
      var out, todo;
      return ((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = todos.length; i < len; i++) {
          todo = todos[i];
          out = '-' + todo.getMarkdownArray(this.showInTable).join('');
          if (out === '-') {
            out = "- No details";
          }
          results.push(out + "\n");
        }
        return results;
      }).call(this)).join('');
    };

    TodosMarkdown.prototype.markdown = function(todos) {
      if (atom.config.get('todo-show.exportAs') === 'Table') {
        return this.getTable(todos);
      } else {
        return this.getList(todos);
      }
    };

    return TodosMarkdown;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG9sb2tvYmFuL0NvZGUvZ2l0aHViL2F0b20tY29uZmlnL3BhY2thZ2VzL3RvZG8tc2hvdy9saWIvdG9kby1tYXJrZG93bi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyx1QkFBQTtNQUNYLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQjtJQURKOzs0QkFHYixRQUFBLEdBQVUsU0FBQyxLQUFEO0FBQ1IsVUFBQTtNQUFBLEVBQUEsR0FBTSxJQUFBLEdBQUksQ0FBQzs7QUFBQztBQUFBO2FBQUEscUNBQUE7O3VCQUE2QjtBQUE3Qjs7bUJBQUQsQ0FBa0MsQ0FBQyxJQUFuQyxDQUF3QyxLQUF4QyxDQUFELENBQUosR0FBb0Q7TUFDMUQsRUFBQSxJQUFNLEdBQUEsR0FBRyxDQUFDLEtBQUEsQ0FBTSxFQUFFLENBQUMsTUFBSCxHQUFVLENBQWhCLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsR0FBeEIsQ0FBRCxDQUFILEdBQWlDO2FBQ3ZDLEVBQUEsR0FBSzs7QUFBQzthQUFBLHVDQUFBOztVQUNKLEdBQUEsR0FBTSxHQUFBLEdBQU0sSUFBSSxDQUFDLGdCQUFMLENBQXNCLElBQUMsQ0FBQSxXQUF2QixDQUFtQyxDQUFDLElBQXBDLENBQXlDLElBQXpDO3VCQUNULEdBQUQsR0FBSztBQUZIOzttQkFBRCxDQUdKLENBQUMsSUFIRyxDQUdFLEVBSEY7SUFIRzs7NEJBUVYsT0FBQSxHQUFTLFNBQUMsS0FBRDtBQUNQLFVBQUE7YUFBQTs7QUFBQzthQUFBLHVDQUFBOztVQUNDLEdBQUEsR0FBTSxHQUFBLEdBQU0sSUFBSSxDQUFDLGdCQUFMLENBQXNCLElBQUMsQ0FBQSxXQUF2QixDQUFtQyxDQUFDLElBQXBDLENBQXlDLEVBQXpDO1VBQ1osSUFBd0IsR0FBQSxLQUFPLEdBQS9CO1lBQUEsR0FBQSxHQUFNLGVBQU47O3VCQUNHLEdBQUQsR0FBSztBQUhSOzttQkFBRCxDQUlDLENBQUMsSUFKRixDQUlPLEVBSlA7SUFETzs7NEJBT1QsUUFBQSxHQUFVLFNBQUMsS0FBRDtNQUNSLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixDQUFBLEtBQXlDLE9BQTVDO2VBQ0UsSUFBQyxDQUFBLFFBQUQsQ0FBVSxLQUFWLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFULEVBSEY7O0lBRFE7Ozs7O0FBcEJaIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVG9kb3NNYXJrZG93blxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAc2hvd0luVGFibGUgPSBhdG9tLmNvbmZpZy5nZXQoJ3RvZG8tc2hvdy5zaG93SW5UYWJsZScpXG5cbiAgZ2V0VGFibGU6ICh0b2RvcykgLT5cbiAgICBtZCA9ICBcInwgI3soZm9yIGtleSBpbiBAc2hvd0luVGFibGUgdGhlbiBrZXkpLmpvaW4oJyB8ICcpfSB8XFxuXCJcbiAgICBtZCArPSBcInwje0FycmF5KG1kLmxlbmd0aC0yKS5qb2luKCctJyl9fFxcblwiXG4gICAgbWQgKyAoZm9yIHRvZG8gaW4gdG9kb3NcbiAgICAgIG91dCA9ICd8JyArIHRvZG8uZ2V0TWFya2Rvd25BcnJheShAc2hvd0luVGFibGUpLmpvaW4oJyB8JylcbiAgICAgIFwiI3tvdXR9IHxcXG5cIlxuICAgICkuam9pbignJylcblxuICBnZXRMaXN0OiAodG9kb3MpIC0+XG4gICAgKGZvciB0b2RvIGluIHRvZG9zXG4gICAgICBvdXQgPSAnLScgKyB0b2RvLmdldE1hcmtkb3duQXJyYXkoQHNob3dJblRhYmxlKS5qb2luKCcnKVxuICAgICAgb3V0ID0gXCItIE5vIGRldGFpbHNcIiBpZiBvdXQgaXMgJy0nXG4gICAgICBcIiN7b3V0fVxcblwiXG4gICAgKS5qb2luKCcnKVxuXG4gIG1hcmtkb3duOiAodG9kb3MpIC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCd0b2RvLXNob3cuZXhwb3J0QXMnKSBpcyAnVGFibGUnXG4gICAgICBAZ2V0VGFibGUgdG9kb3NcbiAgICBlbHNlXG4gICAgICBAZ2V0TGlzdCB0b2Rvc1xuIl19
