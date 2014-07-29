/*
 * Copyright (c) 2014 CJ Hanson at Rhythm
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var AWS = require('aws-sdk');

module.exports = function(grunt) {
    grunt.registerMultiTask('download-s3-bucket', 'Download bucket from Amazon S3', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            bucket: '',
            overwrite: 'no'
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

        var processObjectList = function(params, data, err){
            if (err) {
                console.log(err, err.stack);
                completeTask(false);
            }else {
                if(data.IsTruncated && data.Contents.length > 0){
                    params.Marker = data.Contents[data.Contents.length -1].Key;

                    addTask();

                    s3.listObjects(params, function(err, data) {
                        processObjectList(params, data, err);
                    });
                }

                for(var i = 0; i < data.Contents.length; ++i){
                    addTask();
                }

                data.Contents.forEach(function(element, index, array){
                    if(path.extname(element.Key) == ''){
                        if(!fs.existsSync(element.Key)) {
                            console.log('mkdir ' + element.Key);
                            fs.mkdirSync(element.Key);
                        }
                        completeTask(true);
                    }else{
                        var skipDownload = false;
                        if(options.overwrite != 'yes'){
                            if(fs.existsSync(element.Key)){
                                skipDownload = true;
                            }
                        }

                        if(skipDownload){
                            console.log('Skipping '+element.Key);
                            completeTask(true);
                        }else{
                            var params = {Bucket: options.bucket, Key: element.Key};
                            var file = fs.createWriteStream(element.Key);

                            s3.getObject(params)
                                .on('httpData', function(chunk) {
                                    file.write(chunk);
                                })
                                .on('httpDone', function() {
                                    file.end();
                                })
                                .on('success', function(response) {
                                    console.log("Success! "+element.Key);
                                    completeTask(true);
                                })
                                .on('error', function(response) {
                                    console.log("Error! "+element.Key);
                                    completeTask(false);
                                })
                                .send();
                        }
                    }
                });

                //console.log(data);
                completeTask(true);
            }
        };

        var params = {
            Bucket: options.bucket, // required
            Delimiter: '',
            //EncodingType: 'url',
            Marker: '',
            MaxKeys: 1000,
            Prefix: ''
        };

        addTask();

        s3.listObjects(params, function(err, data) {
            processObjectList(params, data, err);
        });
    });
};
