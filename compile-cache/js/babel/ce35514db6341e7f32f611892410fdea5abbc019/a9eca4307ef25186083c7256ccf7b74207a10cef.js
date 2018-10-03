function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

/* eslint-disable import/extensions, import/no-extraneous-dependencies */

var _atom = require('atom');

/* eslint-enable import/extensions, import/no-extraneous-dependencies */

// Dependencies
'use babel';

var helpers = undefined;
var atomlinter = undefined;
var minimatch = undefined;
var Reporter = undefined;

function loadDeps() {
  if (!helpers) {
    helpers = require('./helpers');
  }
  if (!atomlinter) {
    atomlinter = require('atom-linter');
  }
  if (!minimatch) {
    minimatch = require('minimatch');
  }
  if (!Reporter) {
    Reporter = require('jshint-json');
  }
}

module.exports = {
  activate: function activate() {
    var _this = this;

    this.idleCallbacks = new Set();
    var depsCallbackID = undefined;
    var installLinterJSHintDeps = function installLinterJSHintDeps() {
      _this.idleCallbacks['delete'](depsCallbackID);
      if (!atom.inSpecMode()) {
        require('atom-package-deps').install('linter-jshint');
      }
      loadDeps();
    };
    depsCallbackID = window.requestIdleCallback(installLinterJSHintDeps);
    this.idleCallbacks.add(depsCallbackID);

    this.scopes = [];

    this.subscriptions = new _atom.CompositeDisposable();
    var scopeEmbedded = 'source.js.embedded.html';

    this.subscriptions.add(atom.config.observe('linter-jshint.executablePath', function (value) {
      if (value === '') {
        _this.executablePath = _path2['default'].join(__dirname, '..', 'node_modules', 'jshint', 'bin', 'jshint');
      } else {
        _this.executablePath = value;
      }
    }), atom.config.observe('linter-jshint.disableWhenNoJshintrcFileInPath', function (value) {
      _this.disableWhenNoJshintrcFileInPath = value;
    }), atom.config.observe('linter-jshint.jshintFileName', function (value) {
      _this.jshintFileName = value;
    }), atom.config.observe('linter-jshint.jshintignoreFilename', function (value) {
      _this.jshintignoreFilename = value;
    }), atom.config.observe('linter-jshint.lintInlineJavaScript', function (value) {
      _this.lintInlineJavaScript = value;
      if (value) {
        _this.scopes.push(scopeEmbedded);
      } else if (_this.scopes.indexOf(scopeEmbedded) !== -1) {
        _this.scopes.splice(_this.scopes.indexOf(scopeEmbedded), 1);
      }
    }));
    // NOTE: Separating this out from the others to ensure lintInlineJavaScript is set
    this.subscriptions.add(atom.config.observe('linter-jshint.scopes', function (value) {
      // Remove any old scopes
      _this.scopes.splice(0, _this.scopes.length);
      // Add the current scopes
      Array.prototype.push.apply(_this.scopes, value);
      // Re-check the embedded JS scope
      if (_this.lintInlineJavaScript && _this.scopes.indexOf(scopeEmbedded) !== -1) {
        _this.scopes.push(scopeEmbedded);
      }
    }));

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'linter-jshint:debug': _asyncToGenerator(function* () {
        loadDeps();
        var debugString = yield helpers.generateDebugString();
        var notificationOptions = { detail: debugString, dismissable: true };
        atom.notifications.addInfo('linter-jshint:: Debugging information', notificationOptions);
      })
    }));
  },

  deactivate: function deactivate() {
    this.idleCallbacks.forEach(function (callbackID) {
      return window.cancelIdleCallback(callbackID);
    });
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    return {
      name: 'JSHint',
      grammarScopes: this.scopes,
      scope: 'file',
      lintsOnChange: true,
      lint: _asyncToGenerator(function* (textEditor) {
        var results = [];
        var filePath = textEditor.getPath();
        var fileDir = _path2['default'].dirname(filePath);
        var fileContents = textEditor.getText();
        loadDeps();
        var parameters = ['--reporter', Reporter, '--filename', filePath];

        var configFile = yield atomlinter.findCachedAsync(fileDir, _this2.jshintFileName);

        if (configFile) {
          if (_this2.jshintFileName !== '.jshintrc') {
            parameters.push('--config', configFile);
          }
        } else if (_this2.disableWhenNoJshintrcFileInPath && !(yield helpers.hasHomeConfig())) {
          return results;
        }

        var ignoreFile = yield atomlinter.findCachedAsync(fileDir, _this2.jshintignoreFilename);

        if (ignoreFile) {
          // JSHint completely ignores .jshintignore files for STDIN on it's own
          // so we must re-implement the functionality
          var ignoreList = yield helpers.readIgnoreList(ignoreFile);
          if (ignoreList.some(function (pattern) {
            return minimatch(filePath, pattern);
          })) {
            // The file is ignored by one of the patterns
            return [];
          }
        }

        if (_this2.lintInlineJavaScript && textEditor.getGrammar().scopeName.indexOf('text.html') !== -1) {
          parameters.push('--extract', 'always');
        }
        parameters.push('-');

        var execOpts = {
          stdin: fileContents,
          ignoreExitCode: true,
          cwd: fileDir
        };
        var result = yield atomlinter.execNode(_this2.executablePath, parameters, execOpts);

        if (textEditor.getText() !== fileContents) {
          // File has changed since the lint was triggered, tell Linter not to update
          return null;
        }

        var parsed = undefined;
        try {
          parsed = JSON.parse(result);
        } catch (_) {
          // eslint-disable-next-line no-console
          console.error('[Linter-JSHint]', _, result);
          atom.notifications.addWarning('[Linter-JSHint]', { detail: 'JSHint return an invalid response, check your console for more info' });
          return results;
        }

        Object.keys(parsed.result).forEach(_asyncToGenerator(function* (entryID) {
          var message = undefined;
          var entry = parsed.result[entryID];

          var error = entry.error;
          var errorType = error.code.substr(0, 1);
          var severity = 'info';
          if (errorType === 'E') {
            severity = 'error';
          } else if (errorType === 'W') {
            severity = 'warning';
          }
          var line = error.line > 0 ? error.line - 1 : 0;
          var character = error.character > 0 ? error.character - 1 : 0;
          try {
            var position = atomlinter.generateRange(textEditor, line, character);
            message = {
              severity: severity,
              excerpt: error.code + ' - ' + error.reason,
              location: {
                file: filePath,
                position: position
              }
            };
          } catch (e) {
            message = yield helpers.generateInvalidTrace(line, character, filePath, textEditor, error);
          }

          results.push(message);
        }));
        return results;
      })
    };
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RvbG9rb2Jhbi9Db2RlL2dpdGh1Yi9hdG9tLWNvbmZpZy9wYWNrYWdlcy9saW50ZXItanNoaW50L2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBSWlCLE1BQU07Ozs7OztvQkFFYSxNQUFNOzs7OztBQU4xQyxXQUFXLENBQUM7O0FBV1osSUFBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLElBQUksVUFBVSxZQUFBLENBQUM7QUFDZixJQUFJLFNBQVMsWUFBQSxDQUFDO0FBQ2QsSUFBSSxRQUFRLFlBQUEsQ0FBQzs7QUFFYixTQUFTLFFBQVEsR0FBRztBQUNsQixNQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1osV0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUNoQztBQUNELE1BQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixjQUFVLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0dBQ3JDO0FBQ0QsTUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNkLGFBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7R0FDbEM7QUFDRCxNQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsWUFBUSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztHQUNuQztDQUNGOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQUEsb0JBQUc7OztBQUNULFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMvQixRQUFJLGNBQWMsWUFBQSxDQUFDO0FBQ25CLFFBQU0sdUJBQXVCLEdBQUcsU0FBMUIsdUJBQXVCLEdBQVM7QUFDcEMsWUFBSyxhQUFhLFVBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO0FBQ3RCLGVBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztPQUN2RDtBQUNE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QUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hFLGNBQUk7QUFDRixnQkFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZFLG1CQUFPLEdBQUc7QUFDUixzQkFBUSxFQUFSLFFBQVE7QUFDUixxQkFBTyxFQUFLLEtBQUssQ0FBQyxJQUFJLFdBQU0sS0FBSyxDQUFDLE1BQU0sQUFBRTtBQUMxQyxzQkFBUSxFQUFFO0FBQ1Isb0JBQUksRUFBRSxRQUFRO0FBQ2Qsd0JBQVEsRUFBUixRQUFRO2VBQ1Q7YUFDRixDQUFDO1dBQ0gsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLG1CQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsb0JBQW9CLENBQzFDLElBQUksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztXQUNqRDs7QUFFRCxpQkFBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN2QixFQUFDLENBQUM7QUFDSCxlQUFPLE9BQU8sQ0FBQztPQUNoQixDQUFBO0tBQ0YsQ0FBQztHQUNIO0NBQ0YsQ0FBQyIsImZpbGUiOiIvaG9tZS90b2xva29iYW4vQ29kZS9naXRodWIvYXRvbS1jb25maWcvcGFja2FnZXMvbGludGVyLWpzaGludC9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vKiBAZmxvdyAqL1xuXG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJztcbi8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9leHRlbnNpb25zLCBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXMgKi9cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcbmltcG9ydCB0eXBlIHsgVGV4dEVkaXRvciB9IGZyb20gJ2F0b20nO1xuLyogZXNsaW50LWVuYWJsZSBpbXBvcnQvZXh0ZW5zaW9ucywgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzICovXG5cbi8vIERlcGVuZGVuY2llc1xubGV0IGhlbHBlcnM7XG5sZXQgYXRvbWxpbnRlcjtcbmxldCBtaW5pbWF0Y2g7XG5sZXQgUmVwb3J0ZXI7XG5cbmZ1bmN0aW9uIGxvYWREZXBzKCkge1xuICBpZiAoIWhlbHBlcnMpIHtcbiAgICBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG4gIH1cbiAgaWYgKCFhdG9tbGludGVyKSB7XG4gICAgYXRvbWxpbnRlciA9IHJlcXVpcmUoJ2F0b20tbGludGVyJyk7XG4gIH1cbiAgaWYgKCFtaW5pbWF0Y2gpIHtcbiAgICBtaW5pbWF0Y2ggPSByZXF1aXJlKCdtaW5pbWF0Y2gnKTtcbiAgfVxuICBpZiAoIVJlcG9ydGVyKSB7XG4gICAgUmVwb3J0ZXIgPSByZXF1aXJlKCdqc2hpbnQtanNvbicpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MgPSBuZXcgU2V0KCk7XG4gICAgbGV0IGRlcHNDYWxsYmFja0lEO1xuICAgIGNvbnN0IGluc3RhbGxMaW50ZXJKU0hpbnREZXBzID0gKCkgPT4ge1xuICAgICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmRlbGV0ZShkZXBzQ2FsbGJhY2tJRCk7XG4gICAgICBpZiAoIWF0b20uaW5TcGVjTW9kZSgpKSB7XG4gICAgICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbGludGVyLWpzaGludCcpO1xuICAgICAgfVxuICAgICAgbG9hZERlcHMoKTtcbiAgICB9O1xuICAgIGRlcHNDYWxsYmFja0lEID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2soaW5zdGFsbExpbnRlckpTSGludERlcHMpO1xuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5hZGQoZGVwc0NhbGxiYWNrSUQpO1xuXG4gICAgdGhpcy5zY29wZXMgPSBbXTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgY29uc3Qgc2NvcGVFbWJlZGRlZCA9ICdzb3VyY2UuanMuZW1iZWRkZWQuaHRtbCc7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWpzaGludC5leGVjdXRhYmxlUGF0aCcsICh2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgdGhpcy5leGVjdXRhYmxlUGF0aCA9IFBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICdub2RlX21vZHVsZXMnLCAnanNoaW50JywgJ2JpbicsICdqc2hpbnQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmV4ZWN1dGFibGVQYXRoID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWpzaGludC5kaXNhYmxlV2hlbk5vSnNoaW50cmNGaWxlSW5QYXRoJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuZGlzYWJsZVdoZW5Ob0pzaGludHJjRmlsZUluUGF0aCA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItanNoaW50LmpzaGludEZpbGVOYW1lJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuanNoaW50RmlsZU5hbWUgPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWpzaGludC5qc2hpbnRpZ25vcmVGaWxlbmFtZScsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmpzaGludGlnbm9yZUZpbGVuYW1lID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1qc2hpbnQubGludElubGluZUphdmFTY3JpcHQnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5saW50SW5saW5lSmF2YVNjcmlwdCA9IHZhbHVlO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICB0aGlzLnNjb3Blcy5wdXNoKHNjb3BlRW1iZWRkZWQpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2NvcGVzLmluZGV4T2Yoc2NvcGVFbWJlZGRlZCkgIT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5zY29wZXMuc3BsaWNlKHRoaXMuc2NvcGVzLmluZGV4T2Yoc2NvcGVFbWJlZGRlZCksIDEpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuICAgIC8vIE5PVEU6IFNlcGFyYXRpbmcgdGhpcyBvdXQgZnJvbSB0aGUgb3RoZXJzIHRvIGVuc3VyZSBsaW50SW5saW5lSmF2YVNjcmlwdCBpcyBzZXRcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWpzaGludC5zY29wZXMnLCAodmFsdWUpID0+IHtcbiAgICAgICAgLy8gUmVtb3ZlIGFueSBvbGQgc2NvcGVzXG4gICAgICAgIHRoaXMuc2NvcGVzLnNwbGljZSgwLCB0aGlzLnNjb3Blcy5sZW5ndGgpO1xuICAgICAgICAvLyBBZGQgdGhlIGN1cnJlbnQgc2NvcGVzXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMuc2NvcGVzLCB2YWx1ZSk7XG4gICAgICAgIC8vIFJlLWNoZWNrIHRoZSBlbWJlZGRlZCBKUyBzY29wZVxuICAgICAgICBpZiAodGhpcy5saW50SW5saW5lSmF2YVNjcmlwdCAmJiB0aGlzLnNjb3Blcy5pbmRleE9mKHNjb3BlRW1iZWRkZWQpICE9PSAtMSkge1xuICAgICAgICAgIHRoaXMuc2NvcGVzLnB1c2goc2NvcGVFbWJlZGRlZCk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICk7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAgICdsaW50ZXItanNoaW50OmRlYnVnJzogYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGxvYWREZXBzKCk7XG4gICAgICAgICAgY29uc3QgZGVidWdTdHJpbmcgPSBhd2FpdCBoZWxwZXJzLmdlbmVyYXRlRGVidWdTdHJpbmcoKTtcbiAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25PcHRpb25zID0geyBkZXRhaWw6IGRlYnVnU3RyaW5nLCBkaXNtaXNzYWJsZTogdHJ1ZSB9O1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdsaW50ZXItanNoaW50OjogRGVidWdnaW5nIGluZm9ybWF0aW9uJywgbm90aWZpY2F0aW9uT3B0aW9ucyk7XG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICApO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmZvckVhY2goY2FsbGJhY2tJRCA9PiB3aW5kb3cuY2FuY2VsSWRsZUNhbGxiYWNrKGNhbGxiYWNrSUQpKTtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MuY2xlYXIoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9LFxuXG4gIHByb3ZpZGVMaW50ZXIoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdKU0hpbnQnLFxuICAgICAgZ3JhbW1hclNjb3BlczogdGhpcy5zY29wZXMsXG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgbGludHNPbkNoYW5nZTogdHJ1ZSxcbiAgICAgIGxpbnQ6IGFzeW5jICh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICAgICAgY29uc3QgZmlsZURpciA9IFBhdGguZGlybmFtZShmaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IGZpbGVDb250ZW50cyA9IHRleHRFZGl0b3IuZ2V0VGV4dCgpO1xuICAgICAgICBsb2FkRGVwcygpO1xuICAgICAgICBjb25zdCBwYXJhbWV0ZXJzID0gWyctLXJlcG9ydGVyJywgUmVwb3J0ZXIsICctLWZpbGVuYW1lJywgZmlsZVBhdGhdO1xuXG4gICAgICAgIGNvbnN0IGNvbmZpZ0ZpbGUgPSBhd2FpdCBhdG9tbGludGVyLmZpbmRDYWNoZWRBc3luYyhmaWxlRGlyLCB0aGlzLmpzaGludEZpbGVOYW1lKTtcblxuICAgICAgICBpZiAoY29uZmlnRmlsZSkge1xuICAgICAgICAgIGlmICh0aGlzLmpzaGludEZpbGVOYW1lICE9PSAnLmpzaGludHJjJykge1xuICAgICAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctLWNvbmZpZycsIGNvbmZpZ0ZpbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRpc2FibGVXaGVuTm9Kc2hpbnRyY0ZpbGVJblBhdGggJiYgIShhd2FpdCBoZWxwZXJzLmhhc0hvbWVDb25maWcoKSkpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlnbm9yZUZpbGUgPSBhd2FpdCBhdG9tbGludGVyLmZpbmRDYWNoZWRBc3luYyhmaWxlRGlyLCB0aGlzLmpzaGludGlnbm9yZUZpbGVuYW1lKTtcblxuICAgICAgICBpZiAoaWdub3JlRmlsZSkge1xuICAgICAgICAgIC8vIEpTSGludCBjb21wbGV0ZWx5IGlnbm9yZXMgLmpzaGludGlnbm9yZSBmaWxlcyBmb3IgU1RESU4gb24gaXQncyBvd25cbiAgICAgICAgICAvLyBzbyB3ZSBtdXN0IHJlLWltcGxlbWVudCB0aGUgZnVuY3Rpb25hbGl0eVxuICAgICAgICAgIGNvbnN0IGlnbm9yZUxpc3QgPSBhd2FpdCBoZWxwZXJzLnJlYWRJZ25vcmVMaXN0KGlnbm9yZUZpbGUpO1xuICAgICAgICAgIGlmIChpZ25vcmVMaXN0LnNvbWUocGF0dGVybiA9PiBtaW5pbWF0Y2goZmlsZVBhdGgsIHBhdHRlcm4pKSkge1xuICAgICAgICAgICAgLy8gVGhlIGZpbGUgaXMgaWdub3JlZCBieSBvbmUgb2YgdGhlIHBhdHRlcm5zXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubGludElubGluZUphdmFTY3JpcHQgJiZcbiAgICAgICAgICB0ZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUuaW5kZXhPZigndGV4dC5odG1sJykgIT09IC0xXG4gICAgICAgICkge1xuICAgICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLS1leHRyYWN0JywgJ2Fsd2F5cycpO1xuICAgICAgICB9XG4gICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLScpO1xuXG4gICAgICAgIGNvbnN0IGV4ZWNPcHRzID0ge1xuICAgICAgICAgIHN0ZGluOiBmaWxlQ29udGVudHMsXG4gICAgICAgICAgaWdub3JlRXhpdENvZGU6IHRydWUsXG4gICAgICAgICAgY3dkOiBmaWxlRGlyLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhdG9tbGludGVyLmV4ZWNOb2RlKFxuICAgICAgICAgIHRoaXMuZXhlY3V0YWJsZVBhdGgsIHBhcmFtZXRlcnMsIGV4ZWNPcHRzLFxuICAgICAgICApO1xuXG4gICAgICAgIGlmICh0ZXh0RWRpdG9yLmdldFRleHQoKSAhPT0gZmlsZUNvbnRlbnRzKSB7XG4gICAgICAgICAgLy8gRmlsZSBoYXMgY2hhbmdlZCBzaW5jZSB0aGUgbGludCB3YXMgdHJpZ2dlcmVkLCB0ZWxsIExpbnRlciBub3QgdG8gdXBkYXRlXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFyc2VkO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHBhcnNlZCA9IEpTT04ucGFyc2UocmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgY29uc29sZS5lcnJvcignW0xpbnRlci1KU0hpbnRdJywgXywgcmVzdWx0KTtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnW0xpbnRlci1KU0hpbnRdJyxcbiAgICAgICAgICAgIHsgZGV0YWlsOiAnSlNIaW50IHJldHVybiBhbiBpbnZhbGlkIHJlc3BvbnNlLCBjaGVjayB5b3VyIGNvbnNvbGUgZm9yIG1vcmUgaW5mbycgfSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmtleXMocGFyc2VkLnJlc3VsdCkuZm9yRWFjaChhc3luYyAoZW50cnlJRCkgPT4ge1xuICAgICAgICAgIGxldCBtZXNzYWdlO1xuICAgICAgICAgIGNvbnN0IGVudHJ5ID0gcGFyc2VkLnJlc3VsdFtlbnRyeUlEXTtcblxuICAgICAgICAgIGNvbnN0IGVycm9yID0gZW50cnkuZXJyb3I7XG4gICAgICAgICAgY29uc3QgZXJyb3JUeXBlID0gZXJyb3IuY29kZS5zdWJzdHIoMCwgMSk7XG4gICAgICAgICAgbGV0IHNldmVyaXR5ID0gJ2luZm8nO1xuICAgICAgICAgIGlmIChlcnJvclR5cGUgPT09ICdFJykge1xuICAgICAgICAgICAgc2V2ZXJpdHkgPSAnZXJyb3InO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3JUeXBlID09PSAnVycpIHtcbiAgICAgICAgICAgIHNldmVyaXR5ID0gJ3dhcm5pbmcnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBsaW5lID0gZXJyb3IubGluZSA+IDAgPyBlcnJvci5saW5lIC0gMSA6IDA7XG4gICAgICAgICAgY29uc3QgY2hhcmFjdGVyID0gZXJyb3IuY2hhcmFjdGVyID4gMCA/IGVycm9yLmNoYXJhY3RlciAtIDEgOiAwO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGF0b21saW50ZXIuZ2VuZXJhdGVSYW5nZSh0ZXh0RWRpdG9yLCBsaW5lLCBjaGFyYWN0ZXIpO1xuICAgICAgICAgICAgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgc2V2ZXJpdHksXG4gICAgICAgICAgICAgIGV4Y2VycHQ6IGAke2Vycm9yLmNvZGV9IC0gJHtlcnJvci5yZWFzb259YCxcbiAgICAgICAgICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgICAgICAgICBmaWxlOiBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IGF3YWl0IGhlbHBlcnMuZ2VuZXJhdGVJbnZhbGlkVHJhY2UoXG4gICAgICAgICAgICAgIGxpbmUsIGNoYXJhY3RlciwgZmlsZVBhdGgsIHRleHRFZGl0b3IsIGVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXN1bHRzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn07XG4iXX0=