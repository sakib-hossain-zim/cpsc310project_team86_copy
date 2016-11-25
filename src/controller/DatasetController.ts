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
                    let anotherpromise: Promise<string>[] = [];

                    if (zip.files.hasOwnProperty('index.htm')) {
                        fileType = 'html';
                        let zip1 = zip.folder('campus');
                        let zip2 = zip1.folder('discover');
                        zip2.folder('buildings-and-classrooms').forEach(function(relativePath, file) {
                            file.name;
                            let p1 : Promise<string> = file.async("string");
                            promises.push(p1);
                        });
                    } else {
                        fileType = 'json';
                        zip.folder('courses').forEach(function(relativePath, file) {
                            let p2 : Promise<string> = file.async("string");
                            anotherpromise.push(p2);
                        });
                    }
                    // json promises
                    if (fileType === 'json') {
                        console.log(anotherpromise.length);
                        Promise.all(anotherpromise).then(function (files: any[]) {
                            console.log(typeof files);
                            console.log(files.length);
                            if (typeof files === 'undefined' || files.length < 1) {
                                that.invalidDataSet = true;
                            }

                            console.log('filetype is json');
                            let jsonProcess = new ProcessJson();
                            let JSONProcessedDataset = jsonProcess.process(files, processedDataset, that.invalidDataSet);
                            that.save(id, processedDataset);
                            fulfill(true);


                        }).catch(function (err) {
                            console.log('Error in promise.all ' + err);
                            reject(err);
                        });
                    }

                    if (fileType === 'html') {
                        Promise.all(promises).then(function (files: any[]) {
                            if (typeof files === 'undefined' || files.length < 1) {
                                that.invalidDataSet = true;
                            }

                                console.log ('filetype is html');
                                let htmlProcess = new ProcessHtml();
                              htmlProcess.process(id, files, that.invalidDataSet).then(function(value){
                                  console.log('back from htmlprocess');
                                  that.save(id, value);
                                  fulfill(true);
                              });

                        }).catch(function (err) {
                            console.log('Error in promise.all ' + err);
                            reject(err);
                        });
                    }

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
    public save(id: string, processedDataset: any) {
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