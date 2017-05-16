(function() {
  var Beautifier, Promise, _, fs, path, readFile, spawn, temp, which;

  Promise = require('bluebird');

  _ = require('lodash');

  fs = require('fs');

  temp = require('temp').track();

  readFile = Promise.promisify(fs.readFile);

  which = require('which');

  spawn = require('child_process').spawn;

  path = require('path');

  module.exports = Beautifier = (function() {

    /*
    Promise
     */
    Beautifier.prototype.Promise = Promise;


    /*
    Name of Beautifier
     */

    Beautifier.prototype.name = 'Beautifier';


    /*
    Supported Options
    
    Enable options for supported languages.
    - <string:language>:<boolean:all_options_enabled>
    - <string:language>:<string:option_key>:<boolean:enabled>
    - <string:language>:<string:option_key>:<string:rename>
    - <string:language>:<string:option_key>:<function:transform>
    - <string:language>:<string:option_key>:<array:mapper>
     */

    Beautifier.prototype.options = {};


    /*
    Is the beautifier a command-line interface beautifier?
     */

    Beautifier.prototype.isPreInstalled = true;


    /*
    Supported languages by this Beautifier
    
    Extracted from the keys of the `options` field.
     */

    Beautifier.prototype.languages = null;


    /*
    Beautify text
    
    Override this method in subclasses
     */

    Beautifier.prototype.beautify = null;


    /*
    Show deprecation warning to user.
     */

    Beautifier.prototype.deprecate = function(warning) {
      var ref;
      return (ref = atom.notifications) != null ? ref.addWarning(warning) : void 0;
    };


    /*
    Create temporary file
     */

    Beautifier.prototype.tempFile = function(name, contents, ext) {
      if (name == null) {
        name = "atom-beautify-temp";
      }
      if (contents == null) {
        contents = "";
      }
      if (ext == null) {
        ext = "";
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return temp.open({
            prefix: name,
            suffix: ext
          }, function(err, info) {
            _this.debug('tempFile', name, err, info);
            if (err) {
              return reject(err);
            }
            return fs.write(info.fd, contents, function(err) {
              if (err) {
                return reject(err);
              }
              return fs.close(info.fd, function(err) {
                if (err) {
                  return reject(err);
                }
                return resolve(info.path);
              });
            });
          });
        };
      })(this));
    };


    /*
    Read file
     */

    Beautifier.prototype.readFile = function(filePath) {
      return Promise.resolve(filePath).then(function(filePath) {
        return readFile(filePath, "utf8");
      });
    };


    /*
    Find file
     */

    Beautifier.prototype.findFile = function(startDir, fileNames) {
      var currentDir, fileName, filePath, j, len;
      if (!arguments.length) {
        throw new Error("Specify file names to find.");
      }
      if (!(fileNames instanceof Array)) {
        fileNames = [fileNames];
      }
      startDir = startDir.split(path.sep);
      while (startDir.length) {
        currentDir = startDir.join(path.sep);
        for (j = 0, len = fileNames.length; j < len; j++) {
          fileName = fileNames[j];
          filePath = path.join(currentDir, fileName);
          try {
            fs.accessSync(filePath, fs.R_OK);
            return filePath;
          } catch (error) {}
        }
        startDir.pop();
      }
      return null;
    };

    Beautifier.prototype.getDefaultLineEnding = function(crlf, lf, optionEol) {
      if (!optionEol || optionEol === 'System Default') {
        optionEol = atom.config.get('line-ending-selector.defaultLineEnding');
      }
      switch (optionEol) {
        case 'LF':
          return lf;
        case 'CRLF':
          return crlf;
        case 'OS Default':
          if (process.platform === 'win32') {
            return crlf;
          } else {
            return lf;
          }
        default:
          return lf;
      }
    };


    /*
    If platform is Windows
     */

    Beautifier.prototype.isWindows = (function() {
      return new RegExp('^win').test(process.platform);
    })();


    /*
    Get Shell Environment variables
    
    Special thank you to @ioquatix
    See https://github.com/ioquatix/script-runner/blob/v1.5.0/lib/script-runner.coffee#L45-L63
     */

    Beautifier.prototype._envCache = null;

    Beautifier.prototype._envCacheDate = null;

    Beautifier.prototype._envCacheExpiry = 10000;

    Beautifier.prototype.getShellEnvironment = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var buffer, child;
          if ((_this._envCache != null) && (_this._envCacheDate != null)) {
            if ((new Date() - _this._envCacheDate) < _this._envCacheExpiry) {
              return resolve(_this._envCache);
            }
          }
          if (_this.isWindows) {
            return resolve(process.env);
          } else {
            child = spawn(process.env.SHELL, ['-ilc', 'env'], {
              detached: true,
              stdio: ['ignore', 'pipe', process.stderr]
            });
            buffer = '';
            child.stdout.on('data', function(data) {
              return buffer += data;
            });
            return child.on('close', function(code, signal) {
              var definition, environment, j, key, len, ref, ref1, value;
              if (code !== 0) {
                return reject(new Error("Could not get Shell Environment. Exit code: " + code + ", Signal: " + signal));
              }
              environment = {};
              ref = buffer.split('\n');
              for (j = 0, len = ref.length; j < len; j++) {
                definition = ref[j];
                ref1 = definition.split('=', 2), key = ref1[0], value = ref1[1];
                if (key !== '') {
                  environment[key] = value;
                }
              }
              _this._envCache = environment;
              _this._envCacheDate = new Date();
              return resolve(environment);
            });
          }
        };
      })(this));
    };


    /*
    Like the unix which utility.
    
    Finds the first instance of a specified executable in the PATH environment variable.
    Does not cache the results,
    so hash -r is not needed when the PATH changes.
    See https://github.com/isaacs/node-which
     */

    Beautifier.prototype.which = function(exe, options) {
      if (options == null) {
        options = {};
      }
      return this.getShellEnvironment().then((function(_this) {
        return function(env) {
          return new Promise(function(resolve, reject) {
            var i, ref;
            if (options.path == null) {
              options.path = env.PATH;
            }
            if (_this.isWindows) {
              if (!options.path) {
                for (i in env) {
                  if (i.toLowerCase() === "path") {
                    options.path = env[i];
                    break;
                  }
                }
              }
              if (options.pathExt == null) {
                options.pathExt = ((ref = process.env.PATHEXT) != null ? ref : '.EXE') + ";";
              }
            }
            return which(exe, options, function(err, path) {
              if (err) {
                resolve(exe);
              }
              return resolve(path);
            });
          });
        };
      })(this));
    };


    /*
    Add help to error.description
    
    Note: error.description is not officially used in JavaScript,
    however it is used internally for Atom Beautify when displaying errors.
     */

    Beautifier.prototype.commandNotFoundError = function(exe, help) {
      var docsLink, er, helpStr, issueSearchLink, message;
      message = "Could not find '" + exe + "'. The program may not be installed.";
      er = new Error(message);
      er.code = 'CommandNotFound';
      er.errno = er.code;
      er.syscall = 'beautifier::run';
      er.file = exe;
      if (help != null) {
        if (typeof help === "object") {
          helpStr = "See " + help.link + " for program installation instructions.\n";
          if (help.pathOption) {
            helpStr += "You can configure Atom Beautify with the absolute path to '" + (help.program || exe) + "' by setting '" + help.pathOption + "' in the Atom Beautify package settings.\n";
          }
          if (help.additional) {
            helpStr += help.additional;
          }
          issueSearchLink = "https://github.com/Glavin001/atom-beautify/search?q=" + exe + "&type=Issues";
          docsLink = "https://github.com/Glavin001/atom-beautify/tree/master/docs";
          helpStr += "Your program is properly installed if running '" + (this.isWindows ? 'where.exe' : 'which') + " " + exe + "' in your " + (this.isWindows ? 'CMD prompt' : 'Terminal') + " returns an absolute path to the executable. If this does not work then you have not installed the program correctly and so Atom Beautify will not find the program. Atom Beautify requires that the program be found in your PATH environment variable. \nNote that this is not an Atom Beautify issue if beautification does not work and the above command also does not work: this is expected behaviour, since you have not properly installed your program. Please properly setup the program and search through existing Atom Beautify issues before creating a new issue. See " + issueSearchLink + " for related Issues and " + docsLink + " for documentation. If you are still unable to resolve this issue on your own then please create a new issue and ask for help.\n";
          er.description = helpStr;
        } else {
          er.description = help;
        }
      }
      return er;
    };


    /*
    Run command-line interface command
     */

    Beautifier.prototype.run = function(executable, args, arg) {
      var cwd, help, ignoreReturnCode, onStdin, ref;
      ref = arg != null ? arg : {}, cwd = ref.cwd, ignoreReturnCode = ref.ignoreReturnCode, help = ref.help, onStdin = ref.onStdin;
      args = _.flatten(args);
      return Promise.all([executable, Promise.all(args)]).then((function(_this) {
        return function(arg1) {
          var args, exeName;
          exeName = arg1[0], args = arg1[1];
          _this.debug('exeName, args:', exeName, args);
          return Promise.all([exeName, args, _this.getShellEnvironment(), _this.which(exeName)]);
        };
      })(this)).then((function(_this) {
        return function(arg1) {
          var args, env, exe, exeName, exePath, options;
          exeName = arg1[0], args = arg1[1], env = arg1[2], exePath = arg1[3];
          _this.debug('exePath, env:', exePath, env);
          _this.debug('args', args);
          exe = exePath != null ? exePath : exeName;
          options = {
            cwd: cwd,
            env: env
          };
          return _this.spawn(exe, args, options, onStdin).then(function(arg2) {
            var returnCode, stderr, stdout, windowsProgramNotFoundMsg;
            returnCode = arg2.returnCode, stdout = arg2.stdout, stderr = arg2.stderr;
            _this.verbose('spawn result', returnCode, stdout, stderr);
            if (!ignoreReturnCode && returnCode !== 0) {
              windowsProgramNotFoundMsg = "is not recognized as an internal or external command";
              _this.verbose(stderr, windowsProgramNotFoundMsg);
              if (_this.isWindows && returnCode === 1 && stderr.indexOf(windowsProgramNotFoundMsg) !== -1) {
                throw _this.commandNotFoundError(exeName, help);
              } else {
                throw new Error(stderr);
              }
            } else {
              return stdout;
            }
          })["catch"](function(err) {
            _this.debug('error', err);
            if (err.code === 'ENOENT' || err.errno === 'ENOENT') {
              throw _this.commandNotFoundError(exeName, help);
            } else {
              throw err;
            }
          });
        };
      })(this));
    };


    /*
    Spawn
     */

    Beautifier.prototype.spawn = function(exe, args, options, onStdin) {
      args = _.without(args, void 0);
      args = _.without(args, null);
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var cmd, stderr, stdout;
          _this.debug('spawn', exe, args);
          cmd = spawn(exe, args, options);
          stdout = "";
          stderr = "";
          cmd.stdout.on('data', function(data) {
            return stdout += data;
          });
          cmd.stderr.on('data', function(data) {
            return stderr += data;
          });
          cmd.on('close', function(returnCode) {
            _this.debug('spawn done', returnCode, stderr, stdout);
            return resolve({
              returnCode: returnCode,
              stdout: stdout,
              stderr: stderr
            });
          });
          cmd.on('error', function(err) {
            _this.debug('error', err);
            return reject(err);
          });
          if (onStdin) {
            return onStdin(cmd.stdin);
          }
        };
      })(this));
    };


    /*
    Logger instance
     */

    Beautifier.prototype.logger = null;


    /*
    Initialize and configure Logger
     */

    Beautifier.prototype.setupLogger = function() {
      var key, method, ref;
      this.logger = require('../logger')(__filename);
      ref = this.logger;
      for (key in ref) {
        method = ref[key];
        this[key] = method;
      }
      return this.verbose(this.name + " beautifier logger has been initialized.");
    };


    /*
    Constructor to setup beautifer
     */

    function Beautifier() {
      var globalOptions, lang, options, ref;
      this.setupLogger();
      if (this.options._ != null) {
        globalOptions = this.options._;
        delete this.options._;
        if (typeof globalOptions === "object") {
          ref = this.options;
          for (lang in ref) {
            options = ref[lang];
            if (typeof options === "boolean") {
              if (options === true) {
                this.options[lang] = globalOptions;
              }
            } else if (typeof options === "object") {
              this.options[lang] = _.merge(globalOptions, options);
            } else {
              this.warn(("Unsupported options type " + (typeof options) + " for language " + lang + ": ") + options);
            }
          }
        }
      }
      this.verbose("Options for " + this.name + ":", this.options);
      this.languages = _.keys(this.options);
    }

    return Beautifier;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9FOi9Db2RlL2dpdGh1Yi9hdG9tLWNvbmZpZy9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9iZWF1dGlmaWVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztFQUNWLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFDSixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQyxLQUFoQixDQUFBOztFQUNQLFFBQUEsR0FBVyxPQUFPLENBQUMsU0FBUixDQUFrQixFQUFFLENBQUMsUUFBckI7O0VBQ1gsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztFQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsZUFBUixDQUF3QixDQUFDOztFQUNqQyxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FBdUI7O0FBRXJCOzs7eUJBR0EsT0FBQSxHQUFTOzs7QUFFVDs7Ozt5QkFHQSxJQUFBLEdBQU07OztBQUVOOzs7Ozs7Ozs7Ozt5QkFVQSxPQUFBLEdBQVM7OztBQUVUOzs7O3lCQUdBLGNBQUEsR0FBZ0I7OztBQUVoQjs7Ozs7O3lCQUtBLFNBQUEsR0FBVzs7O0FBRVg7Ozs7Ozt5QkFLQSxRQUFBLEdBQVU7OztBQUVWOzs7O3lCQUdBLFNBQUEsR0FBVyxTQUFDLE9BQUQ7QUFDVCxVQUFBO3FEQUFrQixDQUFFLFVBQXBCLENBQStCLE9BQS9CO0lBRFM7OztBQUdYOzs7O3lCQUdBLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBOEIsUUFBOUIsRUFBNkMsR0FBN0M7O1FBQUMsT0FBTzs7O1FBQXNCLFdBQVc7OztRQUFJLE1BQU07O0FBQzNELGFBQVcsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUE7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QyxDQUFBLElBQUYsR0FBTywwQ0FBbEI7SUFQVzs7O0FBU2I7Ozs7SUFHYSxvQkFBQTtBQUVYLFVBQUE7TUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBO01BRUEsSUFBRyxzQkFBSDtRQUNFLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLE9BQU8sQ0FBQztRQUN6QixPQUFPLElBQUMsQ0FBQSxPQUFPLENBQUM7UUFFaEIsSUFBRyxPQUFPLGFBQVAsS0FBd0IsUUFBM0I7QUFFRTtBQUFBLGVBQUEsV0FBQTs7WUFFRSxJQUFHLE9BQU8sT0FBUCxLQUFrQixTQUFyQjtjQUNFLElBQUcsT0FBQSxLQUFXLElBQWQ7Z0JBQ0UsSUFBQyxDQUFBLE9BQVEsQ0FBQSxJQUFBLENBQVQsR0FBaUIsY0FEbkI7ZUFERjthQUFBLE1BR0ssSUFBRyxPQUFPLE9BQVAsS0FBa0IsUUFBckI7Y0FDSCxJQUFDLENBQUEsT0FBUSxDQUFBLElBQUEsQ0FBVCxHQUFpQixDQUFDLENBQUMsS0FBRixDQUFRLGFBQVIsRUFBdUIsT0FBdkIsRUFEZDthQUFBLE1BQUE7Y0FHSCxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUEsMkJBQUEsR0FBMkIsQ0FBQyxPQUFPLE9BQVIsQ0FBM0IsR0FBMkMsZ0JBQTNDLEdBQTJELElBQTNELEdBQWdFLElBQWhFLENBQUEsR0FBcUUsT0FBM0UsRUFIRzs7QUFMUCxXQUZGO1NBSkY7O01BZUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxjQUFBLEdBQWUsSUFBQyxDQUFBLElBQWhCLEdBQXFCLEdBQTlCLEVBQWtDLElBQUMsQ0FBQSxPQUFuQztNQUVBLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFDLENBQUEsT0FBUjtJQXJCRjs7Ozs7QUFyWWYiLCJzb3VyY2VzQ29udGVudCI6WyJQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKVxuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5mcyA9IHJlcXVpcmUoJ2ZzJylcbnRlbXAgPSByZXF1aXJlKCd0ZW1wJykudHJhY2soKVxucmVhZEZpbGUgPSBQcm9taXNlLnByb21pc2lmeShmcy5yZWFkRmlsZSlcbndoaWNoID0gcmVxdWlyZSgnd2hpY2gnKVxuc3Bhd24gPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuc3Bhd25cbnBhdGggPSByZXF1aXJlKCdwYXRoJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBCZWF1dGlmaWVyXG5cbiAgIyMjXG4gIFByb21pc2VcbiAgIyMjXG4gIFByb21pc2U6IFByb21pc2VcblxuICAjIyNcbiAgTmFtZSBvZiBCZWF1dGlmaWVyXG4gICMjI1xuICBuYW1lOiAnQmVhdXRpZmllcidcblxuICAjIyNcbiAgU3VwcG9ydGVkIE9wdGlvbnNcblxuICBFbmFibGUgb3B0aW9ucyBmb3Igc3VwcG9ydGVkIGxhbmd1YWdlcy5cbiAgLSA8c3RyaW5nOmxhbmd1YWdlPjo8Ym9vbGVhbjphbGxfb3B0aW9uc19lbmFibGVkPlxuICAtIDxzdHJpbmc6bGFuZ3VhZ2U+OjxzdHJpbmc6b3B0aW9uX2tleT46PGJvb2xlYW46ZW5hYmxlZD5cbiAgLSA8c3RyaW5nOmxhbmd1YWdlPjo8c3RyaW5nOm9wdGlvbl9rZXk+OjxzdHJpbmc6cmVuYW1lPlxuICAtIDxzdHJpbmc6bGFuZ3VhZ2U+OjxzdHJpbmc6b3B0aW9uX2tleT46PGZ1bmN0aW9uOnRyYW5zZm9ybT5cbiAgLSA8c3RyaW5nOmxhbmd1YWdlPjo8c3RyaW5nOm9wdGlvbl9rZXk+OjxhcnJheTptYXBwZXI+XG4gICMjI1xuICBvcHRpb25zOiB7fVxuXG4gICMjI1xuICBJcyB0aGUgYmVhdXRpZmllciBhIGNvbW1hbmQtbGluZSBpbnRlcmZhY2UgYmVhdXRpZmllcj9cbiAgIyMjXG4gIGlzUHJlSW5zdGFsbGVkOiB0cnVlXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBsYW5ndWFnZXMgYnkgdGhpcyBCZWF1dGlmaWVyXG5cbiAgRXh0cmFjdGVkIGZyb20gdGhlIGtleXMgb2YgdGhlIGBvcHRpb25zYCBmaWVsZC5cbiAgIyMjXG4gIGxhbmd1YWdlczogbnVsbFxuXG4gICMjI1xuICBCZWF1dGlmeSB0ZXh0XG5cbiAgT3ZlcnJpZGUgdGhpcyBtZXRob2QgaW4gc3ViY2xhc3Nlc1xuICAjIyNcbiAgYmVhdXRpZnk6IG51bGxcblxuICAjIyNcbiAgU2hvdyBkZXByZWNhdGlvbiB3YXJuaW5nIHRvIHVzZXIuXG4gICMjI1xuICBkZXByZWNhdGU6ICh3YXJuaW5nKSAtPlxuICAgIGF0b20ubm90aWZpY2F0aW9ucz8uYWRkV2FybmluZyh3YXJuaW5nKVxuXG4gICMjI1xuICBDcmVhdGUgdGVtcG9yYXJ5IGZpbGVcbiAgIyMjXG4gIHRlbXBGaWxlOiAobmFtZSA9IFwiYXRvbS1iZWF1dGlmeS10ZW1wXCIsIGNvbnRlbnRzID0gXCJcIiwgZXh0ID0gXCJcIikgLT5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICMgY3JlYXRlIHRlbXAgZmlsZVxuICAgICAgdGVtcC5vcGVuKHtwcmVmaXg6IG5hbWUsIHN1ZmZpeDogZXh0fSwgKGVyciwgaW5mbykgPT5cbiAgICAgICAgQGRlYnVnKCd0ZW1wRmlsZScsIG5hbWUsIGVyciwgaW5mbylcbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuICAgICAgICBmcy53cml0ZShpbmZvLmZkLCBjb250ZW50cywgKGVycikgLT5cbiAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXG4gICAgICAgICAgZnMuY2xvc2UoaW5mby5mZCwgKGVycikgLT5cbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcbiAgICAgICAgICAgIHJlc29sdmUoaW5mby5wYXRoKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcblxuICAjIyNcbiAgUmVhZCBmaWxlXG4gICMjI1xuICByZWFkRmlsZTogKGZpbGVQYXRoKSAtPlxuICAgIFByb21pc2UucmVzb2x2ZShmaWxlUGF0aClcbiAgICAudGhlbigoZmlsZVBhdGgpIC0+XG4gICAgICByZXR1cm4gcmVhZEZpbGUoZmlsZVBhdGgsIFwidXRmOFwiKVxuICAgIClcblxuICAjIyNcbiAgRmluZCBmaWxlXG4gICMjI1xuICBmaW5kRmlsZTogKHN0YXJ0RGlyLCBmaWxlTmFtZXMpIC0+XG4gICAgdGhyb3cgbmV3IEVycm9yIFwiU3BlY2lmeSBmaWxlIG5hbWVzIHRvIGZpbmQuXCIgdW5sZXNzIGFyZ3VtZW50cy5sZW5ndGhcbiAgICB1bmxlc3MgZmlsZU5hbWVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgIGZpbGVOYW1lcyA9IFtmaWxlTmFtZXNdXG4gICAgc3RhcnREaXIgPSBzdGFydERpci5zcGxpdChwYXRoLnNlcClcbiAgICB3aGlsZSBzdGFydERpci5sZW5ndGhcbiAgICAgIGN1cnJlbnREaXIgPSBzdGFydERpci5qb2luKHBhdGguc2VwKVxuICAgICAgZm9yIGZpbGVOYW1lIGluIGZpbGVOYW1lc1xuICAgICAgICBmaWxlUGF0aCA9IHBhdGguam9pbihjdXJyZW50RGlyLCBmaWxlTmFtZSlcbiAgICAgICAgdHJ5XG4gICAgICAgICAgZnMuYWNjZXNzU3luYyhmaWxlUGF0aCwgZnMuUl9PSylcbiAgICAgICAgICByZXR1cm4gZmlsZVBhdGhcbiAgICAgIHN0YXJ0RGlyLnBvcCgpXG4gICAgcmV0dXJuIG51bGxcblxuIyBSZXRyaWV2ZXMgdGhlIGRlZmF1bHQgbGluZSBlbmRpbmcgYmFzZWQgdXBvbiB0aGUgQXRvbSBjb25maWd1cmF0aW9uXG4gICMgIGBsaW5lLWVuZGluZy1zZWxlY3Rvci5kZWZhdWx0TGluZUVuZGluZ2AuIElmIHRoZSBBdG9tIGNvbmZpZ3VyYXRpb25cbiAgIyAgaW5kaWNhdGVzIFwiT1MgRGVmYXVsdFwiLCB0aGUgYHByb2Nlc3MucGxhdGZvcm1gIGlzIHF1ZXJpZWQsIHJldHVybmluZ1xuICAjICBDUkxGIGZvciBXaW5kb3dzIHN5c3RlbXMgYW5kIExGIGZvciBhbGwgb3RoZXIgc3lzdGVtcy5cbiAgIyBDb2RlIG1vZGlmaWVkIGZyb20gYXRvbS9saW5lLWVuZGluZy1zZWxlY3RvclxuICAjIHJldHVybnM6IFRoZSBjb3JyZWN0IGxpbmUtZW5kaW5nIGNoYXJhY3RlciBzZXF1ZW5jZSBiYXNlZCB1cG9uIHRoZSBBdG9tXG4gICMgIGNvbmZpZ3VyYXRpb24sIG9yIGBudWxsYCBpZiB0aGUgQXRvbSBsaW5lIGVuZGluZyBjb25maWd1cmF0aW9uIHdhcyBub3RcbiAgIyAgcmVjb2duaXplZC5cbiAgIyBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2xpbmUtZW5kaW5nLXNlbGVjdG9yL2Jsb2IvbWFzdGVyL2xpYi9tYWluLmpzXG4gIGdldERlZmF1bHRMaW5lRW5kaW5nOiAoY3JsZixsZixvcHRpb25Fb2wpIC0+XG4gICAgaWYgKCFvcHRpb25Fb2wgfHwgb3B0aW9uRW9sID09ICdTeXN0ZW0gRGVmYXVsdCcpXG4gICAgICBvcHRpb25Fb2wgPSBhdG9tLmNvbmZpZy5nZXQoJ2xpbmUtZW5kaW5nLXNlbGVjdG9yLmRlZmF1bHRMaW5lRW5kaW5nJylcbiAgICBzd2l0Y2ggb3B0aW9uRW9sXG4gICAgICB3aGVuICdMRidcbiAgICAgICAgcmV0dXJuIGxmXG4gICAgICB3aGVuICdDUkxGJ1xuICAgICAgICByZXR1cm4gY3JsZlxuICAgICAgd2hlbiAnT1MgRGVmYXVsdCdcbiAgICAgICAgcmV0dXJuIGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJyB0aGVuIGNybGYgZWxzZSBsZlxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gbGZcblxuICAjIyNcbiAgSWYgcGxhdGZvcm0gaXMgV2luZG93c1xuICAjIyNcbiAgaXNXaW5kb3dzOiBkbyAtPlxuICAgIHJldHVybiBuZXcgUmVnRXhwKCded2luJykudGVzdChwcm9jZXNzLnBsYXRmb3JtKVxuXG4gICMjI1xuICBHZXQgU2hlbGwgRW52aXJvbm1lbnQgdmFyaWFibGVzXG5cbiAgU3BlY2lhbCB0aGFuayB5b3UgdG8gQGlvcXVhdGl4XG4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vaW9xdWF0aXgvc2NyaXB0LXJ1bm5lci9ibG9iL3YxLjUuMC9saWIvc2NyaXB0LXJ1bm5lci5jb2ZmZWUjTDQ1LUw2M1xuICAjIyNcbiAgX2VudkNhY2hlOiBudWxsXG4gIF9lbnZDYWNoZURhdGU6IG51bGxcbiAgX2VudkNhY2hlRXhwaXJ5OiAxMDAwMCAjIDEwIHNlY29uZHNcbiAgZ2V0U2hlbGxFbnZpcm9ubWVudDogLT5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICMgQ2hlY2sgQ2FjaGVcbiAgICAgIGlmIEBfZW52Q2FjaGU/IGFuZCBAX2VudkNhY2hlRGF0ZT9cbiAgICAgICAgIyBDaGVjayBpZiBDYWNoZSBpcyBvbGRcbiAgICAgICAgaWYgKG5ldyBEYXRlKCkgLSBAX2VudkNhY2hlRGF0ZSkgPCBAX2VudkNhY2hlRXhwaXJ5XG4gICAgICAgICAgIyBTdGlsbCBmcmVzaFxuICAgICAgICAgIHJldHVybiByZXNvbHZlKEBfZW52Q2FjaGUpXG5cbiAgICAgICMgQ2hlY2sgaWYgV2luZG93c1xuICAgICAgaWYgQGlzV2luZG93c1xuICAgICAgICAjIFdpbmRvd3NcbiAgICAgICAgIyBVc2UgZGVmYXVsdFxuICAgICAgICByZXNvbHZlKHByb2Nlc3MuZW52KVxuICAgICAgZWxzZVxuICAgICAgICAjIE1hYyAmIExpbnV4XG4gICAgICAgICMgSSB0cmllZCB1c2luZyBDaGlsZFByb2Nlc3MuZXhlY0ZpbGUgYnV0IHRoZXJlIGlzIG5vIHdheSB0byBzZXQgZGV0YWNoZWQgYW5kXG4gICAgICAgICMgdGhpcyBjYXVzZXMgdGhlIGNoaWxkIHNoZWxsIHRvIGxvY2sgdXAuXG4gICAgICAgICMgVGhpcyBjb21tYW5kIHJ1bnMgYW4gaW50ZXJhY3RpdmUgbG9naW4gc2hlbGwgYW5kXG4gICAgICAgICMgZXhlY3V0ZXMgdGhlIGV4cG9ydCBjb21tYW5kIHRvIGdldCBhIGxpc3Qgb2YgZW52aXJvbm1lbnQgdmFyaWFibGVzLlxuICAgICAgICAjIFdlIHRoZW4gdXNlIHRoZXNlIHRvIHJ1biB0aGUgc2NyaXB0OlxuICAgICAgICBjaGlsZCA9IHNwYXduIHByb2Nlc3MuZW52LlNIRUxMLCBbJy1pbGMnLCAnZW52J10sXG4gICAgICAgICAgIyBUaGlzIGlzIGVzc2VudGlhbCBmb3IgaW50ZXJhY3RpdmUgc2hlbGxzLCBvdGhlcndpc2UgaXQgbmV2ZXIgZmluaXNoZXM6XG4gICAgICAgICAgZGV0YWNoZWQ6IHRydWUsXG4gICAgICAgICAgIyBXZSBkb24ndCBjYXJlIGFib3V0IHN0ZGluLCBzdGRlcnIgY2FuIGdvIG91dCB0aGUgdXN1YWwgd2F5OlxuICAgICAgICAgIHN0ZGlvOiBbJ2lnbm9yZScsICdwaXBlJywgcHJvY2Vzcy5zdGRlcnJdXG4gICAgICAgICMgV2UgYnVmZmVyIHN0ZG91dDpcbiAgICAgICAgYnVmZmVyID0gJydcbiAgICAgICAgY2hpbGQuc3Rkb3V0Lm9uICdkYXRhJywgKGRhdGEpIC0+IGJ1ZmZlciArPSBkYXRhXG4gICAgICAgICMgV2hlbiB0aGUgcHJvY2VzcyBmaW5pc2hlcywgZXh0cmFjdCB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzIGFuZCBwYXNzIHRoZW0gdG8gdGhlIGNhbGxiYWNrOlxuICAgICAgICBjaGlsZC5vbiAnY2xvc2UnLCAoY29kZSwgc2lnbmFsKSA9PlxuICAgICAgICAgIGlmIGNvZGUgaXNudCAwXG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihcIkNvdWxkIG5vdCBnZXQgU2hlbGwgRW52aXJvbm1lbnQuIEV4aXQgY29kZTogXCIrY29kZStcIiwgU2lnbmFsOiBcIitzaWduYWwpKVxuICAgICAgICAgIGVudmlyb25tZW50ID0ge31cbiAgICAgICAgICBmb3IgZGVmaW5pdGlvbiBpbiBidWZmZXIuc3BsaXQoJ1xcbicpXG4gICAgICAgICAgICBba2V5LCB2YWx1ZV0gPSBkZWZpbml0aW9uLnNwbGl0KCc9JywgMilcbiAgICAgICAgICAgIGVudmlyb25tZW50W2tleV0gPSB2YWx1ZSBpZiBrZXkgIT0gJydcbiAgICAgICAgICAjIENhY2hlIEVudmlyb25tZW50XG4gICAgICAgICAgQF9lbnZDYWNoZSA9IGVudmlyb25tZW50XG4gICAgICAgICAgQF9lbnZDYWNoZURhdGUgPSBuZXcgRGF0ZSgpXG4gICAgICAgICAgcmVzb2x2ZShlbnZpcm9ubWVudClcbiAgICAgIClcblxuICAjIyNcbiAgTGlrZSB0aGUgdW5peCB3aGljaCB1dGlsaXR5LlxuXG4gIEZpbmRzIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiBhIHNwZWNpZmllZCBleGVjdXRhYmxlIGluIHRoZSBQQVRIIGVudmlyb25tZW50IHZhcmlhYmxlLlxuICBEb2VzIG5vdCBjYWNoZSB0aGUgcmVzdWx0cyxcbiAgc28gaGFzaCAtciBpcyBub3QgbmVlZGVkIHdoZW4gdGhlIFBBVEggY2hhbmdlcy5cbiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9pc2FhY3Mvbm9kZS13aGljaFxuICAjIyNcbiAgd2hpY2g6IChleGUsIG9wdGlvbnMgPSB7fSkgLT5cbiAgICAjIEdldCBQQVRIIGFuZCBvdGhlciBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgICBAZ2V0U2hlbGxFbnZpcm9ubWVudCgpXG4gICAgLnRoZW4oKGVudikgPT5cbiAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICAgIG9wdGlvbnMucGF0aCA/PSBlbnYuUEFUSFxuICAgICAgICBpZiBAaXNXaW5kb3dzXG4gICAgICAgICAgIyBFbnZpcm9ubWVudCB2YXJpYWJsZXMgYXJlIGNhc2UtaW5zZW5zaXRpdmUgaW4gd2luZG93c1xuICAgICAgICAgICMgQ2hlY2sgZW52IGZvciBhIGNhc2UtaW5zZW5zaXRpdmUgJ3BhdGgnIHZhcmlhYmxlXG4gICAgICAgICAgaWYgIW9wdGlvbnMucGF0aFxuICAgICAgICAgICAgZm9yIGkgb2YgZW52XG4gICAgICAgICAgICAgIGlmIGkudG9Mb3dlckNhc2UoKSBpcyBcInBhdGhcIlxuICAgICAgICAgICAgICAgIG9wdGlvbnMucGF0aCA9IGVudltpXVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAjIFRyaWNrIG5vZGUtd2hpY2ggaW50byBpbmNsdWRpbmcgZmlsZXNcbiAgICAgICAgICAjIHdpdGggbm8gZXh0ZW5zaW9uIGFzIGV4ZWN1dGFibGVzLlxuICAgICAgICAgICMgUHV0IGVtcHR5IGV4dGVuc2lvbiBsYXN0IHRvIGFsbG93IGZvciBvdGhlciByZWFsIGV4dGVuc2lvbnMgZmlyc3RcbiAgICAgICAgICBvcHRpb25zLnBhdGhFeHQgPz0gXCIje3Byb2Nlc3MuZW52LlBBVEhFWFQgPyAnLkVYRSd9O1wiXG4gICAgICAgIHdoaWNoKGV4ZSwgb3B0aW9ucywgKGVyciwgcGF0aCkgLT5cbiAgICAgICAgICByZXNvbHZlKGV4ZSkgaWYgZXJyXG4gICAgICAgICAgcmVzb2x2ZShwYXRoKVxuICAgICAgICApXG4gICAgICApXG4gICAgKVxuXG4gICMjI1xuICBBZGQgaGVscCB0byBlcnJvci5kZXNjcmlwdGlvblxuXG4gIE5vdGU6IGVycm9yLmRlc2NyaXB0aW9uIGlzIG5vdCBvZmZpY2lhbGx5IHVzZWQgaW4gSmF2YVNjcmlwdCxcbiAgaG93ZXZlciBpdCBpcyB1c2VkIGludGVybmFsbHkgZm9yIEF0b20gQmVhdXRpZnkgd2hlbiBkaXNwbGF5aW5nIGVycm9ycy5cbiAgIyMjXG4gIGNvbW1hbmROb3RGb3VuZEVycm9yOiAoZXhlLCBoZWxwKSAtPlxuICAgICMgQ3JlYXRlIG5ldyBpbXByb3ZlZCBlcnJvclxuICAgICMgbm90aWZ5IHVzZXIgdGhhdCBpdCBtYXkgbm90IGJlXG4gICAgIyBpbnN0YWxsZWQgb3IgaW4gcGF0aFxuICAgIG1lc3NhZ2UgPSBcIkNvdWxkIG5vdCBmaW5kICcje2V4ZX0nLiBcXFxuICAgICAgICAgICAgVGhlIHByb2dyYW0gbWF5IG5vdCBiZSBpbnN0YWxsZWQuXCJcbiAgICBlciA9IG5ldyBFcnJvcihtZXNzYWdlKVxuICAgIGVyLmNvZGUgPSAnQ29tbWFuZE5vdEZvdW5kJ1xuICAgIGVyLmVycm5vID0gZXIuY29kZVxuICAgIGVyLnN5c2NhbGwgPSAnYmVhdXRpZmllcjo6cnVuJ1xuICAgIGVyLmZpbGUgPSBleGVcbiAgICBpZiBoZWxwP1xuICAgICAgaWYgdHlwZW9mIGhlbHAgaXMgXCJvYmplY3RcIlxuICAgICAgICAjIEJhc2ljIG5vdGljZVxuICAgICAgICBoZWxwU3RyID0gXCJTZWUgI3toZWxwLmxpbmt9IGZvciBwcm9ncmFtIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFsbGF0aW9uIGluc3RydWN0aW9ucy5cXG5cIlxuICAgICAgICAjIEhlbHAgdG8gY29uZmlndXJlIEF0b20gQmVhdXRpZnkgZm9yIHByb2dyYW0ncyBwYXRoXG4gICAgICAgIGhlbHBTdHIgKz0gXCJZb3UgY2FuIGNvbmZpZ3VyZSBBdG9tIEJlYXV0aWZ5IFxcXG4gICAgICAgICAgICAgICAgICAgIHdpdGggdGhlIGFic29sdXRlIHBhdGggXFxcbiAgICAgICAgICAgICAgICAgICAgdG8gJyN7aGVscC5wcm9ncmFtIG9yIGV4ZX0nIGJ5IHNldHRpbmcgXFxcbiAgICAgICAgICAgICAgICAgICAgJyN7aGVscC5wYXRoT3B0aW9ufScgaW4gXFxcbiAgICAgICAgICAgICAgICAgICAgdGhlIEF0b20gQmVhdXRpZnkgcGFja2FnZSBzZXR0aW5ncy5cXG5cIiBpZiBoZWxwLnBhdGhPcHRpb25cbiAgICAgICAgIyBPcHRpb25hbCwgYWRkaXRpb25hbCBoZWxwXG4gICAgICAgIGhlbHBTdHIgKz0gaGVscC5hZGRpdGlvbmFsIGlmIGhlbHAuYWRkaXRpb25hbFxuICAgICAgICAjIENvbW1vbiBIZWxwXG4gICAgICAgIGlzc3VlU2VhcmNoTGluayA9XG4gICAgICAgICAgXCJodHRwczovL2dpdGh1Yi5jb20vR2xhdmluMDAxL2F0b20tYmVhdXRpZnkvXFxcbiAgICAgICAgICAgICAgICAgIHNlYXJjaD9xPSN7ZXhlfSZ0eXBlPUlzc3Vlc1wiXG4gICAgICAgIGRvY3NMaW5rID0gXCJodHRwczovL2dpdGh1Yi5jb20vR2xhdmluMDAxL1xcXG4gICAgICAgICAgICAgICAgICBhdG9tLWJlYXV0aWZ5L3RyZWUvbWFzdGVyL2RvY3NcIlxuICAgICAgICBoZWxwU3RyICs9IFwiWW91ciBwcm9ncmFtIGlzIHByb3Blcmx5IGluc3RhbGxlZCBpZiBydW5uaW5nIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyN7aWYgQGlzV2luZG93cyB0aGVuICd3aGVyZS5leGUnIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSAnd2hpY2gnfSAje2V4ZX0nIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW4geW91ciAje2lmIEBpc1dpbmRvd3MgdGhlbiAnQ01EIHByb21wdCcgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlICdUZXJtaW5hbCd9IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJucyBhbiBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBleGVjdXRhYmxlLiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIElmIHRoaXMgZG9lcyBub3Qgd29yayB0aGVuIHlvdSBoYXZlIG5vdCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbGxlZCB0aGUgcHJvZ3JhbSBjb3JyZWN0bHkgYW5kIHNvIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXRvbSBCZWF1dGlmeSB3aWxsIG5vdCBmaW5kIHRoZSBwcm9ncmFtLiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEF0b20gQmVhdXRpZnkgcmVxdWlyZXMgdGhhdCB0aGUgcHJvZ3JhbSBiZSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kIGluIHlvdXIgUEFUSCBlbnZpcm9ubWVudCB2YXJpYWJsZS4gXFxuXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RlIHRoYXQgdGhpcyBpcyBub3QgYW4gQXRvbSBCZWF1dGlmeSBpc3N1ZSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGJlYXV0aWZpY2F0aW9uIGRvZXMgbm90IHdvcmsgYW5kIHRoZSBhYm92ZSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmQgYWxzbyBkb2VzIG5vdCB3b3JrOiB0aGlzIGlzIGV4cGVjdGVkIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVoYXZpb3VyLCBzaW5jZSB5b3UgaGF2ZSBub3QgcHJvcGVybHkgaW5zdGFsbGVkIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeW91ciBwcm9ncmFtLiBQbGVhc2UgcHJvcGVybHkgc2V0dXAgdGhlIHByb2dyYW0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmQgc2VhcmNoIHRocm91Z2ggZXhpc3RpbmcgQXRvbSBCZWF1dGlmeSBpc3N1ZXMgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWZvcmUgY3JlYXRpbmcgYSBuZXcgaXNzdWUuIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VlICN7aXNzdWVTZWFyY2hMaW5rfSBmb3IgcmVsYXRlZCBJc3N1ZXMgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgI3tkb2NzTGlua30gZm9yIGRvY3VtZW50YXRpb24uIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSWYgeW91IGFyZSBzdGlsbCB1bmFibGUgdG8gcmVzb2x2ZSB0aGlzIGlzc3VlIG9uIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeW91ciBvd24gdGhlbiBwbGVhc2UgY3JlYXRlIGEgbmV3IGlzc3VlIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzayBmb3IgaGVscC5cXG5cIlxuICAgICAgICBlci5kZXNjcmlwdGlvbiA9IGhlbHBTdHJcbiAgICAgIGVsc2UgI2lmIHR5cGVvZiBoZWxwIGlzIFwic3RyaW5nXCJcbiAgICAgICAgZXIuZGVzY3JpcHRpb24gPSBoZWxwXG4gICAgcmV0dXJuIGVyXG5cbiAgIyMjXG4gIFJ1biBjb21tYW5kLWxpbmUgaW50ZXJmYWNlIGNvbW1hbmRcbiAgIyMjXG4gIHJ1bjogKGV4ZWN1dGFibGUsIGFyZ3MsIHtjd2QsIGlnbm9yZVJldHVybkNvZGUsIGhlbHAsIG9uU3RkaW59ID0ge30pIC0+XG4gICAgIyBGbGF0dGVuIGFyZ3MgZmlyc3RcbiAgICBhcmdzID0gXy5mbGF0dGVuKGFyZ3MpXG5cbiAgICAjIFJlc29sdmUgZXhlY3V0YWJsZSBhbmQgYWxsIGFyZ3NcbiAgICBQcm9taXNlLmFsbChbZXhlY3V0YWJsZSwgUHJvbWlzZS5hbGwoYXJncyldKVxuICAgICAgLnRoZW4oKFtleGVOYW1lLCBhcmdzXSkgPT5cbiAgICAgICAgQGRlYnVnKCdleGVOYW1lLCBhcmdzOicsIGV4ZU5hbWUsIGFyZ3MpXG5cbiAgICAgICAgIyBHZXQgUEFUSCBhbmQgb3RoZXIgZW52aXJvbm1lbnQgdmFyaWFibGVzXG4gICAgICAgIFByb21pc2UuYWxsKFtleGVOYW1lLCBhcmdzLCBAZ2V0U2hlbGxFbnZpcm9ubWVudCgpLCBAd2hpY2goZXhlTmFtZSldKVxuICAgICAgKVxuICAgICAgLnRoZW4oKFtleGVOYW1lLCBhcmdzLCBlbnYsIGV4ZVBhdGhdKSA9PlxuICAgICAgICBAZGVidWcoJ2V4ZVBhdGgsIGVudjonLCBleGVQYXRoLCBlbnYpXG4gICAgICAgIEBkZWJ1ZygnYXJncycsIGFyZ3MpXG5cbiAgICAgICAgZXhlID0gZXhlUGF0aCA/IGV4ZU5hbWVcbiAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICBjd2Q6IGN3ZFxuICAgICAgICAgIGVudjogZW52XG4gICAgICAgIH1cblxuICAgICAgICBAc3Bhd24oZXhlLCBhcmdzLCBvcHRpb25zLCBvblN0ZGluKVxuICAgICAgICAgIC50aGVuKCh7cmV0dXJuQ29kZSwgc3Rkb3V0LCBzdGRlcnJ9KSA9PlxuICAgICAgICAgICAgQHZlcmJvc2UoJ3NwYXduIHJlc3VsdCcsIHJldHVybkNvZGUsIHN0ZG91dCwgc3RkZXJyKVxuXG4gICAgICAgICAgICAjIElmIHJldHVybiBjb2RlIGlzIG5vdCAwIHRoZW4gZXJyb3Igb2NjdXJlZFxuICAgICAgICAgICAgaWYgbm90IGlnbm9yZVJldHVybkNvZGUgYW5kIHJldHVybkNvZGUgaXNudCAwXG4gICAgICAgICAgICAgICMgb3BlcmFibGUgcHJvZ3JhbSBvciBiYXRjaCBmaWxlXG4gICAgICAgICAgICAgIHdpbmRvd3NQcm9ncmFtTm90Rm91bmRNc2cgPSBcImlzIG5vdCByZWNvZ25pemVkIGFzIGFuIGludGVybmFsIG9yIGV4dGVybmFsIGNvbW1hbmRcIlxuXG4gICAgICAgICAgICAgIEB2ZXJib3NlKHN0ZGVyciwgd2luZG93c1Byb2dyYW1Ob3RGb3VuZE1zZylcblxuICAgICAgICAgICAgICBpZiBAaXNXaW5kb3dzIGFuZCByZXR1cm5Db2RlIGlzIDEgYW5kIHN0ZGVyci5pbmRleE9mKHdpbmRvd3NQcm9ncmFtTm90Rm91bmRNc2cpIGlzbnQgLTFcbiAgICAgICAgICAgICAgICB0aHJvdyBAY29tbWFuZE5vdEZvdW5kRXJyb3IoZXhlTmFtZSwgaGVscClcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihzdGRlcnIpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHN0ZG91dFxuICAgICAgICAgIClcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT5cbiAgICAgICAgICAgIEBkZWJ1ZygnZXJyb3InLCBlcnIpXG5cbiAgICAgICAgICAgICMgQ2hlY2sgaWYgZXJyb3IgaXMgRU5PRU5UIChjb21tYW5kIGNvdWxkIG5vdCBiZSBmb3VuZClcbiAgICAgICAgICAgIGlmIGVyci5jb2RlIGlzICdFTk9FTlQnIG9yIGVyci5lcnJubyBpcyAnRU5PRU5UJ1xuICAgICAgICAgICAgICB0aHJvdyBAY29tbWFuZE5vdEZvdW5kRXJyb3IoZXhlTmFtZSwgaGVscClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgIyBjb250aW51ZSBhcyBub3JtYWwgZXJyb3JcbiAgICAgICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgICAgKVxuICAgICAgKVxuXG4gICMjI1xuICBTcGF3blxuICAjIyNcbiAgc3Bhd246IChleGUsIGFyZ3MsIG9wdGlvbnMsIG9uU3RkaW4pIC0+XG4gICAgIyBSZW1vdmUgdW5kZWZpbmVkL251bGwgdmFsdWVzXG4gICAgYXJncyA9IF8ud2l0aG91dChhcmdzLCB1bmRlZmluZWQpXG4gICAgYXJncyA9IF8ud2l0aG91dChhcmdzLCBudWxsKVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBAZGVidWcoJ3NwYXduJywgZXhlLCBhcmdzKVxuXG4gICAgICBjbWQgPSBzcGF3bihleGUsIGFyZ3MsIG9wdGlvbnMpXG4gICAgICBzdGRvdXQgPSBcIlwiXG4gICAgICBzdGRlcnIgPSBcIlwiXG5cbiAgICAgIGNtZC5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YSkgLT5cbiAgICAgICAgc3Rkb3V0ICs9IGRhdGFcbiAgICAgIClcbiAgICAgIGNtZC5zdGRlcnIub24oJ2RhdGEnLCAoZGF0YSkgLT5cbiAgICAgICAgc3RkZXJyICs9IGRhdGFcbiAgICAgIClcbiAgICAgIGNtZC5vbignY2xvc2UnLCAocmV0dXJuQ29kZSkgPT5cbiAgICAgICAgQGRlYnVnKCdzcGF3biBkb25lJywgcmV0dXJuQ29kZSwgc3RkZXJyLCBzdGRvdXQpXG4gICAgICAgIHJlc29sdmUoe3JldHVybkNvZGUsIHN0ZG91dCwgc3RkZXJyfSlcbiAgICAgIClcbiAgICAgIGNtZC5vbignZXJyb3InLCAoZXJyKSA9PlxuICAgICAgICBAZGVidWcoJ2Vycm9yJywgZXJyKVxuICAgICAgICByZWplY3QoZXJyKVxuICAgICAgKVxuXG4gICAgICBvblN0ZGluIGNtZC5zdGRpbiBpZiBvblN0ZGluXG4gICAgKVxuXG4gICMjI1xuICBMb2dnZXIgaW5zdGFuY2VcbiAgIyMjXG4gIGxvZ2dlcjogbnVsbFxuICAjIyNcbiAgSW5pdGlhbGl6ZSBhbmQgY29uZmlndXJlIExvZ2dlclxuICAjIyNcbiAgc2V0dXBMb2dnZXI6IC0+XG4gICAgQGxvZ2dlciA9IHJlcXVpcmUoJy4uL2xvZ2dlcicpKF9fZmlsZW5hbWUpXG4gICAgIyBAdmVyYm9zZShAbG9nZ2VyKVxuICAgICMgTWVyZ2UgbG9nZ2VyIG1ldGhvZHMgaW50byBiZWF1dGlmaWVyIGNsYXNzXG4gICAgZm9yIGtleSwgbWV0aG9kIG9mIEBsb2dnZXJcbiAgICAgICMgQHZlcmJvc2Uoa2V5LCBtZXRob2QpXG4gICAgICBAW2tleV0gPSBtZXRob2RcbiAgICBAdmVyYm9zZShcIiN7QG5hbWV9IGJlYXV0aWZpZXIgbG9nZ2VyIGhhcyBiZWVuIGluaXRpYWxpemVkLlwiKVxuXG4gICMjI1xuICBDb25zdHJ1Y3RvciB0byBzZXR1cCBiZWF1dGlmZXJcbiAgIyMjXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgICMgU2V0dXAgbG9nZ2VyXG4gICAgQHNldHVwTG9nZ2VyKClcbiAgICAjIEhhbmRsZSBnbG9iYWwgb3B0aW9uc1xuICAgIGlmIEBvcHRpb25zLl8/XG4gICAgICBnbG9iYWxPcHRpb25zID0gQG9wdGlvbnMuX1xuICAgICAgZGVsZXRlIEBvcHRpb25zLl9cbiAgICAgICMgT25seSBtZXJnZSBpZiBnbG9iYWxPcHRpb25zIGlzIGFuIG9iamVjdFxuICAgICAgaWYgdHlwZW9mIGdsb2JhbE9wdGlvbnMgaXMgXCJvYmplY3RcIlxuICAgICAgICAjIEl0ZXJhdGUgb3ZlciBhbGwgc3VwcG9ydGVkIGxhbmd1YWdlc1xuICAgICAgICBmb3IgbGFuZywgb3B0aW9ucyBvZiBAb3B0aW9uc1xuICAgICAgICAgICNcbiAgICAgICAgICBpZiB0eXBlb2Ygb3B0aW9ucyBpcyBcImJvb2xlYW5cIlxuICAgICAgICAgICAgaWYgb3B0aW9ucyBpcyB0cnVlXG4gICAgICAgICAgICAgIEBvcHRpb25zW2xhbmddID0gZ2xvYmFsT3B0aW9uc1xuICAgICAgICAgIGVsc2UgaWYgdHlwZW9mIG9wdGlvbnMgaXMgXCJvYmplY3RcIlxuICAgICAgICAgICAgQG9wdGlvbnNbbGFuZ10gPSBfLm1lcmdlKGdsb2JhbE9wdGlvbnMsIG9wdGlvbnMpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHdhcm4oXCJVbnN1cHBvcnRlZCBvcHRpb25zIHR5cGUgI3t0eXBlb2Ygb3B0aW9uc30gZm9yIGxhbmd1YWdlICN7bGFuZ306IFwiKyBvcHRpb25zKVxuICAgIEB2ZXJib3NlKFwiT3B0aW9ucyBmb3IgI3tAbmFtZX06XCIsIEBvcHRpb25zKVxuICAgICMgU2V0IHN1cHBvcnRlZCBsYW5ndWFnZXNcbiAgICBAbGFuZ3VhZ2VzID0gXy5rZXlzKEBvcHRpb25zKVxuIl19
