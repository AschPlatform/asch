module.exports = function(config) {
  config.set({
    basePath: '',
    files: [
      // Defined by gulp
    ],
    frameworks: ['jasmine'],
    singleRun: true,
    browsers: [ 'Chrome' ]
  });
};