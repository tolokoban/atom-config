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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vRTovQ29kZS9naXRodWIvYXRvbS1jb25maWcvcGFja2FnZXMvdG9sb2ZyYW1ld29yay9saWIvdG9sb2ZyYW1ld29yay12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7OztJQUVTLGlCQUFpQjtBQUV6QixXQUZRLGlCQUFpQixDQUV4QixlQUFlLEVBQUU7MEJBRlYsaUJBQWlCOzs7QUFJbEMsUUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdDLFFBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7O0FBRzVDLFFBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUMsV0FBTyxDQUFDLFdBQVcsR0FBRyxrREFBa0QsQ0FBQztBQUN6RSxXQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxRQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUNuQzs7OztlQVprQixpQkFBaUI7O1dBZTNCLHFCQUFHLEVBQUU7Ozs7O1dBR1AsbUJBQUc7QUFDUixVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ3ZCOzs7V0FFUyxzQkFBRztBQUNYLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztLQUNyQjs7O1NBeEJrQixpQkFBaUI7OztxQkFBakIsaUJBQWlCIiwiZmlsZSI6ImZpbGU6Ly8vRTovQ29kZS9naXRodWIvYXRvbS1jb25maWcvcGFja2FnZXMvdG9sb2ZyYW1ld29yay9saWIvdG9sb2ZyYW1ld29yay12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvbG9mcmFtZXdvcmtWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihzZXJpYWxpemVkU3RhdGUpIHtcbiAgICAvLyBDcmVhdGUgcm9vdCBlbGVtZW50XG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3RvbG9mcmFtZXdvcmsnKTtcblxuICAgIC8vIENyZWF0ZSBtZXNzYWdlIGVsZW1lbnRcbiAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbWVzc2FnZS50ZXh0Q29udGVudCA9ICdUaGUgVG9sb2ZyYW1ld29yayBwYWNrYWdlIGlzIEFsaXZlISBJdFxcJ3MgQUxJVkUhJztcbiAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQoJ21lc3NhZ2UnKTtcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQobWVzc2FnZSk7XG4gIH1cblxuICAvLyBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNhbiBiZSByZXRyaWV2ZWQgd2hlbiBwYWNrYWdlIGlzIGFjdGl2YXRlZFxuICBzZXJpYWxpemUoKSB7fVxuXG4gIC8vIFRlYXIgZG93biBhbnkgc3RhdGUgYW5kIGRldGFjaFxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKTtcbiAgfVxuXG4gIGdldEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudDtcbiAgfVxuXG59XG4iXX0=