/**
 * Created by rtholmes on 2016-09-03.
 */
import Log from "../Util";
import JSZip = require('jszip');
import set = Reflect.set;
import fs = require('fs');
import keys = require("core-js/fn/array/keys");
import {IDatasetController} from "./IDatasetController";
import {Datasets} from "./IDatasetController";

import {stringify} from "querystring";
import {error} from "util";

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: {};
}

interface toBeAdded {
    courses_dept: string;
    courses_id: string;
    courses_avg: number;
    courses_instructor: string;
    courses_title: string;
    courses_pass: number;
    courses_fail: number;
    courses_uuid: string;
    courses_audit: number;
}


export default class JSONDatasetController implements IDatasetController {

    private datasets: Datasets = {};
    public invalidDataSet: boolean = false;

    constructor() {
        Log.trace('DatasetController::init()');
        // this.getDatasets();

    }
    /**
     * Returns the referenced dataset. If the dataset is not in memory, it should be
     * loaded from disk and put in memory. If it is not in disk, then it should return
     * null.
     *
     * @param id
     * @returns {{}}
     */
    public getDataset(id: string): any {
        return this.datasets[id];
    }

    public getDatasets(): Datasets {

        let that = this;

        let i = 0;
        var filenames = fs.readdirSync("./data/");
        filenames.forEach(function (file) {
            that.datasets[i] = fs.readFileSync("./data/" + file, 'utf8');
            i++;
        });

        return that.datasets;
    }
    /**
     * Process the dataset; save it to disk when complete.
     *
     * @param id
     * @param data base64 representation of a zip file
     * @returns {Promise<boolean>} returns true if successful; false if the dataset was invalid (for whatever reason)
     */
    public process(id: string, data: any): Promise<boolean> {
        Log.trace('DatasetController::process( ' + id + '... )');

        let that = this;
        let processedDataset : toBeAdded[] = [];

        return new Promise(function (fulfill, reject) {
            try {

                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.var myCourses: JSZipObject;

                    let promises: Promise<string>[] = [];
                    zip.folder('courses').forEach(function(relativePath, file) {
                        var p : Promise<string> = file.async("string");
                        promises.push(p);
                    });
                    Promise.all(promises).then(function(files: any[]) {
                        if (typeof files === 'undefined' || files.length < 1) {
                            that.invalidDataSet = true;
                        }
                        files.forEach(function (file) {

                            let results: any[];
                            if (file !== null) {
                                var o = JSON.parse(file);
                                results = o.result;
                            }

                            if((!(o.hasOwnProperty("result"))) || (typeof o !== 'object' )) {
                                that.invalidDataSet = true;
                            }
                            if (results.length > 0) {

                                results.forEach(function (arrObject: any) {
                                    let tba: toBeAdded = <any>{};

                                    tba.courses_dept = arrObject['Subject'];
                                    tba.courses_id = arrObject['Course'];
                                    tba.courses_avg = arrObject['Avg'];
                                    tba.courses_instructor = arrObject['Professor'];
                                    tba.courses_title = arrObject['Title'];
                                    tba.courses_pass = arrObject['Pass'];
                                    tba.courses_fail = arrObject['Fail'];
                                    tba.courses_uuid = arrObject['id'];
                                    tba.courses_audit = arrObject['Audit'];
                                    processedDataset.push(tba);
                                });
                            }
                        });
                        that.save(id, processedDataset);
                    });
                    fulfill(true);
                }).catch(function (err) {
                    Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                    reject(err);
                });
            } catch (err) {
                Log.trace('DatasetController::process(..) - ERROR: ' + err);
                reject(err);
            }
        });
    }

    /**
     * Writes the processed dataset to disk as 'id.json'. The function should overwrite
     * any existing dataset with the same name.
     *
     * @param id
     * @param processedDataset
     */
    private save(id: string, processedDataset: any) {
        // add it to the memory model
        try {
            var dirExist = fs.existsSync('./data');
            if (!dirExist) {
                fs.mkdirSync('./data/');
                fs.writeFile('./data/' + id + '.json', JSON.stringify(processedDataset));
            } else {
                fs.writeFile('./data/' + id + '.json', JSON.stringify(processedDataset));
            }
        }

        catch(err){
            Log.trace("error in writing file to disk");
        }
    }
}