Synchronize files with S3.

#### Example Gruntfile.js

    module.exports = function(grunt) {
        //Register the tasks from the rhythm.aws.s3.sync Gruntfile
        var s3Sync = require('rhythm.aws.s3.sync/Gruntfile.js');
        s3Sync(grunt);
        
        //Continue normal configuration
        grunt.config.data.pkg = grunt.file.readJSON('package.json');
        grunt.initConfig(grunt.config.data);
    };

#### Usage:

    $ grunt download --bucket=NAME_OF_S3_BUCKET
    $ grunt upload --bucket=NAME_OF_S3_BUCKET --files=REL_PATH_DEFAULT_IS_CURRENT_PATH

#### Optionally overwrite files:

    $ grunt download --bucket=NAME_OF_S3_BUCKET --overwrite=yes
    $ grunt upload --bucket=NAME_OF_S3_BUCKET --files=REL_PATH_DEFAULT_IS_CURRENT_PATH --overwrite=yes
    
#### Clean up aborted uploads: (Amazon charges you storage even for parts of files uploaded and abandoned)

    $ grunt clear-upload --bucket=NAME_OF_S3_BUCKET

### Amazon credentials are read from ./awsconfig.json with a fallback to ~/.aws/credentials

#### Example awsconfig.json

    {
        "accessKeyId": "ACCESS_KEY_ID",
        "secretAccessKey": "SECRET_ACCESS_KEY"
    }

#### Example ~/.aws/credentials

    [default]
    aws_access_key_id = ACCESS_KEY_ID
    aws_secret_access_key = SECRET_ACCESS_KEY