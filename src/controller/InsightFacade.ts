/*
 * This should be in the same namespace as your controllers
 */
import {QueryRequest, default as QueryController} from "./QueryController";
import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import DatasetController from "./DatasetController";

export default class InsightFacade implements IInsightFacade {
    private static datasetController = new DatasetController();

    /**
     *
     * @param id
     * @param content
     * @returns {Promise<InsightResponse>}
     */
    public addDataset (id:string, content: string) : Promise<InsightResponse> {
        // The promise should return an InsightResponse for both fullfill and reject.
        // fulfill should be for 2XX codes and reject for everything else.

        return new Promise(function (fulfill, reject) {
            try {
                let controller = InsightFacade.datasetController;
                var fs = require('fs');

                controller.process(id, content).then(function (result) {
                    try {
                        if (!result) {
                            let response: InsightResponse = {code: 400, body: "not valid dataset"};
                            reject(response);
                        } else {
                            if (fs.existsSync('./data/' + id + '.json')) {
                                let response: InsightResponse = {code: 201, body: "success and updated"};
                                fulfill(response);
                            } else {
                                let response: InsightResponse = {code: 204, body: "success"};
                                fulfill(response);
                            }
                        }
                    } catch (e) {
                        let response: InsightResponse = {code: 400, body: e.message};
                        reject(response);
                    }
                }).catch(function (err: Error) {
                    let response: InsightResponse = {code: 400, body: err.message};
                    reject(response);
                });
            } catch (e) {
                let response: InsightResponse = {code: 400, body: e.message};
                reject(response);
            }
        });
    }

    /**
     *
     * @param id
     * @returns {Promise<InsightResponse>}
     */
    public removeDataset (id:string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            try {
                var fs = require('fs');
                let controller = InsightFacade.datasetController;
                let datasets = controller.getDatasets();

                if (fs.existsSync('./data/' + id + '.json')){
                    fs.unlink('./data/' + id + '.json');
                    datasets[id] = null;
                    let response: InsightResponse = {code: 204, body: "delete successful"};
                    fulfill(response);
                } else {
                    let response: InsightResponse = {code: 404, body: 'resource with id: ' + id + ' was not previously PUT'};
                    reject(response);
                }
            } catch (err) {
                let response: InsightResponse = {code: 404, body: err.message};
                reject(response);
            }
        });
    }

    /**
     *
     * @param query
     * @returns {Promise<InsightResponse>}
     */
    public performQuery (query: QueryRequest): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            try {
                var fs = require('fs');

                let datasets = InsightFacade.datasetController.getDatasets();
                let queryController = new QueryController(datasets);
                let id = query.GET[0].split('_')[0];
                let isValid = queryController.isValid(query);

                if (isValid === true) {
                    let result = queryController.query(query);
                    try {
                        if (!fs.existsSync('./data/' + id + '.json')) {
                            let response: InsightResponse = {code: 424, body: {missing: [id]}};
                            reject(response);
                        } else {
                            let response: InsightResponse = {code: 200, body: result};
                            fulfill(response);
                        }
                    } catch (err) {
                        let response: InsightResponse = {code: 400, body: err.message};
                        reject(response);
                    }
                } else {
                    let response: InsightResponse = {code: 400, body: "invalid query"};
                    reject(response);
                }
            } catch (e) {
                let response: InsightResponse = {code: 400, body: e.message};
                reject(response);
            }
        });
    }
}