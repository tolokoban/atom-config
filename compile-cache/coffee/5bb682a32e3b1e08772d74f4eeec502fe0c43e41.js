(function() {
  var Emitter, TodoModel, _, maxLength, path;

  path = require('path');

  Emitter = require('atom').Emitter;

  _ = require('underscore-plus');

  maxLength = 120;

  module.exports = TodoModel = (function() {
    function TodoModel(match, arg) {
      var plain;
      plain = (arg != null ? arg : []).plain;
      if (plain) {
        return _.extend(this, match);
      }
      this.handleScanMatch(match);
    }

    TodoModel.prototype.getAllKeys = function() {
      return atom.config.get('todo-show.showInTable') || ['Text'];
    };

    TodoModel.prototype.get = function(key) {
      var value;
      if (key == null) {
        key = '';
      }
      if ((value = this[key.toLowerCase()]) || value === '') {
        return value;
      }
      return this.text || 'No details';
    };

    TodoModel.prototype.getMarkdown = function(key) {
      var value;
      if (key == null) {
        key = '';
      }
      if (!(value = this[key.toLowerCase()])) {
        return '';
      }
      switch (key) {
        case 'All':
        case 'Text':
          return " " + value;
        case 'Type':
        case 'Project':
          return " __" + value + "__";
        case 'Range':
        case 'Line':
          return " _:" + value + "_";
        case 'Regex':
          return " _'" + value + "'_";
        case 'Path':
        case 'File':
          return " [" + value + "](" + value + ")";
        case 'Tags':
        case 'Id':
          return " _" + value + "_";
      }
    };

    TodoModel.prototype.getMarkdownArray = function(keys) {
      var i, key, len, ref, results;
      ref = keys || this.getAllKeys();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        results.push(this.getMarkdown(key));
      }
      return results;
    };

    TodoModel.prototype.keyIsNumber = function(key) {
      return key === 'Range' || key === 'Line';
    };

    TodoModel.prototype.contains = function(string) {
      var i, item, key, len, ref;
      if (string == null) {
        string = '';
      }
      ref = this.getAllKeys();
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        if (!(item = this.get(key))) {
          break;
        }
        if (item.toLowerCase().indexOf(string.toLowerCase()) !== -1) {
          return true;
        }
      }
      return false;
    };

    TodoModel.prototype.handleScanMatch = function(match) {
      var _matchText, loc, matchText, matches, pos, project, ref, ref1, ref2, ref3, relativePath, tag;
      matchText = match.text || match.all || '';
      if (matchText.length > ((ref = match.all) != null ? ref.length : void 0)) {
        match.all = matchText;
      }
      while ((_matchText = (ref1 = match.regexp) != null ? ref1.exec(matchText) : void 0)) {
        if (!match.type) {
          match.type = _matchText[1];
        }
        matchText = _matchText.pop();
      }
      if (matchText.indexOf('(') === 0) {
        if (matches = matchText.match(/\((.*?)\):?(.*)/)) {
          matchText = matches.pop();
          match.id = matches.pop();
        }
      }
      matchText = this.stripCommentEnd(matchText);
      match.tags = ((function() {
        var results;
        results = [];
        while ((tag = /\s*#([\w.|]+)[,.]?$/.exec(matchText))) {
          if (tag.length !== 2) {
            break;
          }
          matchText = matchText.slice(0, -tag.shift().length);
          results.push(tag.shift().trim().replace(/[\.,]\s*$/, ''));
        }
        return results;
      })()).sort().join(', ');
      if (!matchText && match.all && (pos = (ref2 = match.position) != null ? (ref3 = ref2[0]) != null ? ref3[1] : void 0 : void 0)) {
        matchText = match.all.substr(0, pos);
        matchText = this.stripCommentStart(matchText);
      }
      if (matchText.length >= maxLength) {
        matchText = (matchText.substr(0, maxLength - 3)) + "...";
      }
      if (!(match.position && match.position.length > 0)) {
        match.position = [[0, 0]];
      }
      if (match.position.serialize) {
        match.range = match.position.serialize().toString();
      } else {
        match.range = match.position.toString();
      }
      relativePath = atom.project.relativizePath(match.loc);
      if (relativePath[0] == null) {
        relativePath[0] = '';
      }
      match.path = relativePath[1] || '';
      if ((match.loc && (loc = path.basename(match.loc))) !== 'undefined') {
        match.file = loc;
      } else {
        match.file = 'untitled';
      }
      if ((project = path.basename(relativePath[0])) !== 'null') {
        match.project = project;
      } else {
        match.project = '';
      }
      match.text = matchText || "No details";
      match.line = (parseInt(match.range.split(',')[0]) + 1).toString();
      match.regex = match.regex.replace('${TODOS}', match.type);
      match.id = match.id || '';
      return _.extend(this, match);
    };

    TodoModel.prototype.stripCommentStart = function(text) {
      var startRegex;
      if (text == null) {
        text = '';
      }
      startRegex = /(\/\*|<\?|<!--|<#|{-|\[\[|\/\/|#)\s*$/;
      return text.replace(startRegex, '').trim();
    };

    TodoModel.prototype.stripCommentEnd = function(text) {
      var endRegex;
      if (text == null) {
        text = '';
      }
      endRegex = /(\*\/}?|\?>|-->|#>|-}|\]\])\s*$/;
      return text.replace(endRegex, '').trim();
    };

    return TodoModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG9sb2tvYmFuL0NvZGUvZ2l0aHViL2F0b20tY29uZmlnL3BhY2thZ2VzL3RvZG8tc2hvdy9saWIvdG9kby1tb2RlbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFTixVQUFXLE9BQUEsQ0FBUSxNQUFSOztFQUNaLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosU0FBQSxHQUFZOztFQUVaLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxtQkFBQyxLQUFELEVBQVEsR0FBUjtBQUNYLFVBQUE7TUFEb0IsdUJBQUQsTUFBVTtNQUM3QixJQUFnQyxLQUFoQztBQUFBLGVBQU8sQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQWUsS0FBZixFQUFQOztNQUNBLElBQUMsQ0FBQSxlQUFELENBQWlCLEtBQWpCO0lBRlc7O3dCQUliLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixDQUFBLElBQTRDLENBQUMsTUFBRDtJQURsQzs7d0JBR1osR0FBQSxHQUFLLFNBQUMsR0FBRDtBQUNILFVBQUE7O1FBREksTUFBTTs7TUFDVixJQUFnQixDQUFDLEtBQUEsR0FBUSxJQUFFLENBQUEsR0FBRyxDQUFDLFdBQUosQ0FBQSxDQUFBLENBQVgsQ0FBQSxJQUFrQyxLQUFBLEtBQVMsRUFBM0Q7QUFBQSxlQUFPLE1BQVA7O2FBQ0EsSUFBQyxDQUFBLElBQUQsSUFBUztJQUZOOzt3QkFJTCxXQUFBLEdBQWEsU0FBQyxHQUFEO0FBQ1gsVUFBQTs7UUFEWSxNQUFNOztNQUNsQixJQUFBLENBQWlCLENBQUEsS0FBQSxHQUFRLElBQUUsQ0FBQSxHQUFHLENBQUMsV0FBSixDQUFBLENBQUEsQ0FBVixDQUFqQjtBQUFBLGVBQU8sR0FBUDs7QUFDQSxjQUFPLEdBQVA7QUFBQSxhQUNPLEtBRFA7QUFBQSxhQUNjLE1BRGQ7aUJBQzBCLEdBQUEsR0FBSTtBQUQ5QixhQUVPLE1BRlA7QUFBQSxhQUVlLFNBRmY7aUJBRThCLEtBQUEsR0FBTSxLQUFOLEdBQVk7QUFGMUMsYUFHTyxPQUhQO0FBQUEsYUFHZ0IsTUFIaEI7aUJBRzRCLEtBQUEsR0FBTSxLQUFOLEdBQVk7QUFIeEMsYUFJTyxPQUpQO2lCQUlvQixLQUFBLEdBQU0sS0FBTixHQUFZO0FBSmhDLGFBS08sTUFMUDtBQUFBLGFBS2UsTUFMZjtpQkFLMkIsSUFBQSxHQUFLLEtBQUwsR0FBVyxJQUFYLEdBQWUsS0FBZixHQUFxQjtBQUxoRCxhQU1PLE1BTlA7QUFBQSxhQU1lLElBTmY7aUJBTXlCLElBQUEsR0FBSyxLQUFMLEdBQVc7QUFOcEM7SUFGVzs7d0JBVWIsZ0JBQUEsR0FBa0IsU0FBQyxJQUFEO0FBQ2hCLFVBQUE7QUFBQTtBQUFBO1dBQUEscUNBQUE7O3FCQUNFLElBQUMsQ0FBQSxXQUFELENBQWEsR0FBYjtBQURGOztJQURnQjs7d0JBSWxCLFdBQUEsR0FBYSxTQUFDLEdBQUQ7YUFDWCxHQUFBLEtBQVEsT0FBUixJQUFBLEdBQUEsS0FBaUI7SUFETjs7d0JBR2IsUUFBQSxHQUFVLFNBQUMsTUFBRDtBQUNSLFVBQUE7O1FBRFMsU0FBUzs7QUFDbEI7QUFBQSxXQUFBLHFDQUFBOztRQUNFLElBQUEsQ0FBYSxDQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRCxDQUFLLEdBQUwsQ0FBUCxDQUFiO0FBQUEsZ0JBQUE7O1FBQ0EsSUFBZSxJQUFJLENBQUMsV0FBTCxDQUFBLENBQWtCLENBQUMsT0FBbkIsQ0FBMkIsTUFBTSxDQUFDLFdBQVAsQ0FBQSxDQUEzQixDQUFBLEtBQXNELENBQUMsQ0FBdEU7QUFBQSxpQkFBTyxLQUFQOztBQUZGO2FBR0E7SUFKUTs7d0JBTVYsZUFBQSxHQUFpQixTQUFDLEtBQUQ7QUFDZixVQUFBO01BQUEsU0FBQSxHQUFZLEtBQUssQ0FBQyxJQUFOLElBQWMsS0FBSyxDQUFDLEdBQXBCLElBQTJCO01BQ3ZDLElBQUcsU0FBUyxDQUFDLE1BQVYsbUNBQTRCLENBQUUsZ0JBQWpDO1FBQ0UsS0FBSyxDQUFDLEdBQU4sR0FBWSxVQURkOztBQUtBLGFBQU0sQ0FBQyxVQUFBLHVDQUF5QixDQUFFLElBQWQsQ0FBbUIsU0FBbkIsVUFBZCxDQUFOO1FBRUUsSUFBQSxDQUFrQyxLQUFLLENBQUMsSUFBeEM7VUFBQSxLQUFLLENBQUMsSUFBTixHQUFhLFVBQVcsQ0FBQSxDQUFBLEVBQXhCOztRQUVBLFNBQUEsR0FBWSxVQUFVLENBQUMsR0FBWCxDQUFBO01BSmQ7TUFPQSxJQUFHLFNBQVMsQ0FBQyxPQUFWLENBQWtCLEdBQWxCLENBQUEsS0FBMEIsQ0FBN0I7UUFDRSxJQUFHLE9BQUEsR0FBVSxTQUFTLENBQUMsS0FBVixDQUFnQixpQkFBaEIsQ0FBYjtVQUNFLFNBQUEsR0FBWSxPQUFPLENBQUMsR0FBUixDQUFBO1VBQ1osS0FBSyxDQUFDLEVBQU4sR0FBVyxPQUFPLENBQUMsR0FBUixDQUFBLEVBRmI7U0FERjs7TUFLQSxTQUFBLEdBQVksSUFBQyxDQUFBLGVBQUQsQ0FBaUIsU0FBakI7TUFHWixLQUFLLENBQUMsSUFBTixHQUFhOztBQUFDO2VBQU0sQ0FBQyxHQUFBLEdBQU0scUJBQXFCLENBQUMsSUFBdEIsQ0FBMkIsU0FBM0IsQ0FBUCxDQUFOO1VBQ1osSUFBUyxHQUFHLENBQUMsTUFBSixLQUFnQixDQUF6QjtBQUFBLGtCQUFBOztVQUNBLFNBQUEsR0FBWSxTQUFTLENBQUMsS0FBVixDQUFnQixDQUFoQixFQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFKLENBQUEsQ0FBVyxDQUFDLE1BQWhDO3VCQUNaLEdBQUcsQ0FBQyxLQUFKLENBQUEsQ0FBVyxDQUFDLElBQVosQ0FBQSxDQUFrQixDQUFDLE9BQW5CLENBQTJCLFdBQTNCLEVBQXdDLEVBQXhDO1FBSFksQ0FBQTs7VUFBRCxDQUlaLENBQUMsSUFKVyxDQUFBLENBSUwsQ0FBQyxJQUpJLENBSUMsSUFKRDtNQU9iLElBQUcsQ0FBSSxTQUFKLElBQWtCLEtBQUssQ0FBQyxHQUF4QixJQUFnQyxDQUFBLEdBQUEsb0VBQTBCLENBQUEsQ0FBQSxtQkFBMUIsQ0FBbkM7UUFDRSxTQUFBLEdBQVksS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFWLENBQWlCLENBQWpCLEVBQW9CLEdBQXBCO1FBQ1osU0FBQSxHQUFZLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixTQUFuQixFQUZkOztNQUtBLElBQUcsU0FBUyxDQUFDLE1BQVYsSUFBb0IsU0FBdkI7UUFDRSxTQUFBLEdBQWMsQ0FBQyxTQUFTLENBQUMsTUFBVixDQUFpQixDQUFqQixFQUFvQixTQUFBLEdBQVksQ0FBaEMsQ0FBRCxDQUFBLEdBQW9DLE1BRHBEOztNQUlBLElBQUEsQ0FBQSxDQUFnQyxLQUFLLENBQUMsUUFBTixJQUFtQixLQUFLLENBQUMsUUFBUSxDQUFDLE1BQWYsR0FBd0IsQ0FBM0UsQ0FBQTtRQUFBLEtBQUssQ0FBQyxRQUFOLEdBQWlCLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQWpCOztNQUNBLElBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFsQjtRQUNFLEtBQUssQ0FBQyxLQUFOLEdBQWMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFmLENBQUEsQ0FBMEIsQ0FBQyxRQUEzQixDQUFBLEVBRGhCO09BQUEsTUFBQTtRQUdFLEtBQUssQ0FBQyxLQUFOLEdBQWMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFmLENBQUEsRUFIaEI7O01BTUEsWUFBQSxHQUFlLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUE0QixLQUFLLENBQUMsR0FBbEM7O1FBQ2YsWUFBYSxDQUFBLENBQUEsSUFBTTs7TUFDbkIsS0FBSyxDQUFDLElBQU4sR0FBYSxZQUFhLENBQUEsQ0FBQSxDQUFiLElBQW1CO01BRWhDLElBQUcsQ0FBQyxLQUFLLENBQUMsR0FBTixJQUFjLENBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxRQUFMLENBQWMsS0FBSyxDQUFDLEdBQXBCLENBQU4sQ0FBZixDQUFBLEtBQW9ELFdBQXZEO1FBQ0UsS0FBSyxDQUFDLElBQU4sR0FBYSxJQURmO09BQUEsTUFBQTtRQUdFLEtBQUssQ0FBQyxJQUFOLEdBQWEsV0FIZjs7TUFLQSxJQUFHLENBQUMsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFMLENBQWMsWUFBYSxDQUFBLENBQUEsQ0FBM0IsQ0FBWCxDQUFBLEtBQWdELE1BQW5EO1FBQ0UsS0FBSyxDQUFDLE9BQU4sR0FBZ0IsUUFEbEI7T0FBQSxNQUFBO1FBR0UsS0FBSyxDQUFDLE9BQU4sR0FBZ0IsR0FIbEI7O01BS0EsS0FBSyxDQUFDLElBQU4sR0FBYSxTQUFBLElBQWE7TUFDMUIsS0FBSyxDQUFDLElBQU4sR0FBYSxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQVosQ0FBa0IsR0FBbEIsQ0FBdUIsQ0FBQSxDQUFBLENBQWhDLENBQUEsR0FBc0MsQ0FBdkMsQ0FBeUMsQ0FBQyxRQUExQyxDQUFBO01BQ2IsS0FBSyxDQUFDLEtBQU4sR0FBYyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQVosQ0FBb0IsVUFBcEIsRUFBZ0MsS0FBSyxDQUFDLElBQXRDO01BQ2QsS0FBSyxDQUFDLEVBQU4sR0FBVyxLQUFLLENBQUMsRUFBTixJQUFZO2FBRXZCLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUFlLEtBQWY7SUFoRWU7O3dCQWtFakIsaUJBQUEsR0FBbUIsU0FBQyxJQUFEO0FBQ2pCLFVBQUE7O1FBRGtCLE9BQU87O01BQ3pCLFVBQUEsR0FBYTthQUNiLElBQUksQ0FBQyxPQUFMLENBQWEsVUFBYixFQUF5QixFQUF6QixDQUE0QixDQUFDLElBQTdCLENBQUE7SUFGaUI7O3dCQUluQixlQUFBLEdBQWlCLFNBQUMsSUFBRDtBQUNmLFVBQUE7O1FBRGdCLE9BQU87O01BQ3ZCLFFBQUEsR0FBVzthQUNYLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixFQUF1QixFQUF2QixDQUEwQixDQUFDLElBQTNCLENBQUE7SUFGZTs7Ozs7QUFqSG5CIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbntFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5tYXhMZW5ndGggPSAxMjBcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVG9kb01vZGVsXG4gIGNvbnN0cnVjdG9yOiAobWF0Y2gsIHtwbGFpbn0gPSBbXSkgLT5cbiAgICByZXR1cm4gXy5leHRlbmQodGhpcywgbWF0Y2gpIGlmIHBsYWluXG4gICAgQGhhbmRsZVNjYW5NYXRjaCBtYXRjaFxuXG4gIGdldEFsbEtleXM6IC0+XG4gICAgYXRvbS5jb25maWcuZ2V0KCd0b2RvLXNob3cuc2hvd0luVGFibGUnKSBvciBbJ1RleHQnXVxuXG4gIGdldDogKGtleSA9ICcnKSAtPlxuICAgIHJldHVybiB2YWx1ZSBpZiAodmFsdWUgPSBAW2tleS50b0xvd2VyQ2FzZSgpXSkgb3IgdmFsdWUgaXMgJydcbiAgICBAdGV4dCBvciAnTm8gZGV0YWlscydcblxuICBnZXRNYXJrZG93bjogKGtleSA9ICcnKSAtPlxuICAgIHJldHVybiAnJyB1bmxlc3MgdmFsdWUgPSBAW2tleS50b0xvd2VyQ2FzZSgpXVxuICAgIHN3aXRjaCBrZXlcbiAgICAgIHdoZW4gJ0FsbCcsICdUZXh0JyB0aGVuIFwiICN7dmFsdWV9XCJcbiAgICAgIHdoZW4gJ1R5cGUnLCAnUHJvamVjdCcgdGhlbiBcIiBfXyN7dmFsdWV9X19cIlxuICAgICAgd2hlbiAnUmFuZ2UnLCAnTGluZScgdGhlbiBcIiBfOiN7dmFsdWV9X1wiXG4gICAgICB3aGVuICdSZWdleCcgdGhlbiBcIiBfJyN7dmFsdWV9J19cIlxuICAgICAgd2hlbiAnUGF0aCcsICdGaWxlJyB0aGVuIFwiIFsje3ZhbHVlfV0oI3t2YWx1ZX0pXCJcbiAgICAgIHdoZW4gJ1RhZ3MnLCAnSWQnIHRoZW4gXCIgXyN7dmFsdWV9X1wiXG5cbiAgZ2V0TWFya2Rvd25BcnJheTogKGtleXMpIC0+XG4gICAgZm9yIGtleSBpbiBrZXlzIG9yIEBnZXRBbGxLZXlzKClcbiAgICAgIEBnZXRNYXJrZG93bihrZXkpXG5cbiAga2V5SXNOdW1iZXI6IChrZXkpIC0+XG4gICAga2V5IGluIFsnUmFuZ2UnLCAnTGluZSddXG5cbiAgY29udGFpbnM6IChzdHJpbmcgPSAnJykgLT5cbiAgICBmb3Iga2V5IGluIEBnZXRBbGxLZXlzKClcbiAgICAgIGJyZWFrIHVubGVzcyBpdGVtID0gQGdldChrZXkpXG4gICAgICByZXR1cm4gdHJ1ZSBpZiBpdGVtLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzdHJpbmcudG9Mb3dlckNhc2UoKSkgaXNudCAtMVxuICAgIGZhbHNlXG5cbiAgaGFuZGxlU2Nhbk1hdGNoOiAobWF0Y2gpIC0+XG4gICAgbWF0Y2hUZXh0ID0gbWF0Y2gudGV4dCBvciBtYXRjaC5hbGwgb3IgJydcbiAgICBpZiBtYXRjaFRleHQubGVuZ3RoID4gbWF0Y2guYWxsPy5sZW5ndGhcbiAgICAgIG1hdGNoLmFsbCA9IG1hdGNoVGV4dFxuXG4gICAgIyBTdHJpcCBvdXQgdGhlIHJlZ2V4IHRva2VuIGZyb20gdGhlIGZvdW5kIGFubm90YXRpb25cbiAgICAjIG5vdCBhbGwgb2JqZWN0cyB3aWxsIGhhdmUgYW4gZXhlYyBtYXRjaFxuICAgIHdoaWxlIChfbWF0Y2hUZXh0ID0gbWF0Y2gucmVnZXhwPy5leGVjKG1hdGNoVGV4dCkpXG4gICAgICAjIEZpbmQgbWF0Y2ggdHlwZVxuICAgICAgbWF0Y2gudHlwZSA9IF9tYXRjaFRleHRbMV0gdW5sZXNzIG1hdGNoLnR5cGVcbiAgICAgICMgRXh0cmFjdCB0b2RvIHRleHRcbiAgICAgIG1hdGNoVGV4dCA9IF9tYXRjaFRleHQucG9wKClcblxuICAgICMgRXh0cmFjdCBnb29nbGUgc3R5bGUgZ3VpZGUgdG9kbyBpZFxuICAgIGlmIG1hdGNoVGV4dC5pbmRleE9mKCcoJykgaXMgMFxuICAgICAgaWYgbWF0Y2hlcyA9IG1hdGNoVGV4dC5tYXRjaCgvXFwoKC4qPylcXCk6PyguKikvKVxuICAgICAgICBtYXRjaFRleHQgPSBtYXRjaGVzLnBvcCgpXG4gICAgICAgIG1hdGNoLmlkID0gbWF0Y2hlcy5wb3AoKVxuXG4gICAgbWF0Y2hUZXh0ID0gQHN0cmlwQ29tbWVudEVuZChtYXRjaFRleHQpXG5cbiAgICAjIEV4dHJhY3QgdG9kbyB0YWdzXG4gICAgbWF0Y2gudGFncyA9ICh3aGlsZSAodGFnID0gL1xccyojKFtcXHcufF0rKVssLl0/JC8uZXhlYyhtYXRjaFRleHQpKVxuICAgICAgYnJlYWsgaWYgdGFnLmxlbmd0aCBpc250IDJcbiAgICAgIG1hdGNoVGV4dCA9IG1hdGNoVGV4dC5zbGljZSgwLCAtdGFnLnNoaWZ0KCkubGVuZ3RoKVxuICAgICAgdGFnLnNoaWZ0KCkudHJpbSgpLnJlcGxhY2UoL1tcXC4sXVxccyokLywgJycpXG4gICAgKS5zb3J0KCkuam9pbignLCAnKVxuXG4gICAgIyBVc2UgdGV4dCBiZWZvcmUgdG9kbyBpZiBubyBjb250ZW50IGFmdGVyXG4gICAgaWYgbm90IG1hdGNoVGV4dCBhbmQgbWF0Y2guYWxsIGFuZCBwb3MgPSBtYXRjaC5wb3NpdGlvbj9bMF0/WzFdXG4gICAgICBtYXRjaFRleHQgPSBtYXRjaC5hbGwuc3Vic3RyKDAsIHBvcylcbiAgICAgIG1hdGNoVGV4dCA9IEBzdHJpcENvbW1lbnRTdGFydChtYXRjaFRleHQpXG5cbiAgICAjIFRydW5jYXRlIGxvbmcgbWF0Y2ggc3RyaW5nc1xuICAgIGlmIG1hdGNoVGV4dC5sZW5ndGggPj0gbWF4TGVuZ3RoXG4gICAgICBtYXRjaFRleHQgPSBcIiN7bWF0Y2hUZXh0LnN1YnN0cigwLCBtYXhMZW5ndGggLSAzKX0uLi5cIlxuXG4gICAgIyBNYWtlIHN1cmUgcmFuZ2UgaXMgc2VyaWFsaXplZCB0byBwcm9kdWNlIGNvcnJlY3QgcmVuZGVyZWQgZm9ybWF0XG4gICAgbWF0Y2gucG9zaXRpb24gPSBbWzAsMF1dIHVubGVzcyBtYXRjaC5wb3NpdGlvbiBhbmQgbWF0Y2gucG9zaXRpb24ubGVuZ3RoID4gMFxuICAgIGlmIG1hdGNoLnBvc2l0aW9uLnNlcmlhbGl6ZVxuICAgICAgbWF0Y2gucmFuZ2UgPSBtYXRjaC5wb3NpdGlvbi5zZXJpYWxpemUoKS50b1N0cmluZygpXG4gICAgZWxzZVxuICAgICAgbWF0Y2gucmFuZ2UgPSBtYXRjaC5wb3NpdGlvbi50b1N0cmluZygpXG5cbiAgICAjIEV4dHJhY3QgcGF0aHMgYW5kIHByb2plY3RcbiAgICByZWxhdGl2ZVBhdGggPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgobWF0Y2gubG9jKVxuICAgIHJlbGF0aXZlUGF0aFswXSA/PSAnJ1xuICAgIG1hdGNoLnBhdGggPSByZWxhdGl2ZVBhdGhbMV0gb3IgJydcblxuICAgIGlmIChtYXRjaC5sb2MgYW5kIGxvYyA9IHBhdGguYmFzZW5hbWUobWF0Y2gubG9jKSkgaXNudCAndW5kZWZpbmVkJ1xuICAgICAgbWF0Y2guZmlsZSA9IGxvY1xuICAgIGVsc2VcbiAgICAgIG1hdGNoLmZpbGUgPSAndW50aXRsZWQnXG5cbiAgICBpZiAocHJvamVjdCA9IHBhdGguYmFzZW5hbWUocmVsYXRpdmVQYXRoWzBdKSkgaXNudCAnbnVsbCdcbiAgICAgIG1hdGNoLnByb2plY3QgPSBwcm9qZWN0XG4gICAgZWxzZVxuICAgICAgbWF0Y2gucHJvamVjdCA9ICcnXG5cbiAgICBtYXRjaC50ZXh0ID0gbWF0Y2hUZXh0IG9yIFwiTm8gZGV0YWlsc1wiXG4gICAgbWF0Y2gubGluZSA9IChwYXJzZUludChtYXRjaC5yYW5nZS5zcGxpdCgnLCcpWzBdKSArIDEpLnRvU3RyaW5nKClcbiAgICBtYXRjaC5yZWdleCA9IG1hdGNoLnJlZ2V4LnJlcGxhY2UoJyR7VE9ET1N9JywgbWF0Y2gudHlwZSlcbiAgICBtYXRjaC5pZCA9IG1hdGNoLmlkIG9yICcnXG5cbiAgICBfLmV4dGVuZCh0aGlzLCBtYXRjaClcblxuICBzdHJpcENvbW1lbnRTdGFydDogKHRleHQgPSAnJykgLT5cbiAgICBzdGFydFJlZ2V4ID0gLyhcXC9cXCp8PFxcP3w8IS0tfDwjfHstfFxcW1xcW3xcXC9cXC98IylcXHMqJC9cbiAgICB0ZXh0LnJlcGxhY2Uoc3RhcnRSZWdleCwgJycpLnRyaW0oKVxuXG4gIHN0cmlwQ29tbWVudEVuZDogKHRleHQgPSAnJykgLT5cbiAgICBlbmRSZWdleCA9IC8oXFwqXFwvfT98XFw/PnwtLT58Iz58LX18XFxdXFxdKVxccyokL1xuICAgIHRleHQucmVwbGFjZShlbmRSZWdleCwgJycpLnRyaW0oKVxuIl19
