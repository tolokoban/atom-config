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
var Reporter = undefined;

function loadDeps() {
  if (!helpers) {
    helpers = require('./helpers');
  }
  if (!atomlinter) {
    atomlinter = require('atom-linter');
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
    }), atom.config.observe('linter-jshint.scopes', function (value) {
      // NOTE: Subscriptions are created in the order given to add() so this
      // is safe at the end.

      // Remove any old scopes
      _this.scopes.splice(0, _this.scopes.length);
      // Add the current scopes
      Array.prototype.push.apply(_this.scopes, value);
      // Re-check the embedded JS scope
      if (_this.lintInlineJavaScript && _this.scopes.indexOf(scopeEmbedded) !== -1) {
        _this.scopes.push(scopeEmbedded);
      }
    }), atom.commands.add('atom-text-editor', {
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

        // JSHint completely ignores .jshintignore files for STDIN on it's own
        // so we must re-implement the functionality
        var ignoreFile = yield atomlinter.findCachedAsync(fileDir, _this2.jshintignoreFilename);
        if (ignoreFile) {
          var isIgnored = yield helpers.isIgnored(filePath, ignoreFile);
          if (isIgnored) {
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

        Object.keys(parsed.result).forEach(function (entryID) {
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
            message = helpers.generateInvalidTrace(line, character, filePath, textEditor, error);
          }

          results.push(message);
        });

        // Make sure any invalid traces have resolved
        return Promise.all(results);
      })
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RvbG9rb2Jhbi9Db2RlL2dpdGh1Yi9hdG9tLWNvbmZpZy9wYWNrYWdlcy9saW50ZXItanNoaW50L2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBSWlCLE1BQU07Ozs7OztvQkFFYSxNQUFNOzs7OztBQU4xQyxXQUFXLENBQUM7O0FBV1osSUFBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLElBQUksVUFBVSxZQUFBLENBQUM7QUFDZixJQUFJLFFBQVEsWUFBQSxDQUFDOztBQUViLFNBQVMsUUFBUSxHQUFHO0FBQ2xCLE1BQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixXQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQ2hDO0FBQ0QsTUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNmLGNBQVUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7R0FDckM7QUFDRCxNQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsWUFBUSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztHQUNuQztDQUNGOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQUEsb0JBQUc7OztBQUNULFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMvQixRQUFJLGNBQWMsWUFBQSxDQUFDO0FBQ25CLFFBQU0sdUJBQXVCLEdBQUcsU0FBMUIsdUJBQXVCLEdBQVM7QUFDcEMsWUFBSyxhQUFhLFVBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO0FBQ3RCLGVBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztPQUN2RDtBQUNELGNBQVEsRUFBRSxDQUFDO0tBQ1osQ0FBQztBQUNGLGtCQUFjLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDckUsUUFBSSxDQUFD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UixRQUFRO2VBQ1Q7YUFDRixDQUFDO1dBQ0gsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLG1CQUFPLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztXQUN0Rjs7QUFFRCxpQkFBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN2QixDQUFDLENBQUM7OztBQUdILGVBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUM3QixDQUFBO0tBQ0YsQ0FBQztHQUNIO0NBQ0YsQ0FBQyIsImZpbGUiOiIvaG9tZS90b2xva29iYW4vQ29kZS9naXRodWIvYXRvbS1jb25maWcvcGFja2FnZXMvbGludGVyLWpzaGludC9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vKiBAZmxvdyAqL1xuXG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJztcbi8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9leHRlbnNpb25zLCBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXMgKi9cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcbmltcG9ydCB0eXBlIHsgVGV4dEVkaXRvciB9IGZyb20gJ2F0b20nO1xuLyogZXNsaW50LWVuYWJsZSBpbXBvcnQvZXh0ZW5zaW9ucywgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzICovXG5cbi8vIERlcGVuZGVuY2llc1xubGV0IGhlbHBlcnM7XG5sZXQgYXRvbWxpbnRlcjtcbmxldCBSZXBvcnRlcjtcblxuZnVuY3Rpb24gbG9hZERlcHMoKSB7XG4gIGlmICghaGVscGVycykge1xuICAgIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcbiAgfVxuICBpZiAoIWF0b21saW50ZXIpIHtcbiAgICBhdG9tbGludGVyID0gcmVxdWlyZSgnYXRvbS1saW50ZXInKTtcbiAgfVxuICBpZiAoIVJlcG9ydGVyKSB7XG4gICAgUmVwb3J0ZXIgPSByZXF1aXJlKCdqc2hpbnQtanNvbicpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MgPSBuZXcgU2V0KCk7XG4gICAgbGV0IGRlcHNDYWxsYmFja0lEO1xuICAgIGNvbnN0IGluc3RhbGxMaW50ZXJKU0hpbnREZXBzID0gKCkgPT4ge1xuICAgICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmRlbGV0ZShkZXBzQ2FsbGJhY2tJRCk7XG4gICAgICBpZiAoIWF0b20uaW5TcGVjTW9kZSgpKSB7XG4gICAgICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbGludGVyLWpzaGludCcpO1xuICAgICAgfVxuICAgICAgbG9hZERlcHMoKTtcbiAgICB9O1xuICAgIGRlcHNDYWxsYmFja0lEID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2soaW5zdGFsbExpbnRlckpTSGludERlcHMpO1xuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5hZGQoZGVwc0NhbGxiYWNrSUQpO1xuXG4gICAgdGhpcy5zY29wZXMgPSBbXTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgY29uc3Qgc2NvcGVFbWJlZGRlZCA9ICdzb3VyY2UuanMuZW1iZWRkZWQuaHRtbCc7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWpzaGludC5leGVjdXRhYmxlUGF0aCcsICh2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgdGhpcy5leGVjdXRhYmxlUGF0aCA9IFBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICdub2RlX21vZHVsZXMnLCAnanNoaW50JywgJ2JpbicsICdqc2hpbnQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmV4ZWN1dGFibGVQYXRoID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWpzaGludC5kaXNhYmxlV2hlbk5vSnNoaW50cmNGaWxlSW5QYXRoJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuZGlzYWJsZVdoZW5Ob0pzaGludHJjRmlsZUluUGF0aCA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItanNoaW50LmpzaGludEZpbGVOYW1lJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuanNoaW50RmlsZU5hbWUgPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWpzaGludC5qc2hpbnRpZ25vcmVGaWxlbmFtZScsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmpzaGludGlnbm9yZUZpbGVuYW1lID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1qc2hpbnQubGludElubGluZUphdmFTY3JpcHQnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5saW50SW5saW5lSmF2YVNjcmlwdCA9IHZhbHVlO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICB0aGlzLnNjb3Blcy5wdXNoKHNjb3BlRW1iZWRkZWQpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2NvcGVzLmluZGV4T2Yoc2NvcGVFbWJlZGRlZCkgIT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5zY29wZXMuc3BsaWNlKHRoaXMuc2NvcGVzLmluZGV4T2Yoc2NvcGVFbWJlZGRlZCksIDEpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1qc2hpbnQuc2NvcGVzJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIC8vIE5PVEU6IFN1YnNjcmlwdGlvbnMgYXJlIGNyZWF0ZWQgaW4gdGhlIG9yZGVyIGdpdmVuIHRvIGFkZCgpIHNvIHRoaXNcbiAgICAgICAgLy8gaXMgc2FmZSBhdCB0aGUgZW5kLlxuXG4gICAgICAgIC8vIFJlbW92ZSBhbnkgb2xkIHNjb3Blc1xuICAgICAgICB0aGlzLnNjb3Blcy5zcGxpY2UoMCwgdGhpcy5zY29wZXMubGVuZ3RoKTtcbiAgICAgICAgLy8gQWRkIHRoZSBjdXJyZW50IHNjb3Blc1xuICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSh0aGlzLnNjb3BlcywgdmFsdWUpO1xuICAgICAgICAvLyBSZS1jaGVjayB0aGUgZW1iZWRkZWQgSlMgc2NvcGVcbiAgICAgICAgaWYgKHRoaXMubGludElubGluZUphdmFTY3JpcHQgJiYgdGhpcy5zY29wZXMuaW5kZXhPZihzY29wZUVtYmVkZGVkKSAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnNjb3Blcy5wdXNoKHNjb3BlRW1iZWRkZWQpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywge1xuICAgICAgICAnbGludGVyLWpzaGludDpkZWJ1Zyc6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICBsb2FkRGVwcygpO1xuICAgICAgICAgIGNvbnN0IGRlYnVnU3RyaW5nID0gYXdhaXQgaGVscGVycy5nZW5lcmF0ZURlYnVnU3RyaW5nKCk7XG4gICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uT3B0aW9ucyA9IHsgZGV0YWlsOiBkZWJ1Z1N0cmluZywgZGlzbWlzc2FibGU6IHRydWUgfTtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnbGludGVyLWpzaGludDo6IERlYnVnZ2luZyBpbmZvcm1hdGlvbicsIG5vdGlmaWNhdGlvbk9wdGlvbnMpO1xuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5mb3JFYWNoKGNhbGxiYWNrSUQgPT4gd2luZG93LmNhbmNlbElkbGVDYWxsYmFjayhjYWxsYmFja0lEKSk7XG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmNsZWFyKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfSxcblxuICBwcm92aWRlTGludGVyKCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnSlNIaW50JyxcbiAgICAgIGdyYW1tYXJTY29wZXM6IHRoaXMuc2NvcGVzLFxuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIGxpbnRzT25DaGFuZ2U6IHRydWUsXG4gICAgICBsaW50OiBhc3luYyAodGV4dEVkaXRvcjogVGV4dEVkaXRvcikgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgICAgIGNvbnN0IGZpbGVEaXIgPSBQYXRoLmRpcm5hbWUoZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBmaWxlQ29udGVudHMgPSB0ZXh0RWRpdG9yLmdldFRleHQoKTtcbiAgICAgICAgbG9hZERlcHMoKTtcbiAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9IFsnLS1yZXBvcnRlcicsIFJlcG9ydGVyLCAnLS1maWxlbmFtZScsIGZpbGVQYXRoXTtcblxuICAgICAgICBjb25zdCBjb25maWdGaWxlID0gYXdhaXQgYXRvbWxpbnRlci5maW5kQ2FjaGVkQXN5bmMoZmlsZURpciwgdGhpcy5qc2hpbnRGaWxlTmFtZSk7XG5cbiAgICAgICAgaWYgKGNvbmZpZ0ZpbGUpIHtcbiAgICAgICAgICBpZiAodGhpcy5qc2hpbnRGaWxlTmFtZSAhPT0gJy5qc2hpbnRyYycpIHtcbiAgICAgICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLS1jb25maWcnLCBjb25maWdGaWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5kaXNhYmxlV2hlbk5vSnNoaW50cmNGaWxlSW5QYXRoICYmICEoYXdhaXQgaGVscGVycy5oYXNIb21lQ29uZmlnKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBKU0hpbnQgY29tcGxldGVseSBpZ25vcmVzIC5qc2hpbnRpZ25vcmUgZmlsZXMgZm9yIFNURElOIG9uIGl0J3Mgb3duXG4gICAgICAgIC8vIHNvIHdlIG11c3QgcmUtaW1wbGVtZW50IHRoZSBmdW5jdGlvbmFsaXR5XG4gICAgICAgIGNvbnN0IGlnbm9yZUZpbGUgPSBhd2FpdCBhdG9tbGludGVyLmZpbmRDYWNoZWRBc3luYyhmaWxlRGlyLCB0aGlzLmpzaGludGlnbm9yZUZpbGVuYW1lKTtcbiAgICAgICAgaWYgKGlnbm9yZUZpbGUpIHtcbiAgICAgICAgICBjb25zdCBpc0lnbm9yZWQgPSBhd2FpdCBoZWxwZXJzLmlzSWdub3JlZChmaWxlUGF0aCwgaWdub3JlRmlsZSk7XG4gICAgICAgICAgaWYgKGlzSWdub3JlZCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxpbnRJbmxpbmVKYXZhU2NyaXB0XG4gICAgICAgICAgJiYgdGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lLmluZGV4T2YoJ3RleHQuaHRtbCcpICE9PSAtMVxuICAgICAgICApIHtcbiAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tZXh0cmFjdCcsICdhbHdheXMnKTtcbiAgICAgICAgfVxuICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0nKTtcblxuICAgICAgICBjb25zdCBleGVjT3B0cyA9IHtcbiAgICAgICAgICBzdGRpbjogZmlsZUNvbnRlbnRzLFxuICAgICAgICAgIGlnbm9yZUV4aXRDb2RlOiB0cnVlLFxuICAgICAgICAgIGN3ZDogZmlsZURpcixcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXRvbWxpbnRlci5leGVjTm9kZSh0aGlzLmV4ZWN1dGFibGVQYXRoLCBwYXJhbWV0ZXJzLCBleGVjT3B0cyk7XG5cbiAgICAgICAgaWYgKHRleHRFZGl0b3IuZ2V0VGV4dCgpICE9PSBmaWxlQ29udGVudHMpIHtcbiAgICAgICAgICAvLyBGaWxlIGhhcyBjaGFuZ2VkIHNpbmNlIHRoZSBsaW50IHdhcyB0cmlnZ2VyZWQsIHRlbGwgTGludGVyIG5vdCB0byB1cGRhdGVcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXJzZWQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcGFyc2VkID0gSlNPTi5wYXJzZShyZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdbTGludGVyLUpTSGludF0nLCBfLCByZXN1bHQpO1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAgICAgJ1tMaW50ZXItSlNIaW50XScsXG4gICAgICAgICAgICB7IGRldGFpbDogJ0pTSGludCByZXR1cm4gYW4gaW52YWxpZCByZXNwb25zZSwgY2hlY2sgeW91ciBjb25zb2xlIGZvciBtb3JlIGluZm8nIH0sXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5rZXlzKHBhcnNlZC5yZXN1bHQpLmZvckVhY2goKGVudHJ5SUQpID0+IHtcbiAgICAgICAgICBsZXQgbWVzc2FnZTtcbiAgICAgICAgICBjb25zdCBlbnRyeSA9IHBhcnNlZC5yZXN1bHRbZW50cnlJRF07XG5cbiAgICAgICAgICBjb25zdCB7IGVycm9yIH0gPSBlbnRyeTtcbiAgICAgICAgICBjb25zdCBlcnJvclR5cGUgPSBlcnJvci5jb2RlLnN1YnN0cigwLCAxKTtcbiAgICAgICAgICBsZXQgc2V2ZXJpdHkgPSAnaW5mbyc7XG4gICAgICAgICAgaWYgKGVycm9yVHlwZSA9PT0gJ0UnKSB7XG4gICAgICAgICAgICBzZXZlcml0eSA9ICdlcnJvcic7XG4gICAgICAgICAgfSBlbHNlIGlmIChlcnJvclR5cGUgPT09ICdXJykge1xuICAgICAgICAgICAgc2V2ZXJpdHkgPSAnd2FybmluZyc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGxpbmUgPSBlcnJvci5saW5lID4gMCA/IGVycm9yLmxpbmUgLSAxIDogMDtcbiAgICAgICAgICBjb25zdCBjaGFyYWN0ZXIgPSBlcnJvci5jaGFyYWN0ZXIgPiAwID8gZXJyb3IuY2hhcmFjdGVyIC0gMSA6IDA7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gYXRvbWxpbnRlci5nZW5lcmF0ZVJhbmdlKHRleHRFZGl0b3IsIGxpbmUsIGNoYXJhY3Rlcik7XG4gICAgICAgICAgICBtZXNzYWdlID0ge1xuICAgICAgICAgICAgICBzZXZlcml0eSxcbiAgICAgICAgICAgICAgZXhjZXJwdDogYCR7ZXJyb3IuY29kZX0gLSAke2Vycm9yLnJlYXNvbn1gLFxuICAgICAgICAgICAgICBsb2NhdGlvbjoge1xuICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gaGVscGVycy5nZW5lcmF0ZUludmFsaWRUcmFjZShsaW5lLCBjaGFyYWN0ZXIsIGZpbGVQYXRoLCB0ZXh0RWRpdG9yLCBlcnJvcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzdWx0cy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBNYWtlIHN1cmUgYW55IGludmFsaWQgdHJhY2VzIGhhdmUgcmVzb2x2ZWRcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHJlc3VsdHMpO1xuICAgICAgfSxcbiAgICB9O1xuICB9LFxufTtcbiJdfQ==