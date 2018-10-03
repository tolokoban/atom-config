Object.defineProperty(exports, '__esModule', {
  value: true
});

var getJSHintVersion = _asyncToGenerator(function* (config) {
  var execPath = config.executablePath !== '' ? config.executablePath : _path2['default'].join(__dirname, '..', 'node_modules', 'jshint', 'bin', 'jshint');

  if (debugCache.has(execPath)) {
    return debugCache.get(execPath);
  }

  // NOTE: Yes, `jshint --version` gets output on STDERR...
  var jshintVersion = yield atomlinter.execNode(execPath, ['--version'], { stream: 'stderr' });
  debugCache.set(execPath, jshintVersion);
  return jshintVersion;
});

var getDebugInfo = _asyncToGenerator(function* () {
  var linterJSHintVersion = getPackageMeta().version;
  var config = atom.config.get('linter-jshint');
  var jshintVersion = yield getJSHintVersion(config);
  var hoursSinceRestart = Math.round(process.uptime() / 3600 * 10) / 10;
  var editorScopes = getEditorScopes();

  return {
    atomVersion: atom.getVersion(),
    linterJSHintVersion: linterJSHintVersion,
    linterJSHintConfig: config,
    jshintVersion: jshintVersion,
    hoursSinceRestart: hoursSinceRestart,
    platform: process.platform,
    editorScopes: editorScopes
  };
});

exports.getDebugInfo = getDebugInfo;

var generateDebugString = _asyncToGenerator(function* () {
  var debug = yield getDebugInfo();
  var details = ['Atom version: ' + debug.atomVersion, 'linter-jshint version: v' + debug.linterJSHintVersion, 'JSHint version: ' + debug.jshintVersion, 'Hours since last Atom restart: ' + debug.hoursSinceRestart, 'Platform: ' + debug.platform, 'Current file\'s scopes: ' + JSON.stringify(debug.editorScopes, null, 2), 'linter-jshint configuration: ' + JSON.stringify(debug.linterJSHintConfig, null, 2)];
  return details.join('\n');
}

/**
 * Finds the oldest open issue of the same title in this project's repository.
 * Results are cached for 1 hour.
 * @param  {string} issueTitle The issue title to search for
 * @return {string|null}       The URL of the found issue or null if none is found.
 */
);

exports.generateDebugString = generateDebugString;

