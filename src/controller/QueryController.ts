/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets, default as DatasetController} from "./DatasetController";
import Log from "../Util";
import fs = require('fs');
import filter = require("core-js/library/fn/array/filter");

export interface QueryRequest {
    GET: string|string[];
    WHERE: {};
    ORDER: {};
    AS: string;
    APPLY?: {}[];
    GROUP?: string[];
    GT?: {};
    IS?: {};
}


export interface QueryResponse {
    render?: string;
    result?: [{}];
}

interface responseObject {
    courses_dept: string;
    courses_avg: number;
    courses_instructor: string;
    courses_pass: number;
    courses_fail: number;
    courses_title: string;
    courses_id: string;
    courses_audit: string;
}

interface stringArray {
    [index: number]: string;
}

export default class QueryController {
    private datasets: Datasets = {};

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    /**
     * Check if query is valid
     * @param query
     * @returns {boolean}
     */
    public isValid(query: QueryRequest): boolean {

        //console.log(query.GET.includes(query.ORDER));
        if (typeof query === 'undefined') return false;
        if (query.AS != 'TABLE') return false;

        if (query.GROUP != undefined && query.APPLY != undefined) {
            if ((query.GROUP.length) == 0) {
                return false;
            }
            if ((typeof query.APPLY !== 'undefined') && (typeof query.GROUP == 'undefined')) {
                return false;
            }
            if ((typeof query.GROUP !== 'undefined') && (typeof query.APPLY == 'undefined')) {
                return false;
            }

            if (typeof query.GET !== 'undefined') {

                let keys: any = query.GET;
                let group_keys: any = query.GROUP;
                let apply_keys: any = query.APPLY;

                for (let key of keys){
                    var get_keys:any = key;
                   // console.log ("what is " + get_keys);
                }

                for (let group_key of group_keys) {
                    var groupies = group_key;
                    //console.log ("what is " + groupies);
                }

                for (let apply_key of apply_keys) {  // iterate through every key in apply
                    var applies: any = Object.keys(apply_key)[0];
                    //console.log ("what is " + applies);
                }
                //console.log ("groupies is" + groupies);
                //console.log (get_keys.includes(groupies));

                if (get_keys.includes(groupies)) {
                    return true;
                }
                else {
                    return false;
                }

            }
        }
        // keys in GROUP cannot occur in APPLY and vice versa
        if (typeof query.GROUP !== 'undefined' && typeof query.APPLY !== 'undefined') {
            for (let groupKey of query.GROUP) {
                //  console.log(groupKey);
                for (let applyObj of query.APPLY) {
                    let applyKeys = Object.keys(applyObj);
                    for (let key of applyKeys) {
                        //   console.log(key);
                        if (key == groupKey) {
                            return false;
                        }
                        let insideObj = applyObj[key];
                        let insideKeys = Object.keys(insideObj);
                        for (let insideKey of insideKeys) {
                            let insideValue = insideObj[insideKey];
                            if (insideValue == groupKey) {
                                return false;
                            }
                        }
                    }
                }
            }
        }


        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0) {
            return true;
        }
    }

    /**
     * Check is dataset is empty
     * @param data
     * @returns {boolean}
     */
    public isDataSetEmpty(data: any): boolean {
        if (typeof data !== 'undefined' && data.length > 0) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * GET filter
     * @param query
     * @param data
     * @returns {responseObject[]}
     */
    public filterColumns(query: QueryRequest, data: any): any {
        console.log("in filter columns (GET)");
        let respObjArray: responseObject[] = [];
        let applyKeyArray: any = [];

        if (typeof query.APPLY !== "undefined" && query.APPLY.length > 0) {
            for (let objApply of query.APPLY) {
                for (let prop in objApply) {
                    let innerObj = objApply[prop];
                    for (let innerProp in innerObj) {
                        let applyKey = innerObj[innerProp];
                        applyKeyArray.push(applyKey);
                    }
                }
            }
        }

        data.forEach(function (obj: any) {
            var respObj: responseObject = <any>{};
            let i: number = 0;

            for (let key of query.GET) {

                if (key == "courses_dept") {
                    respObj.courses_dept = obj.courses_dept;
                }
                if (key == "courses_avg") {
                    respObj.courses_avg = obj.courses_avg;
                }
                if (key == "courses_audit") {
                    respObj.courses_audit = obj.courses_audit;
                }
                if (key == "courses_pass") {
                    respObj.courses_pass = obj.courses_pass;
                }
                if (key == "courses_fail") {
                    respObj.courses_fail = obj.courses_fail;
                }
                if (key == "courses_id") {
                    respObj.courses_id = obj.courses_id;
                }
                if (key == "courses_title") {
                    respObj.courses_title = obj.courses_title;
                }
                if (key == "courses_instructor") {
                    respObj.courses_instructor = obj.courses_instructor;
                }
            }
            for (let applyKey of applyKeyArray) {
                respObj[applyKey] = obj[applyKey];
            }
            if (typeof query.APPLY !== 'undefined' && query.APPLY.length > 0) {
                for (let obj of query.APPLY) {
                    let newProp: any = Object.keys(obj)[0];
                    respObj[newProp] = "";
                }
            }
            respObjArray.push(respObj);
        });
        return respObjArray; // object with only the GET columns
    }

    /**
     * Sort ascending
     * @param value1
     * @param value2
     * @param keys
     * @param i
     * @returns {any}
     */
    public sortUpFunction (value1: any, value2: any, keys: any, i: number) {
        if (value1[keys[i]] < value2[keys[i]]) {
            return -1;
        } else if (value1[keys[i]] > value2[keys[i]]) {
            return 1;
        } else {
            return this.sortUpFunction (value1, value2, keys, i + 1);
        }
    }

    /**
     * Sort descending
     * @param value1
     * @param value2
     * @param keys
     * @param i
     * @returns {any}
     */
    public sortDownFunction (value1: any, value2: any, keys: any, i: number) {
        if (value1[keys[i]] > value2[keys[i]]) {
            return -1;
        } else if (value1[keys[i]] < value2[keys[i]]) {
            return 1;
        } else {
            return this.sortDownFunction (value1, value2, keys, i + 1);
        }
    }

    /**
     * ORDER results by ascending or descending
     * @param query
     * @param data
     * @param i
     * @returns {T[]|Uint32Array|Float32Array|Int32Array|any|Uint16Array}
     */
    public orderResponse(query: QueryRequest, data: any, i: number) { // i always starts 0
        let that = this;
        let key:any = query.ORDER;
        // console.log(Object.keys(key).length);
        let dir: any = Object.keys(key)[0];
        let keys: any = Object.keys(key)[1];
        let dirValue: any = key[dir];
        let keysValue: any = key[keys];

        // let properties = (Object.keys(key).length);

        if (typeof query.ORDER == "string") {
            console.log("in orderResponse if branch");
            return data.sort(function (result1: any, result2: any) {
                if (result1[key] < result2[key]) {
                    return -1;
                }
                else if (result1[key] > result2[key]) {
                    return 1;
                }
                return 0;
            });

        }

        if (i < keysValue.length) {
            if (dirValue == 'UP') {
                return data.sort(function (result1: any, result2: any) {
                    return that.sortUpFunction(result1, result2, keysValue, i);
                });
            }
            
            if (dirValue == 'DOWN') {
                return data.sort(function (result1: any, result2: any) {
                    return that.sortDownFunction(result1, result2, keysValue, i);
                });
            }
        }
    }

    /**
     * Helper method for filterRows. Returns the result of a comparison between two values.
     * @param field: indicates which type of comparison is to be made value & threshold are the 2 values to be compared
     * @param value
     * @param threshold
     * @returns {Boolean} obtained from the comparison
     */
    public compare(field: string, value: any, threshold?: any) {
        var res: Boolean;
        // console.log("in compare method");
        switch (field) {
            case "GT":
                res = value > +threshold;
                break;
            case 'LT':
                res = value < +threshold;
                break;
            case 'EQ':
                res = value == threshold;
                break;
            case 'NOT':
                res = value !== threshold;
                break;
            case 'IS':
                res = value === threshold;
                break;
            default:
                res = true;
                break;

        }
        return res;
    }

    /**
     * WHERE filter
     * @param field
     * @param queryData
     * @param data
     * @returns {any}
     */
    public filterRows(field: any, queryData: any, data: any) {
        let that = this;
        var filteredData: any = [];
        var ANDFilteredData: any;
        var count: number = 0;

        if (field == 'AND') {
            for (let obj of queryData) {
                var key: any;
                var value: any;
                for (let i in obj) {
                    key = i;
                    value = obj[i];
                    if (count < 1) {
                        ANDFilteredData = this.filterRows(key, value, data);
                    }
                    else {
                        ANDFilteredData = this.filterRows(key, value, ANDFilteredData);
                    }
                    count++;
                }
            }
            return ANDFilteredData;
        }


        else if (field == 'OR') {
            var ORFilteredData: any;
            var ORReturnData: any = [];
            // console.log(queryData);
            for (let obj of queryData) {
                var key: any;
                var value: any;

                for (let i in obj) {
                    key = i;
                    value = obj[i];
                    ORFilteredData = this.filterRows(key, value, data);
                    for (let obj of ORFilteredData) {
                        ORReturnData.push(obj);
                    }
                }
            }
            return ORReturnData;
        }

        else {
            var Cvalue: any;
            let keys: any = Object.keys(queryData);
            for (let key of keys) {
                var replaceKey = key.replace(/[\[\]']+/g,'');
            }
            for (let i in queryData) {
                Cvalue = queryData[i];
            }

            data.forEach(function (x: any) {
                if (that.compare(field, x[replaceKey], Cvalue)) {
                    filteredData.push(x);
                }
            });
            return filteredData;
        }
    }

    // public getValuesforKey (key:any, data:any): any {
    //     let arrOfKeyValues: any = [];
    //     let i:number;
    //     for (i =0; i < data.length; i++) {
    //         let keyToMatch: any = data[i][key];
    //         if (!(arrOfKeyValues.indexOf(keyToMatch)> -1)) {
    //             arrOfKeyValues.push(keyToMatch);
    //         }
    //         i++;
    //     }
    //     return arrOfKeyValues;
    // }
    public arrayFromObject(obj) {
        var arr = [];
        for (var i in obj) {
            arr.push(obj[i]);
        }
        return arr;
    }
    /**
     * Group the list of results into sets by some matching criteria (an Array of groups, each of which is an array)
     * @param query
     * @param data
     * @returns {any}
     */
    public group(query: QueryRequest, data: any, i: any): any {
        if (typeof query.GROUP == 'undefined') {
            return data;
        }
        let groupKeys: any = query.GROUP;

        var hash = {};
        for (let obj of data) {
            let keyArray: any = [];

            for (let key of groupKeys) {
                keyArray.push(obj[key]);
            }
            let property: string = keyArray.join('');

            if (hash.hasOwnProperty(property)) {
                hash[property].push(obj);
            } else {
                hash[property] = [];
                hash[property].push(obj);
            }
        }
        let groupArray: any = this.arrayFromObject(hash);
        return groupArray;
    }

    /**
     *
     * @param field
     * @param value
     * @param group
     * @param query
     * @returns {number}
     */
    public applyFields(field:any, value: any, group: any, query: QueryRequest) {
        if (field == 'MAX') {
            var max: number = 0;
            for (let obj of group) {
                if (obj[value] > max) {
                    max = obj[value];
                }
                if(!query.GET.hasOwnProperty(value)) {
                    delete obj[value];
                }
            }
            return max;
        }
        if (field == 'MIN') {
            var min: number = 1000000;
            for (let obj of group) {
                if (obj[value] < min) {
                    min = obj[value];
                }
                if(!query.GET.hasOwnProperty(value)) {
                    delete obj[value];
                }
            }
            return min;
        }
        if (field == 'AVG') {
            let sum: number = 0;
            let count: number = 0;
            for (let obj of group) {
                sum = sum + obj[value];
                count++;
                if(!query.GET.hasOwnProperty(value)) {
                    delete obj[value];
                }
            }
            let avg: number = sum / count;
            avg = +avg.toFixed(2);
            return avg;
        }
        if (field == 'COUNT') {
            let count: number = 0;
            let compareArray: any = [];
            for (let obj of group) {
                let compareVal: any = obj[value];
                compareArray.push(compareVal);
            }
            var counts = {};
            for (var i = 0; i < compareArray.length; i++) {
                counts[compareArray[i]] = 1 + (counts[compareArray[i]] || 0);
            }
            let key = Object.keys(counts)[0];
            let result: any = counts[key];

            for (let obj of group)  {
                if(!query.GET.hasOwnProperty(value)) {
                    delete obj[value];
                }
            }
            return result;
        }
    }

    /**
     *
     * @param query
     * @param data
     * @returns {any}
     */
    public apply(query: QueryRequest, data: any): any {
        if (typeof query.APPLY == 'undefined') {
            return data;
        }
        console.log("in apply method");
        let respArray: any = [];
        let applyArray: any = query.APPLY;

        for (let group of data) {

            for (let obj of applyArray) {
                let applyProp: any = Object.keys(obj)[0];
                for (let prop in obj) {
                    let innerObj: any = obj[prop];
                    for (let innerProp in innerObj) {
                        var field: any = innerProp;
                        var value: any = innerObj[innerProp];
                    }
                }
                let result: any = this.applyFields(field, value, group, query);
                group[0][applyProp] = result;
            }
            respArray.push(group[0]);
        }
        return respArray;
    }

    /**
     * The actual query happening
     * @param query
     * @returns {QueryResponse}
     */
    public query(query: QueryRequest): any {
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');
        //define a function to process the query. use this to check
        let id = query.GET[0].split('_')[0];
        let dataID = Object.keys(this.datasets)[0];

        let data: any = this.datasets[dataID];
        let isEmpty = this.isDataSetEmpty(data);
        if (isEmpty === true) {
            let response: QueryResponse = {render: query.AS, result: [{}]};
            return response;
        }
        var parsedData = JSON.parse(data);
        // let groupedData: any = [];
        // let GET_results = this.filterColumns(query, parsedData);

        if (typeof query.WHERE == 'undefined'|| Object.keys(query.WHERE).length == 0) {
            var GET_results = this.filterColumns(query, parsedData);
        } else {
            let operands: stringArray = Object.keys(query.WHERE);
            var key: any = operands[0];
            var value: any;
            for (let i in query.WHERE) {
                value = query.WHERE[i];
            }
            let WHERE_Results: {}[] = this.filterRows(key, value, parsedData);
            var GET_results = this.filterColumns(query, WHERE_Results);

        }
        var groupedData = this.group(query, GET_results,0);

        let appliedData: any = this.apply(query, groupedData);

        if (typeof query.ORDER !== 'undefined') {
            // let i: number = 0;
            var orderedResults = this.orderResponse(query, appliedData, 0);
        }
        var response: QueryResponse = {render: query.AS, result: orderedResults};
        return response;
    }
}