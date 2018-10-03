Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var readIgnoreList = _asyncToGenerator(function* (ignorePath) {
  return (yield readFile(ignorePath)).split(/[\r\n]/);
});

exports.readIgnoreList = readIgnoreList;

var getDebugInfo = _asyncToGenerator(function* () {
  var textEditor = atom.workspace.getActiveTextEditor();
  var editorScopes = undefined;
  if (atom.workspace.isTextEditor(textEditor)) {
    editorScopes = textEditor.getLastCursor().getScopeDescriptor().getScopesArray();
  } else {
    // Somehow this can be called with no active TextEditor, impossible I know...
    editorScopes = ['unknown'];
  }

  var packagePath = atom.packages.resolvePackagePath('linter-jshint');
  var linterJSHintMeta = undefined;
  if (packagePath === undefined) {
    // Apparently for some users the package path fails to resolve
    linterJSHintMeta = { version: 'unknown!' };
  } else {
    // eslint-disable-next-line import/no-dynamic-require
    var metaPath = _path2['default'].join(packagePath, 'package.json');
    linterJSHintMeta = JSON.parse((yield readFile(metaPath)));
  }

  var config = atom.config.get('linter-jshint');
  var hoursSinceRestart = Math.round(process.uptime() / 3600 * 10) / 10;
  var execPath = config.executablePath !== '' ? config.executablePath : _path2['default'].join(__dirname, '..', 'node_modules', 'jshint', 'bin', 'jshint');
  // NOTE: Yes, `jshint --version` gets output on STDERR...
  var jshintVersion = yield atomlinter.execNode(execPath, ['--version'], { stream: 'stderr' });

  var returnVal = {
    atomVersion: atom.getVersion(),
    linterJSHintVersion: linterJSHintMeta.version,
    linterJSHintConfig: config,
    // eslint-disable-next-line import/no-dynamic-require
    jshintVersion: jshintVersion,
    hoursSinceRestart: hoursSinceRestart,
    platform: process.platform,
    editorScopes: editorScopes
  };
  return returnVal;
});

exports.getDebugInfo = getDebugInfo;

var generateDebugString = _asyncToGenerator(function* () {
  var debug = yield getDebugInfo();
  var details = ['Atom version: ' + debug.atomVersion, 'linter-jshint version: ' + debug.linterJSHintVersion, 'JSHint version: ' + debug.jshintVersion, 'Hours since last Atom restart: ' + debug.hoursSinceRestart, 'Platform: ' + debug.platform, 'Current file\'s scopes: ' + JSON.stringify(debug.editorScopes, null, 2), 'linter-jshint configuration: ' + JSON.stringify(debug.linterJSHintConfig, null, 2)];
  return details.join('\n');
});

exports.generateDebugString = generateDebugString;

var generateInvalidTrace = _asyncToGenerator(function* (msgLine, msgCol, filePath, textEditor, error) {
  var errMsgRange = msgLine + 1 + ':' + msgCol;
  var rangeText = 'Requested start point: ' + errMsgRange;
  var issueURL = 'https://github.com/AtomLinter/linter-eslint/issues/new';
  var titleText = 'Invalid position given by \'' + error.code + '\'';
  var title = encodeURIComponent(titleText);
  var body = encodeURIComponent(['JSHint returned a point that did not exist in the document being edited.', 'Rule: `' + error.code + '`', rangeText, '', '', '<!-- If at all possible, please include code to reproduce this issue! -->', '', '', 'Debug information:', '```json', JSON.stringify((yield getDebugInfo()), null, 2), '```'].join('\n'));
  var newIssueURL = issueURL + '?title=' + title + '&body=' + body;
  return {
    severity: 'error',
    excerpt: titleText + '. ' + rangeText + '. Please report this using the message link!',
    detils: 'Original message: ' + error.code + ' - ' + error.reason,
    url: newIssueURL,
    location: {
      filePath: filePath,
      position: atomlinter.generateRange(textEditor)
    }
  };
});

exports.generateInvalidTrace = generateInvalidTrace;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _atomLinter = require('atom-linter');

var atomlinter = _interopRequireWildcard(_atomLinter);

var _fs = require('fs');

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies
'use babel';

