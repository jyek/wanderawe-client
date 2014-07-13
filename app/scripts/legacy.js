'use strict';

(function () {
  /* http://stackoverflow.com/questions/13478303/correct-way-to-use-modernizr-to-detect-ie */
  /* http://stackoverflow.com/questions/503093/how-can-i-make-a-redirect-page-in-jquery-javascript */
  var BrowserDetect = {
    init: function () {
      this.browser = this.searchString(this.dataBrowser) || 'Other';
      this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || 'Unknown';
    },

    searchString: function (data) {
      for (var i = 0; i < data.length; i += 1) {
        var dataString = data[i].string;
        this.versionSearchString = data[i].subString;
        if (dataString.indexOf(data[i].subString) !== -1) {
          return data[i].identity;
        }
      }
    },

    searchVersion: function (dataString) {
      var index = dataString.indexOf(this.versionSearchString);
      if (index === -1) { return; }
      return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
    },

    dataBrowser: [
      { string: navigator.userAgent, subString: 'Chrome',  identity: 'Chrome' },
      { string: navigator.userAgent, subString: 'MSIE',    identity: 'Explorer' },
      { string: navigator.userAgent, subString: 'Firefox', identity: 'Firefox' },
      { string: navigator.userAgent, subString: 'Safari',  identity: 'Safari' },
      { string: navigator.userAgent, subString: 'Opera',   identity: 'Opera' }
    ]
  };

  BrowserDetect.init();

  if (BrowserDetect.browser === 'Explorer' && BrowserDetect.version <= 9) {
    window.location.replace('http://www.wanderawe.com/legacy');
  }
})();