'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var TolokobanTestView = (function () {
  function TolokobanTestView(serializedState) {
    _classCallCheck(this, TolokobanTestView);

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('tolokoban-test');

    // Create message element
    var message = document.createElement('div');
    message.textContent = 'The TolokobanTest package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);
  }

  // Returns an object that can be retrieved when package is activated

  _createClass(TolokobanTestView, [{
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

  return TolokobanTestView;
})();

exports['default'] = TolokobanTestView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vRTovQ29kZS9naXRodWIvYXRvbS90b2xva29iYW4tdGVzdC9saWIvdG9sb2tvYmFuLXRlc3Qtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7SUFFUyxpQkFBaUI7QUFFekIsV0FGUSxpQkFBaUIsQ0FFeEIsZUFBZSxFQUFFOzBCQUZWLGlCQUFpQjs7O0FBSWxDLFFBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QyxRQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7O0FBRzdDLFFBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUMsV0FBTyxDQUFDLFdBQVcsR0FBRyxrREFBa0QsQ0FBQztBQUN6RSxXQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxRQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUNuQzs7OztlQVprQixpQkFBaUI7O1dBZTNCLHFCQUFHLEVBQUU7Ozs7O1dBR1AsbUJBQUc7QUFDUixVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ3ZCOzs7V0FFUyxzQkFBRztBQUNYLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztLQUNyQjs7O1NBeEJrQixpQkFBaUI7OztxQkFBakIsaUJBQWlCIiwiZmlsZSI6ImZpbGU6Ly8vRTovQ29kZS9naXRodWIvYXRvbS90b2xva29iYW4tdGVzdC9saWIvdG9sb2tvYmFuLXRlc3Qtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2xva29iYW5UZXN0VmlldyB7XG5cbiAgY29uc3RydWN0b3Ioc2VyaWFsaXplZFN0YXRlKSB7XG4gICAgLy8gQ3JlYXRlIHJvb3QgZWxlbWVudFxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCd0b2xva29iYW4tdGVzdCcpO1xuXG4gICAgLy8gQ3JlYXRlIG1lc3NhZ2UgZWxlbWVudFxuICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gJ1RoZSBUb2xva29iYW5UZXN0IHBhY2thZ2UgaXMgQWxpdmUhIEl0XFwncyBBTElWRSEnO1xuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCgnbWVzc2FnZScpO1xuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChtZXNzYWdlKTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHJldHJpZXZlZCB3aGVuIHBhY2thZ2UgaXMgYWN0aXZhdGVkXG4gIHNlcmlhbGl6ZSgpIHt9XG5cbiAgLy8gVGVhciBkb3duIGFueSBzdGF0ZSBhbmQgZGV0YWNoXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpO1xuICB9XG5cbiAgZ2V0RWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50O1xuICB9XG5cbn1cbiJdfQ==