var findSimilarIssue = _asyncToGenerator(function* (issueTitle) {
  if (debugCache.has(issueTitle)) {
    var oldResult = debugCache.get(issueTitle);
    if (new Date().valueOf() < oldResult.expires) {
      return oldResult.url;
    }
    debugCache['delete'](issueTitle);
  }

  var oneHour = 1000 * 60 * 60; // ms * s * m
  var tenMinutes = 1000 * 60 * 10; // ms * s * m
  var repoUrl = getPackageMeta().repository.url;
  var repo = repoUrl.replace(/https?:\/\/(\d+\.)?github\.com\//gi, '');
  var query = encodeURIComponent('repo:' + repo + ' is:open in:title ' + issueTitle);
  var githubHeaders = new Headers({
    accept: 'application/vnd.github.v3+json',
    contentType: 'application/json'
  });
  var queryUrl = 'https://api.github.com/search/issues?q=' + query + '&sort=created&order=asc';

  var url = null;
  try {
    var rawResponse = yield fetch(queryUrl, { headers: githubHeaders });
    if (!rawResponse.ok) {
      // Querying GitHub API failed, don't try again for 10 minutes.
      debugCache.set(issueTitle, {
        expires: new Date().valueOf() + tenMinutes,
        url: url
      });
      return null;
    }
    var data = yield rawResponse.json();
    if ((data !== null ? data.items : null) !== null) {
      if (Array.isArray(data.items) && data.items.length > 0) {
        var issue = data.items[0];
        if (issue.title.includes(issueTitle)) {
          url = repoUrl + '/issues/' + issue.number;
        }
      }
    }
  } catch (e) {
    // Do nothing
  }
  debugCache.set(issueTitle, {
    expires: new Date().valueOf() + oneHour,
    url: url
  });
  return url;
});

var generateInvalidTrace = _asyncToGenerator(function* (msgLine, msgCol, file, textEditor, error) {
  var errMsgRange = msgLine + 1 + ':' + msgCol;
  var rangeText = 'Requested point: ' + errMsgRange;
  var packageRepoUrl = getPackageMeta().repository.url;
  var issueURL = packageRepoUrl + '/issues/new';
  var titleText = 'Invalid position given by \'' + error.code + '\'';
  var invalidMessage = {
    severity: 'error',
    description: 'Original message: ' + error.code + ' - ' + error.reason + '  \n' + rangeText + '.',
    location: {
      file: file,
      position: atomlinter.generateRange(textEditor)
    }
  };
  var similarIssueUrl = yield findSimilarIssue(titleText);
  if (similarIssueUrl !== null) {
    invalidMessage.excerpt = titleText + '. This has already been reported, see message link!';
    invalidMessage.url = similarIssueUrl;
    return invalidMessage;
  }

  var title = encodeURIComponent(titleText);
  var body = encodeURIComponent(['JSHint returned a point that did not exist in the document being edited.', 'Rule: `' + error.code + '`', rangeText, '', '', '<!-- If at all possible, please include code to reproduce this issue! -->', '', '', 'Debug information:', '```', yield generateDebugString(), '```'].join('\n'));
  var newIssueURL = issueURL + '?title=' + title + '&body=' + body;
  invalidMessage.excerpt = titleText + '. Please report this using the message link!';
  invalidMessage.url = newIssueURL;
  return invalidMessage;
});

exports.generateInvalidTrace = generateInvalidTrace;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _shelljs = require('shelljs');

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _atomLinter = require('atom-linter');

var atomlinter = _interopRequireWildcard(_atomLinter);

var _fs = require('fs');

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies
'use babel';

var homeConfigPath = undefined;
var debugCache = new Map();

var readFile = _asyncToGenerator(function* (filePath) {
  return new Promise(function (resolve, reject) {
    (0, _fs.readFile)(filePath, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
});

var isIgnored = _asyncToGenerator(function* (filePath, ignorePath) {
  var fileDir = _path2['default'].dirname(filePath);
  var rawIgnoreList = (yield readFile(ignorePath)).split(/[\r\n]/);

  // "Fix" the patterns in the same way JSHint does
  var ignoreList = rawIgnoreList.filter(function (line) {
    return !!line.trim();
  }).map(function (pattern) {
    if (pattern.startsWith('!')) {
      return '!' + _path2['default'].resolve(fileDir, pattern.substr(1).trim());
    }
    return _path2['default'].join(fileDir, pattern.trim());
  });

  // Check the modified patterns
  // NOTE: This is what JSHint actually does, not what the documentation says
  return ignoreList.some(function (pattern) {
    // Check the modified pattern against the path using minimatch
    if ((0, _minimatch2['default'])(filePath, pattern, { nocase: true })) {
      return true;
    }

    // Check if a pattern matches filePath exactly
    if (_path2['default'].resolve(filePath) === pattern) {
      return true;
    }

    // Check using `test -d` for directory exclusions
    if ((0, _shelljs.test)('-d', filePath) && pattern.match(/^[^/\\]*[/\\]?$/) && filePath.match(new RegExp('^' + pattern + '.*'))) {
      return true;
    }

    return false;
  });
});

exports.isIgnored = isIgnored;
var fileExists = _asyncToGenerator(function* (checkPath) {
  return new Promise(function (resolve) {
    (0, _fs.access)(checkPath, function (err) {
      if (err) {
        resolve(false);
      }
      resolve(true);
    });
  });
});

var hasHomeConfig = _asyncToGenerator(function* () {
  if (!homeConfigPath) {
    homeConfigPath = _path2['default'].join((0, _os.homedir)(), '.jshintrc');
  }
  return fileExists(homeConfigPath);
});

exports.hasHomeConfig = hasHomeConfig;
function getPackageMeta() {
  // NOTE: This is using a non-public property of the Package object
  // The alternative to this would basically mean re-implementing the parsing
  // that Atom is already doing anyway, and as this is unlikely to change this
  // is likely safe to use.
  return atom.packages.getLoadedPackage('linter-jshint').metadata;
}

function getEditorScopes() {
  var textEditor = atom.workspace.getActiveTextEditor();
  var editorScopes = undefined;
  if (atom.workspace.isTextEditor(textEditor)) {
    editorScopes = textEditor.getLastCursor().getScopeDescriptor().getScopesArray();
  } else {
    // Somehow this can be called with no active TextEditor, impossible I know...
    editorScopes = ['unknown'];
  }
  return editorScopes;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RvbG9rb2Jhbi9Db2RlL2dpdGh1Yi9hdG9tLWNvbmZpZy9wYWNrYWdlcy9saW50ZXItanNoaW50L2xpYi9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFxRmUsZ0JBQWdCLHFCQUEvQixXQUFnQyxNQUFNLEVBQUU7QUFDdEMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLGNBQWMsS0FBSyxFQUFFLEdBQUcsTUFBTSxDQUFDLGNBQWMsR0FDakUsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7O0FBRTFFLE1BQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUM1QixXQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDakM7OztBQUdELE1BQU0sYUFBYSxHQUFHLE1BQU0sVUFBVSxDQUFDLFFBQVEsQ0FDN0MsUUFBUSxFQUNSLENBQUMsV0FBVyxDQUFDLEVBQ2IsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQ3JCLENBQUM7QUFDRixZQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUN4QyxTQUFPLGFBQWEsQ0FBQztDQUN0Qjs7SUFjcUIsWUFBWSxxQkFBM0IsYUFBOEI7QUFDbkMsTUFBTSxtQkFBbUIsR0FBRyxjQUFjLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDckQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDaEQsTUFBTSxhQUFhLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNyRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQUFBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxHQUFJLEVBQUUsQ0FBQyxHQUFH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QVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDeEQsTUFBSSxZQUEyQixZQUFBLENBQUM7QUFDaEMsTUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUMzQyxnQkFBWSxHQUFHLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO0dBQ2pGLE1BQU07O0FBRUwsZ0JBQVksR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQzVCO0FBQ0QsU0FBTyxZQUFZLENBQUM7Q0FDckIiLCJmaWxlIjoiL2hvbWUvdG9sb2tvYmFuL0NvZGUvZ2l0aHViL2F0b20tY29uZmlnL3BhY2thZ2VzL2xpbnRlci1qc2hpbnQvbGliL2hlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBob21lZGlyIH0gZnJvbSAnb3MnO1xuaW1wb3J0IHsgdGVzdCBhcyBzaGpzVGVzdCB9IGZyb20gJ3NoZWxsanMnO1xuaW1wb3J0IG1pbmltYXRjaCBmcm9tICdtaW5pbWF0Y2gnO1xuaW1wb3J0ICogYXMgYXRvbWxpbnRlciBmcm9tICdhdG9tLWxpbnRlcic7XG5pbXBvcnQgeyByZWFkRmlsZSBhcyBmc1JlYWRGaWxlLCBhY2Nlc3MgfSBmcm9tICdmcyc7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L2V4dGVuc2lvbnMsIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llc1xuaW1wb3J0IHR5cGUgeyBUZXh0RWRpdG9yIH0gZnJvbSAnYXRvbSc7XG5cbmxldCBob21lQ29uZmlnUGF0aDtcbmNvbnN0IGRlYnVnQ2FjaGUgPSBuZXcgTWFwKCk7XG5cbmNvbnN0IHJlYWRGaWxlID0gYXN5bmMgZmlsZVBhdGggPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICBmc1JlYWRGaWxlKGZpbGVQYXRoLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9XG4gICAgcmVzb2x2ZShkYXRhKTtcbiAgfSk7XG59KTtcblxuZXhwb3J0IGNvbnN0IGlzSWdub3JlZCA9IGFzeW5jIChmaWxlUGF0aCwgaWdub3JlUGF0aCkgPT4ge1xuICBjb25zdCBmaWxlRGlyID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcbiAgY29uc3QgcmF3SWdub3JlTGlzdCA9IChhd2FpdCByZWFkRmlsZShpZ25vcmVQYXRoKSkuc3BsaXQoL1tcXHJcXG5dLyk7XG5cbiAgLy8gXCJGaXhcIiB0aGUgcGF0dGVybnMgaW4gdGhlIHNhbWUgd2F5IEpTSGludCBkb2VzXG4gIGNvbnN0IGlnbm9yZUxpc3QgPSByYXdJZ25vcmVMaXN0LmZpbHRlcihsaW5lID0+ICEhbGluZS50cmltKCkpLm1hcCgocGF0dGVybikgPT4ge1xuICAgIGlmIChwYXR0ZXJuLnN0YXJ0c1dpdGgoJyEnKSkge1xuICAgICAgcmV0dXJuIGAhJHtwYXRoLnJlc29sdmUoZmlsZURpciwgcGF0dGVybi5zdWJzdHIoMSkudHJpbSgpKX1gO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aC5qb2luKGZpbGVEaXIsIHBhdHRlcm4udHJpbSgpKTtcbiAgfSk7XG5cbiAgLy8gQ2hlY2sgdGhlIG1vZGlmaWVkIHBhdHRlcm5zXG4gIC8vIE5PVEU6IFRoaXMgaXMgd2hhdCBKU0hpbnQgYWN0dWFsbHkgZG9lcywgbm90IHdoYXQgdGhlIGRvY3VtZW50YXRpb24gc2F5c1xuICByZXR1cm4gaWdub3JlTGlzdC5zb21lKChwYXR0ZXJuKSA9PiB7XG4gICAgLy8gQ2hlY2sgdGhlIG1vZGlmaWVkIHBhdHRlcm4gYWdhaW5zdCB0aGUgcGF0aCB1c2luZyBtaW5pbWF0Y2hcbiAgICBpZiAobWluaW1hdGNoKGZpbGVQYXRoLCBwYXR0ZXJuLCB7IG5vY2FzZTogdHJ1ZSB9KSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgYSBwYXR0ZXJuIG1hdGNoZXMgZmlsZVBhdGggZXhhY3RseVxuICAgIGlmIChwYXRoLnJlc29sdmUoZmlsZVBhdGgpID09PSBwYXR0ZXJuKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayB1c2luZyBgdGVzdCAtZGAgZm9yIGRpcmVjdG9yeSBleGNsdXNpb25zXG4gICAgaWYgKFxuICAgICAgc2hqc1Rlc3QoJy1kJywgZmlsZVBhdGgpXG4gICAgICAmJiBwYXR0ZXJuLm1hdGNoKC9eW14vXFxcXF0qWy9cXFxcXT8kLylcbiAgICAgICYmIGZpbGVQYXRoLm1hdGNoKG5ldyBSZWdFeHAoYF4ke3BhdHRlcm59LipgKSlcbiAgICApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG59O1xuXG5jb25zdCBmaWxlRXhpc3RzID0gYXN5bmMgY2hlY2tQYXRoID0+IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gIGFjY2VzcyhjaGVja1BhdGgsIChlcnIpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICB9XG4gICAgcmVzb2x2ZSh0cnVlKTtcbiAgfSk7XG59KTtcblxuZXhwb3J0IGNvbnN0IGhhc0hvbWVDb25maWcgPSBhc3luYyAoKSA9PiB7XG4gIGlmICghaG9tZUNvbmZpZ1BhdGgpIHtcbiAgICBob21lQ29uZmlnUGF0aCA9IHBhdGguam9pbihob21lZGlyKCksICcuanNoaW50cmMnKTtcbiAgfVxuICByZXR1cm4gZmlsZUV4aXN0cyhob21lQ29uZmlnUGF0aCk7XG59O1xuXG5mdW5jdGlvbiBnZXRQYWNrYWdlTWV0YSgpIHtcbiAgLy8gTk9URTogVGhpcyBpcyB1c2luZyBhIG5vbi1wdWJsaWMgcHJvcGVydHkgb2YgdGhlIFBhY2thZ2Ugb2JqZWN0XG4gIC8vIFRoZSBhbHRlcm5hdGl2ZSB0byB0aGlzIHdvdWxkIGJhc2ljYWxseSBtZWFuIHJlLWltcGxlbWVudGluZyB0aGUgcGFyc2luZ1xuICAvLyB0aGF0IEF0b20gaXMgYWxyZWFkeSBkb2luZyBhbnl3YXksIGFuZCBhcyB0aGlzIGlzIHVubGlrZWx5IHRvIGNoYW5nZSB0aGlzXG4gIC8vIGlzIGxpa2VseSBzYWZlIHRvIHVzZS5cbiAgcmV0dXJuIGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZSgnbGludGVyLWpzaGludCcpLm1ldGFkYXRhO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRKU0hpbnRWZXJzaW9uKGNvbmZpZykge1xuICBjb25zdCBleGVjUGF0aCA9IGNvbmZpZy5leGVjdXRhYmxlUGF0aCAhPT0gJycgPyBjb25maWcuZXhlY3V0YWJsZVBhdGhcbiAgICA6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICdub2RlX21vZHVsZXMnLCAnanNoaW50JywgJ2JpbicsICdqc2hpbnQnKTtcblxuICBpZiAoZGVidWdDYWNoZS5oYXMoZXhlY1BhdGgpKSB7XG4gICAgcmV0dXJuIGRlYnVnQ2FjaGUuZ2V0KGV4ZWNQYXRoKTtcbiAgfVxuXG4gIC8vIE5PVEU6IFllcywgYGpzaGludCAtLXZlcnNpb25gIGdldHMgb3V0cHV0IG9uIFNUREVSUi4uLlxuICBjb25zdCBqc2hpbnRWZXJzaW9uID0gYXdhaXQgYXRvbWxpbnRlci5leGVjTm9kZShcbiAgICBleGVjUGF0aCxcbiAgICBbJy0tdmVyc2lvbiddLFxuICAgIHsgc3RyZWFtOiAnc3RkZXJyJyB9LFxuICApO1xuICBkZWJ1Z0NhY2hlLnNldChleGVjUGF0aCwganNoaW50VmVyc2lvbik7XG4gIHJldHVybiBqc2hpbnRWZXJzaW9uO1xufVxuXG5mdW5jdGlvbiBnZXRFZGl0b3JTY29wZXMoKSB7XG4gIGNvbnN0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gIGxldCBlZGl0b3JTY29wZXM6IEFycmF5PHN0cmluZz47XG4gIGlmIChhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IodGV4dEVkaXRvcikpIHtcbiAgICBlZGl0b3JTY29wZXMgPSB0ZXh0RWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRTY29wZURlc2NyaXB0b3IoKS5nZXRTY29wZXNBcnJheSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIFNvbWVob3cgdGhpcyBjYW4gYmUgY2FsbGVkIHdpdGggbm8gYWN0aXZlIFRleHRFZGl0b3IsIGltcG9zc2libGUgSSBrbm93Li4uXG4gICAgZWRpdG9yU2NvcGVzID0gWyd1bmtub3duJ107XG4gIH1cbiAgcmV0dXJuIGVkaXRvclNjb3Blcztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERlYnVnSW5mbygpIHtcbiAgY29uc3QgbGludGVySlNIaW50VmVyc2lvbiA9IGdldFBhY2thZ2VNZXRhKCkudmVyc2lvbjtcbiAgY29uc3QgY29uZmlnID0gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItanNoaW50Jyk7XG4gIGNvbnN0IGpzaGludFZlcnNpb24gPSBhd2FpdCBnZXRKU0hpbnRWZXJzaW9uKGNvbmZpZyk7XG4gIGNvbnN0IGhvdXJzU2luY2VSZXN0YXJ0ID0gTWF0aC5yb3VuZCgocHJvY2Vzcy51cHRpbWUoKSAvIDM2MDApICogMTApIC8gMTA7XG4gIGNvbnN0IGVkaXRvclNjb3BlcyA9IGdldEVkaXRvclNjb3BlcygpO1xuXG4gIHJldHVybiB7XG4gICAgYXRvbVZlcnNpb246IGF0b20uZ2V0VmVyc2lvbigpLFxuICAgIGxpbnRlckpTSGludFZlcnNpb24sXG4gICAgbGludGVySlNIaW50Q29uZmlnOiBjb25maWcsXG4gICAganNoaW50VmVyc2lvbixcbiAgICBob3Vyc1NpbmNlUmVzdGFydCxcbiAgICBwbGF0Zm9ybTogcHJvY2Vzcy5wbGF0Zm9ybSxcbiAgICBlZGl0b3JTY29wZXMsXG4gIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZURlYnVnU3RyaW5nKCkge1xuICBjb25zdCBkZWJ1ZyA9IGF3YWl0IGdldERlYnVnSW5mbygpO1xuICBjb25zdCBkZXRhaWxzID0gW1xuICAgIGBBdG9tIHZlcnNpb246ICR7ZGVidWcuYXRvbVZlcnNpb259YCxcbiAgICBgbGludGVyLWpzaGludCB2ZXJzaW9uOiB2JHtkZWJ1Zy5saW50ZXJKU0hpbnRWZXJzaW9ufWAsXG4gICAgYEpTSGludCB2ZXJzaW9uOiAke2RlYnVnLmpzaGludFZlcnNpb259YCxcbiAgICBgSG91cnMgc2luY2UgbGFzdCBBdG9tIHJlc3RhcnQ6ICR7ZGVidWcuaG91cnNTaW5jZVJlc3RhcnR9YCxcbiAgICBgUGxhdGZvcm06ICR7ZGVidWcucGxhdGZvcm19YCxcbiAgICBgQ3VycmVudCBmaWxlJ3Mgc2NvcGVzOiAke0pTT04uc3RyaW5naWZ5KGRlYnVnLmVkaXRvclNjb3BlcywgbnVsbCwgMil9YCxcbiAgICBgbGludGVyLWpzaGludCBjb25maWd1cmF0aW9uOiAke0pTT04uc3RyaW5naWZ5KGRlYnVnLmxpbnRlckpTSGludENvbmZpZywgbnVsbCwgMil9YCxcbiAgXTtcbiAgcmV0dXJuIGRldGFpbHMuam9pbignXFxuJyk7XG59XG5cbi8qKlxuICogRmluZHMgdGhlIG9sZGVzdCBvcGVuIGlzc3VlIG9mIHRoZSBzYW1lIHRpdGxlIGluIHRoaXMgcHJvamVjdCdzIHJlcG9zaXRvcnkuXG4gKiBSZXN1bHRzIGFyZSBjYWNoZWQgZm9yIDEgaG91ci5cbiAqIEBwYXJhbSAge3N0cmluZ30gaXNzdWVUaXRsZSBUaGUgaXNzdWUgdGl0bGUgdG8gc2VhcmNoIGZvclxuICogQHJldHVybiB7c3RyaW5nfG51bGx9ICAgICAgIFRoZSBVUkwgb2YgdGhlIGZvdW5kIGlzc3VlIG9yIG51bGwgaWYgbm9uZSBpcyBmb3VuZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZmluZFNpbWlsYXJJc3N1ZShpc3N1ZVRpdGxlKSB7XG4gIGlmIChkZWJ1Z0NhY2hlLmhhcyhpc3N1ZVRpdGxlKSkge1xuICAgIGNvbnN0IG9sZFJlc3VsdCA9IGRlYnVnQ2FjaGUuZ2V0KGlzc3VlVGl0bGUpO1xuICAgIGlmICgobmV3IERhdGUoKS52YWx1ZU9mKCkpIDwgb2xkUmVzdWx0LmV4cGlyZXMpIHtcbiAgICAgIHJldHVybiBvbGRSZXN1bHQudXJsO1xuICAgIH1cbiAgICBkZWJ1Z0NhY2hlLmRlbGV0ZShpc3N1ZVRpdGxlKTtcbiAgfVxuXG4gIGNvbnN0IG9uZUhvdXIgPSAxMDAwICogNjAgKiA2MDsgLy8gbXMgKiBzICogbVxuICBjb25zdCB0ZW5NaW51dGVzID0gMTAwMCAqIDYwICogMTA7IC8vIG1zICogcyAqIG1cbiAgY29uc3QgcmVwb1VybCA9IGdldFBhY2thZ2VNZXRhKCkucmVwb3NpdG9yeS51cmw7XG4gIGNvbnN0IHJlcG8gPSByZXBvVXJsLnJlcGxhY2UoL2h0dHBzPzpcXC9cXC8oXFxkK1xcLik/Z2l0aHViXFwuY29tXFwvL2dpLCAnJyk7XG4gIGNvbnN0IHF1ZXJ5ID0gZW5jb2RlVVJJQ29tcG9uZW50KGByZXBvOiR7cmVwb30gaXM6b3BlbiBpbjp0aXRsZSAke2lzc3VlVGl0bGV9YCk7XG4gIGNvbnN0IGdpdGh1YkhlYWRlcnMgPSBuZXcgSGVhZGVycyh7XG4gICAgYWNjZXB0OiAnYXBwbGljYXRpb24vdm5kLmdpdGh1Yi52Mytqc29uJyxcbiAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB9KTtcbiAgY29uc3QgcXVlcnlVcmwgPSBgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9zZWFyY2gvaXNzdWVzP3E9JHtxdWVyeX0mc29ydD1jcmVhdGVkJm9yZGVyPWFzY2A7XG5cbiAgbGV0IHVybCA9IG51bGw7XG4gIHRyeSB7XG4gICAgY29uc3QgcmF3UmVzcG9uc2UgPSBhd2FpdCBmZXRjaChxdWVyeVVybCwgeyBoZWFkZXJzOiBnaXRodWJIZWFkZXJzIH0pO1xuICAgIGlmICghcmF3UmVzcG9uc2Uub2spIHtcbiAgICAgIC8vIFF1ZXJ5aW5nIEdpdEh1YiBBUEkgZmFpbGVkLCBkb24ndCB0cnkgYWdhaW4gZm9yIDEwIG1pbnV0ZXMuXG4gICAgICBkZWJ1Z0NhY2hlLnNldChpc3N1ZVRpdGxlLCB7XG4gICAgICAgIGV4cGlyZXM6IChuZXcgRGF0ZSgpLnZhbHVlT2YoKSkgKyB0ZW5NaW51dGVzLFxuICAgICAgICB1cmwsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmF3UmVzcG9uc2UuanNvbigpO1xuICAgIGlmICgoZGF0YSAhPT0gbnVsbCA/IGRhdGEuaXRlbXMgOiBudWxsKSAhPT0gbnVsbCkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YS5pdGVtcykgJiYgZGF0YS5pdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGlzc3VlID0gZGF0YS5pdGVtc1swXTtcbiAgICAgICAgaWYgKGlzc3VlLnRpdGxlLmluY2x1ZGVzKGlzc3VlVGl0bGUpKSB7XG4gICAgICAgICAgdXJsID0gYCR7cmVwb1VybH0vaXNzdWVzLyR7aXNzdWUubnVtYmVyfWA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBEbyBub3RoaW5nXG4gIH1cbiAgZGVidWdDYWNoZS5zZXQoaXNzdWVUaXRsZSwge1xuICAgIGV4cGlyZXM6IChuZXcgRGF0ZSgpLnZhbHVlT2YoKSkgKyBvbmVIb3VyLFxuICAgIHVybCxcbiAgfSk7XG4gIHJldHVybiB1cmw7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUludmFsaWRUcmFjZShcbiAgbXNnTGluZTogbnVtYmVyLCBtc2dDb2w6IG51bWJlciwgZmlsZTogc3RyaW5nLCB0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yLFxuICBlcnJvcjogT2JqZWN0LFxuKSB7XG4gIGNvbnN0IGVyck1zZ1JhbmdlID0gYCR7bXNnTGluZSArIDF9OiR7bXNnQ29sfWA7XG4gIGNvbnN0IHJhbmdlVGV4dCA9IGBSZXF1ZXN0ZWQgcG9pbnQ6ICR7ZXJyTXNnUmFuZ2V9YDtcbiAgY29uc3QgcGFja2FnZVJlcG9VcmwgPSBnZXRQYWNrYWdlTWV0YSgpLnJlcG9zaXRvcnkudXJsO1xuICBjb25zdCBpc3N1ZVVSTCA9IGAke3BhY2thZ2VSZXBvVXJsfS9pc3N1ZXMvbmV3YDtcbiAgY29uc3QgdGl0bGVUZXh0ID0gYEludmFsaWQgcG9zaXRpb24gZ2l2ZW4gYnkgJyR7ZXJyb3IuY29kZX0nYDtcbiAgY29uc3QgaW52YWxpZE1lc3NhZ2UgPSB7XG4gICAgc2V2ZXJpdHk6ICdlcnJvcicsXG4gICAgZGVzY3JpcHRpb246IGBPcmlnaW5hbCBtZXNzYWdlOiAke2Vycm9yLmNvZGV9IC0gJHtlcnJvci5yZWFzb259ICBcXG4ke3JhbmdlVGV4dH0uYCxcbiAgICBsb2NhdGlvbjoge1xuICAgICAgZmlsZSxcbiAgICAgIHBvc2l0aW9uOiBhdG9tbGludGVyLmdlbmVyYXRlUmFuZ2UodGV4dEVkaXRvciksXG4gICAgfSxcbiAgfTtcbiAgY29uc3Qgc2ltaWxhcklzc3VlVXJsID0gYXdhaXQgZmluZFNpbWlsYXJJc3N1ZSh0aXRsZVRleHQpO1xuICBpZiAoc2ltaWxhcklzc3VlVXJsICE9PSBudWxsKSB7XG4gICAgaW52YWxpZE1lc3NhZ2UuZXhjZXJwdCA9IGAke3RpdGxlVGV4dH0uIFRoaXMgaGFzIGFscmVhZHkgYmVlbiByZXBvcnRlZCwgc2VlIG1lc3NhZ2UgbGluayFgO1xuICAgIGludmFsaWRNZXNzYWdlLnVybCA9IHNpbWlsYXJJc3N1ZVVybDtcbiAgICByZXR1cm4gaW52YWxpZE1lc3NhZ2U7XG4gIH1cblxuICBjb25zdCB0aXRsZSA9IGVuY29kZVVSSUNvbXBvbmVudCh0aXRsZVRleHQpO1xuICBjb25zdCBib2R5ID0gZW5jb2RlVVJJQ29tcG9uZW50KFtcbiAgICAnSlNIaW50IHJldHVybmVkIGEgcG9pbnQgdGhhdCBkaWQgbm90IGV4aXN0IGluIHRoZSBkb2N1bWVudCBiZWluZyBlZGl0ZWQuJyxcbiAgICBgUnVsZTogXFxgJHtlcnJvci5jb2RlfVxcYGAsXG4gICAgcmFuZ2VUZXh0LFxuICAgICcnLCAnJyxcbiAgICAnPCEtLSBJZiBhdCBhbGwgcG9zc2libGUsIHBsZWFzZSBpbmNsdWRlIGNvZGUgdG8gcmVwcm9kdWNlIHRoaXMgaXNzdWUhIC0tPicsXG4gICAgJycsICcnLFxuICAgICdEZWJ1ZyBpbmZvcm1hdGlvbjonLFxuICAgICdgYGAnLFxuICAgIGF3YWl0IGdlbmVyYXRlRGVidWdTdHJpbmcoKSxcbiAgICAnYGBgJyxcbiAgXS5qb2luKCdcXG4nKSk7XG4gIGNvbnN0IG5ld0lzc3VlVVJMID0gYCR7aXNzdWVVUkx9P3RpdGxlPSR7dGl0bGV9JmJvZHk9JHtib2R5fWA7XG4gIGludmFsaWRNZXNzYWdlLmV4Y2VycHQgPSBgJHt0aXRsZVRleHR9LiBQbGVhc2UgcmVwb3J0IHRoaXMgdXNpbmcgdGhlIG1lc3NhZ2UgbGluayFgO1xuICBpbnZhbGlkTWVzc2FnZS51cmwgPSBuZXdJc3N1ZVVSTDtcbiAgcmV0dXJuIGludmFsaWRNZXNzYWdlO1xufVxuIl19