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

    var zipFileContents: string = null;
    var zipFileContents_room: string = null;
    var facade: InsightFacade = null;

    before(function () {
        Log.info('InsightController::before() - start');
        // this zip might be in a different spot for you
        zipFileContents = new Buffer(fs.readFileSync('310courses.1.0.zip')).toString('base64');
        zipFileContents_room = new Buffer(fs.readFileSync('310rooms.1.1.zip')).toString('base64');
        try {
            // what you delete here is going to depend on your impl, just make sure
            // all of your temporary files and directories are deleted
            fs.unlinkSync('./data/courses.json');
            fs.unlinkSync('./data/rooms.json');

        } catch (err) {
            // silently fail, but don't crash; this is fine
            Log.warn('InsightController::before() - courses.json not removed (probably not present)');
        }
        Log.info('InsightController::before() - done');
    });

    beforeEach(function () {
        facade = new InsightFacade();
    });


    it("Should be able to add a new HTML dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('rooms', zipFileContents_room).then(function (response: InsightResponse) {
            console.log('response code is ' + response.code);
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to add a new dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
            console.log(response.code);
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });

    });


    it("Should be able to update an existing dataset (201)", function () {
        var that = this;
        // that.timeout(5000);
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('repeatCourses', zipFileContents).then(function() {
             facade.addDataset('repeatCourses', zipFileContents).then(function (response: InsightResponse) {
                expect(response.code).to.equal(201);
            }).catch(function (response: InsightResponse) {
                expect.fail('Should not happen');
            });
        });
    });

    //
    // it("Should be able to add a new HTML dataset (204)", function () {
    //     var that = this;
    //     Log.trace("Starting test: " + that.test.title);
    //     return facade.addDataset('rooms', zipFileContents_room).then(function (response: InsightResponse) {
    //         console.log('response code is ' + response.code);
    //         expect(response.code).to.equal(204);
    //     }).catch(function (response: InsightResponse) {
    //         expect.fail('Should not happen');
    //     });
    // });


    it("Should be able to update an existing dataset (201)", function () {
        var that = this;
        // that.timeout(5000);
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('roomsRepeat', zipFileContents).then(function() {
             facade.addDataset('roomsRepeat', zipFileContents).then(function (response: InsightResponse) {
                expect(response.code).to.equal(201);
            }).catch(function (response: InsightResponse) {
                expect.fail('Should not happen');
            });
        });
    });

    it("Should not be able to add an invalid dataset (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('invalid', 'some random bytes').then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
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
        facade.addDataset('courses', zipFileContents).then(function() {
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



    it("Should be able to update an existing html dataset (201)", function () {
        var that = this;
        // that.timeout(5000);
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('repeathtml', zipFileContents_room).then(function() {
           facade.addDataset('repeathtml', zipFileContents_room).then(function (response: InsightResponse) {
                expect(response.code).to.equal(201);
            }).catch(function (response: InsightResponse) {
                expect.fail('Should not happen');
            });
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
        facade.addDataset('rooms', zipFileContents_room).then(function() {
            facade.performQuery(query).then(function (response: InsightResponse) {
                console.log(response.code);
                expect(response.code).to.equal(200);
            }).catch(function (response: InsightResponse) {
                expect.fail('Should not happen');
            });
        });
    });

    it("html give 200", function () {
        var that = this;
        let query: QueryRequest = {
            "GET": ["rooms_fullname", "rooms_number"],
            "WHERE": {"IS": {"rooms_shortname": "DMP"}},
            "ORDER": { "dir": "UP", "keys": ["rooms_number"]},
            "AS": "TABLE"
        };
        Log.trace("Starting test: " + that.test.title);
        facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });
});