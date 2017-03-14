(function() {
  var TodoRegex;

  module.exports = TodoRegex = (function() {
    function TodoRegex(regex, todoList) {
      this.regex = regex;
      this.error = false;
      this.regexp = this.createRegexp(this.regex, todoList);
    }

    TodoRegex.prototype.makeRegexObj = function(regexStr) {
      var flags, pattern, ref, ref1;
      if (regexStr == null) {
        regexStr = '';
      }
      pattern = (ref = regexStr.match(/\/(.+)\//)) != null ? ref[1] : void 0;
      flags = (ref1 = regexStr.match(/\/(\w+$)/)) != null ? ref1[1] : void 0;
      if (!pattern) {
        this.error = true;
        return false;
      }
      return new RegExp(pattern, flags);
    };

    TodoRegex.prototype.createRegexp = function(regexStr, todoList) {
      if (!(Object.prototype.toString.call(todoList) === '[object Array]' && todoList.length > 0 && regexStr)) {
        this.error = true;
        return false;
      }
      return this.makeRegexObj(regexStr.replace('${TODOS}', todoList.join('|')));
    };

    return TodoRegex;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG9sb2tvYmFuL0NvZGUvZ2l0aHViL2F0b20tY29uZmlnL3BhY2thZ2VzL3RvZG8tc2hvdy9saWIvdG9kby1yZWdleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxtQkFBQyxLQUFELEVBQVMsUUFBVDtNQUFDLElBQUMsQ0FBQSxRQUFEO01BQ1osSUFBQyxDQUFBLEtBQUQsR0FBUztNQUNULElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsS0FBZixFQUFzQixRQUF0QjtJQUZDOzt3QkFJYixZQUFBLEdBQWMsU0FBQyxRQUFEO0FBRVosVUFBQTs7UUFGYSxXQUFXOztNQUV4QixPQUFBLG1EQUFzQyxDQUFBLENBQUE7TUFFdEMsS0FBQSxxREFBb0MsQ0FBQSxDQUFBO01BRXBDLElBQUEsQ0FBTyxPQUFQO1FBQ0UsSUFBQyxDQUFBLEtBQUQsR0FBUztBQUNULGVBQU8sTUFGVDs7YUFHSSxJQUFBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCLEtBQWhCO0lBVFE7O3dCQVdkLFlBQUEsR0FBYyxTQUFDLFFBQUQsRUFBVyxRQUFYO01BQ1osSUFBQSxDQUFBLENBQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBMUIsQ0FBK0IsUUFBL0IsQ0FBQSxLQUE0QyxnQkFBNUMsSUFDUCxRQUFRLENBQUMsTUFBVCxHQUFrQixDQURYLElBRVAsUUFGQSxDQUFBO1FBR0UsSUFBQyxDQUFBLEtBQUQsR0FBUztBQUNULGVBQU8sTUFKVDs7YUFLQSxJQUFDLENBQUEsWUFBRCxDQUFjLFFBQVEsQ0FBQyxPQUFULENBQWlCLFVBQWpCLEVBQTZCLFFBQVEsQ0FBQyxJQUFULENBQWMsR0FBZCxDQUE3QixDQUFkO0lBTlk7Ozs7O0FBakJoQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFRvZG9SZWdleFxuICBjb25zdHJ1Y3RvcjogKEByZWdleCwgdG9kb0xpc3QpIC0+XG4gICAgQGVycm9yID0gZmFsc2VcbiAgICBAcmVnZXhwID0gQGNyZWF0ZVJlZ2V4cChAcmVnZXgsIHRvZG9MaXN0KVxuXG4gIG1ha2VSZWdleE9iajogKHJlZ2V4U3RyID0gJycpIC0+XG4gICAgIyBFeHRyYWN0IHRoZSByZWdleCBwYXR0ZXJuIChhbnl0aGluZyBiZXR3ZWVuIHRoZSBzbGFzaGVzKVxuICAgIHBhdHRlcm4gPSByZWdleFN0ci5tYXRjaCgvXFwvKC4rKVxcLy8pP1sxXVxuICAgICMgRXh0cmFjdCB0aGUgZmxhZ3MgKGFmdGVyIGxhc3Qgc2xhc2gpXG4gICAgZmxhZ3MgPSByZWdleFN0ci5tYXRjaCgvXFwvKFxcdyskKS8pP1sxXVxuXG4gICAgdW5sZXNzIHBhdHRlcm5cbiAgICAgIEBlcnJvciA9IHRydWVcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIG5ldyBSZWdFeHAocGF0dGVybiwgZmxhZ3MpXG5cbiAgY3JlYXRlUmVnZXhwOiAocmVnZXhTdHIsIHRvZG9MaXN0KSAtPlxuICAgIHVubGVzcyBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodG9kb0xpc3QpIGlzICdbb2JqZWN0IEFycmF5XScgYW5kXG4gICAgdG9kb0xpc3QubGVuZ3RoID4gMCBhbmRcbiAgICByZWdleFN0clxuICAgICAgQGVycm9yID0gdHJ1ZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgQG1ha2VSZWdleE9iaihyZWdleFN0ci5yZXBsYWNlKCcke1RPRE9TfScsIHRvZG9MaXN0LmpvaW4oJ3wnKSkpXG4iXX0=
