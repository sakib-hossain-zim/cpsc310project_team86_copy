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
            let stringKeys = file.split(".");
            let id = stringKeys[0];
            that.datasets[id] = fs.readFileSync("./data/" + file, 'utf8');
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

        return new Promise(function (fulfill, reject) {

            try {

                if (id == "courses") {
                    let jsonProcess = new ProcessJson();
                    let JSONProcessedDataset = jsonProcess.process(id, data, that.invalidDataSet);
                    JSONProcessedDataset.then(function (value) {
                        fulfill(value);
                    }).catch(function (err) {
                        Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                        reject(err);
                    });;
                }
                if (id == "rooms") {
                    let htmlProcess = new ProcessHtml();
                    let htmlProcessedDataset = htmlProcess.process(id, data, that.invalidDataSet);
                    htmlProcessedDataset.then(function (value) {
                        fulfill(value);
                    }).catch(function (err) {
                        Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                        reject(err);
                    });
                }
            } catch (error) {
                reject(error);
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