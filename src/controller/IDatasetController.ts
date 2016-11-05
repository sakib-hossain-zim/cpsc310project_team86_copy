/**
 * Created by Sp05_ on 2016-11-05.
 */
import {QueryRequest} from "./QueryController";

export interface Datasets {
    [id: string]: {};
}

export interface IDatasetController {

    /**
     * Returns the referenced dataset. If the dataset is not in memory, it should be
     * loaded from disk and put in memory. If it is not in disk, then it should return
     * null.
     *
     * @param id
     * @returns {{}}
     */
    getDataset(id: string): any;


    getDatasets(): Datasets;

    /**
     * Process the dataset; save it to disk when complete.
     *
     * @param id
     * @param data base64 representation of a zip file
     * @returns {Promise<boolean>} returns true if successful; false if the dataset was invalid (for whatever reason)
     */
    process(id: string, data: any): Promise<boolean>;

    /**
     * Writes the processed dataset to disk as 'id.json'. The function should overwrite
     * any existing dataset with the same name.
     *
     * @param id
     * @param processedDataset
     */
    save(id: string, processedDataset: any);

}