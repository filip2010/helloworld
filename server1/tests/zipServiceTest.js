var request = require('supertest')
    , should = require('should')
    , fs = require('fs')
    , rimraf = require('rimraf')
    , zip = require('../services/zipService.js');


describe('Zip Service Tests', function () {

    afterEach(function (done) {
        rimraf('./server/tests/zipTest', function (e) {
            done();
            if (e) console.log(e);
        });
    });

    beforeEach(function (done) {
        fs.mkdir('./server/tests/zipTest', function (err) {
            done();
        });
    })

    describe('1. Create a zip of a dir', function () {

        it('1.1 should create a zip file in the desired path', function (done) {
            fs.readdir('./server/tests/zipTest', function (err, files) {
                files.should.be.empty;
                fs.writeFile('./server/tests/zipTest/echo.txt', "test", function (err) {
                    zip.createZip('./server/tests/zipTest/', './server/tests/zipTest/test.zip', null, null, function (err) {
                        zip.unzipAndKeepZip('./server/tests/zipTest/test.zip', './server/tests/zipTest/', function (err) {
                            fs.readdir('./server/tests/zipTest', function (err, files) {
                                files.length.should.be.equal(2);
                                done();
                            });
                        })
                    })
                })
            });
        });

        it('1.2 should fail when trying to unzip a file that does not exists', function (done) {
            zip.unzipAndKeepZip('./server/tests/zipTest/test.zip', './server/tests/zipTest/', function (err) {
                err.should.be.ok;
                done();
            });
        });

        it('1.3 should create a zip from a specified list files', function (done) {
            fs.writeFile('./server/tests/zipTest/echo.txt', "test", function (err) {
                fs.writeFile('./server/tests/zipTest/echo1.txt', "blah", function (err) {
                    var arr = [
                        {name: 'echo.txt', path: './server/tests/zipTest/echo.txt'},
                        {name: 'echo1.txt', path: './server/tests/zipTest/echo1.txt'}
                    ];
                    zip.createZip(null, './server/tests/zipTest/test.zip', arr, null, function (err) {
                        zip.unzipAndKeepZip('./server/tests/zipTest/test.zip', './server/tests/zipTest/extract/', function (err) {
                            fs.readdir('./server/tests/zipTest/extract', function (err, files) {
                                files.length.should.be.equal(2);
                                done();
                            })
                        })
                    })
                })
            });
        });

        it('1.4 should not include files that are in the ignore list and are also in the specified files list', function (done) {
            fs.writeFile('./server/tests/zipTest/echo.txt', "test", function (err) {
                fs.writeFile('./server/tests/zipTest/echo1.txt', "blah", function (err) {
                    var arr = [
                        {name: 'echo.txt', path: './server/tests/zipTest/echo.txt'},
                        {name: 'echo1.txt', path: './server/tests/zipTest/echo1.txt'}
                    ];
                    var ignoreList = ['echo.txt'];
                    zip.createZip(null, './server/tests/zipTest/test.zip', arr, ignoreList, function (err) {
                        zip.unzipAndKeepZip('./server/tests/zipTest/test.zip', './server/tests/zipTest/extract/', function (err) {
                            fs.readdir('./server/tests/zipTest/extract', function (err, files) {
                                files.length.should.be.equal(1);
                                done();
                            })
                        })
                    })
                })
            });
        });

        it('1.5 should not allow ignore list to be an empty array', function (done) {
            fs.writeFile('./server/tests/zipTest/echo.txt', "test", function (err) {
                fs.writeFile('./server/tests/zipTest/echo1.txt', "blah", function (err) {
                    var arr = [
                        {name: 'echo.txt', path: './server/tests/zipTest/echo.txt'},
                        {name: 'echo1.txt', path: './server/tests/zipTest/echo1.txt'}
                    ];
                    var ignoreList = ['echo.txt'];
                    zip.createZip(null, './server/tests/zipTest/test.zip', arr, [], function (err) {
                        zip.unzipAndKeepZip('./server/tests/zipTest/test.zip', './server/tests/zipTest/extract/', function (err) {
                            fs.readdir('./server/tests/zipTest/extract', function (err, files) {
                                files.length.should.be.equal(2);
                                done();
                            })
                        })
                    })
                })
            });
        });

        it('1.6 should fail when there are no files to zip', function (done) {
            fs.writeFile('./server/tests/zipTest/echo.txt', "test", function (err) {
                fs.writeFile('./server/tests/zipTest/echo1.txt', "blah", function (err) {
                    var arr = [
                        {name: 'echo.txt', path: './server/tests/zipTest/echo.txt'},
                        {name: 'echo1.txt', path: './server/tests/zipTest/echo1.txt'}
                    ];
                    var ignoreList = ['echo.txt', 'echo1.txt'];
                    zip.createZip(null, './server/tests/zipTest/test.zip', arr, ignoreList, function (err) {
                        err.should.be.ok;
                        done();
                    })
                })
            })
        });

        it('1.7 should not include files from the ignore list that are in the dir files', function (done) {
            fs.writeFile('./server/tests/zipTest/echo.txt', "test", function (err) {
                fs.writeFile('./server/tests/zipTest/echo1.txt', "blah", function (err) {
                    var ignoreList = ['echo.txt'];
                    zip.createZip('./server/tests/zipTest/', './server/tests/zipTest/test.zip', null, ignoreList, function (err) {
                        zip.unzipAndKeepZip('./server/tests/zipTest/test.zip', './server/tests/zipTest/extract/', function (err) {
                            fs.readdir('./server/tests/zipTest/extract', function (err, files) {
                                files.length.should.be.equal(1);
                                done();
                            })
                        })
                    })
                })
            });
        });

        it('1.8 should fail if all files inside the dir were in the ignore list', function (done) {
            fs.writeFile('./server/tests/zipTest/echo.txt', "test", function (err) {
                fs.writeFile('./server/tests/zipTest/echo1.txt', "blah", function (err) {
                    var ignoreList = ['echo.txt', 'echo1.txt'];
                    zip.createZip('./server/tests/zipTest/', './server/tests/zipTest/test.zip', null, ignoreList, function (err) {
                        err.should.be.ok;
                        done();
                    })
                })
            });
        });

    });

});

