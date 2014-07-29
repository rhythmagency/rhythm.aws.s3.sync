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
            overwrite: 'no',
            files: '.'
        });

        console.log(options);

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
                                console.log(err, err.stack);
                                completeTask(false);
                            }else{
                                processFiles(fullPath, files);
                            }
                        });
                    }else{
                        console.log(fullPath);
                    }
                }
            });

            completeTask(true);
        };

        addTask();
        var fullPath = options.files;
        fs.readdir(fullPath, function(err, files){
            if(err){
                console.log(err, err.stack);
                completeTask(false);
            }else{
                processFiles(fullPath, files);
            }
        });
    });
};
