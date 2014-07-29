/**
 *
 * See README.md for usage
 *
 */
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        'download-s3-bucket': {
            options: {
                bucket: grunt.option('bucket') || '',
                overwrite: (grunt.option('overwrite') || 'no').toLowerCase()
            },
            build: {
            }
        }
    });

    grunt.registerTask('download', ['download-s3-bucket']);

    grunt.loadTasks(__dirname + '/tasks');
};
