Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.shouldTriggerLinter = shouldTriggerLinter;
exports.getEditorCursorScopes = getEditorCursorScopes;
exports.isPathIgnored = isPathIgnored;
exports.subscriptiveObserve = subscriptiveObserve;
exports.messageKey = messageKey;
exports.normalizeMessages = normalizeMessages;
exports.messageKeyLegacy = messageKeyLegacy;
exports.normalizeMessagesLegacy = normalizeMessagesLegacy;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _lodashUniq = require('lodash.uniq');

var _lodashUniq2 = _interopRequireDefault(_lodashUniq);

var _atom = require('atom');

var $version = '__$sb_linter_version';
exports.$version = $version;
var $activated = '__$sb_linter_activated';
exports.$activated = $activated;
var $requestLatest = '__$sb_linter_request_latest';
exports.$requestLatest = $requestLatest;
var $requestLastReceived = '__$sb_linter_request_last_received';

exports.$requestLastReceived = $requestLastReceived;

function shouldTriggerLinter(linter, wasTriggeredOnChange, scopes) {
  if (wasTriggeredOnChange && !(linter[$version] === 2 ? linter.lintsOnChange : linter.lintOnFly)) {
    return false;
  }
  return scopes.some(function (scope) {
    return linter.grammarScopes.includes(scope);
  });
}

function getEditorCursorScopes(textEditor) {
  return (0, _lodashUniq2['default'])(textEditor.getCursors().reduce(function (scopes, cursor) {
    return scopes.concat(cursor.getScopeDescriptor().getScopesArray());
  }, ['*']));
}

function isPathIgnored(filePath, ignoredGlob, ignoredVCS) {
  if (ignoredVCS) {
    var repository = null;
    var projectPaths = atom.project.getPaths();
    for (var i = 0, _length2 = projectPaths.length; i < _length2; ++i) {
      var projectPath = projectPaths[i];
      if (filePath.indexOf(projectPath) === 0) {
        repository = atom.project.getRepositories()[i];
        break;
      }
    }
    if (repository && repository.isPathIgnored(filePath)) {
      return true;
    }
  }
  var normalizedFilePath = process.platform === 'win32' ? filePath.replace(/\\/g, '/') : filePath;
  return (0, _minimatch2['default'])(normalizedFilePath, ignoredGlob);
}

function subscriptiveObserve(object, eventName, callback) {
  var subscription = null;
  var eventSubscription = object.observe(eventName, function (props) {
    if (subscription) {
      subscription.dispose();
    }
    subscription = callback.call(this, props);
  });

  return new _atom.Disposable(function () {
    eventSubscription.dispose();
    if (subscription) {
      subscription.dispose();
    }
  });
}

function messageKey(message) {
  var reference = message.reference;
  return ['$LINTER:' + message.linterName, '$LOCATION:' + message.location.file + '$' + message.location.position.start.row + '$' + message.location.position.start.column + '$' + message.location.position.end.row + '$' + message.location.position.end.column, reference ? '$REFERENCE:' + reference.file + '$' + (reference.position ? reference.position.row + '$' + reference.position.column : '') : '$REFERENCE:null', '$EXCERPT:' + message.excerpt, '$SEVERITY:' + message.severity, message.icon ? '$ICON:' + message.icon : '$ICON:null', message.url ? '$URL:' + message.url : '$URL:null'].join('');
}

function normalizeMessages(linterName, messages) {
  for (var i = 0, _length3 = messages.length; i < _length3; ++i) {
    var message = messages[i];
    var reference = message.reference;
    if (Array.isArray(message.location.position)) {
      message.location.position = _atom.Range.fromObject(message.location.position);
    }
    if (reference && Array.isArray(reference.position)) {
      reference.position = _atom.Point.fromObject(reference.position);
    }
    if (message.solutions && message.solutions.length) {
      for (var j = 0, _length = message.solutions.length, solution = undefined; j < _length; j++) {
        solution = message.solutions[j];
        if (Array.isArray(solution.position)) {
          solution.position = _atom.Range.fromObject(solution.position);
        }
      }
    }
    message.version = 2;
    message.linterName = linterName;
    message.key = messageKey(message);
  }
}

