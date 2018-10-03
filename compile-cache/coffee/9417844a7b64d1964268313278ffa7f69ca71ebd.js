
/*
 * Open Terminal Here - Atom package
 * https://github.com/blueimp/atom-open-terminal-here
 *
 * Copyright 2015, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

(function() {
  var defaultCommand, filterProcessEnv, getActiveFilePath, getRootDir, open;

  getActiveFilePath = function() {
    var ref, ref1, ref2, ref3;
    return ((ref = document.querySelector('.tree-view .selected')) != null ? typeof ref.getPath === "function" ? ref.getPath() : void 0 : void 0) || ((ref1 = atom.workspace.getActivePaneItem()) != null ? (ref2 = ref1.buffer) != null ? (ref3 = ref2.file) != null ? ref3.path : void 0 : void 0 : void 0);
  };

  getRootDir = function() {
    var activeFilePath, defaultPath, dir, dirs, i, len, ref;
    dirs = atom.project.getDirectories();
    defaultPath = (ref = dirs[0]) != null ? ref.path : void 0;
    if (dirs.length < 2) {
      return defaultPath;
    }
    activeFilePath = getActiveFilePath();
    if (!activeFilePath) {
      return defaultPath;
    }
    for (i = 0, len = dirs.length; i < len; i++) {
      dir = dirs[i];
      if (activeFilePath.indexOf(dir.path + '/') === 0) {
        return dir.path;
      }
    }
    return defaultPath;
  };

  filterProcessEnv = function() {
    var env, key, ref, value;
    env = {};
    ref = process.env;
    for (key in ref) {
      value = ref[key];
      if (key !== 'NODE_PATH' && key !== 'NODE_ENV' && key !== 'GOOGLE_API_KEY' && key !== 'ATOM_HOME') {
        env[key] = value;
      }
    }
    return env;
  };

  open = function(filepath) {
    var command, dirpath, error, fs, isFile, message;
    if (!filepath) {
      dirpath = getRootDir();
    } else {
      fs = require('fs');
      try {
        isFile = fs.lstatSync(fs.realpathSync(filepath)).isFile();
      } catch (error1) {
        isFile = true;
      }
      if (isFile) {
        dirpath = require('path').dirname(filepath);
      } else {
        dirpath = filepath;
      }
    }
    if (!dirpath) {
      return;
    }
    command = atom.config.get('open-terminal-here.command');
    try {
      return require('child_process').exec(command, {
        cwd: dirpath,
        env: filterProcessEnv()
      });
    } catch (error1) {
      error = error1;
      if (error.code === 'EACCES') {
        message = 'Permission denied to open Terminal at ' + dirpath;
        return atom.notifications.addError(message, {
          dismissable: true
        });
      } else {
        throw error;
      }
    }
  };

  switch (require('os').platform()) {
    case 'darwin':
      defaultCommand = 'open -a Terminal.app "$PWD"';
      break;
    case 'win32':
      defaultCommand = 'start /D "%cd%" cmd';
      break;
    default:
      defaultCommand = 'x-terminal-emulator';
  }

  module.exports = {
    config: {
      command: {
        type: 'string',
        "default": defaultCommand
      }
    },
    activate: function() {
      atom.commands.add('.tree-view .selected, atom-text-editor, atom-workspace', {
        'open-terminal-here:open': function(event) {
          var base;
          event.stopImmediatePropagation();
          return open((typeof this.getPath === "function" ? this.getPath() : void 0) || (typeof this.getModel === "function" ? typeof (base = this.getModel()).getPath === "function" ? base.getPath() : void 0 : void 0) || getActiveFilePath());
        }
      });
      return atom.commands.add('atom-workspace', {
        'open-terminal-here:open-root': function(event) {
          event.stopImmediatePropagation();
          return open();
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG9sb2tvYmFuL0NvZGUvZ2l0aHViL2F0b20tY29uZmlnL3BhY2thZ2VzL29wZW4tdGVybWluYWwtaGVyZS9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7OztBQUFBO0FBQUEsTUFBQTs7RUFXQSxpQkFBQSxHQUFvQixTQUFBO0FBQ2xCLFFBQUE7b0hBQThDLENBQUUsNEJBQWhELDJIQUNrRCxDQUFFO0VBRmxDOztFQUlwQixVQUFBLEdBQWEsU0FBQTtBQUNYLFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQUE7SUFDUCxXQUFBLGdDQUFxQixDQUFFO0lBQ3ZCLElBQXNCLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBcEM7QUFBQSxhQUFPLFlBQVA7O0lBQ0EsY0FBQSxHQUFpQixpQkFBQSxDQUFBO0lBQ2pCLElBQXNCLENBQUksY0FBMUI7QUFBQSxhQUFPLFlBQVA7O0FBQ0EsU0FBQSxzQ0FBQTs7TUFDRSxJQUFtQixjQUFjLENBQUMsT0FBZixDQUF1QixHQUFHLENBQUMsSUFBSixHQUFXLEdBQWxDLENBQUEsS0FBMEMsQ0FBN0Q7QUFBQSxlQUFPLEdBQUcsQ0FBQyxLQUFYOztBQURGO1dBRUE7RUFSVzs7RUFVYixnQkFBQSxHQUFtQixTQUFBO0FBQ2pCLFFBQUE7SUFBQSxHQUFBLEdBQU07QUFDTjtBQUFBLFNBQUEsVUFBQTs7TUFDRSxJQUFvQixHQUFBLEtBRWxCLFdBRmtCLElBQUEsR0FBQSxLQUVMLFVBRkssSUFBQSxHQUFBLEtBRU8sZ0JBRlAsSUFBQSxHQUFBLEtBRXlCLFdBRjdDO1FBQUEsR0FBSSxDQUFBLEdBQUEsQ0FBSixHQUFXLE1BQVg7O0FBREY7V0FLQTtFQVBpQjs7RUFTbkIsSUFBQSxHQUFPLFNBQUMsUUFBRDtBQUNMLFFBQUE7SUFBQSxJQUFHLENBQUksUUFBUDtNQUNFLE9BQUEsR0FBVSxVQUFBLENBQUEsRUFEWjtLQUFBLE1BQUE7TUFHRSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7QUFDTDtRQUNFLE1BQUEsR0FBUyxFQUFFLENBQUMsU0FBSCxDQUFhLEVBQUUsQ0FBQyxZQUFILENBQWdCLFFBQWhCLENBQWIsQ0FBdUMsQ0FBQyxNQUF4QyxDQUFBLEVBRFg7T0FBQSxjQUFBO1FBR0UsTUFBQSxHQUFTLEtBSFg7O01BSUEsSUFBRyxNQUFIO1FBQ0UsT0FBQSxHQUFVLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQyxPQUFoQixDQUF3QixRQUF4QixFQURaO09BQUEsTUFBQTtRQUdFLE9BQUEsR0FBVSxTQUhaO09BUkY7O0lBWUEsSUFBVSxDQUFJLE9BQWQ7QUFBQSxhQUFBOztJQUNBLE9BQUEsR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCO0FBQ1Y7YUFDRSxPQUFBLENBQVEsZUFBUixDQUF3QixDQUFDLElBQXpCLENBQThCLE9BQTlCLEVBQXVDO1FBQUEsR0FBQSxFQUFLLE9BQUw7UUFBYyxHQUFBLEVBQUssZ0JBQUEsQ0FBQSxDQUFuQjtPQUF2QyxFQURGO0tBQUEsY0FBQTtNQUVNO01BQ0osSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLFFBQWpCO1FBQ0UsT0FBQSxHQUFVLHdDQUFBLEdBQTJDO2VBQ3JELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsT0FBNUIsRUFBcUM7VUFBQyxXQUFBLEVBQWEsSUFBZDtTQUFyQyxFQUZGO09BQUEsTUFBQTtBQUlFLGNBQU0sTUFKUjtPQUhGOztFQWZLOztBQXdCUCxVQUFPLE9BQUEsQ0FBUSxJQUFSLENBQWEsQ0FBQyxRQUFkLENBQUEsQ0FBUDtBQUFBLFNBQ08sUUFEUDtNQUVJLGNBQUEsR0FBaUI7QUFEZDtBQURQLFNBR08sT0FIUDtNQUlJLGNBQUEsR0FBaUI7QUFEZDtBQUhQO01BTUksY0FBQSxHQUFpQjtBQU5yQjs7RUFRQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsT0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLGNBRFQ7T0FERjtLQURGO0lBSUEsUUFBQSxFQUFVLFNBQUE7TUFDUixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isd0RBQWxCLEVBQ0U7UUFBQSx5QkFBQSxFQUEyQixTQUFDLEtBQUQ7QUFDekIsY0FBQTtVQUFBLEtBQUssQ0FBQyx3QkFBTixDQUFBO2lCQUNBLElBQUEsdUNBQUssSUFBQyxDQUFBLG1CQUFELHdHQUEyQixDQUFDLDRCQUE1QixJQUEwQyxpQkFBQSxDQUFBLENBQS9DO1FBRnlCLENBQTNCO09BREY7YUFJQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ0U7UUFBQSw4QkFBQSxFQUFnQyxTQUFDLEtBQUQ7VUFDOUIsS0FBSyxDQUFDLHdCQUFOLENBQUE7aUJBQ0EsSUFBQSxDQUFBO1FBRjhCLENBQWhDO09BREY7SUFMUSxDQUpWOztBQW5FRiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuICogT3BlbiBUZXJtaW5hbCBIZXJlIC0gQXRvbSBwYWNrYWdlXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYmx1ZWltcC9hdG9tLW9wZW4tdGVybWluYWwtaGVyZVxuICpcbiAqIENvcHlyaWdodCAyMDE1LCBTZWJhc3RpYW4gVHNjaGFuXG4gKiBodHRwczovL2JsdWVpbXAubmV0XG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogaHR0cHM6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiMjI1xuXG5nZXRBY3RpdmVGaWxlUGF0aCA9ICgpIC0+XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50cmVlLXZpZXcgLnNlbGVjdGVkJyk/LmdldFBhdGg/KCkgfHxcbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpPy5idWZmZXI/LmZpbGU/LnBhdGhcblxuZ2V0Um9vdERpciA9ICgpIC0+XG4gIGRpcnMgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxuICBkZWZhdWx0UGF0aCA9IGRpcnNbMF0/LnBhdGhcbiAgcmV0dXJuIGRlZmF1bHRQYXRoIGlmIGRpcnMubGVuZ3RoIDwgMlxuICBhY3RpdmVGaWxlUGF0aCA9IGdldEFjdGl2ZUZpbGVQYXRoKClcbiAgcmV0dXJuIGRlZmF1bHRQYXRoIGlmIG5vdCBhY3RpdmVGaWxlUGF0aFxuICBmb3IgZGlyIGluIGRpcnNcbiAgICByZXR1cm4gZGlyLnBhdGggaWYgYWN0aXZlRmlsZVBhdGguaW5kZXhPZihkaXIucGF0aCArICcvJykgaXMgMFxuICBkZWZhdWx0UGF0aFxuXG5maWx0ZXJQcm9jZXNzRW52ID0gKCkgLT5cbiAgZW52ID0ge31cbiAgZm9yIGtleSwgdmFsdWUgb2YgcHJvY2Vzcy5lbnZcbiAgICBlbnZba2V5XSA9IHZhbHVlIGlmIGtleSBub3QgaW4gW1xuICAgICAgIyBGaWx0ZXIgb3V0IGVudmlyb25tZW50IHZhcmlhYmxlcyBsZWFrZWQgYnkgdGhlIEF0b20gcHJvY2VzczpcbiAgICAgICdOT0RFX1BBVEgnLCAnTk9ERV9FTlYnLCAnR09PR0xFX0FQSV9LRVknLCAnQVRPTV9IT01FJ1xuICAgIF1cbiAgZW52XG5cbm9wZW4gPSAoZmlsZXBhdGgpIC0+XG4gIGlmIG5vdCBmaWxlcGF0aFxuICAgIGRpcnBhdGggPSBnZXRSb290RGlyKClcbiAgZWxzZVxuICAgIGZzID0gcmVxdWlyZSgnZnMnKVxuICAgIHRyeVxuICAgICAgaXNGaWxlID0gZnMubHN0YXRTeW5jKGZzLnJlYWxwYXRoU3luYyhmaWxlcGF0aCkpLmlzRmlsZSgpXG4gICAgY2F0Y2hcbiAgICAgIGlzRmlsZSA9IHRydWVcbiAgICBpZiBpc0ZpbGVcbiAgICAgIGRpcnBhdGggPSByZXF1aXJlKCdwYXRoJykuZGlybmFtZShmaWxlcGF0aClcbiAgICBlbHNlXG4gICAgICBkaXJwYXRoID0gZmlsZXBhdGhcbiAgcmV0dXJuIGlmIG5vdCBkaXJwYXRoXG4gIGNvbW1hbmQgPSBhdG9tLmNvbmZpZy5nZXQgJ29wZW4tdGVybWluYWwtaGVyZS5jb21tYW5kJ1xuICB0cnlcbiAgICByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuZXhlYyBjb21tYW5kLCBjd2Q6IGRpcnBhdGgsIGVudjogZmlsdGVyUHJvY2Vzc0VudigpXG4gIGNhdGNoIGVycm9yXG4gICAgaWYgZXJyb3IuY29kZSBpcyAnRUFDQ0VTJ1xuICAgICAgbWVzc2FnZSA9ICdQZXJtaXNzaW9uIGRlbmllZCB0byBvcGVuIFRlcm1pbmFsIGF0ICcgKyBkaXJwYXRoXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgbWVzc2FnZSwge2Rpc21pc3NhYmxlOiB0cnVlfVxuICAgIGVsc2VcbiAgICAgIHRocm93IGVycm9yXG5cbnN3aXRjaCByZXF1aXJlKCdvcycpLnBsYXRmb3JtKClcbiAgd2hlbiAnZGFyd2luJ1xuICAgIGRlZmF1bHRDb21tYW5kID0gJ29wZW4gLWEgVGVybWluYWwuYXBwIFwiJFBXRFwiJ1xuICB3aGVuICd3aW4zMidcbiAgICBkZWZhdWx0Q29tbWFuZCA9ICdzdGFydCAvRCBcIiVjZCVcIiBjbWQnXG4gIGVsc2VcbiAgICBkZWZhdWx0Q29tbWFuZCA9ICd4LXRlcm1pbmFsLWVtdWxhdG9yJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICBjb21tYW5kOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IGRlZmF1bHRDb21tYW5kXG4gIGFjdGl2YXRlOiAtPlxuICAgIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3IC5zZWxlY3RlZCwgYXRvbS10ZXh0LWVkaXRvciwgYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ29wZW4tdGVybWluYWwtaGVyZTpvcGVuJzogKGV2ZW50KSAtPlxuICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgICBvcGVuIEBnZXRQYXRoPygpIHx8IEBnZXRNb2RlbD8oKS5nZXRQYXRoPygpIHx8IGdldEFjdGl2ZUZpbGVQYXRoKClcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ29wZW4tdGVybWluYWwtaGVyZTpvcGVuLXJvb3QnOiAoZXZlbnQpIC0+XG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgIG9wZW4oKVxuIl19
