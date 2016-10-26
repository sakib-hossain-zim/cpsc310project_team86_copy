/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets, default as DatasetController} from "../src/controller/DatasetController";
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

    it("Should be an invalid query - all keys in group not in get", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_id", "courses_instructor" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Should be a valid query - all keys correct", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        // console.log (query.APPLY.length);
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(true);
    });

    it("Should be able an invalid query for - all GROUP not in GET", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Should be able a valid query for empty apply", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept"],
            "WHERE": {},
            "GROUP": ["courses_dept"],
            "APPLY": [],
            "ORDER": {"dir": "UP", "keys": ["courses_dept"]},
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(true);
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

    // it("Should be able to invalidate an invalid query for ORDER", function () {
    //     // NOTE: this is not actually a valid query for D1
    //     let query: QueryRequest = {
    //         "GET": ["courses_dept"],
    //         "WHERE": {
    //             "GT": {
    //                 "courses_avg": 90
    //             }
    //         },
    //         "ORDER": "courses_avg",
    //         "AS": "TABLE"
    //     };
    //     let dataset: Datasets = {};
    //     let controller = new QueryController(dataset);
    //     let isValid = controller.isValid(query);
    //
    //     expect(isValid).to.equal(false);
    // });

    it("Should invalidate query with GROUP length 0", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"LT": {"courses_avg": 90}},
            "GROUP": [],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Should invalidate query with no GROUP", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"NOT": {"courses_dept": "cpsc"}}},
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Should invalidate query with APPLY undefined", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"courses_dept": "cpsc"},
            "GROUP": ["courses_id"],
            "APPLY": ['undefined'],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Should be able to query, although the answer will be empty", function () {
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

    it("Should be valid LT query", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"LT": {"courses_avg": 200}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
    });

    it("Should be valid NOT query", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"IS": {"NOT": {"courses_dept": "cpsc"}}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret.toString()).to.not.include('cpsc');
    });

    it("Should be able to calculate MIN", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"MIN": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
    });

    it("Should be able to query with OLD QUERY EXAMPLE 1", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"GT": {"courses_avg": 90}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };

        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult =
        { render: 'TABLE',
            result:
                [ { courses_dept: 'cnps', courses_avg: 90.02 },
                    { courses_dept: 'dhyg', courses_avg: 90.03 },
                    { courses_dept: 'epse', courses_avg: 90.03 },
                    { courses_dept: 'epse', courses_avg: 90.05 },
                    { courses_dept: 'kin', courses_avg: 90.05 },
                    { courses_dept: 'kin', courses_avg: 90.05 },
                    { courses_dept: 'epse', courses_avg: 90.05 },
                    { courses_dept: 'edcp', courses_avg: 90.06 },
                    { courses_dept: 'civl', courses_avg: 90.06 },
                    { courses_dept: 'edst', courses_avg: 90.06 },
                    { courses_dept: 'nurs', courses_avg: 90.06 },
                    { courses_dept: 'edst', courses_avg: 90.06 },
                    { courses_dept: 'civl', courses_avg: 90.06 },
                    { courses_dept: 'sowk', courses_avg: 90.06 },
                    { courses_dept: 'edst', courses_avg: 90.06 },
                    { courses_dept: 'edst', courses_avg: 90.06 },
                    { courses_dept: 'sowk', courses_avg: 90.06 },
                    { courses_dept: 'psyc', courses_avg: 90.06 },
                    { courses_dept: 'psyc', courses_avg: 90.06 },
                    { courses_dept: 'cnps', courses_avg: 90.06 },
                    { courses_dept: 'cnps', courses_avg: 90.06 },
                    { courses_dept: 'edcp', courses_avg: 90.06 },
                    { courses_dept: 'nurs', courses_avg: 90.06 },
                    { courses_dept: 'cnps', courses_avg: 90.07 },
                    { courses_dept: 'epse', courses_avg: 90.07 },
                    { courses_dept: 'pcth', courses_avg: 90.07 },
                    { courses_dept: 'educ', courses_avg: 90.07 },
                    { courses_dept: 'eece', courses_avg: 90.07 },
                    { courses_dept: 'eece', courses_avg: 90.07 },
                    { courses_dept: 'pcth', courses_avg: 90.07 },
                    { courses_dept: 'epse', courses_avg: 90.07 },
                    { courses_dept: 'nurs', courses_avg: 90.07 },
                    { courses_dept: 'nurs', courses_avg: 90.07 },
                    { courses_dept: 'epse', courses_avg: 90.07 },
                    { courses_dept: 'eece', courses_avg: 90.07 },
                    { courses_dept: 'econ', courses_avg: 90.07 },
                    { courses_dept: 'econ', courses_avg: 90.07 },
                    { courses_dept: 'eece', courses_avg: 90.07 },
                    { courses_dept: 'eosc', courses_avg: 90.08 },
                    { courses_dept: 'epse', courses_avg: 90.08 },
                    { courses_dept: 'etec', courses_avg: 90.08 },
                    { courses_dept: 'dhyg', courses_avg: 90.08 },
                    { courses_dept: 'plan', courses_avg: 90.08 },
                    { courses_dept: 'plan', courses_avg: 90.08 },
                    { courses_dept: 'dhyg', courses_avg: 90.08 },
                    { courses_dept: 'etec', courses_avg: 90.09 },
                    { courses_dept: 'epse', courses_avg: 90.09 },
                    { courses_dept: 'bioc', courses_avg: 90.1 },
                    { courses_dept: 'bioc', courses_avg: 90.1 },
                    { courses_dept: 'epse', courses_avg: 90.1 },
                    { courses_dept: 'lled', courses_avg: 90.1 },
                    { courses_dept: 'phar', courses_avg: 90.1 },
                    { courses_dept: 'phar', courses_avg: 90.1 },
                    { courses_dept: 'cons', courses_avg: 90.1 },
                    { courses_dept: 'etec', courses_avg: 90.1 },
                    { courses_dept: 'etec', courses_avg: 90.1 },
                    { courses_dept: 'cons', courses_avg: 90.1 },
                    { courses_dept: 'civl', courses_avg: 90.11 },
                    { courses_dept: 'civl', courses_avg: 90.11 },
                    { courses_dept: 'audi', courses_avg: 90.11 },
                    { courses_dept: 'spph', courses_avg: 90.11 },
                    { courses_dept: 'edcp', courses_avg: 90.11 },
                    { courses_dept: 'path', courses_avg: 90.11 },
                    { courses_dept: 'audi', courses_avg: 90.11 },
                    { courses_dept: 'epse', courses_avg: 90.11 },
                    { courses_dept: 'epse', courses_avg: 90.11 },
                    { courses_dept: 'audi', courses_avg: 90.12 },
                    { courses_dept: 'audi', courses_avg: 90.12 },
                    { courses_dept: 'cnps', courses_avg: 90.12 },
                    { courses_dept: 'surg', courses_avg: 90.13 },
                    { courses_dept: 'sowk', courses_avg: 90.13 },
                    { courses_dept: 'surg', courses_avg: 90.13 },
                    { courses_dept: 'sowk', courses_avg: 90.13 },
                    { courses_dept: 'econ', courses_avg: 90.13 },
                    { courses_dept: 'medg', courses_avg: 90.13 },
                    { courses_dept: 'econ', courses_avg: 90.13 },
                    { courses_dept: 'medg', courses_avg: 90.13 },
                    { courses_dept: 'educ', courses_avg: 90.14 },
                    { courses_dept: 'edcp', courses_avg: 90.14 },
                    { courses_dept: 'edcp', courses_avg: 90.14 },
                    { courses_dept: 'thtr', courses_avg: 90.14 },
                    { courses_dept: 'etec', courses_avg: 90.14 },
                    { courses_dept: 'mtrl', courses_avg: 90.14 },
                    { courses_dept: 'kin', courses_avg: 90.14 },
                    { courses_dept: 'thtr', courses_avg: 90.14 },
                    { courses_dept: 'mtrl', courses_avg: 90.14 },
                    { courses_dept: 'phar', courses_avg: 90.15 },
                    { courses_dept: 'phar', courses_avg: 90.15 },
                    { courses_dept: 'phar', courses_avg: 90.15 },
                    { courses_dept: 'phar', courses_avg: 90.15 },
                    { courses_dept: 'epse', courses_avg: 90.15 },
                    { courses_dept: 'eosc', courses_avg: 90.15 },
                    { courses_dept: 'eosc', courses_avg: 90.15 },
                    { courses_dept: 'econ', courses_avg: 90.17 },
                    { courses_dept: 'mech', courses_avg: 90.17 },
                    { courses_dept: 'adhe', courses_avg: 90.17 },
                    { courses_dept: 'biol', courses_avg: 90.17 },
                    { courses_dept: 'biol', courses_avg: 90.17 },
                    { courses_dept: 'russ', courses_avg: 90.17 },
                    { courses_dept: 'mech', courses_avg: 90.17 }]};
        let expectedResultString = expectedResult.toString();
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret.toString()).to.contain(expectedResultString);
    });

    it("Should be able to query with OLD QUERY EXAMPLE 2", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "adhe"}}
                    ]},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };

        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult =
        { render: 'TABLE',
            result:
                [ { courses_dept: 'adhe', courses_id: '412', courses_avg: 70.53 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 70.53 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 70.56 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 72.29 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 72.93 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 73.79 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 75.67 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 75.68 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 75.91 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 76.17 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 76.22 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 76.59 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 76.63 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 77 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 77.28 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 77.42 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 77.5 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 77.58 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 77.58 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 77.59 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 77.77 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 78 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 78.21 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 78.24 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 78.41 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 78.57 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 78.77 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 78.81 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 78.81 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 78.85 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 78.9 },
                    { courses_dept: 'adhe', courses_id: '328', courses_avg: 78.91 },
                    { courses_dept: 'adhe', courses_id: '328', courses_avg: 78.91 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 79 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 79.19 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 79.47 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 79.5 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 79.83 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 80.25 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 80.33 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 80.4 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 80.44 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 80.55 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 80.76 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 81.45 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 81.45 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 81.62 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 81.67 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 81.71 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 81.85 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 81.89 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 82 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 82.49 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 82.73 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 82.76 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 82.78 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 82.81 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 83.02 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 83.05 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 83.07 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 83.16 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 83.29 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 83.34 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 83.41 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 83.45 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 83.45 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 83.47 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 83.57 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 83.64 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 83.68 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 83.69 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 83.71 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 83.74 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 83.83 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 83.9 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 84 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 84.04 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 84.07 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 84.14 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 84.3 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 84.52 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 84.57 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 84.78 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 84.87 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 84.9 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 85 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 85.04 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 85.04 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 85.06 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 85.12 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 85.2 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 85.29 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 85.39 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 85.6 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 85.7 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 85.72 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 85.8 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 85.8 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 85.81 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 85.81 }]};
        let expectedResultString = expectedResult.toString();
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret.toString()).to.contain(expectedResultString);
    });


    it("Should be able to query with QUERY EXAMPLE 1", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult =
        {"render":"TABLE",
            "result":
                [{"courses_id":"261","courseAverage":68.41},
                    {"courses_id":"320","courseAverage":70.61},
                    {"courses_id":"415","courseAverage":70.72},
                    {"courses_id":"420","courseAverage":71.57},
                    {"courses_id":"317","courseAverage":72.09},
                    {"courses_id":"322","courseAverage":73.47},
                    {"courses_id":"404","courseAverage":73.47},
                    {"courses_id":"303","courseAverage":73.55},
                    {"courses_id":"340","courseAverage":73.55},
                    {"courses_id":"210","courseAverage":74.08},
                    {"courses_id":"313","courseAverage":74.15},
                    {"courses_id":"422","courseAverage":74.15},
                    {"courses_id":"425","courseAverage":74.16},
                    {"courses_id":"213","courseAverage":74.37},
                    {"courses_id":"110","courseAverage":74.61},
                    {"courses_id":"416","courseAverage":74.8},
                    {"courses_id":"259","courseAverage":74.98},
                    {"courses_id":"221","courseAverage":75.08},
                    {"courses_id":"302","courseAverage":76.2},
                    {"courses_id":"121","courseAverage":76.24},
                    {"courses_id":"314","courseAverage":76.71},
                    {"courses_id":"421","courseAverage":76.83},
                    {"courses_id":"304","courseAverage":76.86},
                    {"courses_id":"311","courseAverage":77.17},
                    {"courses_id":"410","courseAverage":77.61},
                    {"courses_id":"418","courseAverage":77.74},
                    {"courses_id":"430","courseAverage":77.77},
                    {"courses_id":"310","courseAverage":78.06},
                    {"courses_id":"344","courseAverage":79.05},
                    {"courses_id":"444","courseAverage":79.19},
                    {"courses_id":"411","courseAverage":79.34},
                    {"courses_id":"515","courseAverage":81.02},
                    {"courses_id":"513","courseAverage":81.5},
                    {"courses_id":"445","courseAverage":81.61},
                    {"courses_id":"301","courseAverage":81.64}]};
        let expectedResultString = expectedResult.toString();
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret.toString()).to.contain(expectedResultString);
    });

    it("Should be able to query QUERY EXAMPLE 2", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult =
        {"render":"TABLE",
            "result":
                [{"courses_dept":"wood","courses_id":"475","courseAverage":52.83,"maxFail":2},
                    {"courses_dept":"busi","courses_id":"398","courseAverage":57.92,"maxFail":12},
                    {"courses_dept":"busi","courses_id":"460","courseAverage":57.96,"maxFail":13},
                    {"courses_dept":"test","courses_id":"100","courseAverage":60,"maxFail":0},
                    {"courses_dept":"busi","courses_id":"344","courseAverage":60.04,"maxFail":36},
                    {"courses_dept":"chbe","courses_id":"477","courseAverage":61.22,"maxFail":6},
                    {"courses_dept":"math","courses_id":"180","courseAverage":61.55,"maxFail":94},
                    {"courses_dept":"math","courses_id":"110","courseAverage":62.09,"maxFail":73},
                    {"courses_dept":"mtrl","courses_id":"378","courseAverage":62.5,"maxFail":12},
                    {"courses_dept":"busi","courses_id":"121","courseAverage":62.5,"maxFail":52},
                    {"courses_dept":"math","courses_id":"264","courseAverage":62.57,"maxFail":34},
                    {"courses_dept":"math","courses_id":"310","courseAverage":62.95,"maxFail":8},
                    {"courses_dept":"mtrl","courses_id":"365","courseAverage":63.08,"maxFail":7},
                    {"courses_dept":"busi","courses_id":"300","courseAverage":63.34,"maxFail":37},
                    {"courses_dept":"chem","courses_id":"330","courseAverage":63.71,"maxFail":13},
                    {"courses_dept":"thtr","courses_id":"450","courseAverage":63.78,"maxFail":4},
                    {"courses_dept":"busi","courses_id":"331","courseAverage":63.83,"maxFail":44},
                    {"courses_dept":"math","courses_id":"184","courseAverage":64.04,"maxFail":114},
                    {"courses_dept":"chem","courses_id":"260","courseAverage":64.21,"maxFail":19},
                    {"courses_dept":"apbi","courses_id":"351","courseAverage":64.34,"maxFail":5},
                    {"courses_dept":"hist","courses_id":"102","courseAverage":64.38,"maxFail":14},
                    {"courses_dept":"busi","courses_id":"330","courseAverage":64.62,"maxFail":81},
                    {"courses_dept":"math","courses_id":"220","courseAverage":64.99,"maxFail":51},
                    {"courses_dept":"busi","courses_id":"100","courseAverage":65.28,"maxFail":36},
                    {"courses_dept":"math","courses_id":"101","courseAverage":65.38,"maxFail":222},
                    {"courses_dept":"hist","courses_id":"101","courseAverage":65.46,"maxFail":6}]};
        let expectedResultString = expectedResult.toString();
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret.toString()).to.contain(expectedResultString);
    });

    it("Should be able to query QUERY EXAMPLE 3", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult =
        {"render":"TABLE",
            "result":
                [{"courses_dept":"atsc","courses_id":"506","numSections":1},
                    {"courses_dept":"germ","courses_id":"548","numSections":1},
                    {"courses_dept":"phil","courses_id":"599","numSections":1},
                    {"courses_dept":"rhsc","courses_id":"585","numSections":1},
                    {"courses_dept":"span","courses_id":"548","numSections":1},
                    {"courses_dept":"test","courses_id":"100","numSections":1},
                    {"courses_dept":"adhe","courses_id":"328","numSections":2},
                    {"courses_dept":"anat","courses_id":"515","numSections":2},
                    {"courses_dept":"apbi","courses_id":"410","numSections":2},
                    {"courses_dept":"apbi","courses_id":"440","numSections":2},
                    {"courses_dept":"arbc","courses_id":"101","numSections":2},
                    {"courses_dept":"arbc","courses_id":"102","numSections":2},
                    {"courses_dept":"arbc","courses_id":"201","numSections":2},
                    {"courses_dept":"arbc","courses_id":"202","numSections":2},
                    {"courses_dept":"arcl","courses_id":"140","numSections":2},
                    {"courses_dept":"arcl","courses_id":"204","numSections":2},
                    {"courses_dept":"arcl","courses_id":"228","numSections":2},
                    {"courses_dept":"arcl","courses_id":"305","numSections":2},
                    {"courses_dept":"arcl","courses_id":"309","numSections":2},
                    {"courses_dept":"arcl","courses_id":"318","numSections":2},
                    {"courses_dept":"arcl","courses_id":"326","numSections":2},
                    {"courses_dept":"arcl","courses_id":"419","numSections":2},
                    {"courses_dept":"arst","courses_id":"560","numSections":2},
                    {"courses_dept":"arst","courses_id":"600","numSections":2},
                    {"courses_dept":"arth","courses_id":"464","numSections":2}]};
        let expectedResultString = expectedResult.toString();
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret.toString()).to.contain(expectedResultString);
    });

    it("Should be able to query with UP ORDER", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult: any =
        { render: 'TABLE',
            result:
                [ { courses_id: '261', courseAverage: 68.41 },
                    { courses_id: '320', courseAverage: 70.61 },
                    { courses_id: '415', courseAverage: 70.72 },
                    { courses_id: '420', courseAverage: 71.57 },
                    { courses_id: '317', courseAverage: 72.09 },
                    { courses_id: '322', courseAverage: 73.47 },
                    { courses_id: '404', courseAverage: 73.47 },
                    { courses_id: '303', courseAverage: 73.55 },
                    { courses_id: '340', courseAverage: 73.55 },
                    { courses_id: '210', courseAverage: 74.08 },
                    { courses_id: '313', courseAverage: 74.15 },
                    { courses_id: '422', courseAverage: 74.15 },
                    { courses_id: '425', courseAverage: 74.16 },
                    { courses_id: '213', courseAverage: 74.37 },
                    { courses_id: '110', courseAverage: 74.61 },
                    { courses_id: '416', courseAverage: 74.8 },
                    { courses_id: '259', courseAverage: 74.98 },
                    { courses_id: '221', courseAverage: 75.08 },
                    { courses_id: '302', courseAverage: 76.2 },
                    { courses_id: '121', courseAverage: 76.24 },
                    { courses_id: '314', courseAverage: 76.71 },
                    { courses_id: '421', courseAverage: 76.83 },
                    { courses_id: '304', courseAverage: 76.86 },
                    { courses_id: '311', courseAverage: 77.17 },
                    { courses_id: '410', courseAverage: 77.61 },
                    { courses_id: '418', courseAverage: 77.74 },
                    { courses_id: '430', courseAverage: 77.77 },
                    { courses_id: '310', courseAverage: 78.06 },
                    { courses_id: '344', courseAverage: 79.05 },
                    { courses_id: '444', courseAverage: 79.19 },
                    { courses_id: '411', courseAverage: 79.34 },
                    { courses_id: '515', courseAverage: 81.02 },
                    { courses_id: '513', courseAverage: 81.5 },
                    { courses_id: '445', courseAverage: 81.61 },
                    { courses_id: '301', courseAverage: 81.64 },
                    { courses_id: '312', courseAverage: 81.81 },
                    { courses_id: '502', courseAverage: 83.22 },
                    { courses_id: '527', courseAverage: 83.78 },
                    { courses_id: '500', courseAverage: 83.95 },
                    { courses_id: '319', courseAverage: 84.15 },
                    { courses_id: '544', courseAverage: 84.25 },
                    { courses_id: '521', courseAverage: 84.86 },
                    { courses_id: '509', courseAverage: 85.72 },
                    { courses_id: '522', courseAverage: 85.75 },
                    { courses_id: '589', courseAverage: 85.82 },
                    { courses_id: '540', courseAverage: 86.46 },
                    { courses_id: '543', courseAverage: 87.32 },
                    { courses_id: '503', courseAverage: 88.43 },
                    { courses_id: '547', courseAverage: 88.47 },
                    { courses_id: '507', courseAverage: 88.57 },
                    { courses_id: '501', courseAverage: 90.21 },
                    { courses_id: '490', courseAverage: 90.73 },
                    { courses_id: '449', courseAverage: 92.1 } ] };
        expect(ret).not.to.be.equal(null);
        expect(ret).to.deep.equal(expectedResult);
    });

    it("Should be able to query with DOWN ORDER", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult: any =
        { render: 'TABLE',
            result:
                [ { courses_id: '449', courseAverage: 92.1 },
                    { courses_id: '490', courseAverage: 90.73 },
                    { courses_id: '501', courseAverage: 90.21 },
                    { courses_id: '507', courseAverage: 88.57 },
                    { courses_id: '547', courseAverage: 88.47 },
                    { courses_id: '503', courseAverage: 88.43 },
                    { courses_id: '543', courseAverage: 87.32 },
                    { courses_id: '540', courseAverage: 86.46 },
                    { courses_id: '589', courseAverage: 85.82 },
                    { courses_id: '522', courseAverage: 85.75 },
                    { courses_id: '509', courseAverage: 85.72 },
                    { courses_id: '521', courseAverage: 84.86 },
                    { courses_id: '544', courseAverage: 84.25 },
                    { courses_id: '319', courseAverage: 84.15 },
                    { courses_id: '500', courseAverage: 83.95 },
                    { courses_id: '527', courseAverage: 83.78 },
                    { courses_id: '502', courseAverage: 83.22 },
                    { courses_id: '312', courseAverage: 81.81 },
                    { courses_id: '301', courseAverage: 81.64 },
                    { courses_id: '445', courseAverage: 81.61 },
                    { courses_id: '513', courseAverage: 81.5 },
                    { courses_id: '515', courseAverage: 81.02 },
                    { courses_id: '411', courseAverage: 79.34 },
                    { courses_id: '444', courseAverage: 79.19 },
                    { courses_id: '344', courseAverage: 79.05 },
                    { courses_id: '310', courseAverage: 78.06 },
                    { courses_id: '430', courseAverage: 77.77 },
                    { courses_id: '418', courseAverage: 77.74 },
                    { courses_id: '410', courseAverage: 77.61 },
                    { courses_id: '311', courseAverage: 77.17 },
                    { courses_id: '304', courseAverage: 76.86 },
                    { courses_id: '421', courseAverage: 76.83 },
                    { courses_id: '314', courseAverage: 76.71 },
                    { courses_id: '121', courseAverage: 76.24 },
                    { courses_id: '302', courseAverage: 76.2 },
                    { courses_id: '221', courseAverage: 75.08 },
                    { courses_id: '259', courseAverage: 74.98 },
                    { courses_id: '416', courseAverage: 74.8 },
                    { courses_id: '110', courseAverage: 74.61 },
                    { courses_id: '213', courseAverage: 74.37 },
                    { courses_id: '425', courseAverage: 74.16 },
                    { courses_id: '422', courseAverage: 74.15 },
                    { courses_id: '313', courseAverage: 74.15 },
                    { courses_id: '210', courseAverage: 74.08 },
                    { courses_id: '340', courseAverage: 73.55 },
                    { courses_id: '303', courseAverage: 73.55 },
                    { courses_id: '404', courseAverage: 73.47 },
                    { courses_id: '322', courseAverage: 73.47 },
                    { courses_id: '317', courseAverage: 72.09 },
                    { courses_id: '420', courseAverage: 71.57 },
                    { courses_id: '415', courseAverage: 70.72 },
                    { courses_id: '320', courseAverage: 70.61 },
                    { courses_id: '261', courseAverage: 68.41 } ] };
        expect(ret).not.to.be.equal(null);
        expect(ret).to.deep.equal(expectedResult);
    });

    it("Should be able to query with DOWN ORDER", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult: any =
        { render: 'TABLE',
            result:
                [ { courses_id: '449', courseAverage: 92.1 },
                    { courses_id: '490', courseAverage: 90.73 },
                    { courses_id: '501', courseAverage: 90.21 },
                    { courses_id: '507', courseAverage: 88.57 },
                    { courses_id: '547', courseAverage: 88.47 },
                    { courses_id: '503', courseAverage: 88.43 },
                    { courses_id: '543', courseAverage: 87.32 },
                    { courses_id: '540', courseAverage: 86.46 },
                    { courses_id: '589', courseAverage: 85.82 },
                    { courses_id: '522', courseAverage: 85.75 },
                    { courses_id: '509', courseAverage: 85.72 },
                    { courses_id: '521', courseAverage: 84.86 },
                    { courses_id: '544', courseAverage: 84.25 },
                    { courses_id: '319', courseAverage: 84.15 },
                    { courses_id: '500', courseAverage: 83.95 },
                    { courses_id: '527', courseAverage: 83.78 },
                    { courses_id: '502', courseAverage: 83.22 },
                    { courses_id: '312', courseAverage: 81.81 },
                    { courses_id: '301', courseAverage: 81.64 },
                    { courses_id: '445', courseAverage: 81.61 },
                    { courses_id: '513', courseAverage: 81.5 },
                    { courses_id: '515', courseAverage: 81.02 },
                    { courses_id: '411', courseAverage: 79.34 },
                    { courses_id: '444', courseAverage: 79.19 },
                    { courses_id: '344', courseAverage: 79.05 },
                    { courses_id: '310', courseAverage: 78.06 },
                    { courses_id: '430', courseAverage: 77.77 },
                    { courses_id: '418', courseAverage: 77.74 },
                    { courses_id: '410', courseAverage: 77.61 },
                    { courses_id: '311', courseAverage: 77.17 },
                    { courses_id: '304', courseAverage: 76.86 },
                    { courses_id: '421', courseAverage: 76.83 },
                    { courses_id: '314', courseAverage: 76.71 },
                    { courses_id: '121', courseAverage: 76.24 },
                    { courses_id: '302', courseAverage: 76.2 },
                    { courses_id: '221', courseAverage: 75.08 },
                    { courses_id: '259', courseAverage: 74.98 },
                    { courses_id: '416', courseAverage: 74.8 },
                    { courses_id: '110', courseAverage: 74.61 },
                    { courses_id: '213', courseAverage: 74.37 },
                    { courses_id: '425', courseAverage: 74.16 },
                    { courses_id: '422', courseAverage: 74.15 },
                    { courses_id: '313', courseAverage: 74.15 },
                    { courses_id: '210', courseAverage: 74.08 },
                    { courses_id: '340', courseAverage: 73.55 },
                    { courses_id: '303', courseAverage: 73.55 },
                    { courses_id: '404', courseAverage: 73.47 },
                    { courses_id: '322', courseAverage: 73.47 },
                    { courses_id: '317', courseAverage: 72.09 },
                    { courses_id: '420', courseAverage: 71.57 },
                    { courses_id: '415', courseAverage: 70.72 },
                    { courses_id: '320', courseAverage: 70.61 },
                    { courses_id: '261', courseAverage: 68.41 } ] };
        expect(ret).not.to.be.equal(null);
        expect(ret).to.deep.equal(expectedResult);
    });


    it("Should be able to query - MAX", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}} ,
            "GROUP": [ "courses_id" ],
            "APPLY": [ {"courseAverage": {"MAX": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courses_id", "courseAverage"]},
            "AS":"TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult: any =
        { render: 'TABLE',
            result:
                [ { courses_id: '110', courseAverage: 85.46 },
                    { courses_id: '121', courseAverage: 84.56 },
                    { courses_id: '210', courseAverage: 86.15 },
                    { courses_id: '213', courseAverage: 81.76 },
                    { courses_id: '221', courseAverage: 86.47 },
                    { courses_id: '259', courseAverage: 75.82 },
                    { courses_id: '261', courseAverage: 69.1 },
                    { courses_id: '301', courseAverage: 88 },
                    { courses_id: '302', courseAverage: 79.46 },
                    { courses_id: '303', courseAverage: 77.62 },
                    { courses_id: '304', courseAverage: 85.5 },
                    { courses_id: '310', courseAverage: 81.88 },
                    { courses_id: '311', courseAverage: 80.15 },
                    { courses_id: '312', courseAverage: 85.13 },
                    { courses_id: '313', courseAverage: 82.27 },
                    { courses_id: '314', courseAverage: 82.58 },
                    { courses_id: '317', courseAverage: 75.56 },
                    { courses_id: '319', courseAverage: 88.39 },
                    { courses_id: '320', courseAverage: 72.78 },
                    { courses_id: '322', courseAverage: 78.34 },
                    { courses_id: '340', courseAverage: 77.93 },
                    { courses_id: '344', courseAverage: 81.18 },
                    { courses_id: '404', courseAverage: 77.95 },
                    { courses_id: '410', courseAverage: 80.18 },
                    { courses_id: '411', courseAverage: 85 },
                    { courses_id: '415', courseAverage: 73.37 },
                    { courses_id: '416', courseAverage: 79.31 },
                    { courses_id: '418', courseAverage: 79.87 },
                    { courses_id: '420', courseAverage: 78.32 },
                    { courses_id: '421', courseAverage: 79.88 },
                    { courses_id: '422', courseAverage: 78.3 },
                    { courses_id: '425', courseAverage: 77.68 },
                    { courses_id: '430', courseAverage: 80.55 },
                    { courses_id: '444', courseAverage: 80.62 },
                    { courses_id: '445', courseAverage: 91.25 },
                    { courses_id: '449', courseAverage: 93.5 },
                    { courses_id: '490', courseAverage: 92.4 },
                    { courses_id: '500', courseAverage: 86.33 },
                    { courses_id: '501', courseAverage: 92.75 },
                    { courses_id: '502', courseAverage: 86.2 },
                    { courses_id: '503', courseAverage: 89.1 },
                    { courses_id: '507', courseAverage: 91.79 },
                    { courses_id: '509', courseAverage: 88 },
                    { courses_id: '513', courseAverage: 89.09 },
                    { courses_id: '515', courseAverage: 82.15 },
                    { courses_id: '521', courseAverage: 87.78 },
                    { courses_id: '522', courseAverage: 90.71 },
                    { courses_id: '527', courseAverage: 83.78 },
                    { courses_id: '540', courseAverage: 91.22 },
                    { courses_id: '543', courseAverage: 89.75 },
                    { courses_id: '544', courseAverage: 86.71 },
                    { courses_id: '547', courseAverage: 88.47 },
                    { courses_id: '589', courseAverage: 95 } ] }
        expect(ret).not.to.be.equal(null);
        expect(ret).to.deep.equal(expectedResult);
    });

    it("Should be able to query - MIN", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}} ,
            "GROUP": [ "courses_id" ],
            "APPLY": [ {"courseAverage": {"MIN": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courses_id", "courseAverage"]},
            "AS":"TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult: any =
        { render: 'TABLE',
            result:
                [ { courses_id: '110', courseAverage: 67.79 },
                    { courses_id: '121', courseAverage: 69.73 },
                    { courses_id: '210', courseAverage: 68.13 },
                    { courses_id: '213', courseAverage: 64.62 },
                    { courses_id: '221', courseAverage: 65.1 },
                    { courses_id: '259', courseAverage: 74.22 },
                    { courses_id: '261', courseAverage: 67.91 },
                    { courses_id: '301', courseAverage: 71 },
                    { courses_id: '302', courseAverage: 73.18 },
                    { courses_id: '303', courseAverage: 70.16 },
                    { courses_id: '304', courseAverage: 71.89 },
                    { courses_id: '310', courseAverage: 72.27 },
                    { courses_id: '311', courseAverage: 74.06 },
                    { courses_id: '312', courseAverage: 76.84 },
                    { courses_id: '313', courseAverage: 70.46 },
                    { courses_id: '314', courseAverage: 67.85 },
                    { courses_id: '317', courseAverage: 68.54 },
                    { courses_id: '319', courseAverage: 78.93 },
                    { courses_id: '320', courseAverage: 67.76 },
                    { courses_id: '322', courseAverage: 67.48 },
                    { courses_id: '340', courseAverage: 68.4 },
                    { courses_id: '344', courseAverage: 75.91 },
                    { courses_id: '404', courseAverage: 69.58 },
                    { courses_id: '410', courseAverage: 74.25 },
                    { courses_id: '411', courseAverage: 72.24 },
                    { courses_id: '415', courseAverage: 68.79 },
                    { courses_id: '416', courseAverage: 72 },
                    { courses_id: '418', courseAverage: 75.61 },
                    { courses_id: '420', courseAverage: 68.77 },
                    { courses_id: '421', courseAverage: 74.68 },
                    { courses_id: '422', courseAverage: 68.84 },
                    { courses_id: '425', courseAverage: 72.48 },
                    { courses_id: '430', courseAverage: 73.25 },
                    { courses_id: '444', courseAverage: 78.42 },
                    { courses_id: '445', courseAverage: 73.88 },
                    { courses_id: '449', courseAverage: 88.5 },
                    { courses_id: '490', courseAverage: 89 },
                    { courses_id: '500', courseAverage: 78.87 },
                    { courses_id: '501', courseAverage: 84.67 },
                    { courses_id: '502', courseAverage: 81.06 },
                    { courses_id: '503', courseAverage: 87.36 },
                    { courses_id: '507', courseAverage: 84.75 },
                    { courses_id: '509', courseAverage: 84.25 },
                    { courses_id: '513', courseAverage: 64 },
                    { courses_id: '515', courseAverage: 79.88 },
                    { courses_id: '521', courseAverage: 82.65 },
                    { courses_id: '522', courseAverage: 82.55 },
                    { courses_id: '527', courseAverage: 83.78 },
                    { courses_id: '540', courseAverage: 82.82 },
                    { courses_id: '543', courseAverage: 85.35 },
                    { courses_id: '544', courseAverage: 82.28 },
                    { courses_id: '547', courseAverage: 88.47 },
                    { courses_id: '589', courseAverage: 75 } ] }
        expect(ret).not.to.be.equal(null);
        expect(ret).to.deep.equal(expectedResult);
    });

    // it("Should be able to query - COUNT", function () {
    //     let query: QueryRequest = {
    //         "GET": ["courses_dept", "courses_id", "numSections"],
    //         "WHERE": {"IS": {"courses_dept": "cpsc"}},
    //         "GROUP": [ "courses_dept", "courses_id" ],
    //         "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
    //         "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
    //         "AS":"TABLE"
    //     };
    //     let datasetController = new DatasetController();
    //     let datasets: Datasets = datasetController.getDatasets();
    //     let controller = new QueryController(datasets);
    //     let ret = controller.query(query);
    //     console.log (ret);
    //     let expectedResult: any =
    //     { render: 'TABLE',
    //         result:
    //             [ { courses_dept: 'cpsc', courses_id: '527', numSections: 2 },
    //                 { courses_dept: 'cpsc', courses_id: '547', numSections: 2 },
    //                 { courses_dept: 'cpsc', courses_id: '418', numSections: 4 },
    //                 { courses_dept: 'cpsc', courses_id: '515', numSections: 4 },
    //                 { courses_dept: 'cpsc', courses_id: '261', numSections: 6 },
    //                 { courses_dept: 'cpsc', courses_id: '503', numSections: 6 },
    //                 { courses_dept: 'cpsc', courses_id: '507', numSections: 6 },
    //                 { courses_dept: 'cpsc', courses_id: '522', numSections: 6 },
    //                 { courses_dept: 'cpsc', courses_id: '259', numSections: 8 },
    //                 { courses_dept: 'cpsc', courses_id: '444', numSections: 8 },
    //                 { courses_dept: 'cpsc', courses_id: '501', numSections: 8 },
    //                 { courses_dept: 'cpsc', courses_id: '502', numSections: 8 },
    //                 { courses_dept: 'cpsc', courses_id: '509', numSections: 8 },
    //                 { courses_dept: 'cpsc', courses_id: '543', numSections: 8 },
    //                 { courses_dept: 'cpsc', courses_id: '449', numSections: 10 },
    //                 { courses_dept: 'cpsc', courses_id: '490', numSections: 10 },
    //                 { courses_dept: 'cpsc', courses_id: '521', numSections: 10 },
    //                 { courses_dept: 'cpsc', courses_id: '540', numSections: 10 },
    //                 { courses_dept: 'cpsc', courses_id: '301', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '302', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '303', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '311', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '312', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '319', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '340', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '410', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '411', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '415', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '416', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '420', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '421', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '422', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '425', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '445', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '500', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '513', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '544', numSections: 12 },
    //                 { courses_dept: 'cpsc', courses_id: '344', numSections: 13 },
    //                 { courses_dept: 'cpsc', courses_id: '589', numSections: 14 },
    //                 { courses_dept: 'cpsc', courses_id: '430', numSections: 16 },
    //                 { courses_dept: 'cpsc', courses_id: '314', numSections: 18 },
    //                 { courses_dept: 'cpsc', courses_id: '317', numSections: 18 },
    //                 { courses_dept: 'cpsc', courses_id: '404', numSections: 18 },
    //                 { courses_dept: 'cpsc', courses_id: '322', numSections: 22 },
    //                 { courses_dept: 'cpsc', courses_id: '320', numSections: 23 },
    //                 { courses_dept: 'cpsc', courses_id: '310', numSections: 26 },
    //                 { courses_dept: 'cpsc', courses_id: '313', numSections: 26 },
    //                 { courses_dept: 'cpsc', courses_id: '304', numSections: 30 },
    //                 { courses_dept: 'cpsc', courses_id: '213', numSections: 31 },
    //                 { courses_dept: 'cpsc', courses_id: '221', numSections: 37 },
    //                 { courses_dept: 'cpsc', courses_id: '210', numSections: 39 },
    //                 { courses_dept: 'cpsc', courses_id: '121', numSections: 43 },
    //                 { courses_dept: 'cpsc', courses_id: '110', numSections: 49 } ] }
    //     expect(ret).not.to.be.equal(null);
    //     expect(ret).to.deep.equal(expectedResult);
    // });

    it("Order of keys ordering should matter (Galactica)", function () {
        let query1: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let query2: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courses_id", "courseAverage"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller1 = new QueryController(datasets);
        let controller2 = new QueryController(datasets);
        let ret1 = controller1.query(query1);
        let ret2 = controller2.query(query2);
        expect(ret1).not.to.be.equal(null);
        expect(ret2).not.to.be.equal(null);
        expect(ret1).to.not.deep.equal(ret2);
    });
    it ("Should return an empty array if the dataset is empty", function() {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasets: Datasets = {};
        let controller1 = new QueryController(datasets);
        let ret = controller1.query(query);
        let expectedResult = {render: query.AS, result: [{}]};
        expect(ret).to.deep.equal(expectedResult);
    })
});