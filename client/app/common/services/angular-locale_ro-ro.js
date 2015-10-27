// https://code.angularjs.org/1.0.8/i18n/angular-locale_ro-ro.js
// ultima varianta este aici (dar nu ai nevoie) https://raw.githubusercontent.com/angular/angular.js/master/src/ngLocale/angular-locale_ro-ro.js

// practic ca sa ai localizare in calendarul din AngularUI e suficient sa adaugi acest fisier. Detalii aici: http://stackoverflow.com/a/19676300

// jshint ignore: start
'use strict';
angular.module('ngLocale', [], ['$provide', function($provide) {
var PLURAL_CATEGORY = {ZERO: 'zero', ONE: 'one', TWO: 'two', FEW: 'few', MANY: 'many', OTHER: 'other'};
$provide.value('$locale', {
  'DATETIME_FORMATS': {
    'AMPMS': [
      'AM',
      'PM'
    ],
    'DAY': [
      'duminic\u0103',
      'luni',
      'mar\u021bi',
      'miercuri',
      'joi',
      'vineri',
      's\u00e2mb\u0103t\u0103'
    ],
    'MONTH': [
      'ianuarie',
      'februarie',
      'martie',
      'aprilie',
      'mai',
      'iunie',
      'iulie',
      'august',
      'septembrie',
      'octombrie',
      'noiembrie',
      'decembrie'
    ],
    'SHORTDAY': [
      'Du',
      'Lu',
      'Ma',
      'Mi',
      'Jo',
      'Vi',
      'S\u00e2'
    ],
    'SHORTMONTH': [
      'ian.',
      'feb.',
      'mar.',
      'apr.',
      'mai',
      'iun.',
      'iul.',
      'aug.',
      'sept.',
      'oct.',
      'nov.',
      'dec.'
    ],
    'fullDate': 'EEEE, d MMMM y',
    'longDate': 'd MMMM y',
    'medium': 'dd.MM.yyyy HH:mm:ss',
    'mediumDate': 'dd.MM.yyyy',
    'mediumTime': 'HH:mm:ss',
    'short': 'dd.MM.yyyy HH:mm',
    'shortDate': 'dd.MM.yyyy',
    'shortTime': 'HH:mm'
  },
  'NUMBER_FORMATS': {
    'CURRENCY_SYM': 'RON',
    'DECIMAL_SEP': ',',
    'GROUP_SEP': '.',
    'PATTERNS': [
      {
        'gSize': 3,
        'lgSize': 3,
        'macFrac': 0,
        'maxFrac': 3,
        'minFrac': 0,
        'minInt': 1,
        'negPre': '-',
        'negSuf': '',
        'posPre': '',
        'posSuf': ''
      },
      {
        'gSize': 3,
        'lgSize': 3,
        'macFrac': 0,
        'maxFrac': 2,
        'minFrac': 2,
        'minInt': 1,
        'negPre': '-',
        'negSuf': '\u00a0\u00a4',
        'posPre': '',
        'posSuf': '\u00a0\u00a4'
      }
    ]
  },
  'id': 'ro-ro',
  'pluralCat': function (n) {  if (n == 1) {   return PLURAL_CATEGORY.ONE;  }  if (n == 0 || n != 1 && n == (n | 0) && n % 100 >= 1 && n % 100 <= 19) {   return PLURAL_CATEGORY.FEW;  }  return PLURAL_CATEGORY.OTHER;}
});
}]);