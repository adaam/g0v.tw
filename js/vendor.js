"use strict";function AngularFire(e,t,n,r){this._q=e,this._parse=t,this._timeout=n,this._initial=!0,this._remoteValue=!1,typeof r=="string"?this._fRef=new Firebase(r):this._fRef=r}angular.module("firebase",[]).value("Firebase",Firebase),angular.module("firebase").factory("angularFire",["$q","$parse","$timeout",function(e,t,n){return function(r,i,s,o){var u=new AngularFire(e,t,n,r);return u.associate(i,s,o)}}]),AngularFire.prototype={associate:function(e,t,n){var r=this;n==undefined&&(n=[]);var i=this._q.defer(),s=i.promise;return this._fRef.on("value",function(s){var o=!1;i&&(o=i,i=!1),r._remoteValue=n;if(s&&s.val()!=undefined){var u=s.val();if(typeof u!=typeof n){r._log("Error: type mismatch");return}var a=Object.prototype.toString;if(a.call(n)!=a.call(u)){r._log("Error: type mismatch");return}r._remoteValue=angular.copy(u);if(angular.equals(u,r._parse(t)(e)))return}r._timeout(function(){r._resolve(e,t,o,r._remoteValue)})}),s},disassociate:function(){var e=this;e._unregister&&e._unregister(),this._fRef.off("value")},_resolve:function(e,t,n,r){var i=this;this._parse(t).assign(e,angular.copy(r)),this._remoteValue=angular.copy(r),n&&(n.resolve(function(){i.disassociate()}),this._watch(e,t))},_watch:function(e,t){var n=this;n._unregister=e.$watch(t,function(){if(n._initial){n._initial=!1;return}var r=JSON.parse(angular.toJson(n._parse(t)(e)));if(angular.equals(r,n._remoteValue))return;n._fRef.ref().set(r)},!0),e.$on("$destroy",function(){n.disassociate()})},_log:function(e){console&&console.log&&console.log(e)}},angular.module("firebase").factory("angularFireCollection",["$timeout",function(e){return function(t,n){function r(e,t){this.$ref=e.ref(),this.$id=e.name(),this.$index=t,angular.extend(this,{priority:e.getPriority()},e.val())}function u(e){return e?i[e]+1:0}function a(e,t){i[t.$id]=e,s.splice(e,0,t)}function f(e){var t=i[e];s.splice(t,1),i[e]=undefined}function l(e,t){s[e]=t}function c(e,t,n){s.splice(e,1),s.splice(t,0,n),h(e,t)}function h(e,t){var n=s.length;t=t||n,t>n&&(t=n);for(var r=e;r<t;r++){var o=s[r];o.$index=i[o.$id]=r}}var i={},s=[],o;return typeof t=="string"?o=new Firebase(t):o=t,n&&typeof n=="function"&&o.once("value",n),o.on("child_added",function(t,n){e(function(){var e=u(n);a(e,new r(t,e)),h(e)})}),o.on("child_removed",function(t){e(function(){var e=t.name(),n=i[e];f(e),h(n)})}),o.on("child_changed",function(t,n){e(function(){var e=i[t.name()],s=u(n),o=new r(t,e);l(e,o),s!==e&&c(e,s,o)})}),o.on("child_moved",function(t,n){e(function(){var e=i[t.name()],r=u(n),o=s[e];c(e,r,o)})}),s.getByName=function(e){return s[i[e]]},s.add=function(e,t){var n;return t?n=o.ref().push(e,t):n=o.ref().push(e),n},s.remove=function(e,t){var n=angular.isString(e)?s[i[e]]:e;t?n.$ref.remove(t):n.$ref.remove()},s.update=function(e,t){var n=angular.isString(e)?s[i[e]]:e,r={};angular.forEach(n,function(e,t){t.indexOf("$")!==0&&(r[t]=e)}),t?n.$ref.set(r,t):n.$ref.set(r)},s}}]),angular.module("firebase").factory("angularFireAuth",["$rootScope","$parse","$timeout","$location","$route",function(e,t,n,r,i){function s(e){var t=e.split(".");if(!t instanceof Array||t.length!==3)throw new Error("Invalid JWT");var n=t[1];return JSON.parse(decodeURIComponent(escape(window.atob(n))))}function o(e,r,i,s){r&&n(function(){t(r).assign(e,i),s()})}function u(e,t,n){e.authRequired&&!n._authenticated&&(e.pathTo===undefined?n._redirectTo=r.path():n._redirectTo=e.pathTo===t?"/":e.pathTo,r.replace(),r.path(t))}return{initialize:function(t,n){var r=this;n=n||{},this._scope=e,n.scope&&(this._scope=n.scope),n.name&&(this._name=n.name),this._cb=function(){},n.callback&&typeof n.callback=="function"&&(this._cb=n.callback),this._redirectTo=null,this._authenticated=!1,n.path&&(i.current&&u(i.current,n.path,r),e.$on("$routeChangeStart",function(e,t){u(t,n.path,r)})),this._ref=new Firebase(t);if(n.simple&&n.simple===!1){o(this._scope,this._name,null);return}if(!window.FirebaseSimpleLogin){var s=new Error("FirebaseSimpleLogin undefined, did you include firebase-simple-login.js?");e.$broadcast("angularFireAuth:error",s);return}var a=new FirebaseSimpleLogin(this._ref,function(t,n){r._cb(t,n),t?e.$broadcast("angularFireAuth:error",t):n?r._loggedIn(n):r._loggedOut()});this._authClient=a},login:function(t,n){switch(t){case"github":case"persona":case"twitter":case"facebook":case"password":if(!this._authClient){var r=new Error("Simple Login not initialized");e.$broadcast("angularFireAuth:error",r)}else this._authClient.login(t,n);break;default:var i,o=this;try{i=s(t),this._ref.auth(t,function(t){t?e.$broadcast("angularFireAuth:error",t):o._loggedIn(i)})}catch(u){e.$broadcast("angularFireAuth:error",u)}}},logout:function(){this._authClient?this._authClient.logout():(this._ref.unauth(),this._loggedOut())},_loggedIn:function(t){var n=this;this._authenticated=!0,o(this._scope,this._name,t,function(){e.$broadcast("angularFireAuth:login",t),n._redirectTo&&(r.replace(),r.path(n._redirectTo),n._redirectTo=null)})},_loggedOut:function(){this._authenticated=!1,o(this._scope,this._name,null,function(){e.$broadcast("angularFireAuth:logout")})}}}]),!function(e){var t=function(t,n){this.options=e.extend({},e.fn.affix.defaults,n),this.$window=e(window).on("scroll.affix.data-api",e.proxy(this.checkPosition,this)).on("click.affix.data-api",e.proxy(function(){setTimeout(e.proxy(this.checkPosition,this),1)},this)),this.$element=e(t),this.checkPosition()};t.prototype.checkPosition=function(){if(!this.$element.is(":visible"))return;var t=e(document).height(),n=this.$window.scrollTop(),r=this.$element.offset(),i=this.options.offset,s=i.bottom,o=i.top,u="affix affix-top affix-bottom",a;typeof i!="object"&&(s=o=i),typeof o=="function"&&(o=i.top()),typeof s=="function"&&(s=i.bottom()),a=this.unpin!=null&&n+this.unpin<=r.top?!1:s!=null&&r.top+this.$element.height()>=t-s?"bottom":o!=null&&n<=o?"top":!1;if(this.affixed===a)return;this.affixed=a,this.unpin=a=="bottom"?r.top-n:null,this.$element.removeClass(u).addClass("affix"+(a?"-"+a:""))},e.fn.affix=function(n){return this.each(function(){var r=e(this),i=r.data("affix"),s=typeof n=="object"&&n;i||r.data("affix",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.affix.Constructor=t,e.fn.affix.defaults={offset:0},e(window).on("load",function(){e('[data-spy="affix"]').each(function(){var t=e(this),n=t.data();n.offset=n.offset||{},n.offsetBottom&&(n.offset.bottom=n.offsetBottom),n.offsetTop&&(n.offset.top=n.offsetTop),t.affix(n)})})}(window.jQuery),!function(e){var t='[data-dismiss="alert"]',n=function(n){e(n).on("click",t,this.close)};n.prototype.close=function(t){function s(){i.trigger("closed").remove()}var n=e(this),r=n.attr("data-target"),i;r||(r=n.attr("href"),r=r&&r.replace(/.*(?=#[^\s]*$)/,"")),i=e(r),t&&t.preventDefault(),i.length||(i=n.hasClass("alert")?n:n.parent()),i.trigger(t=e.Event("close"));if(t.isDefaultPrevented())return;i.removeClass("in"),e.support.transition&&i.hasClass("fade")?i.on(e.support.transition.end,s):s()},e.fn.alert=function(t){return this.each(function(){var r=e(this),i=r.data("alert");i||r.data("alert",i=new n(this)),typeof t=="string"&&i[t].call(r)})},e.fn.alert.Constructor=n,e(document).on("click.alert.data-api",t,n.prototype.close)}(window.jQuery),!function(e){var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.button.defaults,n)};t.prototype.setState=function(e){var t="disabled",n=this.$element,r=n.data(),i=n.is("input")?"val":"html";e+="Text",r.resetText||n.data("resetText",n[i]()),n[i](r[e]||this.options[e]),setTimeout(function(){e=="loadingText"?n.addClass(t).attr(t,t):n.removeClass(t).removeAttr(t)},0)},t.prototype.toggle=function(){var e=this.$element.closest('[data-toggle="buttons-radio"]');e&&e.find(".active").removeClass("active"),this.$element.toggleClass("active")},e.fn.button=function(n){return this.each(function(){var r=e(this),i=r.data("button"),s=typeof n=="object"&&n;i||r.data("button",i=new t(this,s)),n=="toggle"?i.toggle():n&&i.setState(n)})},e.fn.button.defaults={loadingText:"loading..."},e.fn.button.Constructor=t,e(document).on("click.button.data-api","[data-toggle^=button]",function(t){var n=e(t.target);n.hasClass("btn")||(n=n.closest(".btn")),n.button("toggle")})}(window.jQuery),!function(e){var t=function(t,n){this.$element=e(t),this.options=n,this.options.slide&&this.slide(this.options.slide),this.options.pause=="hover"&&this.$element.on("mouseenter",e.proxy(this.pause,this)).on("mouseleave",e.proxy(this.cycle,this))};t.prototype={cycle:function(t){return t||(this.paused=!1),this.options.interval&&!this.paused&&(this.interval=setInterval(e.proxy(this.next,this),this.options.interval)),this},to:function(t){var n=this.$element.find(".item.active"),r=n.parent().children(),i=r.index(n),s=this;if(t>r.length-1||t<0)return;return this.sliding?this.$element.one("slid",function(){s.to(t)}):i==t?this.pause().cycle():this.slide(t>i?"next":"prev",e(r[t]))},pause:function(t){return t||(this.paused=!0),this.$element.find(".next, .prev").length&&e.support.transition.end&&(this.$element.trigger(e.support.transition.end),this.cycle()),clearInterval(this.interval),this.interval=null,this},next:function(){if(this.sliding)return;return this.slide("next")},prev:function(){if(this.sliding)return;return this.slide("prev")},slide:function(t,n){var r=this.$element.find(".item.active"),i=n||r[t](),s=this.interval,o=t=="next"?"left":"right",u=t=="next"?"first":"last",a=this,f;this.sliding=!0,s&&this.pause(),i=i.length?i:this.$element.find(".item")[u](),f=e.Event("slide",{relatedTarget:i[0]});if(i.hasClass("active"))return;if(e.support.transition&&this.$element.hasClass("slide")){this.$element.trigger(f);if(f.isDefaultPrevented())return;i.addClass(t),i[0].offsetWidth,r.addClass(o),i.addClass(o),this.$element.one(e.support.transition.end,function(){i.removeClass([t,o].join(" ")).addClass("active"),r.removeClass(["active",o].join(" ")),a.sliding=!1,setTimeout(function(){a.$element.trigger("slid")},0)})}else{this.$element.trigger(f);if(f.isDefaultPrevented())return;r.removeClass("active"),i.addClass("active"),this.sliding=!1,this.$element.trigger("slid")}return s&&this.cycle(),this}},e.fn.carousel=function(n){return this.each(function(){var r=e(this),i=r.data("carousel"),s=e.extend({},e.fn.carousel.defaults,typeof n=="object"&&n),o=typeof n=="string"?n:s.slide;i||r.data("carousel",i=new t(this,s)),typeof n=="number"?i.to(n):o?i[o]():s.interval&&i.cycle()})},e.fn.carousel.defaults={interval:5e3,pause:"hover"},e.fn.carousel.Constructor=t,e(document).on("click.carousel.data-api","[data-slide]",function(t){var n=e(this),r,i=e(n.attr("data-target")||(r=n.attr("href"))&&r.replace(/.*(?=#[^\s]+$)/,"")),s=e.extend({},i.data(),n.data());i.carousel(s),t.preventDefault()})}(window.jQuery),!function(e){var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.collapse.defaults,n),this.options.parent&&(this.$parent=e(this.options.parent)),this.options.toggle&&this.toggle()};t.prototype={constructor:t,dimension:function(){var e=this.$element.hasClass("width");return e?"width":"height"},show:function(){var t,n,r,i;if(this.transitioning)return;t=this.dimension(),n=e.camelCase(["scroll",t].join("-")),r=this.$parent&&this.$parent.find("> .accordion-group > .in");if(r&&r.length){i=r.data("collapse");if(i&&i.transitioning)return;r.collapse("hide"),i||r.data("collapse",null)}this.$element[t](0),this.transition("addClass",e.Event("show"),"shown"),e.support.transition&&this.$element[t](this.$element[0][n])},hide:function(){var t;if(this.transitioning)return;t=this.dimension(),this.reset(this.$element[t]()),this.transition("removeClass",e.Event("hide"),"hidden"),this.$element[t](0)},reset:function(e){var t=this.dimension();return this.$element.removeClass("collapse")[t](e||"auto")[0].offsetWidth,this.$element[e!==null?"addClass":"removeClass"]("collapse"),this},transition:function(t,n,r){var i=this,s=function(){n.type=="show"&&i.reset(),i.transitioning=0,i.$element.trigger(r)};this.$element.trigger(n);if(n.isDefaultPrevented())return;this.transitioning=1,this.$element[t]("in"),e.support.transition&&this.$element.hasClass("collapse")?this.$element.one(e.support.transition.end,s):s()},toggle:function(){this[this.$element.hasClass("in")?"hide":"show"]()}},e.fn.collapse=function(n){return this.each(function(){var r=e(this),i=r.data("collapse"),s=typeof n=="object"&&n;i||r.data("collapse",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.collapse.defaults={toggle:!0},e.fn.collapse.Constructor=t,e(document).on("click.collapse.data-api","[data-toggle=collapse]",function(t){var n=e(this),r,i=n.attr("data-target")||t.preventDefault()||(r=n.attr("href"))&&r.replace(/.*(?=#[^\s]+$)/,""),s=e(i).data("collapse")?"toggle":n.data();n[e(i).hasClass("in")?"addClass":"removeClass"]("collapsed"),e(i).collapse(s)})}(window.jQuery),!function(e){function r(){e(t).each(function(){i(e(this)).removeClass("open")})}function i(t){var n=t.attr("data-target"),r;return n||(n=t.attr("href"),n=n&&/#/.test(n)&&n.replace(/.*(?=#[^\s]*$)/,"")),r=e(n),r.length||(r=t.parent()),r}var t="[data-toggle=dropdown]",n=function(t){var n=e(t).on("click.dropdown.data-api",this.toggle);e("html").on("click.dropdown.data-api",function(){n.parent().removeClass("open")})};n.prototype={constructor:n,toggle:function(t){var n=e(this),s,o;if(n.is(".disabled, :disabled"))return;return s=i(n),o=s.hasClass("open"),r(),o||(s.toggleClass("open"),n.focus()),!1},keydown:function(t){var n,r,s,o,u,a;if(!/(38|40|27)/.test(t.keyCode))return;n=e(this),t.preventDefault(),t.stopPropagation();if(n.is(".disabled, :disabled"))return;o=i(n),u=o.hasClass("open");if(!u||u&&t.keyCode==27)return n.click();r=e("[role=menu] li:not(.divider) a",o);if(!r.length)return;a=r.index(r.filter(":focus")),t.keyCode==38&&a>0&&a--,t.keyCode==40&&a<r.length-1&&a++,~a||(a=0),r.eq(a).focus()}},e.fn.dropdown=function(t){return this.each(function(){var r=e(this),i=r.data("dropdown");i||r.data("dropdown",i=new n(this)),typeof t=="string"&&i[t].call(r)})},e.fn.dropdown.Constructor=n,e(document).on("click.dropdown.data-api touchstart.dropdown.data-api",r).on("click.dropdown touchstart.dropdown.data-api",".dropdown form",function(e){e.stopPropagation()}).on("click.dropdown.data-api touchstart.dropdown.data-api",t,n.prototype.toggle).on("keydown.dropdown.data-api touchstart.dropdown.data-api",t+", [role=menu]",n.prototype.keydown)}(window.jQuery),!function(e){var t=function(t,n){this.options=n,this.$element=e(t).delegate('[data-dismiss="modal"]',"click.dismiss.modal",e.proxy(this.hide,this)),this.options.remote&&this.$element.find(".modal-body").load(this.options.remote)};t.prototype={constructor:t,toggle:function(){return this[this.isShown?"hide":"show"]()},show:function(){var t=this,n=e.Event("show");this.$element.trigger(n);if(this.isShown||n.isDefaultPrevented())return;this.isShown=!0,this.escape(),this.backdrop(function(){var n=e.support.transition&&t.$element.hasClass("fade");t.$element.parent().length||t.$element.appendTo(document.body),t.$element.show(),n&&t.$element[0].offsetWidth,t.$element.addClass("in").attr("aria-hidden",!1),t.enforceFocus(),n?t.$element.one(e.support.transition.end,function(){t.$element.focus().trigger("shown")}):t.$element.focus().trigger("shown")})},hide:function(t){t&&t.preventDefault();var n=this;t=e.Event("hide"),this.$element.trigger(t);if(!this.isShown||t.isDefaultPrevented())return;this.isShown=!1,this.escape(),e(document).off("focusin.modal"),this.$element.removeClass("in").attr("aria-hidden",!0),e.support.transition&&this.$element.hasClass("fade")?this.hideWithTransition():this.hideModal()},enforceFocus:function(){var t=this;e(document).on("focusin.modal",function(e){t.$element[0]!==e.target&&!t.$element.has(e.target).length&&t.$element.focus()})},escape:function(){var e=this;this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.modal",function(t){t.which==27&&e.hide()}):this.isShown||this.$element.off("keyup.dismiss.modal")},hideWithTransition:function(){var t=this,n=setTimeout(function(){t.$element.off(e.support.transition.end),t.hideModal()},500);this.$element.one(e.support.transition.end,function(){clearTimeout(n),t.hideModal()})},hideModal:function(e){this.$element.hide().trigger("hidden"),this.backdrop()},removeBackdrop:function(){this.$backdrop.remove(),this.$backdrop=null},backdrop:function(t){var n=this,r=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var i=e.support.transition&&r;this.$backdrop=e('<div class="modal-backdrop '+r+'" />').appendTo(document.body),this.$backdrop.click(this.options.backdrop=="static"?e.proxy(this.$element[0].focus,this.$element[0]):e.proxy(this.hide,this)),i&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),i?this.$backdrop.one(e.support.transition.end,t):t()}else!this.isShown&&this.$backdrop?(this.$backdrop.removeClass("in"),e.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(e.support.transition.end,e.proxy(this.removeBackdrop,this)):this.removeBackdrop()):t&&t()}},e.fn.modal=function(n){return this.each(function(){var r=e(this),i=r.data("modal"),s=e.extend({},e.fn.modal.defaults,r.data(),typeof n=="object"&&n);i||r.data("modal",i=new t(this,s)),typeof n=="string"?i[n]():s.show&&i.show()})},e.fn.modal.defaults={backdrop:!0,keyboard:!0,show:!0},e.fn.modal.Constructor=t,e(document).on("click.modal.data-api",'[data-toggle="modal"]',function(t){var n=e(this),r=n.attr("href"),i=e(n.attr("data-target")||r&&r.replace(/.*(?=#[^\s]+$)/,"")),s=i.data("modal")?"toggle":e.extend({remote:!/#/.test(r)&&r},i.data(),n.data());t.preventDefault(),i.modal(s).one("hide",function(){n.focus()})})}(window.jQuery),!function(e){function t(t,n){var r=e.proxy(this.process,this),i=e(t).is("body")?e(window):e(t),s;this.options=e.extend({},e.fn.scrollspy.defaults,n),this.$scrollElement=i.on("scroll.scroll-spy.data-api",r),this.selector=(this.options.target||(s=e(t).attr("href"))&&s.replace(/.*(?=#[^\s]+$)/,"")||"")+" .nav li > a",this.$body=e("body"),this.refresh(),this.process()}t.prototype={constructor:t,refresh:function(){var t=this,n;this.offsets=e([]),this.targets=e([]),n=this.$body.find(this.selector).map(function(){var t=e(this),n=t.data("target")||t.attr("href"),r=/^#\w/.test(n)&&e(n);return r&&r.length&&[[r.position().top,n]]||null}).sort(function(e,t){return e[0]-t[0]}).each(function(){t.offsets.push(this[0]),t.targets.push(this[1])})},process:function(){var e=this.$scrollElement.scrollTop()+this.options.offset,t=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight,n=t-this.$scrollElement.height(),r=this.offsets,i=this.targets,s=this.activeTarget,o;if(e>=n)return s!=(o=i.last()[0])&&this.activate(o);for(o=r.length;o--;)s!=i[o]&&e>=r[o]&&(!r[o+1]||e<=r[o+1])&&this.activate(i[o])},activate:function(t){var n,r;this.activeTarget=t,e(this.selector).parent(".active").removeClass("active"),r=this.selector+'[data-target="'+t+'"],'+this.selector+'[href="'+t+'"]',n=e(r).parent("li").addClass("active"),n.parent(".dropdown-menu").length&&(n=n.closest("li.dropdown").addClass("active")),n.trigger("activate")}},e.fn.scrollspy=function(n){return this.each(function(){var r=e(this),i=r.data("scrollspy"),s=typeof n=="object"&&n;i||r.data("scrollspy",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.scrollspy.Constructor=t,e.fn.scrollspy.defaults={offset:10},e(window).on("load",function(){e('[data-spy="scroll"]').each(function(){var t=e(this);t.scrollspy(t.data())})})}(window.jQuery),!function(e){var t=function(t){this.element=e(t)};t.prototype={constructor:t,show:function(){var t=this.element,n=t.closest("ul:not(.dropdown-menu)"),r=t.attr("data-target"),i,s,o;r||(r=t.attr("href"),r=r&&r.replace(/.*(?=#[^\s]*$)/,""));if(t.parent("li").hasClass("active"))return;i=n.find(".active:last a")[0],o=e.Event("show",{relatedTarget:i}),t.trigger(o);if(o.isDefaultPrevented())return;s=e(r),this.activate(t.parent("li"),n),this.activate(s,s.parent(),function(){t.trigger({type:"shown",relatedTarget:i})})},activate:function(t,n,r){function o(){i.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),t.addClass("active"),s?(t[0].offsetWidth,t.addClass("in")):t.removeClass("fade"),t.parent(".dropdown-menu")&&t.closest("li.dropdown").addClass("active"),r&&r()}var i=n.find("> .active"),s=r&&e.support.transition&&i.hasClass("fade");s?i.one(e.support.transition.end,o):o(),i.removeClass("in")}},e.fn.tab=function(n){return this.each(function(){var r=e(this),i=r.data("tab");i||r.data("tab",i=new t(this)),typeof n=="string"&&i[n]()})},e.fn.tab.Constructor=t,e(document).on("click.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(t){t.preventDefault(),e(this).tab("show")})}(window.jQuery),!function(e){e(function(){e.support.transition=function(){var e=function(){var e=document.createElement("bootstrap"),t={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"},n;for(n in t)if(e.style[n]!==undefined)return t[n]}();return e&&{end:e}}()})}(window.jQuery),!function(e){var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.typeahead.defaults,n),this.matcher=this.options.matcher||this.matcher,this.sorter=this.options.sorter||this.sorter,this.highlighter=this.options.highlighter||this.highlighter,this.updater=this.options.updater||this.updater,this.$menu=e(this.options.menu).appendTo("body"),this.source=this.options.source,this.shown=!1,this.listen()};t.prototype={constructor:t,select:function(){var e=this.$menu.find(".active").attr("data-value");return this.$element.val(this.updater(e)).change(),this.hide()},updater:function(e){return e},show:function(){var t=e.extend({},this.$element.offset(),{height:this.$element[0].offsetHeight});return this.$menu.css({top:t.top+t.height,left:t.left}),this.$menu.show(),this.shown=!0,this},hide:function(){return this.$menu.hide(),this.shown=!1,this},lookup:function(t){var n;return this.query=this.$element.val(),!this.query||this.query.length<this.options.minLength?this.shown?this.hide():this:(n=e.isFunction(this.source)?this.source(this.query,e.proxy(this.process,this)):this.source,n?this.process(n):this)},process:function(t){var n=this;return t=e.grep(t,function(e){return n.matcher(e)}),t=this.sorter(t),t.length?this.render(t.slice(0,this.options.items)).show():this.shown?this.hide():this},matcher:function(e){return~e.toLowerCase().indexOf(this.query.toLowerCase())},sorter:function(e){var t=[],n=[],r=[],i;while(i=e.shift())i.toLowerCase().indexOf(this.query.toLowerCase())?~i.indexOf(this.query)?n.push(i):r.push(i):t.push(i);return t.concat(n,r)},highlighter:function(e){var t=this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&");return e.replace(new RegExp("("+t+")","ig"),function(e,t){return"<strong>"+t+"</strong>"})},render:function(t){var n=this;return t=e(t).map(function(t,r){return t=e(n.options.item).attr("data-value",r),t.find("a").html(n.highlighter(r)),t[0]}),t.first().addClass("active"),this.$menu.html(t),this},next:function(t){var n=this.$menu.find(".active").removeClass("active"),r=n.next();r.length||(r=e(this.$menu.find("li")[0])),r.addClass("active")},prev:function(e){var t=this.$menu.find(".active").removeClass("active"),n=t.prev();n.length||(n=this.$menu.find("li").last()),n.addClass("active")},listen:function(){this.$element.on("blur",e.proxy(this.blur,this)).on("keypress",e.proxy(this.keypress,this)).on("keyup",e.proxy(this.keyup,this)),this.eventSupported("keydown")&&this.$element.on("keydown",e.proxy(this.keydown,this)),this.$menu.on("click",e.proxy(this.click,this)).on("mouseenter","li",e.proxy(this.mouseenter,this))},eventSupported:function(e){var t=e in this.$element;return t||(this.$element.setAttribute(e,"return;"),t=typeof this.$element[e]=="function"),t},move:function(e){if(!this.shown)return;switch(e.keyCode){case 9:case 13:case 27:e.preventDefault();break;case 38:e.preventDefault(),this.prev();break;case 40:e.preventDefault(),this.next()}e.stopPropagation()},keydown:function(t){this.suppressKeyPressRepeat=!~e.inArray(t.keyCode,[40,38,9,13,27]),this.move(t)},keypress:function(e){if(this.suppressKeyPressRepeat)return;this.move(e)},keyup:function(e){switch(e.keyCode){case 40:case 38:case 16:case 17:case 18:break;case 9:case 13:if(!this.shown)return;this.select();break;case 27:if(!this.shown)return;this.hide();break;default:this.lookup()}e.stopPropagation(),e.preventDefault()},blur:function(e){var t=this;setTimeout(function(){t.hide()},150)},click:function(e){e.stopPropagation(),e.preventDefault(),this.select()},mouseenter:function(t){this.$menu.find(".active").removeClass("active"),e(t.currentTarget).addClass("active")}},e.fn.typeahead=function(n){return this.each(function(){var r=e(this),i=r.data("typeahead"),s=typeof n=="object"&&n;i||r.data("typeahead",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.typeahead.defaults={source:[],items:8,menu:'<ul class="typeahead dropdown-menu"></ul>',item:'<li><a href="#"></a></li>',minLength:1},e.fn.typeahead.Constructor=t,e(document).on("focus.typeahead.data-api",'[data-provide="typeahead"]',function(t){var n=e(this);if(n.data("typeahead"))return;t.preventDefault(),n.typeahead(n.data())})}(window.jQuery),function(e){if("function"==typeof bootstrap)bootstrap("jade",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeJade=e}else"undefined"!=typeof window?window.jade=e():global.jade=e()}(function(){var e,t,n,r,i;return function s(e,t,n){function r(o,u){if(!t[o]){if(!e[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=t[o]={exports:{}};e[o][0].call(f.exports,function(t){var n=e[o][1][t];return r(n?n:t)},f,f.exports,s,e,t,n)}return t[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<n.length;o++)r(n[o]);return r}({1:[function(e,t,n){function r(e){return e!=null&&e!==""}function i(e){return Array.isArray(e)?e.map(i).filter(r).join(" "):e}Array.isArray||(Array.isArray=function(e){return"[object Array]"==Object.prototype.toString.call(e)}),Object.keys||(Object.keys=function(e){var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(n);return t}),n.merge=function(t,n){var i=t["class"],s=n["class"];if(i||s)i=i||[],s=s||[],Array.isArray(i)||(i=[i]),Array.isArray(s)||(s=[s]),t["class"]=i.concat(s).filter(r);for(var o in n)o!="class"&&(t[o]=n[o]);return t},n.attrs=function(t,r){var s=[],o=t.terse;delete t.terse;var u=Object.keys(t),a=u.length;if(a){s.push("");for(var f=0;f<a;++f){var l=u[f],c=t[l];"boolean"==typeof c||null==c?c&&(o?s.push(l):s.push(l+'="'+l+'"')):0==l.indexOf("data")&&"string"!=typeof c?s.push(l+"='"+JSON.stringify(c)+"'"):"class"==l?r&&r[l]?(c=n.escape(i(c)))&&s.push(l+'="'+c+'"'):(c=i(c))&&s.push(l+'="'+c+'"'):r&&r[l]?s.push(l+'="'+n.escape(c)+'"'):s.push(l+'="'+c+'"')}}return s.join(" ")},n.escape=function(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},n.rethrow=function s(t,n,r,i){if(t instanceof Error){if((typeof window!="undefined"||!n)&&!i)throw t.message+=" on line "+r,t;try{i=i||e("fs").readFileSync(n,"utf8")}catch(o){s(t,null,r)}var u=3,a=i.split("\n"),f=Math.max(r-u,0),l=Math.min(a.length,r+u),u=a.slice(f,l).map(function(e,t){var n=t+f+1;return(n==r?"  > ":"    ")+n+"| "+e}).join("\n");throw t.path=n,t.message=(n||"Jade")+":"+r+"\n"+u+"\n\n"+t.message,t}throw t}},{fs:2}],2:[function(e,t,n){},{}]},{},[1])(1)});var switchTab=function(e){function t(e){var t=e.tabIdArr,n=e.tabClass,r=e.activeClass,i=e.contentId;for(var s=0,o=t.length;s<o;s++)document.getElementById(t[s]).onclick=function(t){var s=t.target.id,o={tab_state:s};history.pushState(o,s,"#"+s),console.log(history),console.log(history.state),e.activeColor(n,r,s),e.fetchContent(e.getUrl(s),i)};window.addEventListener("popstate",function(t){var s=e.showFirst;window.location.hash!==""&&(s=window.location.hash.substring(1)),e.activeColor(n,r,s),e.fetchContent(e.getUrl(s),i)},!1)}this.tabClass=e.tabClass||"",this.contentId=e.contentId||"",this.activeClass=e.activeClass||"",this.showFirst=e.showFirst||"",this.tabIdArr=e.tabId||[],this.showFirstFn(this),this.state(this),t(this)};switchTab.prototype.state=function(e){var t=e.contentId,n=e.tabClass,r=e.activeClass,t=e.contentId,i=window.location.hash,s=i.substring(1);i&&(this.activeColor(n,r,s),this.fetchContent(this.getUrl(s),t))},switchTab.prototype.getUrl=function(e){return document.getElementById(e).getAttribute("tab-url")},switchTab.prototype.fetchContent=function(e,t){var n;window.XMLHttpRequest?n=new XMLHttpRequest:n=new ActiveXObject("Microsoft.XMLHTTP"),n.onreadystatechange=function(){n.readyState==4&&n.status==200&&(document.getElementById(t).innerHTML=n.responseText)},n.open("GET",e,!0),n.send()},switchTab.prototype.activeColor=function(e,t,n){var r=document.getElementsByClassName(e);for(var i=0;i<r.length;i++)r[i].className=r[i].className.replace(t,"");document.getElementById(n).className+=" "+t},switchTab.prototype.showFirstFn=function(e){var t=e.showFirst,n=e.tabClass,r=e.activeClass,i=e.contentId;e.activeColor(n,r,t),e.fetchContent(e.getUrl(t),i)}