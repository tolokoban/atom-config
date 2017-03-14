(function() {
  var $, BrowserPlusView, CompositeDisposable, View, fs, jQ, path, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), View = ref.View, $ = ref.$;

  $ = jQ = require('jquery');

  require('jquery-ui/autocomplete');

  path = require('path');

  require('JSON2');

  require('jstorage');

  fs = require('fs');

  RegExp.escape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  module.exports = BrowserPlusView = (function(superClass) {
    extend(BrowserPlusView, superClass);

    function BrowserPlusView(model) {
      this.model = model;
      this.subscriptions = new CompositeDisposable;
      this.model.view = this;
      this.model.onDidDestroy((function(_this) {
        return function() {
          _this.subscriptions.dispose();
          return jQ(_this.url).autocomplete('destroy');
        };
      })(this));
      atom.notifications.onDidAddNotification(function(notification) {
        if (notification.type === 'info') {
          return setTimeout(function() {
            return notification.dismiss();
          }, 1000);
        }
      });
      BrowserPlusView.__super__.constructor.apply(this, arguments);
    }

    BrowserPlusView.content = function(params) {
      var hideURLBar, ref1, ref2, ref3, ref4, ref5, url;
      url = params.url;
      hideURLBar = '';
      if ((ref1 = params.opt) != null ? ref1.hideURLBar : void 0) {
        hideURLBar = 'hideURLBar';
      }
      if ((ref2 = params.opt) != null ? ref2.src : void 0) {
        params.src = BrowserPlusView.checkBase(params.opt.src, params.url);
        params.src = params.src.replace(/"/g, "'");
        if (!((ref3 = params.src) != null ? ref3.startsWith("data:text/html,") : void 0)) {
          params.src = "data:text/html," + params.src;
        }
        if (!url) {
          url = params.src;
        }
      }
      if ((ref4 = params.url) != null ? ref4.startsWith("browser-plus://") : void 0) {
        url = (ref5 = params.browserPlus) != null ? typeof ref5.getBrowserPlusUrl === "function" ? ref5.getBrowserPlusUrl(url) : void 0 : void 0;
      }
      return this.div({
        "class": 'browser-plus'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "url native-key-bindings " + hideURLBar,
            outlet: 'urlbar'
          }, function() {
            _this.div({
              "class": 'nav-btns-left'
            }, function() {
              _this.span({
                id: 'back',
                "class": 'mega-octicon octicon-arrow-left',
                outlet: 'back'
              });
              _this.span({
                id: 'forward',
                "class": 'mega-octicon octicon-arrow-right',
                outlet: 'forward'
              });
              _this.span({
                id: 'refresh',
                "class": 'mega-octicon octicon-sync',
                outlet: 'refresh'
              });
              _this.span({
                id: 'history',
                "class": 'mega-octicon octicon-book',
                outlet: 'history'
              });
              _this.span({
                id: 'fav',
                "class": 'mega-octicon octicon-star',
                outlet: 'fav'
              });
              _this.span({
                id: 'favList',
                "class": 'octicon octicon-arrow-down',
                outlet: 'favList'
              });
              return _this.a({
                "class": "fa fa-spinner",
                outlet: 'spinner'
              });
            });
            _this.div({
              "class": 'nav-btns'
            }, function() {
              _this.div({
                "class": 'nav-btns-right'
              }, function() {
                _this.span({
                  id: 'print',
                  "class": 'icon-browser-pluss icon-print',
                  outlet: 'print'
                });
                _this.span({
                  id: 'live',
                  "class": 'mega-octicon octicon-zap',
                  outlet: 'live'
                });
                return _this.span({
                  id: 'devtool',
                  "class": 'mega-octicon octicon-tools',
                  outlet: 'devtool'
                });
              });
              return _this.div({
                "class": 'input-url'
              }, function() {
                return _this.input({
                  "class": "native-key-bindings",
                  type: 'text',
                  id: 'url',
                  outlet: 'url',
                  value: "" + params.url
                });
              });
            });
            return _this.input({
              id: 'find',
              "class": 'find find-hide',
              outlet: 'find'
            });
          });
          return _this.tag('webview', {
            "class": "native-key-bindings",
            outlet: 'htmlv',
            preload: "file:///" + params.browserPlus.resources + "/bp-client.js",
            plugins: 'on',
            src: "" + url,
            disablewebsecurity: 'on',
            allowfileaccessfromfiles: 'on',
            allowPointerLock: 'on'
          });
        };
      })(this));
    };

    BrowserPlusView.prototype.toggleURLBar = function() {
      return this.urlbar.toggle();
    };

    BrowserPlusView.prototype.initialize = function() {
      var base1, ref1, ref2, ref3, ref4, ref5, ref6, ref7, select, src;
      src = (function(_this) {
        return function(req, res) {
          var _, fav, pattern, searchUrl, urls;
          _ = require('lodash');
          pattern = RegExp("" + (RegExp.escape(req.term)), "i");
          fav = _.filter(window.$.jStorage.get('bp.fav'), function(fav) {
            return fav.url.match(pattern) || fav.title.match(pattern);
          });
          urls = _.pluck(fav, "url");
          res(urls);
          searchUrl = 'http://api.bing.com/osjson.aspx';
          return (function() {
            return jQ.ajax({
              url: searchUrl,
              dataType: 'json',
              data: {
                query: req.term,
                'web.count': 10
              },
              success: (function(_this) {
                return function(data) {
                  var dat, i, len, ref1, search;
                  urls = urls.slice(0, 11);
                  search = "http://www.google.com/search?as_q=";
                  ref1 = data[1].slice(0, 11);
                  for (i = 0, len = ref1.length; i < len; i++) {
                    dat = ref1[i];
                    urls.push({
                      label: dat,
                      value: search + dat
                    });
                  }
                  return res(urls);
                };
              })(this)
            });
          })();
        };
      })(this);
      select = (function(_this) {
        return function(event, ui) {
          return _this.goToUrl(ui.item.value);
        };
      })(this);
      if (typeof (base1 = jQ(this.url)).autocomplete === "function") {
        base1.autocomplete({
          source: src,
          minLength: 2,
          select: select
        });
      }
      this.subscriptions.add(atom.tooltips.add(this.back, {
        title: 'Back'
      }));
      this.subscriptions.add(atom.tooltips.add(this.forward, {
        title: 'Forward'
      }));
      this.subscriptions.add(atom.tooltips.add(this.refresh, {
        title: 'Refresh'
      }));
      this.subscriptions.add(atom.tooltips.add(this.print, {
        title: 'Print'
      }));
      this.subscriptions.add(atom.tooltips.add(this.history, {
        title: 'History'
      }));
      this.subscriptions.add(atom.tooltips.add(this.favList, {
        title: 'View Favorites'
      }));
      this.subscriptions.add(atom.tooltips.add(this.fav, {
        title: 'Favoritize'
      }));
      this.subscriptions.add(atom.tooltips.add(this.live, {
        title: 'Live'
      }));
      this.subscriptions.add(atom.tooltips.add(this.devtool, {
        title: 'Dev Tools-f12'
      }));
      this.subscriptions.add(atom.commands.add('.browser-plus webview', {
        'browser-plus-view:goBack': (function(_this) {
          return function() {
            return _this.goBack();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('.browser-plus webview', {
        'browser-plus-view:goForward': (function(_this) {
          return function() {
            return _this.goForward();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('.browser-plus', {
        'browser-plus-view:toggleURLBar': (function(_this) {
          return function() {
            return _this.toggleURLBar();
          };
        })(this)
      }));
      this.liveOn = false;
      this.element.onkeydown = (function(_this) {
        return function() {
          return _this.showDevTool(arguments);
        };
      })(this);
      if (this.model.url.indexOf('file:///') >= 0) {
        this.checkFav();
      }
      if ((ref1 = this.htmlv[0]) != null) {
        ref1.addEventListener("permissionrequest", function(e) {
          return e.request.allow();
        });
      }
      if ((ref2 = this.htmlv[0]) != null) {
        ref2.addEventListener("console-message", (function(_this) {
          return function(e) {
            var BrowserPlusModel, base2, base3, base4, base5, css, csss, data, i, indx, init, inits, j, js, jss, k, l, len, len1, len2, len3, menu, menus, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref3, ref4, ref5, ref6, ref7, ref8, ref9, title, url;
            if (e.message.includes('~browser-plus-href~')) {
              data = e.message.replace('~browser-plus-href~', '');
              indx = data.indexOf(' ');
              url = data.substr(0, indx);
              title = data.substr(indx + 1);
              BrowserPlusModel = require('./browser-plus-model');
              if (!BrowserPlusModel.checkUrl(url)) {
                url = atom.config.get('browser-plus.homepage') || "http://www.google.com";
                atom.notifications.addSuccess("Redirecting to " + url);
                if ((ref3 = _this.htmlv[0]) != null) {
                  ref3.executeJavaScript("location.href = '" + url + "'");
                }
                return;
              }
              if (url && url !== _this.model.url && !((ref4 = _this.url.val()) != null ? ref4.startsWith('browser-plus://') : void 0)) {
                _this.url.val(url);
                _this.model.url = url;
              }
              if (title) {
                if (title !== _this.model.getTitle()) {
                  _this.model.setTitle(title);
                }
              } else {
                _this.model.setTitle(url);
              }
              _this.live.toggleClass('active', _this.liveOn);
              if (!_this.liveOn) {
                if ((ref5 = _this.liveSubscription) != null) {
                  ref5.dispose();
                }
              }
              _this.checkNav();
              _this.checkFav();
              _this.addHistory();
            }
            if (e.message.includes('~browser-plus-jquery~') || e.message.includes('~browser-plus-menu~')) {
              if (e.message.includes('~browser-plus-jquery~')) {
                if ((base2 = _this.model.browserPlus).jQueryJS == null) {
                  base2.jQueryJS = BrowserPlusView.getJQuery.call(_this);
                }
                if ((ref6 = _this.htmlv[0]) != null) {
                  ref6.executeJavaScript(_this.model.browserPlus.jQueryJS);
                }
              }
              if ((base3 = _this.model.browserPlus).jStorageJS == null) {
                base3.jStorageJS = BrowserPlusView.getJStorage.call(_this);
              }
              if ((ref7 = _this.htmlv[0]) != null) {
                ref7.executeJavaScript(_this.model.browserPlus.jStorageJS);
              }
              if ((base4 = _this.model.browserPlus).hotKeys == null) {
                base4.hotKeys = BrowserPlusView.getHotKeys.call(_this);
              }
              if ((ref8 = _this.htmlv[0]) != null) {
                ref8.executeJavaScript(_this.model.browserPlus.hotKeys);
              }
              if ((base5 = _this.model.browserPlus).notifyBar == null) {
                base5.notifyBar = BrowserPlusView.getNotifyBar.call(_this);
              }
              if ((ref9 = _this.htmlv[0]) != null) {
                ref9.executeJavaScript(_this.model.browserPlus.notifyBar);
              }
              if (inits = (ref10 = _this.model.browserPlus.plugins) != null ? ref10.onInit : void 0) {
                for (i = 0, len = inits.length; i < len; i++) {
                  init = inits[i];
                  if ((ref11 = _this.htmlv[0]) != null) {
                    ref11.executeJavaScript(init);
                  }
                }
              }
              if (jss = (ref12 = _this.model.browserPlus.plugins) != null ? ref12.jss : void 0) {
                for (j = 0, len1 = jss.length; j < len1; j++) {
                  js = jss[j];
                  if ((ref13 = _this.htmlv[0]) != null) {
                    ref13.executeJavaScript(BrowserPlusView.loadJS.call(_this, js, true));
                  }
                }
              }
              if (csss = (ref14 = _this.model.browserPlus.plugins) != null ? ref14.csss : void 0) {
                for (k = 0, len2 = csss.length; k < len2; k++) {
                  css = csss[k];
                  if ((ref15 = _this.htmlv[0]) != null) {
                    ref15.executeJavaScript(BrowserPlusView.loadCSS.call(_this, css, true));
                  }
                }
              }
              if (menus = (ref16 = _this.model.browserPlus.plugins) != null ? ref16.menus : void 0) {
                for (l = 0, len3 = menus.length; l < len3; l++) {
                  menu = menus[l];
                  if (menu.fn) {
                    menu.fn = menu.fn.toString();
                  }
                  if (menu.selectorFilter) {
                    menu.selectorFilter = menu.selectorFilter.toString();
                  }
                  if ((ref17 = _this.htmlv[0]) != null) {
                    ref17.executeJavaScript("browserPlus.menu(" + (JSON.stringify(menu)) + ")");
                  }
                }
              }
              if ((ref18 = _this.htmlv[0]) != null) {
                ref18.executeJavaScript(BrowserPlusView.loadCSS.call(_this, 'bp-style.css'));
              }
              return (ref19 = _this.htmlv[0]) != null ? ref19.executeJavaScript(BrowserPlusView.loadCSS.call(_this, 'jquery.notifyBar.css')) : void 0;
            }
          };
        })(this));
      }
      if ((ref3 = this.htmlv[0]) != null) {
        ref3.addEventListener("page-favicon-updated", (function(_this) {
          return function(e) {
            var _, fav, favIcon, favr, style, uri;
            _ = require('lodash');
            favr = window.$.jStorage.get('bp.fav');
            if (fav = _.find(favr, {
              'url': _this.model.url
            })) {
              fav.favIcon = e.favicons[0];
              window.$.jStorage.set('bp.fav', favr);
            }
            _this.model.iconName = Math.floor(Math.random() * 10000).toString();
            _this.model.favIcon = e.favicons[0];
            _this.model.updateIcon(e.favicons[0]);
            favIcon = window.$.jStorage.get('bp.favIcon');
            uri = _this.htmlv[0].getURL();
            if (!uri) {
              return;
            }
            favIcon[uri] = e.favicons[0];
            window.$.jStorage.set('bp.favIcon', favIcon);
            _this.model.updateIcon();
            style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = ".title.icon.icon-" + _this.model.iconName + " {\n  background-size: 16px 16px;\n  background-repeat: no-repeat;\n  padding-left: 20px;\n  background-image: url('" + e.favicons[0] + "');\n  background-position-y: 50%;\n}";
            return document.getElementsByTagName('head')[0].appendChild(style);
          };
        })(this));
      }
      if ((ref4 = this.htmlv[0]) != null) {
        ref4.addEventListener("page-title-set", (function(_this) {
          return function(e) {
            var _, fav, favr, title, uri;
            _ = require('lodash');
            favr = window.$.jStorage.get('bp.fav');
            title = window.$.jStorage.get('bp.title');
            uri = _this.htmlv[0].getURL();
            if (!uri) {
              return;
            }
            title[uri] = e.title;
            window.$.jStorage.set('bp.title', title);
            if (fav = _.find(favr, {
              'url': _this.model.url
            })) {
              fav.title = e.title;
              window.$.jStorage.set('bp.fav', favr);
            }
            return _this.model.setTitle(e.title);
          };
        })(this));
      }
      this.devtool.on('click', (function(_this) {
        return function(evt) {
          return _this.toggleDevTool();
        };
      })(this));
      this.print.on('click', (function(_this) {
        return function(evt) {
          var ref5;
          return (ref5 = _this.htmlv[0]) != null ? ref5.print() : void 0;
        };
      })(this));
      this.history.on('click', (function(_this) {
        return function(evt) {
          return atom.workspace.open("browser-plus://history", {
            split: 'left',
            searchAllPanes: true
          });
        };
      })(this));
      this.live.on('click', (function(_this) {
        return function(evt) {
          _this.liveOn = !_this.liveOn;
          _this.live.toggleClass('active', _this.liveOn);
          if (_this.liveOn) {
            _this.refreshPage();
            _this.liveSubscription = new CompositeDisposable;
            _this.liveSubscription.add(atom.workspace.observeTextEditors(function(editor) {
              return _this.liveSubscription.add(editor.onDidSave(function() {
                var timeout;
                timeout = atom.config.get('browser-plus.live');
                return setTimeout(function() {
                  return _this.refreshPage();
                }, timeout);
              }));
            }));
            return _this.model.onDidDestroy(function() {
              return _this.liveSubscription.dispose();
            });
          } else {
            return _this.liveSubscription.dispose();
          }
        };
      })(this));
      this.fav.on('click', (function(_this) {
        return function(evt) {
          var data, delCount, favs;
          favs = window.$.jStorage.get('bp.fav');
          if (_this.fav.hasClass('active')) {
            _this.removeFav(_this.model);
          } else {
            if (_this.model.orgURI) {
              return;
            }
            data = {
              url: _this.model.url,
              title: _this.model.title || _this.model.url,
              favIcon: _this.model.favIcon
            };
            favs.push(data);
            delCount = favs.length - atom.config.get('browser-plus.fav');
            if (delCount > 0) {
              favs.splice(0, delCount);
            }
            window.$.jStorage.set('bp.fav', favs);
          }
          return _this.fav.toggleClass('active');
        };
      })(this));
      if ((ref5 = this.htmlv[0]) != null) {
        ref5.addEventListener('new-window', function(e) {
          return atom.workspace.open(e.url, {
            split: 'left',
            searchAllPanes: true,
            openInSameWindow: false
          });
        });
      }
      if ((ref6 = this.htmlv[0]) != null) {
        ref6.addEventListener("did-start-loading", (function(_this) {
          return function() {
            var ref7;
            _this.spinner.removeClass('fa-custom');
            return (ref7 = _this.htmlv[0]) != null ? ref7.shadowRoot.firstChild.style.height = '95%' : void 0;
          };
        })(this));
      }
      if ((ref7 = this.htmlv[0]) != null) {
        ref7.addEventListener("did-stop-loading", (function(_this) {
          return function() {
            return _this.spinner.addClass('fa-custom');
          };
        })(this));
      }
      this.back.on('click', (function(_this) {
        return function(evt) {
          var ref8, ref9;
          if (((ref8 = _this.htmlv[0]) != null ? ref8.canGoBack() : void 0) && $( this).hasClass('active')) {
            return (ref9 = _this.htmlv[0]) != null ? ref9.goBack() : void 0;
          }
        };
      })(this));
      this.favList.on('click', (function(_this) {
        return function(evt) {
          var favList;
          favList = require('./fav-view');
          return new favList(window.$.jStorage.get('bp.fav'));
        };
      })(this));
      this.forward.on('click', (function(_this) {
        return function(evt) {
          var ref8, ref9;
          if (((ref8 = _this.htmlv[0]) != null ? ref8.canGoForward() : void 0) && $( this).hasClass('active')) {
            return (ref9 = _this.htmlv[0]) != null ? ref9.goForward() : void 0;
          }
        };
      })(this));
      this.url.on('click', (function(_this) {
        return function(evt) {
          return _this.url.select();
        };
      })(this));
      this.url.on('keypress', (function(_this) {
        return function(evt) {
          var URL, localhostPattern, ref8, url, urls;
          URL = require('url');
          if (evt.which === 13) {
            _this.url.blur();
            urls = URL.parse( this.value);
            url =  this.value;
            if (!url.startsWith('browser-plus://')) {
              if (url.indexOf(' ') >= 0) {
                url = "http://www.google.com/search?as_q=" + url;
              } else {
                localhostPattern = /^(http:\/\/)?localhost/i;
                if (url.search(localhostPattern) < 0 && url.indexOf('.') < 0) {
                  url = "http://www.google.com/search?as_q=" + url;
                } else {
                  if ((ref8 = urls.protocol) === 'http' || ref8 === 'https' || ref8 === 'file:') {
                    if (urls.protocol === 'file:') {
                      url = url.replace(/\\/g, "/");
                    } else {
                      url = URL.format(urls);
                    }
                  } else if (url.indexOf('localhost') !== -1) {
                    url = url.replace(localhostPattern, 'http://127.0.0.1');
                  } else {
                    urls.protocol = 'http';
                    url = URL.format(urls);
                  }
                }
              }
            }
            return _this.goToUrl(url);
          }
        };
      })(this));
      return this.refresh.on('click', (function(_this) {
        return function(evt) {
          return _this.refreshPage();
        };
      })(this));
    };

    BrowserPlusView.prototype.refreshPage = function(url) {
      var pp, ref1, ref2;
      if (this.model.orgURI && (pp = atom.packages.getActivePackage('pp'))) {
        return pp.mainModule.compilePath(this.model.orgURI, this.model._id);
      } else {
        if (url) {
          this.model.url = url;
          this.url.val(url);
        }
        if (this.ultraLiveOn && this.model.src) {
          return (ref1 = this.htmlv[0]) != null ? ref1.src = this.model.src : void 0;
        } else {
          return (ref2 = this.htmlv[0]) != null ? ref2.executeJavaScript("location.href = '" + this.model.url + "'") : void 0;
        }
      }
    };

    BrowserPlusView.prototype.goToUrl = function(url) {
      var BrowserPlusModel, base1, ref1;
      BrowserPlusModel = require('./browser-plus-model');
      if (!BrowserPlusModel.checkUrl(url)) {
        return;
      }
      jQ(this.url).autocomplete("close");
      this.liveOn = false;
      this.live.toggleClass('active', this.liveOn);
      if (!this.liveOn) {
        if ((ref1 = this.liveSubscription) != null) {
          ref1.dispose();
        }
      }
      this.url.val(url);
      this.model.url = url;
      delete this.model.title;
      delete this.model.iconName;
      delete this.model.favIcon;
      this.model.setTitle(null);
      this.model.updateIcon(null);
      if (url.startsWith('browser-plus://')) {
        url = typeof (base1 = this.model.browserPlus).getBrowserPlusUrl === "function" ? base1.getBrowserPlusUrl(url) : void 0;
      }
      return this.htmlv.attr('src', url);
    };

    BrowserPlusView.prototype.showDevTool = function(evt) {
      if (evt[0].keyIdentifier === "F12") {
        return this.toggleDevTool();
      }
    };

    BrowserPlusView.prototype.removeFav = function(favorite) {
      var favr, favrs, i, idx, len;
      favrs = window.$.jStorage.get('bp.fav');
      for (idx = i = 0, len = favrs.length; i < len; idx = ++i) {
        favr = favrs[idx];
        if (favr.url === favorite.url) {
          favrs.splice(idx, 1);
          window.$.jStorage.set('bp.fav', favrs);
          return;
        }
      }
    };

    BrowserPlusView.prototype.setSrc = function(text) {
      var ref1, url;
      url = this.model.orgURI || this.model.url;
      text = BrowserPlusView.checkBase(text, url);
      this.model.src = "data:text/html," + text;
      return (ref1 = this.htmlv[0]) != null ? ref1.src = this.model.src : void 0;
    };

    BrowserPlusView.checkBase = function(text, url) {
      var $html, base, basePath, cheerio;
      cheerio = require('cheerio');
      $html = cheerio.load(text);
      basePath = path.dirname(url) + "/";
      if ($html('base').length) {
        return text;
      } else {
        if ($html('head').length) {
          base = "<base href='" + basePath + "' target='_blank'>";
          $html('head').prepend(base);
        } else {
          base = "<head><base href='" + basePath + "' target='_blank'></head>";
          $html('html').prepend(base);
        }
        return $html.html();
      }
    };

    BrowserPlusView.prototype.checkFav = function() {
      var favr, favrs, i, len, results;
      this.fav.removeClass('active');
      favrs = window.$.jStorage.get('bp.fav');
      results = [];
      for (i = 0, len = favrs.length; i < len; i++) {
        favr = favrs[i];
        if (favr.url === this.model.url) {
          results.push(this.fav.addClass('active'));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    BrowserPlusView.prototype.toggleDevTool = function() {
      var open, ref1, ref2, ref3;
      open = (ref1 = this.htmlv[0]) != null ? ref1.isDevToolsOpened() : void 0;
      if (open) {
        if ((ref2 = this.htmlv[0]) != null) {
          ref2.closeDevTools();
        }
      } else {
        if ((ref3 = this.htmlv[0]) != null) {
          ref3.openDevTools();
        }
      }
      return $(this.devtool).toggleClass('active', !open);
    };

    BrowserPlusView.prototype.checkNav = function() {
      var ref1, ref2, ref3;
      $(this.forward).toggleClass('active', (ref1 = this.htmlv[0]) != null ? ref1.canGoForward() : void 0);
      $(this.back).toggleClass('active', (ref2 = this.htmlv[0]) != null ? ref2.canGoBack() : void 0);
      if ((ref3 = this.htmlv[0]) != null ? ref3.canGoForward() : void 0) {
        if (this.clearForward) {
          $(this.forward).toggleClass('active', false);
          return this.clearForward = false;
        } else {
          return $(this.forward).toggleClass('active', true);
        }
      }
    };

    BrowserPlusView.prototype.goBack = function() {
      return this.back.click();
    };

    BrowserPlusView.prototype.goForward = function() {
      return this.forward.click();
    };

    BrowserPlusView.prototype.addHistory = function() {
      var histToday, history, historyURL, obj, today, todayObj, url, yyyymmdd;
      url = this.htmlv[0].getURL().replace(/\\/g, "/");
      if (!url) {
        return;
      }
      historyURL = ("file:///" + this.model.browserPlus.resources + "history.html").replace(/\\/g, "/");
      if (url.startsWith('browser-plus://') || url.startsWith('data:text/html,') || url.startsWith(historyURL)) {
        return;
      }
      yyyymmdd = function() {
        var date, dd, mm, yyyy;
        date = new Date();
        yyyy = date.getFullYear().toString();
        mm = (date.getMonth() + 1).toString();
        dd = date.getDate().toString();
        return yyyy + (mm[1] ? mm : '0' + mm[0]) + (dd[1] ? dd : '0' + dd[0]);
      };
      today = yyyymmdd();
      history = window.$.jStorage.get('bp.history') || [];
      todayObj = history.find(function(ele, idx, arr) {
        if (ele[today]) {
          return true;
        }
      });
      if (!todayObj) {
        obj = {};
        histToday = [];
        obj[today] = histToday;
        history.unshift(obj);
      } else {
        histToday = todayObj[today];
      }
      histToday.unshift({
        date: new Date().toString(),
        uri: url
      });
      return window.$.jStorage.set('bp.history', history);
    };

    BrowserPlusView.prototype.getTitle = function() {
      return this.model.getTitle();
    };

    BrowserPlusView.prototype.serialize = function() {};

    BrowserPlusView.prototype.destroy = function() {
      jQ(this.url).autocomplete('destroy');
      return this.subscriptions.dispose();
    };

    BrowserPlusView.getJQuery = function() {
      return fs.readFileSync(this.model.browserPlus.resources + "/jquery-2.1.4.min.js", 'utf-8');
    };

    BrowserPlusView.getJStorage = function() {
      return fs.readFileSync(this.model.browserPlus.resources + "/jstorage.min.js", 'utf-8');
    };

    BrowserPlusView.getNotifyBar = function() {
      return fs.readFileSync(this.model.browserPlus.resources + "/jquery.notifyBar.js", 'utf-8');
    };

    BrowserPlusView.getHotKeys = function() {
      return fs.readFileSync(this.model.browserPlus.resources + "/jquery.hotkeys.min.js", 'utf-8');
    };

    BrowserPlusView.loadCSS = function(filename, fullpath) {
      var fpath;
      if (fullpath == null) {
        fullpath = false;
      }
      if (!fullpath) {
        fpath = "file:///" + (this.model.browserPlus.resources.replace(/\\/g, '/'));
        filename = "" + fpath + filename;
      }
      return "jQuery('head').append(jQuery('<link type=\"text/css\" rel=\"stylesheet\" href=\"" + filename + "\">'))";
    };

    BrowserPlusView.loadJS = function(filename, fullpath) {
      var fpath;
      if (fullpath == null) {
        fullpath = false;
      }
      if (!fullpath) {
        fpath = "file:///" + (this.model.browserPlus.resources.replace(/\\/g, '/'));
        filename = "" + fpath + filename;
      }
      return "jQuery('head').append(jQuery('<script type=\"text/javascript\" src=\"" + filename + "\">'))";
    };

    return BrowserPlusView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG9sb2tvYmFuL0NvZGUvZ2l0aHViL2F0b20tY29uZmlnL3BhY2thZ2VzL2Jyb3dzZXItcGx1cy9saWIvYnJvd3Nlci1wbHVzLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnRUFBQTtJQUFBOzs7RUFBQyxzQkFBd0IsT0FBQSxDQUFRLE1BQVI7O0VBQ3pCLE1BQVcsT0FBQSxDQUFRLHNCQUFSLENBQVgsRUFBQyxlQUFELEVBQU07O0VBRU4sQ0FBQSxHQUFJLEVBQUEsR0FBSyxPQUFBLENBQVEsUUFBUjs7RUFDVCxPQUFBLENBQVEsd0JBQVI7O0VBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE9BQUEsQ0FBUSxPQUFSOztFQUNBLE9BQUEsQ0FBUSxVQUFSOztFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFTCxNQUFNLENBQUMsTUFBUCxHQUFlLFNBQUMsQ0FBRDtXQUNiLENBQUMsQ0FBQyxPQUFGLENBQVUsd0JBQVYsRUFBb0MsTUFBcEM7RUFEYTs7RUFHZixNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFDUyx5QkFBQyxLQUFEO01BQUMsSUFBQyxDQUFBLFFBQUQ7TUFDWixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxHQUFjO01BQ2QsSUFBQyxDQUFBLEtBQUssQ0FBQyxZQUFQLENBQW9CLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNsQixLQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtpQkFDQSxFQUFBLENBQUcsS0FBQyxDQUFBLEdBQUosQ0FBUSxDQUFDLFlBQVQsQ0FBc0IsU0FBdEI7UUFGa0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCO01BR0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxvQkFBbkIsQ0FBd0MsU0FBQyxZQUFEO1FBQ3RDLElB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QUFVLFFBQVY7QUFDUCxVQUFBOztRQURpQixXQUFTOztNQUMxQixJQUFBLENBQU8sUUFBUDtRQUNFLEtBQUEsR0FBUSxVQUFBLEdBQVUsQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBN0IsQ0FBcUMsS0FBckMsRUFBMkMsR0FBM0MsQ0FBRDtRQUNsQixRQUFBLEdBQVcsRUFBQSxHQUFHLEtBQUgsR0FBVyxTQUZ4Qjs7YUFJQSx1RUFBQSxHQUNvRSxRQURwRSxHQUM2RTtJQU50RTs7OztLQXhlbUI7QUFkOUIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gID0gcmVxdWlyZSAnYXRvbSdcbntWaWV3LCR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG4jICQgPSBqUSA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9qcXVlcnkvZGlzdC9qcXVlcnkuanMnXG4kID0galEgPSByZXF1aXJlICdqcXVlcnknXG5yZXF1aXJlICdqcXVlcnktdWkvYXV0b2NvbXBsZXRlJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5yZXF1aXJlICdKU09OMidcbnJlcXVpcmUgJ2pzdG9yYWdlJ1xuZnMgPSByZXF1aXJlICdmcydcblxuUmVnRXhwLmVzY2FwZT0gKHMpLT5cbiAgcy5yZXBsYWNlIC9bLVxcL1xcXFxeJCorPy4oKXxbXFxde31dL2csICdcXFxcJCYnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEJyb3dzZXJQbHVzVmlldyBleHRlbmRzIFZpZXdcbiAgY29uc3RydWN0b3I6IChAbW9kZWwpLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQG1vZGVsLnZpZXcgPSBAXG4gICAgQG1vZGVsLm9uRGlkRGVzdHJveSA9PlxuICAgICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICBqUShAdXJsKS5hdXRvY29tcGxldGUoJ2Rlc3Ryb3knKVxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5vbkRpZEFkZE5vdGlmaWNhdGlvbiAobm90aWZpY2F0aW9uKSAtPlxuICAgICAgaWYgbm90aWZpY2F0aW9uLnR5cGUgPT0gJ2luZm8nXG4gICAgICAgIHNldFRpbWVvdXQgKCkgLT5cbiAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICAgICwgMTAwMFxuICAgIHN1cGVyXG5cbiAgQGNvbnRlbnQ6IChwYXJhbXMpLT5cbiAgICB1cmwgID0gcGFyYW1zLnVybFxuICAgIGhpZGVVUkxCYXIgPSAnJ1xuICAgIGlmIHBhcmFtcy5vcHQ/LmhpZGVVUkxCYXJcbiAgICAgIGhpZGVVUkxCYXIgPSAnaGlkZVVSTEJhcidcbiAgICBpZiBwYXJhbXMub3B0Py5zcmNcbiAgICAgIHBhcmFtcy5zcmMgPSBCcm93c2VyUGx1c1ZpZXcuY2hlY2tCYXNlKHBhcmFtcy5vcHQuc3JjLHBhcmFtcy51cmwpXG4gICAgICAjIHBhcmFtcy5zcmMgPSBwYXJhbXMuc3JjLnJlcGxhY2UoL1wiL2csJyZxdW90OycpXG4gICAgICBwYXJhbXMuc3JjID0gcGFyYW1zLnNyYy5yZXBsYWNlKC9cIi9nLFwiJ1wiKVxuICAgICAgdW5sZXNzIHBhcmFtcy5zcmM/LnN0YXJ0c1dpdGggXCJkYXRhOnRleHQvaHRtbCxcIlxuICAgICAgICBwYXJhbXMuc3JjID0gXCJkYXRhOnRleHQvaHRtbCwje3BhcmFtcy5zcmN9XCJcbiAgICAgIHVybCA9IHBhcmFtcy5zcmMgdW5sZXNzIHVybFxuICAgIGlmIHBhcmFtcy51cmw/LnN0YXJ0c1dpdGggXCJicm93c2VyLXBsdXM6Ly9cIlxuICAgICAgdXJsID0gcGFyYW1zLmJyb3dzZXJQbHVzPy5nZXRCcm93c2VyUGx1c1VybD8odXJsKVxuXG4gICAgQGRpdiBjbGFzczonYnJvd3Nlci1wbHVzJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6XCJ1cmwgbmF0aXZlLWtleS1iaW5kaW5ncyAje2hpZGVVUkxCYXJ9XCIsb3V0bGV0Oid1cmxiYXInLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnbmF2LWJ0bnMtbGVmdCcsID0+XG4gICAgICAgICAgQHNwYW4gaWQ6J2JhY2snLGNsYXNzOidtZWdhLW9jdGljb24gb2N0aWNvbi1hcnJvdy1sZWZ0JyxvdXRsZXQ6ICdiYWNrJ1xuICAgICAgICAgIEBzcGFuIGlkOidmb3J3YXJkJyxjbGFzczonbWVnYS1vY3RpY29uIG9jdGljb24tYXJyb3ctcmlnaHQnLG91dGxldDogJ2ZvcndhcmQnXG4gICAgICAgICAgQHNwYW4gaWQ6J3JlZnJlc2gnLGNsYXNzOidtZWdhLW9jdGljb24gb2N0aWNvbi1zeW5jJyxvdXRsZXQ6ICdyZWZyZXNoJ1xuICAgICAgICAgIEBzcGFuIGlkOidoaXN0b3J5JyxjbGFzczonbWVnYS1vY3RpY29uIG9jdGljb24tYm9vaycsb3V0bGV0OiAnaGlzdG9yeSdcbiAgICAgICAgICBAc3BhbiBpZDonZmF2JyxjbGFzczonbWVnYS1vY3RpY29uIG9jdGljb24tc3Rhcicsb3V0bGV0OiAnZmF2J1xuICAgICAgICAgIEBzcGFuIGlkOidmYXZMaXN0JywgY2xhc3M6J29jdGljb24gb2N0aWNvbi1hcnJvdy1kb3duJyxvdXRsZXQ6ICdmYXZMaXN0J1xuICAgICAgICAgIEBhIGNsYXNzOlwiZmEgZmEtc3Bpbm5lclwiLCBvdXRsZXQ6ICdzcGlubmVyJ1xuXG4gICAgICAgIEBkaXYgY2xhc3M6J25hdi1idG5zJywgPT5cbiAgICAgICAgICBAZGl2IGNsYXNzOiAnbmF2LWJ0bnMtcmlnaHQnLCA9PlxuICAgICAgICAgICAgIyBAc3BhbiBpZDoncGRmJyxjbGFzczonbWVnYS1vY3RpY29uIG9jdGljb24tZmlsZS1wZGYnLG91dGxldDogJ3BkZidcbiAgICAgICAgICAgIEBzcGFuIGlkOidwcmludCcsY2xhc3M6J2ljb24tYnJvd3Nlci1wbHVzcyBpY29uLXByaW50JyxvdXRsZXQ6ICdwcmludCdcbiAgICAgICAgICAgIEBzcGFuIGlkOidsaXZlJyxjbGFzczonbWVnYS1vY3RpY29uIG9jdGljb24temFwJyxvdXRsZXQ6J2xpdmUnXG4gICAgICAgICAgICBAc3BhbiBpZDonZGV2dG9vbCcsY2xhc3M6J21lZ2Etb2N0aWNvbiBvY3RpY29uLXRvb2xzJyxvdXRsZXQ6J2RldnRvb2wnXG5cbiAgICAgICAgICBAZGl2IGNsYXNzOidpbnB1dC11cmwnLCA9PlxuICAgICAgICAgICAgQGlucHV0IGNsYXNzOlwibmF0aXZlLWtleS1iaW5kaW5nc1wiLCB0eXBlOid0ZXh0JyxpZDondXJsJyxvdXRsZXQ6J3VybCcsdmFsdWU6XCIje3BhcmFtcy51cmx9XCIgIyN7QHVybH1cIlxuICAgICAgICBAaW5wdXQgaWQ6J2ZpbmQnLGNsYXNzOidmaW5kIGZpbmQtaGlkZScsb3V0bGV0OidmaW5kJ1xuICAgICAgQHRhZyAnd2VidmlldycsY2xhc3M6XCJuYXRpdmUta2V5LWJpbmRpbmdzXCIsb3V0bGV0OiAnaHRtbHYnICxwcmVsb2FkOlwiZmlsZTovLy8je3BhcmFtcy5icm93c2VyUGx1cy5yZXNvdXJjZXN9L2JwLWNsaWVudC5qc1wiLFxuICAgICAgcGx1Z2luczonb24nLHNyYzpcIiN7dXJsfVwiLCBkaXNhYmxld2Vic2VjdXJpdHk6J29uJywgYWxsb3dmaWxlYWNjZXNzZnJvbWZpbGVzOidvbicsIGFsbG93UG9pbnRlckxvY2s6J29uJ1xuXG4gIHRvZ2dsZVVSTEJhcjogLT5cbiAgICBAdXJsYmFyLnRvZ2dsZSgpXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICAgIHNyYyA9IChyZXEscmVzKT0+XG4gICAgICAgIF8gPSByZXF1aXJlICdsb2Rhc2gnXG4gICAgICAgICMgY2hlY2sgZmF2b3JpdGVzXG4gICAgICAgIHBhdHRlcm4gPSAvLy9cbiAgICAgICAgICAgICAgICAgICAgI3tSZWdFeHAuZXNjYXBlIHJlcS50ZXJtfVxuICAgICAgICAgICAgICAgICAgLy8vaVxuXG4gICAgICAgIGZhdiA9IF8uZmlsdGVyIHdpbmRvdy4kLmpTdG9yYWdlLmdldCgnYnAuZmF2JyksKGZhdiktPlxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYXYudXJsLm1hdGNoKHBhdHRlcm4pIG9yIGZhdi50aXRsZS5tYXRjaChwYXR0ZXJuKVxuICAgICAgICB1cmxzID0gXy5wbHVjayhmYXYsXCJ1cmxcIilcblxuICAgICAgICByZXModXJscylcbiAgICAgICAgc2VhcmNoVXJsID0gJ2h0dHA6Ly9hcGkuYmluZy5jb20vb3Nqc29uLmFzcHgnXG4gICAgICAgIGRvIC0+XG4gICAgICAgICAgalEuYWpheFxuICAgICAgICAgICAgICB1cmw6IHNlYXJjaFVybFxuICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICAgIGRhdGE6IHtxdWVyeTpyZXEudGVybSwgJ3dlYi5jb3VudCc6IDEwfVxuICAgICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSk9PlxuICAgICAgICAgICAgICAgIHVybHMgPSB1cmxzWzAuLjEwXVxuICAgICAgICAgICAgICAgIHNlYXJjaCA9IFwiaHR0cDovL3d3dy5nb29nbGUuY29tL3NlYXJjaD9hc19xPVwiXG4gICAgICAgICAgICAgICAgZm9yIGRhdCBpbiBkYXRhWzFdWzAuLjEwXVxuICAgICAgICAgICAgICAgICAgdXJscy5wdXNoXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogZGF0XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc2VhcmNoK2RhdFxuICAgICAgICAgICAgICAgIHJlcyh1cmxzKVxuXG4gICAgICBzZWxlY3QgPSAoZXZlbnQsdWkpPT5cbiAgICAgICAgQGdvVG9VcmwodWkuaXRlbS52YWx1ZSlcblxuICAgICAgalEoQHVybCkuYXV0b2NvbXBsZXRlPyhcbiAgICAgICAgICBzb3VyY2U6IHNyY1xuICAgICAgICAgIG1pbkxlbmd0aDogMlxuICAgICAgICAgIHNlbGVjdDogc2VsZWN0KVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBiYWNrLCB0aXRsZTogJ0JhY2snXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGZvcndhcmQsIHRpdGxlOiAnRm9yd2FyZCdcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAcmVmcmVzaCwgdGl0bGU6ICdSZWZyZXNoJ1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBwcmludCwgdGl0bGU6ICdQcmludCdcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAaGlzdG9yeSwgdGl0bGU6ICdIaXN0b3J5J1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBmYXZMaXN0LCB0aXRsZTogJ1ZpZXcgRmF2b3JpdGVzJ1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBmYXYsIHRpdGxlOiAnRmF2b3JpdGl6ZSdcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAbGl2ZSwgdGl0bGU6ICdMaXZlJ1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBkZXZ0b29sLCB0aXRsZTogJ0RldiBUb29scy1mMTInXG5cbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnLmJyb3dzZXItcGx1cyB3ZWJ2aWV3JywgJ2Jyb3dzZXItcGx1cy12aWV3OmdvQmFjayc6ID0+IEBnb0JhY2soKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICcuYnJvd3Nlci1wbHVzIHdlYnZpZXcnLCAnYnJvd3Nlci1wbHVzLXZpZXc6Z29Gb3J3YXJkJzogPT4gQGdvRm9yd2FyZCgpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy5icm93c2VyLXBsdXMnLCAnYnJvd3Nlci1wbHVzLXZpZXc6dG9nZ2xlVVJMQmFyJzogPT4gQHRvZ2dsZVVSTEJhcigpXG5cbiAgICAgIEBsaXZlT24gPSBmYWxzZVxuICAgICAgQGVsZW1lbnQub25rZXlkb3duID0gPT5Ac2hvd0RldlRvb2woYXJndW1lbnRzKVxuICAgICAgQGNoZWNrRmF2KCkgaWYgQG1vZGVsLnVybC5pbmRleE9mKCdmaWxlOi8vLycpID49IDBcbiAgICAgICMgQXJyYXkub2JzZXJ2ZSBAbW9kZWwuYnJvd3NlclBsdXMuZmF2LCAoZWxlKT0+XG4gICAgICAjICAgQGNoZWNrRmF2KClcblxuICAgICAgQGh0bWx2WzBdPy5hZGRFdmVudExpc3RlbmVyIFwicGVybWlzc2lvbnJlcXVlc3RcIiwgKGUpLT5cbiAgICAgICAgZS5yZXF1ZXN0LmFsbG93KClcblxuICAgICAgQGh0bWx2WzBdPy5hZGRFdmVudExpc3RlbmVyIFwiY29uc29sZS1tZXNzYWdlXCIsIChlKT0+XG4gICAgICAgIGlmIGUubWVzc2FnZS5pbmNsdWRlcygnfmJyb3dzZXItcGx1cy1ocmVmficpXG4gICAgICAgICAgZGF0YSA9IGUubWVzc2FnZS5yZXBsYWNlKCd+YnJvd3Nlci1wbHVzLWhyZWZ+JywnJylcbiAgICAgICAgICBpbmR4ID0gZGF0YS5pbmRleE9mKCcgJylcbiAgICAgICAgICB1cmwgPSBkYXRhLnN1YnN0cigwLGluZHgpXG4gICAgICAgICAgdGl0bGUgPSBkYXRhLnN1YnN0cihpbmR4ICsgMSlcbiAgICAgICAgICBCcm93c2VyUGx1c01vZGVsID0gcmVxdWlyZSAnLi9icm93c2VyLXBsdXMtbW9kZWwnXG4gICAgICAgICAgdW5sZXNzIEJyb3dzZXJQbHVzTW9kZWwuY2hlY2tVcmwodXJsKVxuICAgICAgICAgICAgdXJsID0gYXRvbS5jb25maWcuZ2V0KCdicm93c2VyLXBsdXMuaG9tZXBhZ2UnKSBvciBcImh0dHA6Ly93d3cuZ29vZ2xlLmNvbVwiXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhcIlJlZGlyZWN0aW5nIHRvICN7dXJsfVwiKVxuICAgICAgICAgICAgQGh0bWx2WzBdPy5leGVjdXRlSmF2YVNjcmlwdCBcImxvY2F0aW9uLmhyZWYgPSAnI3t1cmx9J1wiXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBpZiB1cmwgYW5kIHVybCBpc250IEBtb2RlbC51cmwgYW5kIG5vdCBAdXJsLnZhbCgpPy5zdGFydHNXaXRoICdicm93c2VyLXBsdXM6Ly8nXG4gICAgICAgICAgICBAdXJsLnZhbCB1cmxcbiAgICAgICAgICAgIEBtb2RlbC51cmwgPSB1cmxcbiAgICAgICAgICBpZiB0aXRsZVxuICAgICAgICAgICAgIyBAbW9kZWwuYnJvd3NlclBsdXMudGl0bGVbQG1vZGVsLnVybF0gPSB0aXRsZVxuICAgICAgICAgICAgQG1vZGVsLnNldFRpdGxlKHRpdGxlKSBpZiB0aXRsZSBpc250IEBtb2RlbC5nZXRUaXRsZSgpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBAbW9kZWwuYnJvd3NlclBsdXMudGl0bGVbQG1vZGVsLnVybF0gPSB1cmxcbiAgICAgICAgICAgIEBtb2RlbC5zZXRUaXRsZSh1cmwpXG5cbiAgICAgICAgICBAbGl2ZS50b2dnbGVDbGFzcyAnYWN0aXZlJyxAbGl2ZU9uXG4gICAgICAgICAgQGxpdmVTdWJzY3JpcHRpb24/LmRpc3Bvc2UoKSB1bmxlc3MgQGxpdmVPblxuICAgICAgICAgIEBjaGVja05hdigpXG4gICAgICAgICAgQGNoZWNrRmF2KClcbiAgICAgICAgICBAYWRkSGlzdG9yeSgpXG5cbiAgICAgICAgaWYgZS5tZXNzYWdlLmluY2x1ZGVzKCd+YnJvd3Nlci1wbHVzLWpxdWVyeX4nKSBvciBlLm1lc3NhZ2UuaW5jbHVkZXMoJ35icm93c2VyLXBsdXMtbWVudX4nKVxuICAgICAgICAgIGlmIGUubWVzc2FnZS5pbmNsdWRlcygnfmJyb3dzZXItcGx1cy1qcXVlcnl+JylcbiAgICAgICAgICAgIEBtb2RlbC5icm93c2VyUGx1cy5qUXVlcnlKUyA/PSBCcm93c2VyUGx1c1ZpZXcuZ2V0SlF1ZXJ5LmNhbGwgQFxuICAgICAgICAgICAgQGh0bWx2WzBdPy5leGVjdXRlSmF2YVNjcmlwdCBAbW9kZWwuYnJvd3NlclBsdXMualF1ZXJ5SlNcblxuICAgICAgICAgIEBtb2RlbC5icm93c2VyUGx1cy5qU3RvcmFnZUpTID89IEJyb3dzZXJQbHVzVmlldy5nZXRKU3RvcmFnZS5jYWxsIEBcbiAgICAgICAgICBAaHRtbHZbMF0/LmV4ZWN1dGVKYXZhU2NyaXB0IEBtb2RlbC5icm93c2VyUGx1cy5qU3RvcmFnZUpTXG5cbiAgICAgICAgICBAbW9kZWwuYnJvd3NlclBsdXMuaG90S2V5cyA/PSBCcm93c2VyUGx1c1ZpZXcuZ2V0SG90S2V5cy5jYWxsIEBcbiAgICAgICAgICBAaHRtbHZbMF0/LmV4ZWN1dGVKYXZhU2NyaXB0IEBtb2RlbC5icm93c2VyUGx1cy5ob3RLZXlzXG5cbiAgICAgICAgICBAbW9kZWwuYnJvd3NlclBsdXMubm90aWZ5QmFyID89IEJyb3dzZXJQbHVzVmlldy5nZXROb3RpZnlCYXIuY2FsbCBAXG4gICAgICAgICAgQGh0bWx2WzBdPy5leGVjdXRlSmF2YVNjcmlwdCBAbW9kZWwuYnJvd3NlclBsdXMubm90aWZ5QmFyXG5cbiAgICAgICAgICBpZiBpbml0cyA9IEBtb2RlbC5icm93c2VyUGx1cy5wbHVnaW5zPy5vbkluaXRcbiAgICAgICAgICAgIGZvciBpbml0IGluIGluaXRzXG4gICAgICAgICAgICAgICMgaW5pdCA9IFwiKCN7aW5pdC50b1N0cmluZygpfSkoKVwiXG4gICAgICAgICAgICAgIEBodG1sdlswXT8uZXhlY3V0ZUphdmFTY3JpcHQgaW5pdFxuICAgICAgICAgIGlmIGpzcyA9IEBtb2RlbC5icm93c2VyUGx1cy5wbHVnaW5zPy5qc3NcbiAgICAgICAgICAgIGZvciBqcyBpbiBqc3NcbiAgICAgICAgICAgICAgQGh0bWx2WzBdPy5leGVjdXRlSmF2YVNjcmlwdCBCcm93c2VyUGx1c1ZpZXcubG9hZEpTLmNhbGwoQCxqcyx0cnVlKVxuXG4gICAgICAgICAgaWYgY3NzcyA9IEBtb2RlbC5icm93c2VyUGx1cy5wbHVnaW5zPy5jc3NzXG4gICAgICAgICAgICBmb3IgY3NzIGluIGNzc3NcbiAgICAgICAgICAgICAgQGh0bWx2WzBdPy5leGVjdXRlSmF2YVNjcmlwdCBCcm93c2VyUGx1c1ZpZXcubG9hZENTUy5jYWxsKEAsY3NzLHRydWUpXG5cbiAgICAgICAgICBpZiBtZW51cyA9IEBtb2RlbC5icm93c2VyUGx1cy5wbHVnaW5zPy5tZW51c1xuICAgICAgICAgICAgZm9yIG1lbnUgaW4gbWVudXNcbiAgICAgICAgICAgICAgbWVudS5mbiA9IG1lbnUuZm4udG9TdHJpbmcoKSBpZiBtZW51LmZuXG4gICAgICAgICAgICAgIG1lbnUuc2VsZWN0b3JGaWx0ZXIgPSBtZW51LnNlbGVjdG9yRmlsdGVyLnRvU3RyaW5nKCkgaWYgbWVudS5zZWxlY3RvckZpbHRlclxuICAgICAgICAgICAgICBAaHRtbHZbMF0/LmV4ZWN1dGVKYXZhU2NyaXB0IFwiYnJvd3NlclBsdXMubWVudSgje0pTT04uc3RyaW5naWZ5KG1lbnUpfSlcIlxuICAgICAgICAgICMgQG1vZGVsLmJyb3dzZXJQbHVzLmJwU3R5bGUgPz0gQnJvd3NlclBsdXNWaWV3LmdldGJwU3R5bGUuY2FsbCBAXG4gICAgICAgICAgIyBAaHRtbHZbMF0/LmV4ZWN1dGVKYXZhU2NyaXB0IFwiXCJcIlxuICAgICAgICAgICMgICAgICAgICAgICAgICBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgICAjICAgICAgICAgICAgICAgbm9kZS50eXBlPSd0ZXh0L2Nzcyc7XG4gICAgICAgICAgIyAgICAgICAgICAgICAgIG5vZGUuaW5uZXJIVE1MPScje0Btb2RlbC5icm93c2VyUGx1cy5icFN0eWxlfSc7XG4gICAgICAgICAgIyAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgICAgIyAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIEBodG1sdlswXT8uZXhlY3V0ZUphdmFTY3JpcHQgQnJvd3NlclBsdXNWaWV3LmxvYWRDU1MuY2FsbCBALCdicC1zdHlsZS5jc3MnXG4gICAgICAgICAgQGh0bWx2WzBdPy5leGVjdXRlSmF2YVNjcmlwdCBCcm93c2VyUGx1c1ZpZXcubG9hZENTUy5jYWxsIEAsJ2pxdWVyeS5ub3RpZnlCYXIuY3NzJ1xuXG4gICAgICBAaHRtbHZbMF0/LmFkZEV2ZW50TGlzdGVuZXIgXCJwYWdlLWZhdmljb24tdXBkYXRlZFwiLCAoZSk9PlxuICAgICAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgICAgICBmYXZyID0gd2luZG93LiQualN0b3JhZ2UuZ2V0KCdicC5mYXYnKVxuICAgICAgICBpZiBmYXYgPSBfLmZpbmQoIGZhdnIseyd1cmwnOkBtb2RlbC51cmx9IClcbiAgICAgICAgICBmYXYuZmF2SWNvbiA9IGUuZmF2aWNvbnNbMF1cbiAgICAgICAgICB3aW5kb3cuJC5qU3RvcmFnZS5zZXQoJ2JwLmZhdicsZmF2cilcblxuICAgICAgICBAbW9kZWwuaWNvbk5hbWUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTAwMDApLnRvU3RyaW5nKClcbiAgICAgICAgQG1vZGVsLmZhdkljb24gPSBlLmZhdmljb25zWzBdXG4gICAgICAgIEBtb2RlbC51cGRhdGVJY29uIGUuZmF2aWNvbnNbMF1cbiAgICAgICAgZmF2SWNvbiA9IHdpbmRvdy4kLmpTdG9yYWdlLmdldCgnYnAuZmF2SWNvbicpXG4gICAgICAgIHVyaSA9IEBodG1sdlswXS5nZXRVUkwoKVxuICAgICAgICByZXR1cm4gdW5sZXNzIHVyaVxuICAgICAgICBmYXZJY29uW3VyaV0gPSBlLmZhdmljb25zWzBdXG4gICAgICAgIHdpbmRvdy4kLmpTdG9yYWdlLnNldCgnYnAuZmF2SWNvbicsZmF2SWNvbilcbiAgICAgICAgQG1vZGVsLnVwZGF0ZUljb24oKVxuICAgICAgICBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgICAgICAgc3R5bGUudHlwZSA9ICd0ZXh0L2NzcydcbiAgICAgICAgc3R5bGUuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAgICAgICAudGl0bGUuaWNvbi5pY29uLSN7QG1vZGVsLmljb25OYW1lfSB7XG4gICAgICAgICAgICAgIGJhY2tncm91bmQtc2l6ZTogMTZweCAxNnB4O1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xuICAgICAgICAgICAgICBwYWRkaW5nLWxlZnQ6IDIwcHg7XG4gICAgICAgICAgICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybCgnI3tlLmZhdmljb25zWzBdfScpO1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uLXk6IDUwJTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzdHlsZSlcblxuICAgICAgQGh0bWx2WzBdPy5hZGRFdmVudExpc3RlbmVyIFwicGFnZS10aXRsZS1zZXRcIiwgKGUpPT5cbiAgICAgICAgIyBAbW9kZWwuYnJvd3NlclBsdXMudGl0bGVbQG1vZGVsLnVybF0gPSBlLnRpdGxlXG4gICAgICAgIF8gPSByZXF1aXJlICdsb2Rhc2gnXG4gICAgICAgIGZhdnIgPSB3aW5kb3cuJC5qU3RvcmFnZS5nZXQoJ2JwLmZhdicpXG4gICAgICAgIHRpdGxlID0gd2luZG93LiQualN0b3JhZ2UuZ2V0KCdicC50aXRsZScpXG4gICAgICAgIHVyaSA9IEBodG1sdlswXS5nZXRVUkwoKVxuICAgICAgICByZXR1cm4gdW5sZXNzIHVyaVxuICAgICAgICB0aXRsZVt1cmldID0gZS50aXRsZVxuICAgICAgICB3aW5kb3cuJC5qU3RvcmFnZS5zZXQoJ2JwLnRpdGxlJyx0aXRsZSlcbiAgICAgICAgaWYgZmF2ICA9IF8uZmluZCggZmF2cix7J3VybCc6QG1vZGVsLnVybH0gKVxuICAgICAgICAgIGZhdi50aXRsZSA9IGUudGl0bGVcbiAgICAgICAgICB3aW5kb3cuJC5qU3RvcmFnZS5zZXQoJ2JwLmZhdicsZmF2cilcbiAgICAgICAgQG1vZGVsLnNldFRpdGxlKGUudGl0bGUpXG5cbiAgICAgIEBkZXZ0b29sLm9uICdjbGljaycsIChldnQpPT5cbiAgICAgICAgQHRvZ2dsZURldlRvb2woKVxuXG4gICAgICBAcHJpbnQub24gJ2NsaWNrJywgKGV2dCk9PlxuICAgICAgICBAaHRtbHZbMF0/LnByaW50KClcblxuICAgICAgQGhpc3Rvcnkub24gJ2NsaWNrJywgKGV2dCk9PlxuICAgICAgICAjIGF0b20ud29ya3NwYWNlLm9wZW4gXCJmaWxlOi8vLyN7QG1vZGVsLmJyb3dzZXJQbHVzLnJlc291cmNlc31oaXN0b3J5Lmh0bWxcIiAsIHtzcGxpdDogJ2xlZnQnLHNlYXJjaEFsbFBhbmVzOnRydWV9XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gXCJicm93c2VyLXBsdXM6Ly9oaXN0b3J5XCIgLCB7c3BsaXQ6ICdsZWZ0JyxzZWFyY2hBbGxQYW5lczp0cnVlfVxuXG4gICAgICAjIEBwZGYub24gJ2NsaWNrJywgKGV2dCk9PlxuICAgICAgIyAgIEBodG1sdlswXT8ucHJpbnRUb1BERiB7fSwgKGRhdGEsZXJyKS0+XG5cbiAgICAgIEBsaXZlLm9uICdjbGljaycsIChldnQpPT5cbiAgICAgICAgIyByZXR1cm4gaWYgQG1vZGVsLnNyY1xuICAgICAgICBAbGl2ZU9uID0gIUBsaXZlT25cbiAgICAgICAgQGxpdmUudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScsQGxpdmVPbilcbiAgICAgICAgaWYgQGxpdmVPblxuICAgICAgICAgIEByZWZyZXNoUGFnZSgpXG4gICAgICAgICAgQGxpdmVTdWJzY3JpcHRpb24gPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgICAgICAgIEBsaXZlU3Vic2NyaXB0aW9uLmFkZCBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcik9PlxuICAgICAgICAgICAgICAgICAgQGxpdmVTdWJzY3JpcHRpb24uYWRkIGVkaXRvci5vbkRpZFNhdmUgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBhdG9tLmNvbmZpZy5nZXQoJ2Jyb3dzZXItcGx1cy5saXZlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgQHJlZnJlc2hQYWdlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICwgdGltZW91dFxuICAgICAgICAgIEBtb2RlbC5vbkRpZERlc3Ryb3kgPT5cbiAgICAgICAgICAgIEBsaXZlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGxpdmVTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG5cblxuICAgICAgQGZhdi5vbiAnY2xpY2snLChldnQpPT5cbiAgICAgICAgIyByZXR1cm4gaWYgQG1vZGVsLnNyY1xuICAgICAgICAjIHJldHVybiBpZiBAaHRtbHZbMF0/LmdldFVybCgpLnN0YXJ0c1dpdGgoJ2RhdGE6dGV4dC9odG1sLCcpXG4gICAgICAgICMgcmV0dXJuIGlmIEBtb2RlbC51cmwuc3RhcnRzV2l0aCAnYnJvd3Nlci1wbHVzOidcbiAgICAgICAgZmF2cyA9IHdpbmRvdy4kLmpTdG9yYWdlLmdldCgnYnAuZmF2JylcbiAgICAgICAgaWYgQGZhdi5oYXNDbGFzcygnYWN0aXZlJylcbiAgICAgICAgICBAcmVtb3ZlRmF2KEBtb2RlbClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBpZiBAbW9kZWwub3JnVVJJXG4gICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgIHVybDogQG1vZGVsLnVybFxuICAgICAgICAgICAgdGl0bGU6IEBtb2RlbC50aXRsZSBvciBAbW9kZWwudXJsXG4gICAgICAgICAgICBmYXZJY29uOiBAbW9kZWwuZmF2SWNvblxuICAgICAgICAgIH1cbiAgICAgICAgICBmYXZzLnB1c2ggZGF0YVxuICAgICAgICAgIGRlbENvdW50ID0gZmF2cy5sZW5ndGggLSBhdG9tLmNvbmZpZy5nZXQgJ2Jyb3dzZXItcGx1cy5mYXYnXG4gICAgICAgICAgZmF2cy5zcGxpY2UgMCwgZGVsQ291bnQgaWYgZGVsQ291bnQgPiAwXG4gICAgICAgICAgd2luZG93LiQualN0b3JhZ2Uuc2V0KCdicC5mYXYnLGZhdnMpXG4gICAgICAgIEBmYXYudG9nZ2xlQ2xhc3MgJ2FjdGl2ZSdcblxuICAgICAgQGh0bWx2WzBdPy5hZGRFdmVudExpc3RlbmVyICduZXctd2luZG93JywgKGUpLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbiBlLnVybCwge3NwbGl0OiAnbGVmdCcsc2VhcmNoQWxsUGFuZXM6dHJ1ZSxvcGVuSW5TYW1lV2luZG93OmZhbHNlfVxuXG4gICAgICBAaHRtbHZbMF0/LmFkZEV2ZW50TGlzdGVuZXIgXCJkaWQtc3RhcnQtbG9hZGluZ1wiLCA9PlxuICAgICAgICBAc3Bpbm5lci5yZW1vdmVDbGFzcyAnZmEtY3VzdG9tJ1xuICAgICAgICBAaHRtbHZbMF0/LnNoYWRvd1Jvb3QuZmlyc3RDaGlsZC5zdHlsZS5oZWlnaHQgPSAnOTUlJ1xuXG4gICAgICBAaHRtbHZbMF0/LmFkZEV2ZW50TGlzdGVuZXIgXCJkaWQtc3RvcC1sb2FkaW5nXCIsID0+XG4gICAgICAgIEBzcGlubmVyLmFkZENsYXNzICdmYS1jdXN0b20nXG5cbiAgICAgIEBiYWNrLm9uICdjbGljaycsIChldnQpPT5cbiAgICAgICAgaWYgQGh0bWx2WzBdPy5jYW5Hb0JhY2soKSBhbmQgJChgIHRoaXNgKS5oYXNDbGFzcygnYWN0aXZlJylcbiAgICAgICAgICBAaHRtbHZbMF0/LmdvQmFjaygpXG5cbiAgICAgIEBmYXZMaXN0Lm9uICdjbGljaycsIChldnQpPT5cbiAgICAgICAgZmF2TGlzdCA9IHJlcXVpcmUgJy4vZmF2LXZpZXcnXG4gICAgICAgIG5ldyBmYXZMaXN0IHdpbmRvdy4kLmpTdG9yYWdlLmdldCgnYnAuZmF2JylcblxuICAgICAgQGZvcndhcmQub24gJ2NsaWNrJywgKGV2dCk9PlxuICAgICAgICBpZiBAaHRtbHZbMF0/LmNhbkdvRm9yd2FyZCgpIGFuZCAkKGAgdGhpc2ApLmhhc0NsYXNzKCdhY3RpdmUnKVxuICAgICAgICAgIEBodG1sdlswXT8uZ29Gb3J3YXJkKClcblxuICAgICAgQHVybC5vbiAnY2xpY2snLChldnQpPT5cbiAgICAgICAgQHVybC5zZWxlY3QoKVxuXG4gICAgICBAdXJsLm9uICdrZXlwcmVzcycsKGV2dCk9PlxuICAgICAgICBVUkwgPSByZXF1aXJlICd1cmwnXG4gICAgICAgIGlmIGV2dC53aGljaCBpcyAxM1xuICAgICAgICAgIEB1cmwuYmx1cigpXG4gICAgICAgICAgdXJscyA9IFVSTC5wYXJzZShgIHRoaXMudmFsdWVgKVxuICAgICAgICAgIHVybCA9IGAgdGhpcy52YWx1ZWBcbiAgICAgICAgICB1bmxlc3MgdXJsLnN0YXJ0c1dpdGgoJ2Jyb3dzZXItcGx1czovLycpXG4gICAgICAgICAgICBpZiB1cmwuaW5kZXhPZignICcpID49IDBcbiAgICAgICAgICAgICAgdXJsID0gXCJodHRwOi8vd3d3Lmdvb2dsZS5jb20vc2VhcmNoP2FzX3E9I3t1cmx9XCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgbG9jYWxob3N0UGF0dGVybiA9IC8vL15cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaHR0cDovLyk/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxob3N0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vaVxuICAgICAgICAgICAgICBpZiB1cmwuc2VhcmNoKGxvY2FsaG9zdFBhdHRlcm4pIDwgMCAgIGFuZCB1cmwuaW5kZXhPZignLicpIDwgMFxuICAgICAgICAgICAgICAgIHVybCA9IFwiaHR0cDovL3d3dy5nb29nbGUuY29tL3NlYXJjaD9hc19xPSN7dXJsfVwiXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiB1cmxzLnByb3RvY29sIGluIFsnaHR0cCcsJ2h0dHBzJywnZmlsZTonXVxuICAgICAgICAgICAgICAgICAgaWYgdXJscy5wcm90b2NvbCBpcyAnZmlsZTonXG4gICAgICAgICAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKC9cXFxcL2csXCIvXCIpXG4gICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHVybCA9IFVSTC5mb3JtYXQodXJscylcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHVybC5pbmRleE9mKCdsb2NhbGhvc3QnKSBpc250ICAtMVxuICAgICAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UobG9jYWxob3N0UGF0dGVybiwnaHR0cDovLzEyNy4wLjAuMScpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgdXJscy5wcm90b2NvbCA9ICdodHRwJ1xuICAgICAgICAgICAgICAgICAgdXJsID0gVVJMLmZvcm1hdCh1cmxzKVxuICAgICAgICAgIEBnb1RvVXJsKHVybClcblxuICAgICAgQHJlZnJlc2gub24gJ2NsaWNrJywgKGV2dCk9PlxuICAgICAgICBAcmVmcmVzaFBhZ2UoKVxuXG4gIHJlZnJlc2hQYWdlOiAodXJsKS0+XG4gICAgICAjIGh0bWx2ID0gQG1vZGVsLnZpZXcuaHRtbHZbMF1cbiAgICAgIGlmIEBtb2RlbC5vcmdVUkkgYW5kIHBwID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCdwcCcpXG4gICAgICAgIHBwLm1haW5Nb2R1bGUuY29tcGlsZVBhdGgoQG1vZGVsLm9yZ1VSSSxAbW9kZWwuX2lkKVxuICAgICAgZWxzZVxuICAgICAgICBpZiB1cmxcbiAgICAgICAgICBAbW9kZWwudXJsID0gdXJsXG4gICAgICAgICAgQHVybC52YWwgdXJsXG4gICAgICAgIGlmIEB1bHRyYUxpdmVPbiBhbmQgQG1vZGVsLnNyY1xuICAgICAgICAgIEBodG1sdlswXT8uc3JjID0gQG1vZGVsLnNyY1xuICAgICAgICBlbHNlXG4gICAgICAgICAgQGh0bWx2WzBdPy5leGVjdXRlSmF2YVNjcmlwdCBcImxvY2F0aW9uLmhyZWYgPSAnI3tAbW9kZWwudXJsfSdcIlxuXG4gIGdvVG9Vcmw6ICh1cmwpLT5cbiAgICAgIEJyb3dzZXJQbHVzTW9kZWwgPSByZXF1aXJlICcuL2Jyb3dzZXItcGx1cy1tb2RlbCdcbiAgICAgIHJldHVybiB1bmxlc3MgQnJvd3NlclBsdXNNb2RlbC5jaGVja1VybCh1cmwpXG4gICAgICBqUShAdXJsKS5hdXRvY29tcGxldGUoXCJjbG9zZVwiKVxuICAgICAgQGxpdmVPbiA9IGZhbHNlXG4gICAgICBAbGl2ZS50b2dnbGVDbGFzcyAnYWN0aXZlJyxAbGl2ZU9uXG4gICAgICBAbGl2ZVN1YnNjcmlwdGlvbj8uZGlzcG9zZSgpIHVubGVzcyBAbGl2ZU9uXG4gICAgICBAdXJsLnZhbCB1cmxcbiAgICAgIEBtb2RlbC51cmwgPSB1cmxcbiAgICAgIGRlbGV0ZSBAbW9kZWwudGl0bGVcbiAgICAgIGRlbGV0ZSBAbW9kZWwuaWNvbk5hbWVcbiAgICAgIGRlbGV0ZSBAbW9kZWwuZmF2SWNvblxuICAgICAgQG1vZGVsLnNldFRpdGxlKG51bGwpXG4gICAgICBAbW9kZWwudXBkYXRlSWNvbihudWxsKVxuICAgICAgaWYgdXJsLnN0YXJ0c1dpdGgoJ2Jyb3dzZXItcGx1czovLycpXG4gICAgICAgIHVybCA9IEBtb2RlbC5icm93c2VyUGx1cy5nZXRCcm93c2VyUGx1c1VybD8odXJsKVxuICAgICAgQGh0bWx2LmF0dHIgJ3NyYycsdXJsXG5cbiAgc2hvd0RldlRvb2w6IChldnQpLT5cbiAgICBAdG9nZ2xlRGV2VG9vbCgpIGlmIGV2dFswXS5rZXlJZGVudGlmaWVyIGlzIFwiRjEyXCJcblxuXG4gIHJlbW92ZUZhdjogKGZhdm9yaXRlKS0+XG4gICAgZmF2cnMgPSB3aW5kb3cuJC5qU3RvcmFnZS5nZXQoJ2JwLmZhdicpXG4gICAgZm9yIGZhdnIsaWR4IGluIGZhdnJzXG4gICAgICBpZiBmYXZyLnVybCBpcyBmYXZvcml0ZS51cmxcbiAgICAgICAgZmF2cnMuc3BsaWNlIGlkeCwxXG4gICAgICAgIHdpbmRvdy4kLmpTdG9yYWdlLnNldCgnYnAuZmF2JyxmYXZycylcbiAgICAgICAgcmV0dXJuXG5cbiAgc2V0U3JjOiAodGV4dCktPlxuICAgIHVybCA9IEBtb2RlbC5vcmdVUkkgb3IgQG1vZGVsLnVybFxuICAgIHRleHQgPSBCcm93c2VyUGx1c1ZpZXcuY2hlY2tCYXNlKHRleHQsdXJsKVxuICAgIEBtb2RlbC5zcmMgPSBcImRhdGE6dGV4dC9odG1sLCN7dGV4dH1cIlxuICAgIEBodG1sdlswXT8uc3JjID0gQG1vZGVsLnNyY1xuXG4gIEBjaGVja0Jhc2U6ICh0ZXh0LHVybCktPlxuICAgIGNoZWVyaW8gPSByZXF1aXJlICdjaGVlcmlvJ1xuICAgICRodG1sID0gY2hlZXJpby5sb2FkKHRleHQpXG4gICAgIyBiYXNlUGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdK1wiL1wiXG4gICAgYmFzZVBhdGggPSBwYXRoLmRpcm5hbWUodXJsKStcIi9cIlxuICAgIGlmICRodG1sKCdiYXNlJykubGVuZ3RoXG4gICAgICB0ZXh0XG4gICAgZWxzZVxuICAgICAgaWYgJGh0bWwoJ2hlYWQnKS5sZW5ndGhcbiAgICAgICAgYmFzZSAgPSBcIjxiYXNlIGhyZWY9JyN7YmFzZVBhdGh9JyB0YXJnZXQ9J19ibGFuayc+XCJcbiAgICAgICAgJGh0bWwoJ2hlYWQnKS5wcmVwZW5kKGJhc2UpXG4gICAgICBlbHNlXG4gICAgICAgIGJhc2UgID0gXCI8aGVhZD48YmFzZSBocmVmPScje2Jhc2VQYXRofScgdGFyZ2V0PSdfYmxhbmsnPjwvaGVhZD5cIlxuICAgICAgICAkaHRtbCgnaHRtbCcpLnByZXBlbmQoYmFzZSlcbiAgICAgICRodG1sLmh0bWwoKVxuXG4gIGNoZWNrRmF2OiAtPlxuICAgIEBmYXYucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICBmYXZycyA9IHdpbmRvdy4kLmpTdG9yYWdlLmdldCgnYnAuZmF2JylcbiAgICBmb3IgZmF2ciBpbiBmYXZyc1xuICAgICAgaWYgZmF2ci51cmwgaXMgQG1vZGVsLnVybFxuICAgICAgICBAZmF2LmFkZENsYXNzICdhY3RpdmUnXG5cbiAgdG9nZ2xlRGV2VG9vbDogLT5cbiAgICBvcGVuID0gQGh0bWx2WzBdPy5pc0RldlRvb2xzT3BlbmVkKClcbiAgICBpZiBvcGVuXG4gICAgICBAaHRtbHZbMF0/LmNsb3NlRGV2VG9vbHMoKVxuICAgIGVsc2VcbiAgICAgIEBodG1sdlswXT8ub3BlbkRldlRvb2xzKClcblxuICAgICQoQGRldnRvb2wpLnRvZ2dsZUNsYXNzICdhY3RpdmUnLCAhb3BlblxuXG4gIGNoZWNrTmF2OiAtPlxuICAgICAgJChAZm9yd2FyZCkudG9nZ2xlQ2xhc3MgJ2FjdGl2ZScsQGh0bWx2WzBdPy5jYW5Hb0ZvcndhcmQoKVxuICAgICAgJChAYmFjaykudG9nZ2xlQ2xhc3MgJ2FjdGl2ZScsQGh0bWx2WzBdPy5jYW5Hb0JhY2soKVxuICAgICAgaWYgQGh0bWx2WzBdPy5jYW5Hb0ZvcndhcmQoKVxuICAgICAgICBpZiBAY2xlYXJGb3J3YXJkXG4gICAgICAgICAgJChAZm9yd2FyZCkudG9nZ2xlQ2xhc3MgJ2FjdGl2ZScsZmFsc2VcbiAgICAgICAgICBAY2xlYXJGb3J3YXJkID0gZmFsc2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICQoQGZvcndhcmQpLnRvZ2dsZUNsYXNzICdhY3RpdmUnLHRydWVcblxuICBnb0JhY2s6IC0+XG4gICAgQGJhY2suY2xpY2soKVxuXG4gIGdvRm9yd2FyZDogLT5cbiAgICBAZm9yd2FyZC5jbGljaygpXG5cbiAgYWRkSGlzdG9yeTogLT5cbiAgICB1cmwgPSBAaHRtbHZbMF0uZ2V0VVJMKCkucmVwbGFjZSgvXFxcXC9nLFwiL1wiKVxuICAgIHJldHVybiB1bmxlc3MgdXJsXG4gICAgaGlzdG9yeVVSTCA9IFwiZmlsZTovLy8je0Btb2RlbC5icm93c2VyUGx1cy5yZXNvdXJjZXN9aGlzdG9yeS5odG1sXCIucmVwbGFjZSgvXFxcXC9nLFwiL1wiKVxuICAgIHJldHVybiBpZiB1cmwuc3RhcnRzV2l0aCgnYnJvd3Nlci1wbHVzOi8vJykgb3IgdXJsLnN0YXJ0c1dpdGgoJ2RhdGE6dGV4dC9odG1sLCcpIG9yIHVybC5zdGFydHNXaXRoIGhpc3RvcnlVUkxcbiAgICB5eXl5bW1kZCA9IC0+XG4gICAgICBkYXRlID0gbmV3IERhdGUoKVxuICAgICAgeXl5eSA9IGRhdGUuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpXG4gICAgICBtbSA9IChkYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpXG4gICAgICAjIGdldE1vbnRoKCkgaXMgemVyby1iYXNlZFxuICAgICAgZGQgPSBkYXRlLmdldERhdGUoKS50b1N0cmluZygpXG4gICAgICB5eXl5ICsgKGlmIG1tWzFdIHRoZW4gbW0gZWxzZSAnMCcgKyBtbVswXSkgKyAoaWYgZGRbMV0gdGhlbiBkZCBlbHNlICcwJyArIGRkWzBdKVxuICAgIHRvZGF5ID0geXl5eW1tZGQoKVxuICAgIGhpc3RvcnkgPSB3aW5kb3cuJC5qU3RvcmFnZS5nZXQoJ2JwLmhpc3RvcnknKSBvciBbXVxuICAgICMgcmV0dXJuIHVubGVzcyBoaXN0b3J5IG9yIGhpc3RvcnkubGVuZ3RoID0gMFxuICAgIHRvZGF5T2JqID0gaGlzdG9yeS5maW5kIChlbGUsaWR4LGFyciktPlxuICAgICAgcmV0dXJuIHRydWUgaWYgZWxlW3RvZGF5XVxuICAgIHVubGVzcyB0b2RheU9ialxuICAgICAgb2JqID0ge31cbiAgICAgIGhpc3RUb2RheSA9IFtdXG4gICAgICBvYmpbdG9kYXldID0gaGlzdFRvZGF5XG4gICAgICBoaXN0b3J5LnVuc2hpZnQgb2JqXG4gICAgZWxzZVxuICAgICAgaGlzdFRvZGF5ID0gdG9kYXlPYmpbdG9kYXldXG4gICAgaGlzdFRvZGF5LnVuc2hpZnQgZGF0ZTogKG5ldyBEYXRlKCkudG9TdHJpbmcoKSksdXJpOiB1cmxcbiAgICB3aW5kb3cuJC5qU3RvcmFnZS5zZXQoJ2JwLmhpc3RvcnknLGhpc3RvcnkpXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgQG1vZGVsLmdldFRpdGxlKClcblxuICBzZXJpYWxpemU6IC0+XG5cbiAgZGVzdHJveTogLT5cbiAgICBqUShAdXJsKS5hdXRvY29tcGxldGUoJ2Rlc3Ryb3knKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIEBnZXRKUXVlcnk6IC0+XG4gICAgZnMucmVhZEZpbGVTeW5jIFwiI3tAbW9kZWwuYnJvd3NlclBsdXMucmVzb3VyY2VzfS9qcXVlcnktMi4xLjQubWluLmpzXCIsJ3V0Zi04J1xuXG4gIEBnZXRKU3RvcmFnZTogLT5cbiAgICBmcy5yZWFkRmlsZVN5bmMgXCIje0Btb2RlbC5icm93c2VyUGx1cy5yZXNvdXJjZXN9L2pzdG9yYWdlLm1pbi5qc1wiLCd1dGYtOCdcblxuICBAZ2V0Tm90aWZ5QmFyOiAtPlxuICAgIGZzLnJlYWRGaWxlU3luYyBcIiN7QG1vZGVsLmJyb3dzZXJQbHVzLnJlc291cmNlc30vanF1ZXJ5Lm5vdGlmeUJhci5qc1wiLCd1dGYtOCdcblxuICBAZ2V0SG90S2V5czogLT5cbiAgICBmcy5yZWFkRmlsZVN5bmMgXCIje0Btb2RlbC5icm93c2VyUGx1cy5yZXNvdXJjZXN9L2pxdWVyeS5ob3RrZXlzLm1pbi5qc1wiLCd1dGYtOCdcblxuICBAbG9hZENTUzogKGZpbGVuYW1lLGZ1bGxwYXRoPWZhbHNlKS0+XG4gICAgdW5sZXNzIGZ1bGxwYXRoXG4gICAgICBmcGF0aCA9IFwiZmlsZTovLy8je0Btb2RlbC5icm93c2VyUGx1cy5yZXNvdXJjZXMucmVwbGFjZSgvXFxcXC9nLCcvJyl9XCJcbiAgICAgIGZpbGVuYW1lID0gXCIje2ZwYXRofSN7ZmlsZW5hbWV9XCJcbiAgICBcIlwiXCJcbiAgICBqUXVlcnkoJ2hlYWQnKS5hcHBlbmQoalF1ZXJ5KCc8bGluayB0eXBlPVwidGV4dC9jc3NcIiByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIiN7ZmlsZW5hbWV9XCI+JykpXG4gICAgXCJcIlwiXG5cbiAgQGxvYWRKUzogKGZpbGVuYW1lLGZ1bGxwYXRoPWZhbHNlKS0+XG4gICAgdW5sZXNzIGZ1bGxwYXRoXG4gICAgICBmcGF0aCA9IFwiZmlsZTovLy8je0Btb2RlbC5icm93c2VyUGx1cy5yZXNvdXJjZXMucmVwbGFjZSgvXFxcXC9nLCcvJyl9XCJcbiAgICAgIGZpbGVuYW1lID0gXCIje2ZwYXRofSN7ZmlsZW5hbWV9XCJcblxuICAgIFwiXCJcIlxuICAgIGpRdWVyeSgnaGVhZCcpLmFwcGVuZChqUXVlcnkoJzxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiIHNyYz1cIiN7ZmlsZW5hbWV9XCI+JykpXG4gICAgXCJcIlwiXG4iXX0=