function messageKeyLegacy(message) {
  return ['$LINTER:' + message.linterName, '$LOCATION:' + (message.filePath || '') + '$' + (message.range ? message.range.start.row + '$' + message.range.start.column + '$' + message.range.end.row + '$' + message.range.end.column : ''), '$TEXT:' + (message.text || ''), '$HTML:' + (message.html || ''), '$SEVERITY:' + message.severity, '$TYPE:' + message.type, '$CLASS:' + (message['class'] || '')].join('');
}

function normalizeMessagesLegacy(linterName, messages) {
  for (var i = 0, _length4 = messages.length; i < _length4; ++i) {
    var message = messages[i];
    var fix = message.fix;
    if (message.range && message.range.constructor.name === 'Array') {
      message.range = _atom.Range.fromObject(message.range);
    }
    if (fix && fix.range.constructor.name === 'Array') {
      fix.range = _atom.Range.fromObject(fix.range);
    }
    if (!message.severity) {
      var type = message.type.toLowerCase();
      if (type === 'warning') {
        message.severity = type;
      } else if (type === 'info' || type === 'trace') {
        message.severity = 'info';
      } else {
        message.severity = 'error';
      }
    }
    message.version = 1;
    message.linterName = linterName;
    message.key = messageKeyLegacy(message);

    if (message.trace) {
      normalizeMessagesLegacy(linterName, message.trace);
    }
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vRTovQ29kZS9naXRodWIvYXRvbS1jb25maWcvcGFja2FnZXMvbGludGVyL2xpYi9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3lCQUVzQixXQUFXOzs7OzBCQUNULGFBQWE7Ozs7b0JBQ0ksTUFBTTs7QUFJeEMsSUFBTSxRQUFRLEdBQUcsc0JBQXNCLENBQUE7O0FBQ3ZDLElBQU0sVUFBVSxHQUFHLHdCQUF3QixDQUFBOztBQUMzQyxJQUFNLGNBQWMsR0FBRyw2QkFBNkIsQ0FBQTs7QUFDcEQsSUFBTSxvQkFBb0IsR0FBRyxvQ0FBb0MsQ0FBQTs7OztBQUVqRSxTQUFTLG1CQUFtQixDQUNqQyxNQUFjLEVBQ2Qsb0JBQTZCLEVBQzdCLE1BQXFCLEVBQ1o7QUFDVCxNQUFJLG9CQUFvQixJQUFJLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUEsQUFBQyxFQUFFO0FBQy9GLFdBQU8sS0FBSyxDQUFBO0dBQ2I7QUFDRCxTQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBUyxLQUFLLEVBQUU7QUFDakMsV0FBTyxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtHQUM1QyxDQUFDLENBQUE7Q0FDSDs7QUFFTSxTQUFTLHFCQUFxQixDQUFDLFVBQXNCLEVBQWlCO0FBQzNFLFNBQU8sNkJBQVksVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFDLE1BQU0sRUFBRSxNQUFNO1dBQy9ELE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUMsY0FBYyxFQUFFLENBQUM7R0FDNUQsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtDQUNYOztBQUVNLFNBQVMsYUFBYSxDQUFDLFFBQWdCLEVBQUUsV0FBbUIsRUFBRSxVQUFtQixF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LENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQ2hEO0FBQ0QsUUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRTtBQUNqRCxTQUFHLENBQUMsS0FBSyxHQUFHLFlBQU0sVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUN4QztBQUNELFFBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO0FBQ3JCLFVBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDdkMsVUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO0FBQ3RCLGVBQU8sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO09BQ3hCLE1BQU0sSUFBSSxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLEVBQUU7QUFDOUMsZUFBTyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUE7T0FDMUIsTUFBTTtBQUNMLGVBQU8sQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFBO09BQzNCO0tBQ0Y7QUFDRCxXQUFPLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQTtBQUNuQixXQUFPLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQTtBQUMvQixXQUFPLENBQUMsR0FBRyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFBOztBQUV2QyxRQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7QUFDakIsNkJBQXVCLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUNuRDtHQUNGO0NBQ0YiLCJmaWxlIjoiZmlsZTovLy9FOi9Db2RlL2dpdGh1Yi9hdG9tLWNvbmZpZy9wYWNrYWdlcy9saW50ZXIvbGliL2hlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgbWluaW1hdGNoIGZyb20gJ21pbmltYXRjaCdcbmltcG9ydCBhcnJheVVuaXF1ZSBmcm9tICdsb2Rhc2gudW5pcSdcbmltcG9ydCB7IERpc3Bvc2FibGUsIFJhbmdlLCBQb2ludCB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IFRleHRFZGl0b3IgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXIsIE1lc3NhZ2UsIE1lc3NhZ2VMZWdhY3kgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgY29uc3QgJHZlcnNpb24gPSAnX18kc2JfbGludGVyX3ZlcnNpb24nXG5leHBvcnQgY29uc3QgJGFjdGl2YXRlZCA9ICdfXyRzYl9saW50ZXJfYWN0aXZhdGVkJ1xuZXhwb3J0IGNvbnN0ICRyZXF1ZXN0TGF0ZXN0ID0gJ19fJHNiX2xpbnRlcl9yZXF1ZXN0X2xhdGVzdCdcbmV4cG9ydCBjb25zdCAkcmVxdWVzdExhc3RSZWNlaXZlZCA9ICdfXyRzYl9saW50ZXJfcmVxdWVzdF9sYXN0X3JlY2VpdmVkJ1xuXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkVHJpZ2dlckxpbnRlcihcbiAgbGludGVyOiBMaW50ZXIsXG4gIHdhc1RyaWdnZXJlZE9uQ2hhbmdlOiBib29sZWFuLFxuICBzY29wZXM6IEFycmF5PHN0cmluZz4sXG4pOiBib29sZWFuIHtcbiAgaWYgKHdhc1RyaWdnZXJlZE9uQ2hhbmdlICYmICEobGludGVyWyR2ZXJzaW9uXSA9PT0gMiA/IGxpbnRlci5saW50c09uQ2hhbmdlIDogbGludGVyLmxpbnRPbkZseSkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gc2NvcGVzLnNvbWUoZnVuY3Rpb24oc2NvcGUpIHtcbiAgICByZXR1cm4gbGludGVyLmdyYW1tYXJTY29wZXMuaW5jbHVkZXMoc2NvcGUpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFZGl0b3JDdXJzb3JTY29wZXModGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IEFycmF5PHN0cmluZz4ge1xuICByZXR1cm4gYXJyYXlVbmlxdWUodGV4dEVkaXRvci5nZXRDdXJzb3JzKCkucmVkdWNlKChzY29wZXMsIGN1cnNvcikgPT4gKFxuICAgIHNjb3Blcy5jb25jYXQoY3Vyc29yLmdldFNjb3BlRGVzY3JpcHRvcigpLmdldFNjb3Blc0FycmF5KCkpXG4gICksIFsnKiddKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGF0aElnbm9yZWQoZmlsZVBhdGg6IHN0cmluZywgaWdub3JlZEdsb2I6IHN0cmluZywgaWdub3JlZFZDUzogYm9vbGVhbik6IGJvb2xlYW4ge1xuICBpZiAoaWdub3JlZFZDUykge1xuICAgIGxldCByZXBvc2l0b3J5ID0gbnVsbFxuICAgIGNvbnN0IHByb2plY3RQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IHByb2plY3RQYXRocy5sZW5ndGg7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgY29uc3QgcHJvamVjdFBhdGggPSBwcm9qZWN0UGF0aHNbaV1cbiAgICAgIGlmIChmaWxlUGF0aC5pbmRleE9mKHByb2plY3RQYXRoKSA9PT0gMCkge1xuICAgICAgICByZXBvc2l0b3J5ID0gYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpW2ldXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXBvc2l0b3J5ICYmIHJlcG9zaXRvcnkuaXNQYXRoSWdub3JlZChmaWxlUGF0aCkpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIGNvbnN0IG5vcm1hbGl6ZWRGaWxlUGF0aCA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgPyBmaWxlUGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJykgOiBmaWxlUGF0aFxuICByZXR1cm4gbWluaW1hdGNoKG5vcm1hbGl6ZWRGaWxlUGF0aCwgaWdub3JlZEdsb2IpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWJzY3JpcHRpdmVPYnNlcnZlKG9iamVjdDogT2JqZWN0LCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gIGxldCBzdWJzY3JpcHRpb24gPSBudWxsXG4gIGNvbnN0IGV2ZW50U3Vic2NyaXB0aW9uID0gb2JqZWN0Lm9ic2VydmUoZXZlbnROYW1lLCBmdW5jdGlvbihwcm9wcykge1xuICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICB9XG4gICAgc3Vic2NyaXB0aW9uID0gY2FsbGJhY2suY2FsbCh0aGlzLCBwcm9wcylcbiAgfSlcblxuICByZXR1cm4gbmV3IERpc3Bvc2FibGUoZnVuY3Rpb24oKSB7XG4gICAgZXZlbnRTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIH1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lc3NhZ2VLZXkobWVzc2FnZTogTWVzc2FnZSkge1xuICBjb25zdCByZWZlcmVuY2UgPSBtZXNzYWdlLnJlZmVyZW5jZVxuICByZXR1cm4gW1xuICAgIGAkTElOVEVSOiR7bWVzc2FnZS5saW50ZXJOYW1lfWAsXG4gICAgYCRMT0NBVElPTjoke21lc3NhZ2UubG9jYXRpb24uZmlsZX0kJHttZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uLnN0YXJ0LnJvd30kJHttZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uLnN0YXJ0LmNvbHVtbn0kJHttZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uLmVuZC5yb3d9JCR7bWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbi5lbmQuY29sdW1ufWAsXG4gICAgcmVmZXJlbmNlID8gYCRSRUZFUkVOQ0U6JHtyZWZlcmVuY2UuZmlsZX0kJHtyZWZlcmVuY2UucG9zaXRpb24gPyBgJHtyZWZlcmVuY2UucG9zaXRpb24ucm93fSQke3JlZmVyZW5jZS5wb3NpdGlvbi5jb2x1bW59YCA6ICcnfWAgOiAnJFJFRkVSRU5DRTpudWxsJyxcbiAgICBgJEVYQ0VSUFQ6JHttZXNzYWdlLmV4Y2VycHR9YCxcbiAgICBgJFNFVkVSSVRZOiR7bWVzc2FnZS5zZXZlcml0eX1gLFxuICAgIG1lc3NhZ2UuaWNvbiA/IGAkSUNPTjoke21lc3NhZ2UuaWNvbn1gIDogJyRJQ09OOm51bGwnLFxuICAgIG1lc3NhZ2UudXJsID8gYCRVUkw6JHttZXNzYWdlLnVybH1gIDogJyRVUkw6bnVsbCcsXG4gIF0uam9pbignJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZU1lc3NhZ2VzKGxpbnRlck5hbWU6IHN0cmluZywgbWVzc2FnZXM6IEFycmF5PE1lc3NhZ2U+KSB7XG4gIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBtZXNzYWdlcy5sZW5ndGg7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBtZXNzYWdlc1tpXVxuICAgIGNvbnN0IHJlZmVyZW5jZSA9IG1lc3NhZ2UucmVmZXJlbmNlXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbikpIHtcbiAgICAgIG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24gPSBSYW5nZS5mcm9tT2JqZWN0KG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24pXG4gICAgfVxuICAgIGlmIChyZWZlcmVuY2UgJiYgQXJyYXkuaXNBcnJheShyZWZlcmVuY2UucG9zaXRpb24pKSB7XG4gICAgICByZWZlcmVuY2UucG9zaXRpb24gPSBQb2ludC5mcm9tT2JqZWN0KHJlZmVyZW5jZS5wb3NpdGlvbilcbiAgICB9XG4gICAgaWYgKG1lc3NhZ2Uuc29sdXRpb25zICYmIG1lc3NhZ2Uuc29sdXRpb25zLmxlbmd0aCkge1xuICAgICAgZm9yIChsZXQgaiA9IDAsIF9sZW5ndGggPSBtZXNzYWdlLnNvbHV0aW9ucy5sZW5ndGgsIHNvbHV0aW9uOyBqIDwgX2xlbmd0aDsgaisrKSB7XG4gICAgICAgIHNvbHV0aW9uID0gbWVzc2FnZS5zb2x1dGlvbnNbal1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc29sdXRpb24ucG9zaXRpb24pKSB7XG4gICAgICAgICAgc29sdXRpb24ucG9zaXRpb24gPSBSYW5nZS5mcm9tT2JqZWN0KHNvbHV0aW9uLnBvc2l0aW9uKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIG1lc3NhZ2UudmVyc2lvbiA9IDJcbiAgICBtZXNzYWdlLmxpbnRlck5hbWUgPSBsaW50ZXJOYW1lXG4gICAgbWVzc2FnZS5rZXkgPSBtZXNzYWdlS2V5KG1lc3NhZ2UpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lc3NhZ2VLZXlMZWdhY3kobWVzc2FnZTogTWVzc2FnZUxlZ2FjeSk6IHN0cmluZyB7XG4gIHJldHVybiBbXG4gICAgYCRMSU5URVI6JHttZXNzYWdlLmxpbnRlck5hbWV9YCxcbiAgICBgJExPQ0FUSU9OOiR7bWVzc2FnZS5maWxlUGF0aCB8fCAnJ30kJHttZXNzYWdlLnJhbmdlID8gYCR7bWVzc2FnZS5yYW5nZS5zdGFydC5yb3d9JCR7bWVzc2FnZS5yYW5nZS5zdGFydC5jb2x1bW59JCR7bWVzc2FnZS5yYW5nZS5lbmQucm93fSQke21lc3NhZ2UucmFuZ2UuZW5kLmNvbHVtbn1gIDogJyd9YCxcbiAgICBgJFRFWFQ6JHttZXNzYWdlLnRleHQgfHwgJyd9YCxcbiAgICBgJEhUTUw6JHttZXNzYWdlLmh0bWwgfHwgJyd9YCxcbiAgICBgJFNFVkVSSVRZOiR7bWVzc2FnZS5zZXZlcml0eX1gLFxuICAgIGAkVFlQRToke21lc3NhZ2UudHlwZX1gLFxuICAgIGAkQ0xBU1M6JHttZXNzYWdlLmNsYXNzIHx8ICcnfWAsXG4gIF0uam9pbignJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KGxpbnRlck5hbWU6IHN0cmluZywgbWVzc2FnZXM6IEFycmF5PE1lc3NhZ2VMZWdhY3k+KSB7XG4gIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBtZXNzYWdlcy5sZW5ndGg7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBtZXNzYWdlc1tpXVxuICAgIGNvbnN0IGZpeCA9IG1lc3NhZ2UuZml4XG4gICAgaWYgKG1lc3NhZ2UucmFuZ2UgJiYgbWVzc2FnZS5yYW5nZS5jb25zdHJ1Y3Rvci5uYW1lID09PSAnQXJyYXknKSB7XG4gICAgICBtZXNzYWdlLnJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChtZXNzYWdlLnJhbmdlKVxuICAgIH1cbiAgICBpZiAoZml4ICYmIGZpeC5yYW5nZS5jb25zdHJ1Y3Rvci5uYW1lID09PSAnQXJyYXknKSB7XG4gICAgICBmaXgucmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KGZpeC5yYW5nZSlcbiAgICB9XG4gICAgaWYgKCFtZXNzYWdlLnNldmVyaXR5KSB7XG4gICAgICBjb25zdCB0eXBlID0gbWVzc2FnZS50eXBlLnRvTG93ZXJDYXNlKClcbiAgICAgIGlmICh0eXBlID09PSAnd2FybmluZycpIHtcbiAgICAgICAgbWVzc2FnZS5zZXZlcml0eSA9IHR5cGVcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2luZm8nIHx8IHR5cGUgPT09ICd0cmFjZScpIHtcbiAgICAgICAgbWVzc2FnZS5zZXZlcml0eSA9ICdpbmZvJ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVzc2FnZS5zZXZlcml0eSA9ICdlcnJvcidcbiAgICAgIH1cbiAgICB9XG4gICAgbWVzc2FnZS52ZXJzaW9uID0gMVxuICAgIG1lc3NhZ2UubGludGVyTmFtZSA9IGxpbnRlck5hbWVcbiAgICBtZXNzYWdlLmtleSA9IG1lc3NhZ2VLZXlMZWdhY3kobWVzc2FnZSlcblxuICAgIGlmIChtZXNzYWdlLnRyYWNlKSB7XG4gICAgICBub3JtYWxpemVNZXNzYWdlc0xlZ2FjeShsaW50ZXJOYW1lLCBtZXNzYWdlLnRyYWNlKVxuICAgIH1cbiAgfVxufVxuIl19