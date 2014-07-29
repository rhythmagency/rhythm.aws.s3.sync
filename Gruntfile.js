/**
 * Usage:
 * $ grunt download --bucket=NAME_OF_S3_BUCKET
 *
 * Optional:
 * $ grunt download --bucket=NAME_OF_S3_BUCKET --overwrite=no
 */
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        'download-s3-bucket': {
            options: {
                bucket: grunt.option('bucket') || '',
                overwrite: (grunt.option('overwrite') || 'yes').toLowerCase()
            },
            build: {
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-download-s3-bucket');

    grunt.registerTask('download', ['download-s3-bucket']);

};
