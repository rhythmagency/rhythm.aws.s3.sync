# grunt-rhythm-aws-s3-sync v0.1.5
> Sync with Amazon S3 bucket

[![build status](https://travis-ci.org/rhythmagency/rhythm.aws.s3.sync.png?branch=master)](https://travis-ci.org/rhythmagency/rhythm.aws.s3.sync)
[![downloads per month](http://img.shields.io/npm/dm/grunt-rhythm-aws-s3-sync.svg)](https://www.npmjs.org/package/grunt-rhythm-aws-s3-sync)



## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-rhythm-aws-s3-sync --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-rhythm-aws-s3-sync');
```


## Amazon Credentials
> Credentials are read from `./awsconfig.json` with a fallback to `~/.aws/credentials`

#### `awsconfig.json`
```json
{
    "accessKeyId": "ACCESS_KEY_ID",
    "secretAccessKey": "SECRET_ACCESS_KEY"
}
```

#### `~/.aws/credentials`
```ini
[default]
aws_access_key_id = ACCESS_KEY_ID
aws_secret_access_key = SECRET_ACCESS_KEY
```


## Download task
_Run this task with the `grunt download-s3-bucket` command._

### Options

#### bucket

Type: `String`

S3 bucket name.


#### overwrite

Type: `Boolean`  
Default: `false`

Allow overwriting of local files.

#### local-dst
Type: `String`  
Default: `.`

Local destination to download files to.



### Examples

#### Example config

```javascript
grunt.initConfig({
  'download-s3-bucket': {              // Task
    'download': {                      // Target
      options: {                       // Target options
        bucket: 'S3_BUCKET_NAME',
        overwrite: true
      }
    }
  }
});

grunt.loadNpmTasks('grunt-rhythm-aws-s3-sync');

grunt.registerTask('default', ['download-s3-bucket']);
```


## Upload task
_Run this task with the `grunt upload-s3-bucket` command._

### Options

#### bucket

Type: `String`

S3 bucket name.


#### overwrite

Type: `Boolean`  
Default: `false`

Allow overwriting of remote files.


#### files

Type: `String`  
Default: `.`

Path to folder to upload.

### Examples

#### Example config

```javascript
grunt.initConfig({
  'upload-s3-bucket': {                // Task
    'upload': {                        // Target
      options: {                       // Target options
        bucket: 'S3_BUCKET_NAME',
        overwrite: false,
        files: 'media'
      }
    }
  }
});

grunt.loadNpmTasks('grunt-rhythm-aws-s3-sync');

grunt.registerTask('default', ['upload-s3-bucket']);
```


## Clear Abandoned Uploads task
######_(Amazon charges you storage even for parts of files uploaded and abandoned)_
_Run this task with the `grunt clear-upload-s3-bucket` command._

### Options

#### bucket

Type: `String`

S3 bucket name.

### Examples

#### Example config

```javascript
grunt.initConfig({
  'clear-upload-s3-bucket': {          // Task
    'clear-upload': {                  // Target
      options: {                       // Target options
        bucket: 'S3_BUCKET_NAME'
      }
    }
  }
});

grunt.loadNpmTasks('grunt-rhythm-aws-s3-sync');

grunt.registerTask('default', ['upload-s3-bucket']);
```
