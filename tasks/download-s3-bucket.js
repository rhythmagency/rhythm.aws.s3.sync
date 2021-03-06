/*
 * Copyright (c) 2014 CJ Hanson at Rhythm
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs-extra');
var path = require('path');
var AWS = require('aws-sdk');
var Uuid = require('node-uuid');

module.exports = function(grunt) {
    grunt.registerMultiTask('download-s3-bucket', 'Download bucket from Amazon S3', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            bucket: '',
            overwrite: false,
            'remote-src': '',
            'local-dst': '.'
        });

        //remove preceding slash
        options['remote-src'] = options['remote-src'].replace(/^\/+/,'');
        fs.ensureDirSync(options['local-dst']);

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
                fs.removeSync('s3-tmp');
                done(allTasksOK);
            }
        };

        var processObjectList = function(params, data, err){
            if (err) {
                grunt.log.error(err, err.stack);
                completeTask(false);
            }else {
                if(data.IsTruncated && data.Contents.length > 0){
                    var subParams = params;
                    subParams.Marker = data.Contents[data.Contents.length -1].Key;

                    addTask();
                    s3.listObjects(subParams, function(err, data) {
                        processObjectList(subParams, data, err);
                    });
                }

                data.Contents.forEach(function(element, index, array){

                    if(options['remote-src'].length > 0){

                        var relativePath = path.relative(element.Key, options['remote-src']);
                        if(relativePath.substr(0, 2) == '..' && relativePath.substr(-2, 2) == '..'){
                            //include
                        }else{
                            //skip, not in specified remote src folder
                            return;
                        }
                    }

                    var localRelKeyPath = element.Key;
                    if(options['remote-src'].length > 0) {
                        var rmIdx = element.Key.indexOf(options['remote-src']);
                        localRelKeyPath = element.Key.substr(rmIdx + options['remote-src'].length+1);
                    }

                    var localPath = path.join(options['local-dst'], localRelKeyPath);

                    var params = {Bucket: options.bucket, Key: element.Key};
                    var remoteLastModified = element.LastModified;

                    if(path.extname(element.Key) == ''){
                        //no need to deal with directory keys because we are using ensureFile below
                        return;
                    }else{
                        var skipDownload = false;
                        var fileExists = fs.existsSync(localPath);
                        if(fileExists){
                            var stat = fs.statSync(localPath);
                            if(stat.size == 0){
                                fs.removeSync(localPath);
                            }else {
                                if (!options.overwrite) {
                                    skipDownload = true;
                                } else {
                                    params.IfModifiedSince = stat.mtime;
                                }
                            }
                        }

                        if(skipDownload){
                            return;
                        }else{
                            var timestamp = new Date();
                            timestamp.setYear(timestamp.getYear()-10);

                            var uuid = Uuid.v1();
                            var tmpPath = 's3-tmp/'+uuid;
                            fs.ensureDirSync('s3-tmp');
                            fs.ensureFileSync(tmpPath);
                            var stream = fs.createWriteStream(tmpPath);
                            var downloadSuccess = false;
                            var statusCode = 0;
                            stream.on('finish', function() {
                                if(downloadSuccess){
                                    fs.ensureFileSync(localPath);

                                    //copy temp file to our destination
                                    fs.copySync(stream.path, localPath);

                                    //Write the remote timestamp to our local file
                                    fs.utimesSync(localPath, remoteLastModified, remoteLastModified);

                                    var stat = fs.statSync(localPath);
                                    if(stat.size == 0){
                                        grunt.verbose.writeln('Wrote 0 byte file ', localPath);

                                        stat = fs.statSync(stream.path);
                                        grunt.verbose.writeln('Tmp file was '+stat.size+' bytes.');
                                    }

                                    grunt.verbose.writeln('Removing temp file ', stream.path);
                                    fs.removeSync(stream.path);

                                    grunt.log.ok(localPath);
                                    completeTask(true);
                                }else{
                                    fs.removeSync(stream.path);

                                    if(fileExists && statusCode == 304){
                                        grunt.verbose.writeln('Skipped not modified ', localPath);
                                        completeTask(true);
                                    }else{
                                        grunt.log.error("s3.getObject() "+element.Key, statusCode);
                                        completeTask(false);
                                    }
                                }
                            });

                            addTask();
                            s3.getObject(params)
                                .on('httpData', function(chunk) {
                                    stream.write(chunk);
                                })
                                .on('httpDone', function() {
                                    //Always runs regardless of success/error. And runs before success/error
                                })
                                .on('success', function(response) {
                                    downloadSuccess = true;
                                    stream.end();
                                })
                                .on('error', function(response) {
                                    statusCode = response.statusCode;
                                    downloadSuccess = false;
                                    stream.end();
                                })
                                .send();
                        }
                    }
                });

                completeTask(true);
            }
        };

        var params = {
            Bucket: options.bucket, // required
            Delimiter: '',
            //EncodingType: 'url',
            Marker: '',
            MaxKeys: 100,
            Prefix: ''
        };

        addTask();
        s3.listObjects(params, function(err, data) {
            processObjectList(params, data, err);
        });
    });
};
