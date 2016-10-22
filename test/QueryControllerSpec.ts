/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";

import {expect} from 'chai';
describe("QueryController", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to validate a valid query", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(true);
    });

    it("Should be able to find sections with avg greater than 90", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "GT": {
                    "courses_avg":  90
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
    });

    it("Should be able to invalidate an invalid query for AS", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept"],
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                }
            },
            "ORDER": "courses_avg",
            "AS": "n"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Should be able to query, although the answer will be empty", function () {
        // NOTE: this is not actually a valid query for D1, nor is the result correct.
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"GT": {"courses_avg": 200}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        // should check that the value is meaningful
    });
    //
    // it("Should be able to query average for all cpsc courses", function () {
    //     // NOTE: this is not actually a valid query for D1, nor is the result correct.
    //     let query: QueryRequest = {
    //         "GET": ["courses_id", "courseAverage"],
    //             "WHERE": {"IS": {"courses_dept": "cpsc"}} ,
    //         "GROUP": [ "courses_id" ],
    //             "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
    //             "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
    //         "AS":"TABLE"
    //     };
    //     let dataset: Datasets = {};
    //     let controller = new QueryController(dataset);
    //     let ret = controller.query(query);
    //     Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
    //     expect(ret).not.to.be.equal(null);
    //     // should check that the value is meaningful
    // });
});
