/*
 * This should be in the same namespace as your controllers
 */
import {QueryRequest} from "./QueryController";
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

        let controller = InsightFacade.datasetController;
        var fs = require('fs');

        return new Promise(function (fulfill, reject) {
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
        });
    }

    public removeDataset (id:string): Promise<InsightResponse> {
        // TODO: need to implement this
        let controller = InsightFacade.datasetController;
        var fs = require('fs');
        let datasets = controller.getDatasets();

        return new Promise(function (fulfill, reject) {
            try {
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

    public performQuery (query: QueryRequest): Promise<InsightResponse> {
        // TODO: need to implement this
        return new Promise(function (fulfill, reject) {
            try {

            } catch (err) {
                reject(err);
            }
        });
    }
}