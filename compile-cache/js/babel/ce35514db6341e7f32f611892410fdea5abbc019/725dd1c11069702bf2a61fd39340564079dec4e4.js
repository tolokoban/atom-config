'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ToloframeworkView = (function () {
  function ToloframeworkView(serializedState) {
    _classCallCheck(this, ToloframeworkView);

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('toloframework');

    // Create message element
    var message = document.createElement('div');
    message.textContent = 'The Toloframework package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);
  }

  // Returns an object that can be retrieved when package is activated

  _createClass(ToloframeworkView, [{
    key: 'serialize',
    value: function serialize() {}

    // Tear down any state and detach
  }, {
    key: 'destroy',
    value: function destroy() {
      this.element.remove();
    }
  }, {
    key: 'getElement',
    value: function getElement() {
      return this.element;
    }
  }]);

  return ToloframeworkView;
})();

exports['default'] = ToloframeworkView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RvbG9rb2Jhbi9Db2RlL2dpdGh1Yi9hdG9tLWNvbmZpZy9wYWNrYWdlcy90b2xvZnJhbWV3b3JrL2xpYi90b2xvZnJhbWV3b3JrLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7Ozs7O0lBRVMsaUJBQWlCO0FBRXpCLFdBRlEsaUJBQWlCLENBRXhCLGVBQWUsRUFBRTswQkFGVixpQkFBaUI7OztBQUlsQyxRQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0MsUUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDOzs7QUFHNUMsUUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM5QyxXQUFPLENBQUMsV0FBVyxHQUFHLGtEQUFrRCxDQUFDO0FBQ3pFLFdBQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ25DOzs7O2VBWmtCLGlCQUFpQjs7V0FlM0IscUJBQUcsRUFBRTs7Ozs7V0FHUCxtQkFBRztBQUNSLFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDdkI7OztXQUVTLHNCQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0tBQ3JCOzs7U0F4QmtCLGlCQUFpQjs7O3FCQUFqQixpQkFBaUIiLCJmaWxlIjoiL2hvbWUvdG9sb2tvYmFuL0NvZGUvZ2l0aHViL2F0b20tY29uZmlnL3BhY2thZ2VzL3RvbG9mcmFtZXdvcmsvbGliL3RvbG9mcmFtZXdvcmstdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2xvZnJhbWV3b3JrVmlldyB7XG5cbiAgY29uc3RydWN0b3Ioc2VyaWFsaXplZFN0YXRlKSB7XG4gICAgLy8gQ3JlYXRlIHJvb3QgZWxlbWVudFxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCd0b2xvZnJhbWV3b3JrJyk7XG5cbiAgICAvLyBDcmVhdGUgbWVzc2FnZSBlbGVtZW50XG4gICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSAnVGhlIFRvbG9mcmFtZXdvcmsgcGFja2FnZSBpcyBBbGl2ZSEgSXRcXCdzIEFMSVZFISc7XG4gICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKCdtZXNzYWdlJyk7XG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKG1lc3NhZ2UpO1xuICB9XG5cbiAgLy8gUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgcmV0cmlldmVkIHdoZW4gcGFja2FnZSBpcyBhY3RpdmF0ZWRcbiAgc2VyaWFsaXplKCkge31cblxuICAvLyBUZWFyIGRvd24gYW55IHN0YXRlIGFuZCBkZXRhY2hcbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlKCk7XG4gIH1cblxuICBnZXRFbGVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQ7XG4gIH1cblxufVxuIl19