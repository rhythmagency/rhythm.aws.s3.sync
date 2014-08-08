/*
 * Copyright (c) 2014 CJ Hanson at Rhythm
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var AWS = require('aws-sdk');

module.exports = function(grunt) {
    grunt.registerMultiTask('upload-s3-bucket', 'Upload files to Amazon S3 bucket', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            bucket: '',
            overwrite: false,
            files: '.'
        });

        if(fs.existsSync('./awsconfig.json')) {
            grunt.verbose.writeln('Loading credentials from awsconfig.json');
            AWS.config.loadFromPath('./awsconfig.json');
        }else{
            grunt.verbose.writeln('Loading credentials from ~/.aws/credentials');
        }

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
                grunt.log.ok('All done '+allTasksOK);
                done(allTasksOK);
            }
        };

        var processFiles = function(base, files){
            files.forEach(function(element, index, array){
                if(element.substr(0, 1) == '.'){
                    //skip hidden files
                }else{
                    var fullPath = path.join(base, element);
                    var stat = fs.statSync(fullPath);
                    if(stat.isDirectory()){
                        addTask();
                        fs.readdir(fullPath, function(err, files){
                            if(err){
                                grunt.log.error('readdir() '+fullPath);
                                grunt.log.debug(err, err.stack);
                                completeTask(false);
                            }else{
                                processFiles(fullPath, files);
                            }
                        });
                    }else{
                        if(!options.overwrite){
                            addTask();
                            var params = {
                                Bucket: options.bucket, // required
                                Key: fullPath // required
                            };
                            s3.headObject(params, function(err, data) {
                                if(err){
                                    if(err.statusCode == 404){
                                        uploadFile(fullPath);
                                        completeTask(true);
                                    }else{
                                        completeTask(true);
                                    }
                                }else{
                                    //object exists
                                    completeTask(true);
                                }
                            });
                        }else{
                            uploadFile(fullPath);
                        }
                    }
                }
            });

            completeTask(true);
        };

        var uploadFile = function(fullPath){
            addTask();

            var params = {
                Bucket: options.bucket, // required
                Key: fullPath, // required
//                ACL: 'public-read | bucket-owner-full-control',//'private | public-read | public-read-write | authenticated-read | bucket-owner-read | bucket-owner-full-control',
//                CacheControl: 'STRING_VALUE',
//                ContentDisposition: 'STRING_VALUE',
//                ContentEncoding: 'STRING_VALUE',
//                ContentLanguage: 'STRING_VALUE',
//                ContentType: 'STRING_VALUE',
//                Expires: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
//                GrantFullControl: 'STRING_VALUE',
//                GrantRead: 'STRING_VALUE',
//                GrantReadACP: 'STRING_VALUE',
//                GrantWriteACP: 'STRING_VALUE',
//                Metadata: {
//                    someKey: 'STRING_VALUE',
//                    // anotherKey: ...
//                },
//                SSECustomerAlgorithm: 'STRING_VALUE',
//                SSECustomerKey: 'STRING_VALUE',
//                SSECustomerKeyMD5: 'STRING_VALUE',
//                ServerSideEncryption: 'AES256',
                StorageClass: 'STANDARD'
//                WebsiteRedirectLocation: 'STRING_VALUE'
            };
            s3.createMultipartUpload(params, function(err, data) {
                if(err){
                    grunt.log.error('createMultipartUpload() '+fullPath);
                    grunt.log.debug(err, err.stack);
                    completeTask(false);
                }else{
                    addTask();
                    var uploadID = data.UploadId;
                    var readStream = fs.createReadStream(fullPath, {flags:'r', autoClose:true});
                    var params = {
                        Bucket: options.bucket, // required
                        Key: fullPath, // required
                        PartNumber: 1, // required
                        UploadId: uploadID, // required
                        Body: readStream
//                        ContentLength: 0,
//                        ContentMD5: 'STRING_VALUE',
//                        SSECustomerAlgorithm: 'STRING_VALUE',
//                        SSECustomerKey: 'STRING_VALUE',
//                        SSECustomerKeyMD5: 'STRING_VALUE'
                    };
                    s3.uploadPart(params, function(err, data) {
                        if(err){
                            grunt.log.error('uploadPart()');
                            grunt.log.debug(err, err.stack);

                            addTask();
                            var params = {
                                Bucket: options.bucket, // required
                                Key: fullPath, // required
                                UploadId: uploadID // required
                            };
                            s3.abortMultipartUpload(params, function(err, data) {
                                if(err){
                                    grunt.log.error('abortMultipartUpload()');
                                    grunt.log.debug(err, err.stack);
                                    completeTask(false);
                                }else{
                                    grunt.log.debug('Aborted upload OK '+fullPath);
                                    completeTask(true);
                                }
                            });

                            completeTask(false);
                        }else{
                            addTask();
                            var params = {
                                Bucket: options.bucket, // required
                                Key: fullPath, // required
                                UploadId: uploadID, // required
                                MultipartUpload: {
                                    Parts: [
                                        {
                                            ETag: data.ETag,
                                            PartNumber: 1
                                        }
                                    ]
                                }
                            };
                            s3.completeMultipartUpload(params, function(err, data) {
                                if(err){
                                    grunt.log.error('completeMultipartUpload()');
                                    grunt.log.error(err, err.stack);
                                    completeTask(false);
                                }else{
                                    grunt.log.ok('Uploaded '+fullPath);
                                    completeTask(true);
                                }
                            });
                            completeTask(true);
                        }
                    });

                    completeTask(true);
                }
            });
        };

        addTask();
        var fullPath = options.files;
        fs.readdir(fullPath, function(err, files){
            if(err){
                grunt.log.error('readdir() '+fullPath);
                grunt.log.debug(err, err.stack);
                completeTask(false);
            }else{
                processFiles(fullPath, files);
            }
        });
    });
};
