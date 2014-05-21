module.exports = function(config){
  config.set({
    basePath : '../',

    files : [
      'app/bower_components/angular/angular.js',
      'app/bower_components/jquery/jquery.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-ui-router/release/angular-ui-router.js',
      'app/scripts/app.js',
      'app/scripts/**/*.js',
      'app/tests/unit/**/*.js'
    ],

    exclude : [],

    autoWatch : true,

    frameworks: ['mocha', 'chai'],

    browsers : ['Chrome'],

    plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-script-launcher',
            'karma-jasmine',
            'karma-mocha',
            'karma-chai-plugins'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }
  });
};
