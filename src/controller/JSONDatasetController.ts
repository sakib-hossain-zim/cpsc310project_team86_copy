/**
 * Created by rtholmes on 2016-09-03.
 */
import Log from "../Util";
import JSZip = require('jszip');
import set = Reflect.set;
import fs = require('fs');
import keys = require("core-js/fn/array/keys");
import ProcessJson from "./ProcessJson";
import ProcessHtml from "./ProcessHtml";

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: {};
}

// interface toBeAddedJson {
//     courses_dept: string;
//     courses_id: string;
//     courses_avg: number;
//     courses_instructor: string;
//     courses_title: string;
//     courses_pass: number;
//     courses_fail: number;
//     courses_uuid: string;
//     courses_audit: number;
// }
//
// interface toBeAddedHtml {
//     rooms_fullname: string;
//     rooms_shortname: string;
//     rooms_number: string;
//     rooms_name: string;
//     rooms_address: string;
//     rooms_lat: number;
//     rooms_lon: number;
//     rooms_seats: number;
//     rooms_type: string;
//     rooms_furniture: string;
//     rooms_href: string;
// }

export default class DatasetController {

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

        //if filetype is json:
        let processedDataset = [];
        let fileType: string = "";
        // else:
        // let processedDataset : toBeAddedHtml[] = [];

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

                    if (zip.files.hasOwnProperty('index.htm')) {
                        fileType = 'html';
                        zip.folder('310rooms.1.1').forEach(function(relativePath, file) {
                            var p : Promise<string> = file.async("string");
                            promises.push(p);
                        });
                    } else {
                        fileType = 'json';
                        zip.folder('courses').forEach(function(relativePath, file) {
                            var p : Promise<string> = file.async("string");
                            promises.push(p);
                        });
                    }

                    Promise.all(promises).then(function(files: any[]) {
                        if (typeof files === 'undefined' || files.length < 1) {
                            that.invalidDataSet = true;
                        }

                        if (fileType === 'json') {
                            // if filetype is json
                            var jsonProcess = new ProcessJson();
                            jsonProcess.process(files, processedDataset, that.invalidDataSet);
                        } else {
                            var htmlProcess = new ProcessHtml();
                            htmlProcess.process(files, processedDataset, that.invalidDataSet);
                        }

                        // else if filetype is html

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

// files.forEach(function (file) {
//
//     let results: any[];
//     if (file !== null) {
//         var o = JSON.parse(file);
//         results = o.result;
//     }
//
//     if((!(o.hasOwnProperty("result"))) || (typeof o !== 'object' )) {
//         that.invalidDataSet = true;
//     }
//
//     if (results.length > 0) {
//         results.forEach(function (arrObject: any) {
//             let tba: toBeAdded = <any>{};
//
//             tba.courses_dept = arrObject['Subject'];
//             tba.courses_id = arrObject['Course'];
//             tba.courses_avg = arrObject['Avg'];
//             tba.courses_instructor = arrObject['Professor'];
//             tba.courses_title = arrObject['Title'];
//             tba.courses_pass = arrObject['Pass'];
//             tba.courses_fail = arrObject['Fail'];
//             tba.courses_uuid = arrObject['id'];
//             tba.courses_audit = arrObject['Audit'];
//             processedDataset.push(tba);
//         });
//     }
// });