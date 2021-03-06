/**
 * Created by rtholmes on 2016-10-04.
 */

import fs = require('fs');
import Log from "../src/Util";
import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import {QueryRequest} from "../src/controller/QueryController";

describe("InsightFacade", function () {

    var jsonZip: string = null;
    var htmlZip: string = null;
    var randomZip: string = null;
    var facade: InsightFacade = null;

    before(function () {
        Log.info('InsightController::before() - start');
        // this zip might be in a different spot for you
        jsonZip = new Buffer(fs.readFileSync('310courses.1.0.zip')).toString('base64');
        htmlZip = new Buffer(fs.readFileSync('310rooms.1.1.zip')).toString('base64');
        randomZip = new Buffer(fs.readFileSync('classes12.zip')).toString('base64');
        try {
            // what you delete here is going to depend on your impl, just make sure
            // all of your temporary files and directories are deleted
            fs.unlinkSync('./data/courses.json');
            fs.unlinkSync('./data/rooms.json');

        } catch (err) {
            // silently fail, but don't crash; this is fine
            Log.warn('InsightController::before() - courses.json or rooms. json not removed (probably not present)');
        }
        Log.info('InsightController::before() - done');
    });

    beforeEach(function () {
        facade = new InsightFacade();
    });

    it("Should be able to add a new HTML dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('rooms', htmlZip).then(function (response: InsightResponse) {
            console.log('response code is ' + response.code);
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to add a new JSON dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('courses', jsonZip).then(function (response: InsightResponse) {
            console.log(response.code);
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });

    });

    it('adding an undefined dataset could return a 400 error', function() {
        var that = this;
        var empty = undefined;
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('courses', empty).then(function (response: InsightResponse) {
            console.log('failed');
            expect.fail();
        }).catch(function (response: InsightResponse) {
            console.log('failed ' + response.code);
            expect(response.code).to.equal(400);
        });

    });

    it('adding an invalid zip should give a 400 error', function() {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('courses', randomZip).then(function (response: InsightResponse) {
            console.log('failed');
            expect.fail();
        }).catch(function (response: InsightResponse) {
            console.log('failed ' + response.code);
            expect(response.code).to.equal(400);
        });

    });

    it('adding an invalid dataset should return a 400 error', function() {
        var that = this;
        var empty = 'abdksbf';
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('courses', empty).then(function (response: InsightResponse) {
            console.log(response.code);
            expect.fail();
        }).catch(function (response: InsightResponse) {
            console.log('failed ' + response.code);
            expect(response.code).to.equal(400);
        });

    });

    it("Should be able to update an html existing dataset (201)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
       facade.addDataset('roomsRepeat', htmlZip).then(function() {
             facade.addDataset('roomsRepeat', htmlZip).then(function (response: InsightResponse) {
                 console.log(response.code);
                expect(response.code).to.equal(201);
            }).catch(function (response: InsightResponse) {
                expect.fail('Should not happen');
            });
        });
    });

    it("Should be able to update an JSON existing dataset (201)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
       facade.addDataset('coursesRepeat', jsonZip).then(function() {
            facade.addDataset('coursesRepeat', jsonZip).then(function (response: InsightResponse) {
                console.log(response.code);
                expect(response.code).to.equal(201);
            }).catch(function (response: InsightResponse) {
                expect.fail('Should not happen');
            });
        });
    });


    it("Should be able to add courses then rooms dataset 204", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('courses', jsonZip).then(function() {
            facade.addDataset('rooms', htmlZip).then(function (response: InsightResponse) {
                console.log(response.code);
                expect(response.code).to.equal(204);
            }).catch(function (response: InsightResponse) {
                expect.fail('Should not happen');
            });
        });
    });

    it("Should be able to successfully answer a query (200)", function () {
        var that = this;
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"GT": {"courses_avg": 90}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('courses', jsonZip).then(function() {
             facade.performQuery(query).then(function (response: InsightResponse) {
                console.log(response.code);
                expect(response.code).to.equal(200);
            }).catch(function (response: InsightResponse) {
                expect.fail('Should not happen');
            });
        });

    });

    it("Should fail to query because it depends on a resource that has not been PUT (424)", function () {
        var that = this;
        let query: QueryRequest = {
            "GET": ["foo_dept", "foo_avg"],
            "WHERE": {"GT": {"foo_avg": 90}},
            "ORDER": "foo_avg",
            "AS": "TABLE"
        };
        Log.trace("Starting test: " + that.test.title);
        facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            console.log('test failed');
            expect(response.code).to.equal(424);
        });
    });

    it("Should give (424) GET", function () {
        var that = this;
        let query: QueryRequest = {
            "GET": ["foo_dept", "foo_avg"],
            "WHERE": {"GT": {"courses_avg": 90}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        Log.trace("Starting test: " + that.test.title);
        facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            console.log('test failed');
            expect(response.code).to.equal(424);
        });
    });

    it("424 error", function () {
        var that = this;
        let query: QueryRequest = {
            "GET": ["courses_id", "courses_dept", "courses_avg"],
            "WHERE": {
                "OR": [

                    {"IS": {"foo_dept": "adhe"}}
                    ,
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        Log.trace("Starting test: " + that.test.title);
        facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        });
    });

    it("424 error for nested query", function () {
        var that = this;
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"foo_dept": "adhe"}}
                    ]},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        Log.trace("Starting test: " + that.test.title);
       facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        });
    });

    it("424 error for rooms query", function () {
        var that = this;
        let query: QueryRequest = {
            "GET": ["rooms_fullname", "rooms_number", "rooms_seats"],
            "WHERE": {"AND": [
                {"GT": {"rooms_lat": 49.261292}},
                {"LT": {"rooms_lon": -123.245214}},
                {"LT": {"rooms_lat": 49.262966}},
                {"GT": {"oms_lon": -123.249886}},
                {"IS": {"rooms_furniture": "*Movable Tables*"}}
            ]},
            "ORDER": { "dir": "UP", "keys": ["rooms_number"]},
            "AS": "TABLE"
        };
        Log.trace("Starting test: " + that.test.title);
        facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
            console.log(response.code);
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        });
    });



    it("give 200", function () {
        var that = this;
        let query: QueryRequest = {
            "GET": ["courses_id", "courses_dept", "courses_avg"],
            "WHERE": {
                "OR": [

                    {"IS": {"courses_dept": "adhe"}}
                    ,
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        Log.trace("Starting test: " + that.test.title);
        facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });



    it("Should fail to delete a dataset that has not been PUT (404)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
       facade.removeDataset('randomCourse').then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(404);
        });
    });


    it("Should be able to successfully answer a html  (200)", function () {
        var that = this;
        let query: QueryRequest = {
            "GET": ["rooms_shortname", "numRooms"],
            "WHERE": {"GT": {"rooms_seats": 160}},
            "GROUP": [ "rooms_shortname" ],
            "APPLY": [ {"numRooms": {"COUNT": "rooms_name"}} ],
            "AS": "TABLE"
        };
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('rooms', htmlZip).then(function() {
            facade.performQuery(query).then(function (response: InsightResponse) {
                console.log(response.code);
                expect(response.code).to.equal(200);
            }).catch(function (response: InsightResponse) {
                expect.fail('Should not happen');
            });
        });
    });

});