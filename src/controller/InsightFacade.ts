/*
 * This should be in the same namespace as your controllers
 */
import {QueryRequest, default as QueryController} from "./QueryController";
import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import DatasetController from "./DatasetController";
import fs = require('fs');


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
                var controller = InsightFacade.datasetController;

                controller.process(id, content).then(function (result) {
                    try {
                        if (controller.invalidDataSet) {
                            reject({code: 400, body: {error: "not valid dataset"}});
                        } else {
                            if (fs.existsSync('./data/' + id + '.json')) {
                                fulfill({code: 201, body: {success: result}});
                            } else {
                                fulfill({code: 204, body: {success: result}});
                            }
                        }
                    } catch (e) {
                        reject({code: 400, body: {error: e.message}});
                    }
                }).catch(function (err: Error) {
                    reject({code: 400, body: {error: err.message}});
                });
            } catch (e) {
                reject({code: 400, body: {error: e.message}});
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
                let controller = InsightFacade.datasetController;
                let datasets = controller.getDatasets();

                if (fs.existsSync('./data/' + id + '.json')){
                    fs.unlink('./data/' + id + '.json');
                    datasets[id] = null;
                    fulfill({code: 204, body: "delete successful"});
                } else {
                    reject({code: 404, body: {error: 'resource with id: ' + id + ' was not previously PUT'}});
                }
            } catch (err) {
                reject({code: 400, body: {error: err.message}});
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

                let datasets = InsightFacade.datasetController.getDatasets();
                let queryController = new QueryController(datasets);
                let id = query.GET[0].split('_')[0];
                let isValid = queryController.isValid(query);

                if (isValid === true) {
                    let result = queryController.query(query);
                    if (!fs.existsSync('./data/' + id + '.json')) {
                        reject({code: 424, body: {missing: [id]}});
                    } else {
                        console.log("made it to 200");
                        fulfill({code: 200, body: result});
                    }
                } else {
                    reject({code: 400, body: {error: 'invalid query'}});
                }

            } catch (e) {
                reject({code: 400, body: {error: e.message}});
            }
        });
    }
}