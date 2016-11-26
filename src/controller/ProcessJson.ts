import Log from "../Util";
import DatasetController from "./DatasetController";
import JSZip = require('jszip');


interface toBeAddedJson {
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

export default class ProcessJson {

    public process(id: string, data: any, invalidDataset: any): Promise<boolean> {

        let that = this;
        let processedDataset = [];
        let datasetController = new DatasetController();

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
                    zip.folder('courses').forEach(function (relativePath, file) {
                        let p: Promise<string> = file.async("string");
                        promises.push(p);
                    });
                    Promise.all(promises).then(function (files: any[]) {
                        if (typeof files === 'undefined' || files.length < 1) {
                            invalidDataset = true;
                        }
                        files.forEach(function (file) {

                            let results: any[];
                            if (file !== null) {
                                var o = JSON.parse(file);
                                results = o.result;
                            }

                            if ((!(o.hasOwnProperty("result"))) || (typeof o !== 'object' )) {
                                invalidDataset = true;
                            }
                            if (results.length > 0) {

                                results.forEach(function (arrObject: any) {
                                    let tba: toBeAddedJson = <any>{};

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
                        datasetController.save(id, processedDataset)
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
}