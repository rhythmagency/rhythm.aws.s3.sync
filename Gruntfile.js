/*
 * grunt-rhythm-aws-s3-sync
 * https://github.com/rhythmagency/rhythm.aws.s3.sync
 *
 * Copyright (c) 2014 CJ Hanson at Rhythm
 * Licensed under the MIT license.
 */
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        'download-s3-bucket': {
            'download': {
                options: {
                    bucket: grunt.option('bucket') || '',
                    overwrite: grunt.option('overwrite'),
                    'remote-src': grunt.option('remote-src') || '/',
                    'local-dst': grunt.option('local-dst') || '.'
                }
            }
        },
        'upload-s3-bucket': {
            'upload': {
                options: {
                    bucket: grunt.option('bucket') || '',
                    overwrite: grunt.option('overwrite'),
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

    grunt.loadTasks('tasks');
};
