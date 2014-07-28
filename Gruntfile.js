/**
 * Usage:
 * $ grunt --bucket=NAME_OF_S3_BUCKET
 */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'download-media-s3': {
      options: {
          bucket: grunt.option('bucket') || ''
      },
      build: {
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-download-media-s3');

  // Default task(s).
  grunt.registerTask('default', ['download-media-s3']);

};
