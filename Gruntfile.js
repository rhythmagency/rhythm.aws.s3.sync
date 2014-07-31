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
            'download': {
                options: {
                    bucket: grunt.option('bucket') || '',
                    overwrite: (grunt.option('overwrite') || 'no').toLowerCase()
                }
            }
        },
        'upload-s3-bucket': {
            'upload': {
                options: {
                    bucket: grunt.option('bucket') || '',
                    overwrite: (grunt.option('overwrite') || 'no').toLowerCase(),
                    files: grunt.option('files') || '.'
                }
            }
        },
        'clear-upload-s3-bucket': {
            'clear-upload': {
                options: {
                    bucket: grunt.option('bucket') || ''
                }
            }
        }
    });

    grunt.registerTask('download', ['download-s3-bucket']);
    grunt.registerTask('upload', ['upload-s3-bucket']);
    grunt.registerTask('clear-upload', ['clear-upload-s3-bucket']);

    grunt.loadTasks(__dirname + '/tasks');
};
