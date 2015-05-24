'use strict';

module.exports = function () {
  var args = JSON.stringify(Array.prototype.slice.call(arguments, 1)).replace(/"/gi, '&quot;');
  return '<span data-args="' + args + '" data-translatable="' + arguments[0] + '">' + i18n.t.apply(i18n, arguments) + '</span>';
};

module.exports.update = function (lang) {
  i18n.setLng(lang);
  $('[data-translatable]').each(function (i, item) {
    var key = item.dataset.translatable;
    var args = [key].concat(JSON.parse(item.dataset.args));
    $(item).html( i18n.t.apply(i18n, args));
  });
};

module.exports.init = function () {
  i18n.init({
    'useLocalStorage': true,
    'fallbackLng': 'en-CA',
    'supportedLngs': ['en-CA', 'fr-CA'],
    'lngWhitelist': ['en-CA', 'fr-CA']
  });
};

module.exports.load = function (items) {
  Object.keys(items).forEach(function (key) {
    i18n.addResources(key, 'translation', items[key]);
  });
};
