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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vRTovQ29kZS9naXRodWIvYXRvbS1jb25maWcvcGFja2FnZXMvbGludGVyLWpzaGludC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUlpQixNQUFNOzs7Ozs7b0JBRWEsTUFBTTs7Ozs7QUFOMUMsV0FBVyxDQUFDOztBQVdaLElBQUksT0FBTyxZQUFBLENBQUM7QUFDWixJQUFJLFVBQVUsWUFBQSxDQUFDO0FBQ2YsSUFBSSxTQUFTLFlBQUEsQ0FBQztBQUNkLElBQUksUUFBUSxZQUFBLENBQUM7O0FBRWIsU0FBUyxRQUFRLEdBQUc7QUFDbEIsTUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLFdBQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7R0FDaEM7QUFDRCxNQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2YsY0FBVSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztHQUNyQztBQUNELE1BQUksQ0FBQyxTQUFTLEVBQUU7QUFDZCxhQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQ2xDO0FBQ0QsTUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNiLFlBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7R0FDbkM7Q0FDRjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsVUFBUSxFQUFBLG9CQUFHOzs7QUFDVCxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDL0IsUUFBSSxjQUFjLFlBQUEsQ0FBQztBQUNuQixRQUFNLHVCQUF1QixHQUFHLFNBQTFCLHVCQUF1QixHQUFTO0FBQ3BDLFlBQUssYUFBYSxVQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDMUMsVUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUN0QixlQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7T0FDdkQ7QUFDRCxjQUFR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QUFHLENBQUMsQ0FBQztBQUNoRSxjQUFJO0FBQ0YsZ0JBQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztBQUN2RSxtQkFBTyxHQUFHO0FBQ1Isc0JBQVEsRUFBUixRQUFRO0FBQ1IscUJBQU8sRUFBSyxLQUFLLENBQUMsSUFBSSxXQUFNLEtBQUssQ0FBQyxNQUFNLEFBQUU7QUFDMUMsc0JBQVEsRUFBRTtBQUNSLG9CQUFJLEVBQUUsUUFBUTtBQUNkLHdCQUFRLEVBQVIsUUFBUTtlQUNUO2FBQ0YsQ0FBQztXQUNILENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixtQkFBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLG9CQUFvQixDQUMxQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7V0FDakQ7O0FBRUQsaUJBQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDdkIsRUFBQyxDQUFDO0FBQ0gsZUFBTyxPQUFPLENBQUM7T0FDaEIsQ0FBQTtLQUNGLENBQUM7R0FDSDtDQUNGLENBQUMiLCJmaWxlIjoiZmlsZTovLy9FOi9Db2RlL2dpdGh1Yi9hdG9tLWNvbmZpZy9wYWNrYWdlcy9saW50ZXItanNoaW50L2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8qIEBmbG93ICovXG5cbmltcG9ydCBQYXRoIGZyb20gJ3BhdGgnO1xuLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L2V4dGVuc2lvbnMsIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llcyAqL1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHR5cGUgeyBUZXh0RWRpdG9yIH0gZnJvbSAnYXRvbSc7XG4vKiBlc2xpbnQtZW5hYmxlIGltcG9ydC9leHRlbnNpb25zLCBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXMgKi9cblxuLy8gRGVwZW5kZW5jaWVzXG5sZXQgaGVscGVycztcbmxldCBhdG9tbGludGVyO1xubGV0IG1pbmltYXRjaDtcbmxldCBSZXBvcnRlcjtcblxuZnVuY3Rpb24gbG9hZERlcHMoKSB7XG4gIGlmICghaGVscGVycykge1xuICAgIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcbiAgfVxuICBpZiAoIWF0b21saW50ZXIpIHtcbiAgICBhdG9tbGludGVyID0gcmVxdWlyZSgnYXRvbS1saW50ZXInKTtcbiAgfVxuICBpZiAoIW1pbmltYXRjaCkge1xuICAgIG1pbmltYXRjaCA9IHJlcXVpcmUoJ21pbmltYXRjaCcpO1xuICB9XG4gIGlmICghUmVwb3J0ZXIpIHtcbiAgICBSZXBvcnRlciA9IHJlcXVpcmUoJ2pzaGludC1qc29uJyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMuaWRsZUNhbGxiYWNrcyA9IG5ldyBTZXQoKTtcbiAgICBsZXQgZGVwc0NhbGxiYWNrSUQ7XG4gICAgY29uc3QgaW5zdGFsbExpbnRlckpTSGludERlcHMgPSAoKSA9PiB7XG4gICAgICB0aGlzLmlkbGVDYWxsYmFja3MuZGVsZXRlKGRlcHNDYWxsYmFja0lEKTtcbiAgICAgIGlmICghYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgICAgICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXItanNoaW50Jyk7XG4gICAgICB9XG4gICAgICBsb2FkRGVwcygpO1xuICAgIH07XG4gICAgZGVwc0NhbGxiYWNrSUQgPSB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFjayhpbnN0YWxsTGludGVySlNIaW50RGVwcyk7XG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmFkZChkZXBzQ2FsbGJhY2tJRCk7XG5cbiAgICB0aGlzLnNjb3BlcyA9IFtdO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBjb25zdCBzY29wZUVtYmVkZGVkID0gJ3NvdXJjZS5qcy5lbWJlZGRlZC5odG1sJztcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItanNoaW50LmV4ZWN1dGFibGVQYXRoJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICB0aGlzLmV4ZWN1dGFibGVQYXRoID0gUGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ25vZGVfbW9kdWxlcycsICdqc2hpbnQnLCAnYmluJywgJ2pzaGludCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZXhlY3V0YWJsZVBhdGggPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItanNoaW50LmRpc2FibGVXaGVuTm9Kc2hpbnRyY0ZpbGVJblBhdGgnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5kaXNhYmxlV2hlbk5vSnNoaW50cmNGaWxlSW5QYXRoID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1qc2hpbnQuanNoaW50RmlsZU5hbWUnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5qc2hpbnRGaWxlTmFtZSA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItanNoaW50LmpzaGludGlnbm9yZUZpbGVuYW1lJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuanNoaW50aWdub3JlRmlsZW5hbWUgPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWpzaGludC5saW50SW5saW5lSmF2YVNjcmlwdCcsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmxpbnRJbmxpbmVKYXZhU2NyaXB0ID0gdmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgIHRoaXMuc2NvcGVzLnB1c2goc2NvcGVFbWJlZGRlZCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zY29wZXMuaW5kZXhPZihzY29wZUVtYmVkZGVkKSAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnNjb3Blcy5zcGxpY2UodGhpcy5zY29wZXMuaW5kZXhPZihzY29wZUVtYmVkZGVkKSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICk7XG4gICAgLy8gTk9URTogU2VwYXJhdGluZyB0aGlzIG91dCBmcm9tIHRoZSBvdGhlcnMgdG8gZW5zdXJlIGxpbnRJbmxpbmVKYXZhU2NyaXB0IGlzIHNldFxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItanNoaW50LnNjb3BlcycsICh2YWx1ZSkgPT4ge1xuICAgICAgICAvLyBSZW1vdmUgYW55IG9sZCBzY29wZXNcbiAgICAgICAgdGhpcy5zY29wZXMuc3BsaWNlKDAsIHRoaXMuc2NvcGVzLmxlbmd0aCk7XG4gICAgICAgIC8vIEFkZCB0aGUgY3VycmVudCBzY29wZXNcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkodGhpcy5zY29wZXMsIHZhbHVlKTtcbiAgICAgICAgLy8gUmUtY2hlY2sgdGhlIGVtYmVkZGVkIEpTIHNjb3BlXG4gICAgICAgIGlmICh0aGlzLmxpbnRJbmxpbmVKYXZhU2NyaXB0ICYmIHRoaXMuc2NvcGVzLmluZGV4T2Yoc2NvcGVFbWJlZGRlZCkgIT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5zY29wZXMucHVzaChzY29wZUVtYmVkZGVkKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICAgJ2xpbnRlci1qc2hpbnQ6ZGVidWcnOiBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgbG9hZERlcHMoKTtcbiAgICAgICAgICBjb25zdCBkZWJ1Z1N0cmluZyA9IGF3YWl0IGhlbHBlcnMuZ2VuZXJhdGVEZWJ1Z1N0cmluZygpO1xuICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbk9wdGlvbnMgPSB7IGRldGFpbDogZGVidWdTdHJpbmcsIGRpc21pc3NhYmxlOiB0cnVlIH07XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ2xpbnRlci1qc2hpbnQ6OiBEZWJ1Z2dpbmcgaW5mb3JtYXRpb24nLCBub3RpZmljYXRpb25PcHRpb25zKTtcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MuZm9yRWFjaChjYWxsYmFja0lEID0+IHdpbmRvdy5jYW5jZWxJZGxlQ2FsbGJhY2soY2FsbGJhY2tJRCkpO1xuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5jbGVhcigpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH0sXG5cbiAgcHJvdmlkZUxpbnRlcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ0pTSGludCcsXG4gICAgICBncmFtbWFyU2NvcGVzOiB0aGlzLnNjb3BlcyxcbiAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICBsaW50c09uQ2hhbmdlOiB0cnVlLFxuICAgICAgbGludDogYXN5bmMgKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgICBjb25zdCBmaWxlRGlyID0gUGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3QgZmlsZUNvbnRlbnRzID0gdGV4dEVkaXRvci5nZXRUZXh0KCk7XG4gICAgICAgIGxvYWREZXBzKCk7XG4gICAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBbJy0tcmVwb3J0ZXInLCBSZXBvcnRlciwgJy0tZmlsZW5hbWUnLCBmaWxlUGF0aF07XG5cbiAgICAgICAgY29uc3QgY29uZmlnRmlsZSA9IGF3YWl0IGF0b21saW50ZXIuZmluZENhY2hlZEFzeW5jKGZpbGVEaXIsIHRoaXMuanNoaW50RmlsZU5hbWUpO1xuXG4gICAgICAgIGlmIChjb25maWdGaWxlKSB7XG4gICAgICAgICAgaWYgKHRoaXMuanNoaW50RmlsZU5hbWUgIT09ICcuanNoaW50cmMnKSB7XG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tY29uZmlnJywgY29uZmlnRmlsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZGlzYWJsZVdoZW5Ob0pzaGludHJjRmlsZUluUGF0aCAmJiAhKGF3YWl0IGhlbHBlcnMuaGFzSG9tZUNvbmZpZygpKSkge1xuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaWdub3JlRmlsZSA9IGF3YWl0IGF0b21saW50ZXIuZmluZENhY2hlZEFzeW5jKGZpbGVEaXIsIHRoaXMuanNoaW50aWdub3JlRmlsZW5hbWUpO1xuXG4gICAgICAgIGlmIChpZ25vcmVGaWxlKSB7XG4gICAgICAgICAgLy8gSlNIaW50IGNvbXBsZXRlbHkgaWdub3JlcyAuanNoaW50aWdub3JlIGZpbGVzIGZvciBTVERJTiBvbiBpdCdzIG93blxuICAgICAgICAgIC8vIHNvIHdlIG11c3QgcmUtaW1wbGVtZW50IHRoZSBmdW5jdGlvbmFsaXR5XG4gICAgICAgICAgY29uc3QgaWdub3JlTGlzdCA9IGF3YWl0IGhlbHBlcnMucmVhZElnbm9yZUxpc3QoaWdub3JlRmlsZSk7XG4gICAgICAgICAgaWYgKGlnbm9yZUxpc3Quc29tZShwYXR0ZXJuID0+IG1pbmltYXRjaChmaWxlUGF0aCwgcGF0dGVybikpKSB7XG4gICAgICAgICAgICAvLyBUaGUgZmlsZSBpcyBpZ25vcmVkIGJ5IG9uZSBvZiB0aGUgcGF0dGVybnNcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5saW50SW5saW5lSmF2YVNjcmlwdCAmJlxuICAgICAgICAgIHRleHRFZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5pbmRleE9mKCd0ZXh0Lmh0bWwnKSAhPT0gLTFcbiAgICAgICAgKSB7XG4gICAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctLWV4dHJhY3QnLCAnYWx3YXlzJyk7XG4gICAgICAgIH1cbiAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctJyk7XG5cbiAgICAgICAgY29uc3QgZXhlY09wdHMgPSB7XG4gICAgICAgICAgc3RkaW46IGZpbGVDb250ZW50cyxcbiAgICAgICAgICBpZ25vcmVFeGl0Q29kZTogdHJ1ZSxcbiAgICAgICAgICBjd2Q6IGZpbGVEaXIsXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGF0b21saW50ZXIuZXhlY05vZGUoXG4gICAgICAgICAgdGhpcy5leGVjdXRhYmxlUGF0aCwgcGFyYW1ldGVycywgZXhlY09wdHMsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHRleHRFZGl0b3IuZ2V0VGV4dCgpICE9PSBmaWxlQ29udGVudHMpIHtcbiAgICAgICAgICAvLyBGaWxlIGhhcyBjaGFuZ2VkIHNpbmNlIHRoZSBsaW50IHdhcyB0cmlnZ2VyZWQsIHRlbGwgTGludGVyIG5vdCB0byB1cGRhdGVcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXJzZWQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcGFyc2VkID0gSlNPTi5wYXJzZShyZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdbTGludGVyLUpTSGludF0nLCBfLCByZXN1bHQpO1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdbTGludGVyLUpTSGludF0nLFxuICAgICAgICAgICAgeyBkZXRhaWw6ICdKU0hpbnQgcmV0dXJuIGFuIGludmFsaWQgcmVzcG9uc2UsIGNoZWNrIHlvdXIgY29uc29sZSBmb3IgbW9yZSBpbmZvJyB9LFxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3Qua2V5cyhwYXJzZWQucmVzdWx0KS5mb3JFYWNoKGFzeW5jIChlbnRyeUlEKSA9PiB7XG4gICAgICAgICAgbGV0IG1lc3NhZ2U7XG4gICAgICAgICAgY29uc3QgZW50cnkgPSBwYXJzZWQucmVzdWx0W2VudHJ5SURdO1xuXG4gICAgICAgICAgY29uc3QgZXJyb3IgPSBlbnRyeS5lcnJvcjtcbiAgICAgICAgICBjb25zdCBlcnJvclR5cGUgPSBlcnJvci5jb2RlLnN1YnN0cigwLCAxKTtcbiAgICAgICAgICBsZXQgc2V2ZXJpdHkgPSAnaW5mbyc7XG4gICAgICAgICAgaWYgKGVycm9yVHlwZSA9PT0gJ0UnKSB7XG4gICAgICAgICAgICBzZXZlcml0eSA9ICdlcnJvcic7XG4gICAgICAgICAgfSBlbHNlIGlmIChlcnJvclR5cGUgPT09ICdXJykge1xuICAgICAgICAgICAgc2V2ZXJpdHkgPSAnd2FybmluZyc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGxpbmUgPSBlcnJvci5saW5lID4gMCA/IGVycm9yLmxpbmUgLSAxIDogMDtcbiAgICAgICAgICBjb25zdCBjaGFyYWN0ZXIgPSBlcnJvci5jaGFyYWN0ZXIgPiAwID8gZXJyb3IuY2hhcmFjdGVyIC0gMSA6IDA7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gYXRvbWxpbnRlci5nZW5lcmF0ZVJhbmdlKHRleHRFZGl0b3IsIGxpbmUsIGNoYXJhY3Rlcik7XG4gICAgICAgICAgICBtZXNzYWdlID0ge1xuICAgICAgICAgICAgICBzZXZlcml0eSxcbiAgICAgICAgICAgICAgZXhjZXJwdDogYCR7ZXJyb3IuY29kZX0gLSAke2Vycm9yLnJlYXNvbn1gLFxuICAgICAgICAgICAgICBsb2NhdGlvbjoge1xuICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gYXdhaXQgaGVscGVycy5nZW5lcmF0ZUludmFsaWRUcmFjZShcbiAgICAgICAgICAgICAgbGluZSwgY2hhcmFjdGVyLCBmaWxlUGF0aCwgdGV4dEVkaXRvciwgZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3VsdHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgfSxcbiAgICB9O1xuICB9LFxufTtcbiJdfQ==