/**
 * Usage:
 * $ grunt --bucket=NAME_OF_S3_BUCKET
 */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'download-s3-bucket': {
      options: {
          bucket: grunt.option('bucket') || ''
      },
      build: {
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-download-s3-bucket');

  // Default task(s).
  grunt.registerTask('default', ['download-s3-bucket']);

};
