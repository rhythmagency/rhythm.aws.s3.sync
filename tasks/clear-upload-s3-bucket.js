/*
 * Copyright (c) 2014 CJ Hanson at Rhythm
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var AWS = require('aws-sdk');

module.exports = function(grunt) {
    grunt.registerMultiTask('clear-upload-s3-bucket', 'Clear partially uploaded files from Amazon S3 bucket', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            bucket: ''
        });

        console.log(options);

        if(fs.existsSync('./awsconfig.json'))
            AWS.config.loadFromPath('./awsconfig.json');

        console.log(AWS.config.credentials);

        var s3 = new AWS.S3();

        var done = this.async();
        var taskCount = 0;
        var allTasksOK = true;

        var addTask = function(){
            ++taskCount;
        };

        var completeTask = function(allOK){
            if(!allOK)
                allTasksOK = false;

            --taskCount;

            if(taskCount == 0){
                console.log('All done '+allTasksOK);
                done(allTasksOK);
            }
        };

        addTask();
        var params = {
            Bucket: options.bucket // required
//            Delimiter: 'STRING_VALUE',
//            EncodingType: 'url',
//            KeyMarker: 'STRING_VALUE',
//            MaxUploads: 0,
//            Prefix: 'STRING_VALUE',
//            UploadIdMarker: 'STRING_VALUE'
        };
        s3.listMultipartUploads(params, function(err, data) {
            if(err){
                console.log('Error: listMultipartUploads()');
                console.log(err, err.stack);
                completeTask(false);
            }else{
                data.Uploads.forEach(function(element, index, array){
                    addTask();
                    var params = {
                        Bucket: options.bucket, // required
                        Key: element.Key, // required
                        UploadId: element.UploadId // required
                    };
                    s3.abortMultipartUpload(params, function(err, data) {
                        if(err){
                            console.log('Error: abortMultipartUpload()');
                            console.log(err, err.stack);
                            completeTask(false);
                        }else{
                            console.log('Removed uploaded part '+element.UploadId);
                            completeTask(true);
                        }
                    });
                });
                completeTask(true);
            }
        });
    });
};
