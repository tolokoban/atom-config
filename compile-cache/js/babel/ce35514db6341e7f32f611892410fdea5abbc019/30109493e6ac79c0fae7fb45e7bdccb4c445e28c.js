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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vRTovQ29kZS9naXRodWIvYXRvbS1jb25maWcvcGFja2FnZXMvbGludGVyLWpzaGludC9saWIvaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBV2UsUUFBUSxxQkFBdkIsV0FBd0IsUUFBUSxFQUFFO0FBQ2hDLFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3RDLHNCQUFXLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFLO0FBQzFDLFVBQUksR0FBRyxFQUFFO0FBQ1AsY0FBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ2I7QUFDRCxhQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDZixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSjs7SUFFYyxVQUFVLHFCQUF6QixXQUEwQixTQUFTLEVBQUU7QUFDbkMsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBSztBQUM5QixvQkFBTyxTQUFTLEVBQUUsVUFBQyxHQUFHLEVBQUs7QUFDekIsVUFBSSxHQUFHLEVBQUU7QUFDUCxlQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDaEI7QUFDRCxhQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDZixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSjs7SUFFcUIsYUFBYSxxQkFBNUIsYUFBK0I7QUFDcEMsTUFBSSxDQUFDLGNBQWMsRUFBRTtBQUNuQixrQkFBYyxHQUFHLGtCQUFLLElBQUksQ0FBQyxrQkFBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0dBQ3BEO0FBQ0QsU0FBTyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7Q0FDbkM7Ozs7SUFFcUIsY0FBYyxxQkFBN0IsV0FBOEIsVUFBVSxFQUFFO0FBQy9DLFNBQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQSxDQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUNyRDs7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QUFJLGNBQWMsWUFBQSxDQUFDIiwiZmlsZSI6ImZpbGU6Ly8vRTovQ29kZS9naXRodWIvYXRvbS1jb25maWcvcGFja2FnZXMvbGludGVyLWpzaGludC9saWIvaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGhvbWVkaXIgfSBmcm9tICdvcyc7XG5pbXBvcnQgKiBhcyBhdG9tbGludGVyIGZyb20gJ2F0b20tbGludGVyJztcbmltcG9ydCB7IHJlYWRGaWxlIGFzIGZzUmVhZEZpbGUsIGFjY2VzcyB9IGZyb20gJ2ZzJztcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvZXh0ZW5zaW9ucywgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXG5pbXBvcnQgdHlwZSB7IFRleHRFZGl0b3IgfSBmcm9tICdhdG9tJztcblxubGV0IGhvbWVDb25maWdQYXRoO1xuXG5hc3luYyBmdW5jdGlvbiByZWFkRmlsZShmaWxlUGF0aCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGZzUmVhZEZpbGUoZmlsZVBhdGgsICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH1cbiAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBmaWxlRXhpc3RzKGNoZWNrUGF0aCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBhY2Nlc3MoY2hlY2tQYXRoLCAoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgfVxuICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYXNIb21lQ29uZmlnKCkge1xuICBpZiAoIWhvbWVDb25maWdQYXRoKSB7XG4gICAgaG9tZUNvbmZpZ1BhdGggPSBwYXRoLmpvaW4oaG9tZWRpcigpLCAnLmpzaGludHJjJyk7XG4gIH1cbiAgcmV0dXJuIGZpbGVFeGlzdHMoaG9tZUNvbmZpZ1BhdGgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZElnbm9yZUxpc3QoaWdub3JlUGF0aCkge1xuICByZXR1cm4gKGF3YWl0IHJlYWRGaWxlKGlnbm9yZVBhdGgpKS5zcGxpdCgvW1xcclxcbl0vKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERlYnVnSW5mbygpIHtcbiAgY29uc3QgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgbGV0IGVkaXRvclNjb3BlcztcbiAgaWYgKGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcih0ZXh0RWRpdG9yKSkge1xuICAgIGVkaXRvclNjb3BlcyA9IHRleHRFZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdldFNjb3BlRGVzY3JpcHRvcigpLmdldFNjb3Blc0FycmF5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gU29tZWhvdyB0aGlzIGNhbiBiZSBjYWxsZWQgd2l0aCBubyBhY3RpdmUgVGV4dEVkaXRvciwgaW1wb3NzaWJsZSBJIGtub3cuLi5cbiAgICBlZGl0b3JTY29wZXMgPSBbJ3Vua25vd24nXTtcbiAgfVxuXG4gIGNvbnN0IHBhY2thZ2VQYXRoID0gYXRvbS5wYWNrYWdlcy5yZXNvbHZlUGFja2FnZVBhdGgoJ2xpbnRlci1qc2hpbnQnKTtcbiAgbGV0IGxpbnRlckpTSGludE1ldGE7XG4gIGlmIChwYWNrYWdlUGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gQXBwYXJlbnRseSBmb3Igc29tZSB1c2VycyB0aGUgcGFja2FnZSBwYXRoIGZhaWxzIHRvIHJlc29sdmVcbiAgICBsaW50ZXJKU0hpbnRNZXRhID0geyB2ZXJzaW9uOiAndW5rbm93biEnIH07XG4gIH0gZWxzZSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmVcbiAgICBjb25zdCBtZXRhUGF0aCA9IHBhdGguam9pbihwYWNrYWdlUGF0aCwgJ3BhY2thZ2UuanNvbicpO1xuICAgIGxpbnRlckpTSGludE1ldGEgPSBKU09OLnBhcnNlKGF3YWl0IHJlYWRGaWxlKG1ldGFQYXRoKSk7XG4gIH1cblxuICBjb25zdCBjb25maWcgPSBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1qc2hpbnQnKTtcbiAgY29uc3QgaG91cnNTaW5jZVJlc3RhcnQgPSBNYXRoLnJvdW5kKChwcm9jZXNzLnVwdGltZSgpIC8gMzYwMCkgKiAxMCkgLyAxMDtcbiAgY29uc3QgZXhlY1BhdGggPSBjb25maWcuZXhlY3V0YWJsZVBhdGggIT09ICcnID8gY29uZmlnLmV4ZWN1dGFibGVQYXRoIDpcbiAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnbm9kZV9tb2R1bGVzJywgJ2pzaGludCcsICdiaW4nLCAnanNoaW50Jyk7XG4gIC8vIE5PVEU6IFllcywgYGpzaGludCAtLXZlcnNpb25gIGdldHMgb3V0cHV0IG9uIFNUREVSUi4uLlxuICBjb25zdCBqc2hpbnRWZXJzaW9uID0gYXdhaXQgYXRvbWxpbnRlci5leGVjTm9kZShcbiAgICAgIGV4ZWNQYXRoLCBbJy0tdmVyc2lvbiddLCB7IHN0cmVhbTogJ3N0ZGVycicgfSk7XG5cbiAgY29uc3QgcmV0dXJuVmFsID0ge1xuICAgIGF0b21WZXJzaW9uOiBhdG9tLmdldFZlcnNpb24oKSxcbiAgICBsaW50ZXJKU0hpbnRWZXJzaW9uOiBsaW50ZXJKU0hpbnRNZXRhLnZlcnNpb24sXG4gICAgbGludGVySlNIaW50Q29uZmlnOiBjb25maWcsXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmVcbiAgICBqc2hpbnRWZXJzaW9uLFxuICAgIGhvdXJzU2luY2VSZXN0YXJ0LFxuICAgIHBsYXRmb3JtOiBwcm9jZXNzLnBsYXRmb3JtLFxuICAgIGVkaXRvclNjb3BlcyxcbiAgfTtcbiAgcmV0dXJuIHJldHVyblZhbDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRGVidWdTdHJpbmcoKSB7XG4gIGNvbnN0IGRlYnVnID0gYXdhaXQgZ2V0RGVidWdJbmZvKCk7XG4gIGNvbnN0IGRldGFpbHMgPSBbXG4gICAgYEF0b20gdmVyc2lvbjogJHtkZWJ1Zy5hdG9tVmVyc2lvbn1gLFxuICAgIGBsaW50ZXItanNoaW50IHZlcnNpb246ICR7ZGVidWcubGludGVySlNIaW50VmVyc2lvbn1gLFxuICAgIGBKU0hpbnQgdmVyc2lvbjogJHtkZWJ1Zy5qc2hpbnRWZXJzaW9ufWAsXG4gICAgYEhvdXJzIHNpbmNlIGxhc3QgQXRvbSByZXN0YXJ0OiAke2RlYnVnLmhvdXJzU2luY2VSZXN0YXJ0fWAsXG4gICAgYFBsYXRmb3JtOiAke2RlYnVnLnBsYXRmb3JtfWAsXG4gICAgYEN1cnJlbnQgZmlsZSdzIHNjb3BlczogJHtKU09OLnN0cmluZ2lmeShkZWJ1Zy5lZGl0b3JTY29wZXMsIG51bGwsIDIpfWAsXG4gICAgYGxpbnRlci1qc2hpbnQgY29uZmlndXJhdGlvbjogJHtKU09OLnN0cmluZ2lmeShkZWJ1Zy5saW50ZXJKU0hpbnRDb25maWcsIG51bGwsIDIpfWAsXG4gIF07XG4gIHJldHVybiBkZXRhaWxzLmpvaW4oJ1xcbicpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVJbnZhbGlkVHJhY2UoXG4gIG1zZ0xpbmU6IG51bWJlciwgbXNnQ29sOiBudW1iZXIsIGZpbGVQYXRoOiBzdHJpbmcsIHRleHRFZGl0b3I6IFRleHRFZGl0b3IsXG4gIGVycm9yOiBPYmplY3QsXG4pIHtcbiAgY29uc3QgZXJyTXNnUmFuZ2UgPSBgJHttc2dMaW5lICsgMX06JHttc2dDb2x9YDtcbiAgY29uc3QgcmFuZ2VUZXh0ID0gYFJlcXVlc3RlZCBzdGFydCBwb2ludDogJHtlcnJNc2dSYW5nZX1gO1xuICBjb25zdCBpc3N1ZVVSTCA9ICdodHRwczovL2dpdGh1Yi5jb20vQXRvbUxpbnRlci9saW50ZXItZXNsaW50L2lzc3Vlcy9uZXcnO1xuICBjb25zdCB0aXRsZVRleHQgPSBgSW52YWxpZCBwb3NpdGlvbiBnaXZlbiBieSAnJHtlcnJvci5jb2RlfSdgO1xuICBjb25zdCB0aXRsZSA9IGVuY29kZVVSSUNvbXBvbmVudCh0aXRsZVRleHQpO1xuICBjb25zdCBib2R5ID0gZW5jb2RlVVJJQ29tcG9uZW50KFtcbiAgICAnSlNIaW50IHJldHVybmVkIGEgcG9pbnQgdGhhdCBkaWQgbm90IGV4aXN0IGluIHRoZSBkb2N1bWVudCBiZWluZyBlZGl0ZWQuJyxcbiAgICBgUnVsZTogXFxgJHtlcnJvci5jb2RlfVxcYGAsXG4gICAgcmFuZ2VUZXh0LFxuICAgICcnLCAnJyxcbiAgICAnPCEtLSBJZiBhdCBhbGwgcG9zc2libGUsIHBsZWFzZSBpbmNsdWRlIGNvZGUgdG8gcmVwcm9kdWNlIHRoaXMgaXNzdWUhIC0tPicsXG4gICAgJycsICcnLFxuICAgICdEZWJ1ZyBpbmZvcm1hdGlvbjonLFxuICAgICdgYGBqc29uJyxcbiAgICBKU09OLnN0cmluZ2lmeShhd2FpdCBnZXREZWJ1Z0luZm8oKSwgbnVsbCwgMiksXG4gICAgJ2BgYCcsXG4gIF0uam9pbignXFxuJykpO1xuICBjb25zdCBuZXdJc3N1ZVVSTCA9IGAke2lzc3VlVVJMfT90aXRsZT0ke3RpdGxlfSZib2R5PSR7Ym9keX1gO1xuICByZXR1cm4ge1xuICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgIGV4Y2VycHQ6IGAke3RpdGxlVGV4dH0uICR7cmFuZ2VUZXh0fS4gUGxlYXNlIHJlcG9ydCB0aGlzIHVzaW5nIHRoZSBtZXNzYWdlIGxpbmshYCxcbiAgICBkZXRpbHM6IGBPcmlnaW5hbCBtZXNzYWdlOiAke2Vycm9yLmNvZGV9IC0gJHtlcnJvci5yZWFzb259YCxcbiAgICB1cmw6IG5ld0lzc3VlVVJMLFxuICAgIGxvY2F0aW9uOiB7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIHBvc2l0aW9uOiBhdG9tbGludGVyLmdlbmVyYXRlUmFuZ2UodGV4dEVkaXRvciksXG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==