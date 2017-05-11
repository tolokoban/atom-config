(function() {
  var AutoEncoding, _, fs, iconv, jschardet;

  fs = require('fs');

  jschardet = require('jschardet');

  iconv = require('iconv-lite');

  _ = require('lodash');

  module.exports = AutoEncoding = (function() {
    var detectEncoding, divideBuffer, getBestEncode, getDisallowEncTypes, getEncodingFromView, getForceEncTypes, isAllowFile, stripEncName;

    function AutoEncoding() {}

    detectEncoding = function(buffer) {
      var encoding, forceEncMap, ref;
      encoding = ((ref = jschardet.detect(buffer)) != null ? ref : {
        encoding: null
      }).encoding;
      encoding = encoding != null ? encoding : atom.config.get('core.fileEncoding');
      encoding = stripEncName(encoding);
      if (encoding === 'ascii') {
        encoding = 'utf8';
      }
      forceEncMap = getForceEncTypes();
      if (forceEncMap != null ? forceEncMap[encoding] : void 0) {
        encoding = forceEncMap[encoding];
      }
      return encoding;
    };

    getDisallowEncTypes = function() {
      var disallowList, loadSetting;
      loadSetting = atom.config.get('auto-encoding.disallowEncTypes');
      disallowList = [];
      if (!/^(\s+)?$/.test(loadSetting)) {
        disallowList = loadSetting.split(/,/).map(function(enc) {
          return enc.replace(/\s/g, '').toLowerCase();
        });
      }
      return disallowList;
    };

    getForceEncTypes = function() {
      var encMap, items, loadSetting;
      loadSetting = atom.config.get('auto-encoding.forceEncTypes');
      encMap = {};
      if (loadSetting.length) {
        items = loadSetting.replace(/\s/g, '').split(',');
        items.forEach(function(item) {
          var kv;
          kv = item.split(':');
          return encMap[kv[0]] = kv[1];
        });
      }
      return encMap;
    };

    stripEncName = function(name) {
      return name.toLowerCase().replace(/[^0-9a-z]|:\d{4}$/g, '');
    };

    getBestEncode = function(encodings) {
      var disallowEncs, encMap, encoding, k, max, v;
      disallowEncs = getDisallowEncTypes();
      encodings = encodings.filter(function(enc) {
        return (enc != null) && disallowEncs.indexOf(stripEncName(enc)) === -1;
      });
      encoding = atom.config.get('core.fileEncoding');
      encMap = {};
      max = 0;
      encodings.forEach(function(enc) {
        if (encMap[enc] == null) {
          encMap[enc] = 0;
        }
        encMap[enc]++;
      });
      for (k in encMap) {
        v = encMap[k];
        if (max < v || (max === v && k !== encoding)) {
          max = v;
          encoding = k;
        }
      }
      return encoding;
    };

    divideBuffer = function(buffer, n) {
      var i, ref, results, step;
      step = Math.floor(buffer.length / n);
      return (function() {
        results = [];
        for (var i = 0, ref = n - 1; 0 <= ref ? i <= ref : i >= ref; 0 <= ref ? i++ : i--){ results.push(i); }
        return results;
      }).apply(this).map(function(idx) {
        var end, start;
        start = idx === 0 ? 0 : idx * step + 1;
        end = start + step;
        if (idx === n - 1) {
          return buffer.slice(start);
        } else {
          return buffer.slice(start, end);
        }
      });
    };

    getEncodingFromView = function(view) {
      var encoding, pat;
      encoding = '';
      pat = /auto-encoding:\s+(\w+)$/;
      _.each(view.querySelectorAll('.syntax--comment'), (function(_this) {
        return function(node) {
          var matcher;
          matcher = pat.exec(node.textContent);
          if (matcher) {
            encoding = matcher[1];
            return false;
          }
        };
      })(this));
      return encoding;
    };

    isAllowFile = function(filePath) {
      var fileName, filterExt;
      fileName = require('path').basename(filePath);
      filterExt = atom.config.get('auto-encoding.ignorePattern');
      return filterExt === '' || !new RegExp(filterExt).test(fileName);
    };

    AutoEncoding.prototype.fire = function() {
      var divideSize, filePath;
      this.editor = atom.workspace.getActiveTextEditor();
      if (this.editor == null) {
        return;
      }
      filePath = this.editor.getPath();
      if (!fs.existsSync(filePath)) {
        return;
      }
      divideSize = atom.config.get('auto-encoding.divideSize');
      return fs.readFile(filePath, (function(_this) {
        return function(error, buffer) {
          var editorPath, encoding, ref, ref1, ref2;
          if ((error != null) || (_this.editor == null)) {
            return;
          }
          encoding = getEncodingFromView(atom.views.getView(_this.editor));
          if (!encoding) {
            encoding = getBestEncode(divideBuffer(buffer, divideSize).map(function(buf) {
              return detectEncoding(buf);
            }));
          }
          if (!iconv.encodingExists(encoding)) {
            return;
          }
          encoding = stripEncName(encoding);
          editorPath = (ref = _this.editor) != null ? ref.getPath() : void 0;
          if (encoding !== ((ref1 = _this.editor) != null ? ref1.getEncoding() : void 0) && (editorPath != null)) {
            if ((_this.editor != null) && isAllowFile(editorPath)) {
              return (ref2 = _this.editor) != null ? ref2.setEncoding(encoding) : void 0;
            }
          }
        };
      })(this));
    };

    return AutoEncoding;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9FOi9Db2RlL2dpdGh1Yi9hdG9tLWNvbmZpZy9wYWNrYWdlcy9hdXRvLWVuY29kaW5nL2xpYi9hdXRvLWVuY29kaW5nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLFNBQUEsR0FBWSxPQUFBLENBQVEsV0FBUjs7RUFDWixLQUFBLEdBQVEsT0FBQSxDQUFRLFlBQVI7O0VBQ1IsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUVKLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFNSixRQUFBOzs7O0lBQUEsY0FBQSxHQUFpQixTQUFDLE1BQUQ7QUFDZixVQUFBO01BQUMsNkRBQXdDO1FBQUUsUUFBQSxFQUFVLElBQVo7O01BRXpDLFFBQUEsc0JBQVcsV0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQWhCO01BQ3RCLFFBQUEsR0FBVyxZQUFBLENBQWEsUUFBYjtNQUNYLElBQXFCLFFBQUEsS0FBWSxPQUFqQztRQUFBLFFBQUEsR0FBVyxPQUFYOztNQUVBLFdBQUEsR0FBYyxnQkFBQSxDQUFBO01BQ2QsMEJBQUcsV0FBYSxDQUFBLFFBQUEsVUFBaEI7UUFDRSxRQUFBLEdBQVcsV0FBWSxDQUFBLFFBQUEsRUFEekI7O2FBR0E7SUFYZTs7SUFnQmpCLG1CQUFBLEdBQXNCLFNBQUE7QUFDcEIsVUFBQTtNQUFBLFdBQUEsR0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCO01BQ2QsWUFBQSxHQUFlO01BRWYsSUFBQSxDQUFPLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFdBQWhCLENBQVA7UUFDRSxZQUFBLEdBQWUsV0FBVyxDQUFDLEtBQVosQ0FBa0IsR0FBbEIsQ0FBc0IsQ0FBQyxHQUF2QixDQUEyQixTQUFDLEdBQUQ7aUJBQ3hDLEdBQUcsQ0FBQyxPQUFKLENB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VUFLQSxJQUFBLENBQWMsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsUUFBckIsQ0FBZDtBQUFBLG1CQUFBOztVQUNBLFFBQUEsR0FBVyxZQUFBLENBQWEsUUFBYjtVQUNYLFVBQUEscUNBQW9CLENBQUUsT0FBVCxDQUFBO1VBQ2IsSUFBRyxRQUFBLDBDQUFxQixDQUFFLFdBQVQsQ0FBQSxXQUFkLElBQXlDLG9CQUE1QztZQUNFLElBQWtDLHNCQUFBLElBQWEsV0FBQSxDQUFZLFVBQVosQ0FBL0M7eURBQU8sQ0FBRSxXQUFULENBQXFCLFFBQXJCLFdBQUE7YUFERjs7UUFaMkI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBYkg7Ozs7O0FBaklSIiwic291cmNlc0NvbnRlbnQiOlsiIyBhdXRvLWVuY29kaW5nOiB1dGY4XG5mcyA9IHJlcXVpcmUgJ2ZzJ1xuanNjaGFyZGV0ID0gcmVxdWlyZSAnanNjaGFyZGV0J1xuaWNvbnYgPSByZXF1aXJlICdpY29udi1saXRlJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQXV0b0VuY29kaW5nXG5cbiAgIyBEZXRlY3QgZmlsZSBlbmNvZGluZy5cbiAgI1xuICAjIEBwYXJhbSB7QnVmZmVyfSBidWZmZXJcbiAgIyBAcmV0dXJuIHtTdHJpbmd9IGVuY29kaW5nXG4gIGRldGVjdEVuY29kaW5nID0gKGJ1ZmZlcikgLT5cbiAgICB7ZW5jb2Rpbmd9ID0gIGpzY2hhcmRldC5kZXRlY3QoYnVmZmVyKSA/IHsgZW5jb2Rpbmc6IG51bGwgfVxuXG4gICAgZW5jb2RpbmcgPSBlbmNvZGluZyA/IGF0b20uY29uZmlnLmdldCAnY29yZS5maWxlRW5jb2RpbmcnXG4gICAgZW5jb2RpbmcgPSBzdHJpcEVuY05hbWUoZW5jb2RpbmcpXG4gICAgZW5jb2RpbmcgPSAndXRmOCcgaWYgZW5jb2RpbmcgaXMgJ2FzY2lpJ1xuXG4gICAgZm9yY2VFbmNNYXAgPSBnZXRGb3JjZUVuY1R5cGVzKClcbiAgICBpZiBmb3JjZUVuY01hcD9bZW5jb2RpbmddXG4gICAgICBlbmNvZGluZyA9IGZvcmNlRW5jTWFwW2VuY29kaW5nXVxuXG4gICAgZW5jb2RpbmdcblxuICAjIEdldCBkaXNhbGxvdyBlbmNzLlxuICAjXG4gICMgQHJldHVybiB7QXJyYXkuPFN0cmluZz59IGRpc2FsbG93TGlzdFxuICBnZXREaXNhbGxvd0VuY1R5cGVzID0gLT5cbiAgICBsb2FkU2V0dGluZyA9IGF0b20uY29uZmlnLmdldCAnYXV0by1lbmNvZGluZy5kaXNhbGxvd0VuY1R5cGVzJ1xuICAgIGRpc2FsbG93TGlzdCA9IFtdXG5cbiAgICB1bmxlc3MgL14oXFxzKyk/JC8udGVzdCBsb2FkU2V0dGluZ1xuICAgICAgZGlzYWxsb3dMaXN0ID0gbG9hZFNldHRpbmcuc3BsaXQoLywvKS5tYXAgKGVuYykgLT5cbiAgICAgICAgZW5jLnJlcGxhY2UoL1xccy9nLCAnJykudG9Mb3dlckNhc2UoKVxuXG4gICAgZGlzYWxsb3dMaXN0XG5cbiAgIyBHZXQgZm9yY2VkIGVuY29kaW5nIHR5cGVzXG4gICNcbiAgIyBAcmV0dXJuIHtPYmplY3R9IGVuY01hcFxuICBnZXRGb3JjZUVuY1R5cGVzID0gLT5cbiAgICBsb2FkU2V0dGluZyA9IGF0b20uY29uZmlnLmdldCAnYXV0by1lbmNvZGluZy5mb3JjZUVuY1R5cGVzJ1xuICAgIGVuY01hcCA9IHt9XG5cbiAgICBpZiBsb2FkU2V0dGluZy5sZW5ndGhcbiAgICAgIGl0ZW1zID0gbG9hZFNldHRpbmcucmVwbGFjZSgvXFxzL2csICcnKS5zcGxpdCgnLCcpXG4gICAgICBpdGVtcy5mb3JFYWNoIChpdGVtKSAtPlxuICAgICAgICBrdiA9IGl0ZW0uc3BsaXQoJzonKVxuICAgICAgICBlbmNNYXBba3ZbMF1dID0ga3ZbMV1cblxuICAgIGVuY01hcFxuXG4gICMgU3RyaXAgc3ltYm9scyBmcm9tIGVuY29kaW5nIG5hbWVcbiAgI1xuICAjIEByZXR1cm4ge1N0cmluZ31cbiAgc3RyaXBFbmNOYW1lID0gKG5hbWUpIC0+XG4gICAgbmFtZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teMC05YS16XXw6XFxkezR9JC9nLCAnJylcblxuICAjIEdldCBiZXN0IGVuY29kaW5nLlxuICAjXG4gICMgQHBhcmFtIHtBcnJheS48U3RyaW5nPn0gZW5jb2RpbmdzXG4gICMgQHJldHVybiB7U3RyaW5nfSBlbmNvZGluZ1xuICBnZXRCZXN0RW5jb2RlID0gKGVuY29kaW5ncykgLT5cblxuICAgICMgcmVqZWN0IGRpc2FsbG93IGVuY3NcbiAgICBkaXNhbGxvd0VuY3MgPSBnZXREaXNhbGxvd0VuY1R5cGVzKClcbiAgICBlbmNvZGluZ3MgPSBlbmNvZGluZ3MuZmlsdGVyIChlbmMpIC0+XG4gICAgICBlbmM/IGFuZCBkaXNhbGxvd0VuY3MuaW5kZXhPZihcbiAgICAgICAgc3RyaXBFbmNOYW1lKGVuYylcbiAgICAgICkgaXMgLTFcblxuICAgICMgZ2V0IGRlZmF1bHQgZW5jXG4gICAgZW5jb2RpbmcgPSBhdG9tLmNvbmZpZy5nZXQgJ2NvcmUuZmlsZUVuY29kaW5nJ1xuICAgIGVuY01hcCA9IHt9XG4gICAgbWF4ID0gMFxuXG4gICAgZW5jb2RpbmdzXG4gICAgLmZvckVhY2ggKGVuYykgLT5cbiAgICAgIGVuY01hcFtlbmNdID0gMCB1bmxlc3MgZW5jTWFwW2VuY10/XG4gICAgICBlbmNNYXBbZW5jXSsrXG4gICAgICByZXR1cm5cblxuICAgIGZvciBrLCB2IG9mIGVuY01hcFxuICAgICAgaWYgbWF4IDwgdiBvciAobWF4IGlzIHYgYW5kIGsgaXNudCBlbmNvZGluZylcbiAgICAgICAgbWF4ID0gdlxuICAgICAgICBlbmNvZGluZyA9IGtcblxuICAgIGVuY29kaW5nXG5cbiAgIyBkaXZpZGUgYnVmZmVycy5cbiAgI1xuICAjIEBwYXJhbSB7QnVmZmVyfSBidWZmZXJcbiAgIyBAcGFyYW0ge051bWJlcn0gblxuICAjIEByZXR1cm4ge0FycmF5LjxCdWZmZXI+fSBkaXZpZGUgYnVmZmVyLlxuICBkaXZpZGVCdWZmZXIgPSAoYnVmZmVyLCBuKSAtPlxuICAgIHN0ZXAgPSBNYXRoLmZsb29yKGJ1ZmZlci5sZW5ndGggLyBuKVxuICAgIFswLi5uLTFdLm1hcCAoaWR4KSAtPlxuICAgICAgc3RhcnQgPSBpZiBpZHggaXMgMCB0aGVuIDAgZWxzZSBpZHggKiBzdGVwICsgMVxuICAgICAgZW5kID0gc3RhcnQgKyBzdGVwXG4gICAgICBpZiBpZHggaXMgbi0xXG4gICAgICAgIGJ1ZmZlci5zbGljZShzdGFydClcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmZmVyLnNsaWNlKHN0YXJ0LCBlbmQpXG5cbiAgIyBmaW5kIGVuY29kaW5nIGRlZmluaXRpb24gZnJvbSBjb21tZW50XG4gICNcbiAgIyBAcGFyYW0ge0RvbUVsZW1lbnR9IHZpZXcgd29ya3NwYWNlIHZpZXcuXG4gICMgQHJldHVybnMge1N0cmluZ30gZW5jb2RpbmdcbiAgZ2V0RW5jb2RpbmdGcm9tVmlldyA9ICh2aWV3KSAtPlxuICAgIGVuY29kaW5nID0gJydcbiAgICBwYXQgPSAvYXV0by1lbmNvZGluZzpcXHMrKFxcdyspJC9cbiAgICBfLmVhY2godmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuc3ludGF4LS1jb21tZW50JyksIChub2RlKSA9PlxuICAgICAgbWF0Y2hlciA9IHBhdC5leGVjKG5vZGUudGV4dENvbnRlbnQpXG4gICAgICBpZiBtYXRjaGVyXG4gICAgICAgIGVuY29kaW5nID0gbWF0Y2hlclsxXVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICApXG4gICAgZW5jb2RpbmdcblxuICAjIGlzIGFsbG93IGZpbGVcbiAgI1xuICAjIEBwYXJhbSB7U3RyaW5nfSBmaWxlUGF0aFxuICAjIEByZXR1cm5zIHtCb29sZWFufSBpcyBhbGxvdyBmaWxlXG4gIGlzQWxsb3dGaWxlID0gKGZpbGVQYXRoKSAtPlxuICAgIGZpbGVOYW1lID0gcmVxdWlyZSgncGF0aCcpLmJhc2VuYW1lKGZpbGVQYXRoKVxuICAgIGZpbHRlckV4dCA9IGF0b20uY29uZmlnLmdldCAnYXV0by1lbmNvZGluZy5pZ25vcmVQYXR0ZXJuJ1xuICAgIHJldHVybiBmaWx0ZXJFeHQgaXMgJycgb3Igbm90IG5ldyBSZWdFeHAoZmlsdGVyRXh0KS50ZXN0IGZpbGVOYW1lXG5cbiAgZmlyZTogLT5cbiAgICAjIGdldCBhY3RpdmUgdGV4dCBlZGl0b3JcbiAgICBAZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmV0dXJuIGlmIG5vdCBAZWRpdG9yP1xuXG4gICAgIyBnZXQgZmlsZSBwYXRoXG4gICAgZmlsZVBhdGggPSBAZWRpdG9yLmdldFBhdGgoKVxuICAgIHJldHVybiB1bmxlc3MgZnMuZXhpc3RzU3luYyhmaWxlUGF0aClcblxuICAgICMgZGl2aWRlIHNpemVcbiAgICBkaXZpZGVTaXplID0gYXRvbS5jb25maWcuZ2V0ICdhdXRvLWVuY29kaW5nLmRpdmlkZVNpemUnXG5cbiAgICAjIGNvbnZlcnQgdGV4dFxuICAgIHJldHVybiBmcy5yZWFkRmlsZSBmaWxlUGF0aCwgKGVycm9yLCBidWZmZXIpID0+XG4gICAgICByZXR1cm4gaWYgZXJyb3I/IG9yIG5vdCBAZWRpdG9yP1xuXG4gICAgICBlbmNvZGluZyA9IGdldEVuY29kaW5nRnJvbVZpZXcoYXRvbS52aWV3cy5nZXRWaWV3KEBlZGl0b3IpKVxuICAgICAgdW5sZXNzIGVuY29kaW5nXG4gICAgICAgIGVuY29kaW5nID0gZ2V0QmVzdEVuY29kZShcbiAgICAgICAgICBkaXZpZGVCdWZmZXIoYnVmZmVyLCBkaXZpZGVTaXplKS5tYXAgKGJ1ZikgLT4gZGV0ZWN0RW5jb2RpbmcoYnVmKVxuICAgICAgICApXG5cbiAgICAgIHJldHVybiB1bmxlc3MgaWNvbnYuZW5jb2RpbmdFeGlzdHMoZW5jb2RpbmcpXG4gICAgICBlbmNvZGluZyA9IHN0cmlwRW5jTmFtZShlbmNvZGluZylcbiAgICAgIGVkaXRvclBhdGggPSBAZWRpdG9yPy5nZXRQYXRoKClcbiAgICAgIGlmIGVuY29kaW5nIGlzbnQgQGVkaXRvcj8uZ2V0RW5jb2RpbmcoKSBhbmQgZWRpdG9yUGF0aD9cbiAgICAgICAgQGVkaXRvcj8uc2V0RW5jb2RpbmcoZW5jb2RpbmcpIGlmIEBlZGl0b3I/IGFuZCBpc0FsbG93RmlsZShlZGl0b3JQYXRoKVxuIl19
