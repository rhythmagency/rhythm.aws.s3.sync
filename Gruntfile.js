/**
 * Usage:
 * $ grunt download --bucket=NAME_OF_S3_BUCKET
 *
 * Optional:
 * $ grunt download --bucket=NAME_OF_S3_BUCKET --overwrite=yes
 *
 * This reads Amazon credentials from ./awsconfig.json and falls back to ~/.aws/credentials
 *
 * EXAMPLE awsconfig.json
 {
   "accessKeyId": "ACCESS_KEY_ID",
   "secretAccessKey": "SECRET_ACCESS_KEY"
 }
 *
 * EXAMPLE ~/.aws/credentials
 [default]
 aws_access_key_id = ACCESS_KEY_ID
 aws_secret_access_key = SECRET_ACCESS_KEY
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

    grunt.loadNpmTasks('grunt-contrib-download-s3-bucket');

    grunt.registerTask('download', ['download-s3-bucket']);

};