var homeConfigPath = undefined;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RvbG9rb2Jhbi9Db2RlL2dpdGh1Yi9hdG9tLWNvbmZpZy9wYWNrYWdlcy9saW50ZXItanNoaW50L2xpYi9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFXZSxRQUFRLHFCQUF2QixXQUF3QixRQUFRLEVBQUU7QUFDaEMsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsc0JBQVcsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUs7QUFDMUMsVUFBSSxHQUFHLEVBQUU7QUFDUCxjQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDYjtBQUNELGFBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNmLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKOztJQUVjLFVBQVUscUJBQXpCLFdBQTBCLFNBQVMsRUFBRTtBQUNuQyxTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQzlCLG9CQUFPLFNBQVMsRUFBRSxVQUFDLEdBQUcsRUFBSztBQUN6QixVQUFJLEdBQUcsRUFBRTtBQUNQLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNoQjtBQUNELGFBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNmLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKOztJQUVxQixhQUFhLHFCQUE1QixhQUErQjtBQUNwQyxNQUFJLENBQUMsY0FBYyxFQUFFO0FBQ25CLGtCQUFjLEdBQUcsa0JBQUssSUFBSSxDQUFDLGtCQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7R0FDcEQ7QUFDRCxTQUFPLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztDQUNuQzs7OztJQUVxQixjQUFjLHFCQUE3QixXQUE4QixVQUFVLEVBQUU7QUFDL0MsU0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFBLENBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NB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QVNaLElBQUksY0FBYyxZQUFBLENBQUMiLCJmaWxlIjoiL2hvbWUvdG9sb2tvYmFuL0NvZGUvZ2l0aHViL2F0b20tY29uZmlnL3BhY2thZ2VzL2xpbnRlci1qc2hpbnQvbGliL2hlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBob21lZGlyIH0gZnJvbSAnb3MnO1xuaW1wb3J0ICogYXMgYXRvbWxpbnRlciBmcm9tICdhdG9tLWxpbnRlcic7XG5pbXBvcnQgeyByZWFkRmlsZSBhcyBmc1JlYWRGaWxlLCBhY2Nlc3MgfSBmcm9tICdmcyc7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L2V4dGVuc2lvbnMsIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llc1xuaW1wb3J0IHR5cGUgeyBUZXh0RWRpdG9yIH0gZnJvbSAnYXRvbSc7XG5cbmxldCBob21lQ29uZmlnUGF0aDtcblxuYXN5bmMgZnVuY3Rpb24gcmVhZEZpbGUoZmlsZVBhdGgpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBmc1JlYWRGaWxlKGZpbGVQYXRoLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9XG4gICAgICByZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZmlsZUV4aXN0cyhjaGVja1BhdGgpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgYWNjZXNzKGNoZWNrUGF0aCwgKGVycikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzSG9tZUNvbmZpZygpIHtcbiAgaWYgKCFob21lQ29uZmlnUGF0aCkge1xuICAgIGhvbWVDb25maWdQYXRoID0gcGF0aC5qb2luKGhvbWVkaXIoKSwgJy5qc2hpbnRyYycpO1xuICB9XG4gIHJldHVybiBmaWxlRXhpc3RzKGhvbWVDb25maWdQYXRoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRJZ25vcmVMaXN0KGlnbm9yZVBhdGgpIHtcbiAgcmV0dXJuIChhd2FpdCByZWFkRmlsZShpZ25vcmVQYXRoKSkuc3BsaXQoL1tcXHJcXG5dLyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZWJ1Z0luZm8oKSB7XG4gIGNvbnN0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gIGxldCBlZGl0b3JTY29wZXM7XG4gIGlmIChhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IodGV4dEVkaXRvcikpIHtcbiAgICBlZGl0b3JTY29wZXMgPSB0ZXh0RWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRTY29wZURlc2NyaXB0b3IoKS5nZXRTY29wZXNBcnJheSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIFNvbWVob3cgdGhpcyBjYW4gYmUgY2FsbGVkIHdpdGggbm8gYWN0aXZlIFRleHRFZGl0b3IsIGltcG9zc2libGUgSSBrbm93Li4uXG4gICAgZWRpdG9yU2NvcGVzID0gWyd1bmtub3duJ107XG4gIH1cblxuICBjb25zdCBwYWNrYWdlUGF0aCA9IGF0b20ucGFja2FnZXMucmVzb2x2ZVBhY2thZ2VQYXRoKCdsaW50ZXItanNoaW50Jyk7XG4gIGxldCBsaW50ZXJKU0hpbnRNZXRhO1xuICBpZiAocGFja2FnZVBhdGggPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIEFwcGFyZW50bHkgZm9yIHNvbWUgdXNlcnMgdGhlIHBhY2thZ2UgcGF0aCBmYWlscyB0byByZXNvbHZlXG4gICAgbGludGVySlNIaW50TWV0YSA9IHsgdmVyc2lvbjogJ3Vua25vd24hJyB9O1xuICB9IGVsc2Uge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZHluYW1pYy1yZXF1aXJlXG4gICAgY29uc3QgbWV0YVBhdGggPSBwYXRoLmpvaW4ocGFja2FnZVBhdGgsICdwYWNrYWdlLmpzb24nKTtcbiAgICBsaW50ZXJKU0hpbnRNZXRhID0gSlNPTi5wYXJzZShhd2FpdCByZWFkRmlsZShtZXRhUGF0aCkpO1xuICB9XG5cbiAgY29uc3QgY29uZmlnID0gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItanNoaW50Jyk7XG4gIGNvbnN0IGhvdXJzU2luY2VSZXN0YXJ0ID0gTWF0aC5yb3VuZCgocHJvY2Vzcy51cHRpbWUoKSAvIDM2MDApICogMTApIC8gMTA7XG4gIGNvbnN0IGV4ZWNQYXRoID0gY29uZmlnLmV4ZWN1dGFibGVQYXRoICE9PSAnJyA/IGNvbmZpZy5leGVjdXRhYmxlUGF0aCA6XG4gICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ25vZGVfbW9kdWxlcycsICdqc2hpbnQnLCAnYmluJywgJ2pzaGludCcpO1xuICAvLyBOT1RFOiBZZXMsIGBqc2hpbnQgLS12ZXJzaW9uYCBnZXRzIG91dHB1dCBvbiBTVERFUlIuLi5cbiAgY29uc3QganNoaW50VmVyc2lvbiA9IGF3YWl0IGF0b21saW50ZXIuZXhlY05vZGUoXG4gICAgICBleGVjUGF0aCwgWyctLXZlcnNpb24nXSwgeyBzdHJlYW06ICdzdGRlcnInIH0pO1xuXG4gIGNvbnN0IHJldHVyblZhbCA9IHtcbiAgICBhdG9tVmVyc2lvbjogYXRvbS5nZXRWZXJzaW9uKCksXG4gICAgbGludGVySlNIaW50VmVyc2lvbjogbGludGVySlNIaW50TWV0YS52ZXJzaW9uLFxuICAgIGxpbnRlckpTSGludENvbmZpZzogY29uZmlnLFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZHluYW1pYy1yZXF1aXJlXG4gICAganNoaW50VmVyc2lvbixcbiAgICBob3Vyc1NpbmNlUmVzdGFydCxcbiAgICBwbGF0Zm9ybTogcHJvY2Vzcy5wbGF0Zm9ybSxcbiAgICBlZGl0b3JTY29wZXMsXG4gIH07XG4gIHJldHVybiByZXR1cm5WYWw7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZURlYnVnU3RyaW5nKCkge1xuICBjb25zdCBkZWJ1ZyA9IGF3YWl0IGdldERlYnVnSW5mbygpO1xuICBjb25zdCBkZXRhaWxzID0gW1xuICAgIGBBdG9tIHZlcnNpb246ICR7ZGVidWcuYXRvbVZlcnNpb259YCxcbiAgICBgbGludGVyLWpzaGludCB2ZXJzaW9uOiAke2RlYnVnLmxpbnRlckpTSGludFZlcnNpb259YCxcbiAgICBgSlNIaW50IHZlcnNpb246ICR7ZGVidWcuanNoaW50VmVyc2lvbn1gLFxuICAgIGBIb3VycyBzaW5jZSBsYXN0IEF0b20gcmVzdGFydDogJHtkZWJ1Zy5ob3Vyc1NpbmNlUmVzdGFydH1gLFxuICAgIGBQbGF0Zm9ybTogJHtkZWJ1Zy5wbGF0Zm9ybX1gLFxuICAgIGBDdXJyZW50IGZpbGUncyBzY29wZXM6ICR7SlNPTi5zdHJpbmdpZnkoZGVidWcuZWRpdG9yU2NvcGVzLCBudWxsLCAyKX1gLFxuICAgIGBsaW50ZXItanNoaW50IGNvbmZpZ3VyYXRpb246ICR7SlNPTi5zdHJpbmdpZnkoZGVidWcubGludGVySlNIaW50Q29uZmlnLCBudWxsLCAyKX1gLFxuICBdO1xuICByZXR1cm4gZGV0YWlscy5qb2luKCdcXG4nKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlSW52YWxpZFRyYWNlKFxuICBtc2dMaW5lOiBudW1iZXIsIG1zZ0NvbDogbnVtYmVyLCBmaWxlUGF0aDogc3RyaW5nLCB0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yLFxuICBlcnJvcjogT2JqZWN0LFxuKSB7XG4gIGNvbnN0IGVyck1zZ1JhbmdlID0gYCR7bXNnTGluZSArIDF9OiR7bXNnQ29sfWA7XG4gIGNvbnN0IHJhbmdlVGV4dCA9IGBSZXF1ZXN0ZWQgc3RhcnQgcG9pbnQ6ICR7ZXJyTXNnUmFuZ2V9YDtcbiAgY29uc3QgaXNzdWVVUkwgPSAnaHR0cHM6Ly9naXRodWIuY29tL0F0b21MaW50ZXIvbGludGVyLWVzbGludC9pc3N1ZXMvbmV3JztcbiAgY29uc3QgdGl0bGVUZXh0ID0gYEludmFsaWQgcG9zaXRpb24gZ2l2ZW4gYnkgJyR7ZXJyb3IuY29kZX0nYDtcbiAgY29uc3QgdGl0bGUgPSBlbmNvZGVVUklDb21wb25lbnQodGl0bGVUZXh0KTtcbiAgY29uc3QgYm9keSA9IGVuY29kZVVSSUNvbXBvbmVudChbXG4gICAgJ0pTSGludCByZXR1cm5lZCBhIHBvaW50IHRoYXQgZGlkIG5vdCBleGlzdCBpbiB0aGUgZG9jdW1lbnQgYmVpbmcgZWRpdGVkLicsXG4gICAgYFJ1bGU6IFxcYCR7ZXJyb3IuY29kZX1cXGBgLFxuICAgIHJhbmdlVGV4dCxcbiAgICAnJywgJycsXG4gICAgJzwhLS0gSWYgYXQgYWxsIHBvc3NpYmxlLCBwbGVhc2UgaW5jbHVkZSBjb2RlIHRvIHJlcHJvZHVjZSB0aGlzIGlzc3VlISAtLT4nLFxuICAgICcnLCAnJyxcbiAgICAnRGVidWcgaW5mb3JtYXRpb246JyxcbiAgICAnYGBganNvbicsXG4gICAgSlNPTi5zdHJpbmdpZnkoYXdhaXQgZ2V0RGVidWdJbmZvKCksIG51bGwsIDIpLFxuICAgICdgYGAnLFxuICBdLmpvaW4oJ1xcbicpKTtcbiAgY29uc3QgbmV3SXNzdWVVUkwgPSBgJHtpc3N1ZVVSTH0/dGl0bGU9JHt0aXRsZX0mYm9keT0ke2JvZHl9YDtcbiAgcmV0dXJuIHtcbiAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICBleGNlcnB0OiBgJHt0aXRsZVRleHR9LiAke3JhbmdlVGV4dH0uIFBsZWFzZSByZXBvcnQgdGhpcyB1c2luZyB0aGUgbWVzc2FnZSBsaW5rIWAsXG4gICAgZGV0aWxzOiBgT3JpZ2luYWwgbWVzc2FnZTogJHtlcnJvci5jb2RlfSAtICR7ZXJyb3IucmVhc29ufWAsXG4gICAgdXJsOiBuZXdJc3N1ZVVSTCxcbiAgICBsb2NhdGlvbjoge1xuICAgICAgZmlsZVBhdGgsXG4gICAgICBwb3NpdGlvbjogYXRvbWxpbnRlci5nZW5lcmF0ZVJhbmdlKHRleHRFZGl0b3IpLFxuICAgIH0sXG4gIH07XG59XG4iXX0=