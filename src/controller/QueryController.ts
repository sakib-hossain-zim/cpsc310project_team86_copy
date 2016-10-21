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
    ORDER: string;
    AS: string;
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


    public isValid(query: QueryRequest): boolean {

        //console.log(query.GET.includes(query.ORDER));
        if (typeof query === 'undefined' ) return false;
        // if (query.AS != 'TABLE') return false;

        // let operands = Object.keys(query.WHERE);
        // let validWhere: boolean = false;
        // operands.forEach(function (o){
        //     if (o ==('GT' || 'LT' || 'EQ' || 'AND' || 'OR' || 'IS' || 'NOT')) {
        //         validWhere = true;
        //     }
        // });
        // if (!validWhere) {
        //     return false;
        // }


        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0) {
            let hasORDER = query.ORDER;

            if (query.GET.includes(hasORDER)){
                if (query.AS === 'TABLE'){
                    return true;}
            }
            else return false;

        }
    }

    public isDataSetEmpty(data: any): boolean {
        if (typeof data !== 'undefined' && data.length > 0) {
            return false;
        } else {
            return true;
        }
    }

    public filterColumns(query: QueryRequest, data: any): any {

        if (query.GET.constructor !== Array || query.GET.constructor !== String) {
        }

        let respObjArray: responseObject[] = [];

        data.forEach(function (f: any) {
            var respObj: responseObject = <any>{};

            for (let key of query.GET) {

                if (key == "courses_dept") {
                    respObj.courses_dept = f.courses_dept;
                }
                if (key == "courses_avg") {
                    respObj.courses_avg = f.courses_avg;
                }
                if (key == "courses_audit") {
                    respObj.courses_audit = f.courses_audit;
                }
                if (key == "courses_pass") {
                    respObj.courses_pass = f.courses_pass;
                }
                if (key == "courses_fail") {
                    respObj.courses_fail = f.courses_fail;
                }
                if (key == "courses_id") {
                    respObj.courses_id = f.courses_id;
                }
                if (key == "courses_title") {
                    respObj.courses_title = f.courses_title;
                }
                if (key == "courses_instructor") {
                    respObj.courses_instructor = f.courses_instructor;
                }
            }
            respObjArray.push(respObj);
        });
        return respObjArray;
    }

    public orderResponse(query: QueryRequest, data: any) {
        let key = query.ORDER;
        let that = this;
        //data.sort((x[key],y[key]) => x[key]-y[key]);
        // console.log(data);
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
    /**
     * Helper Method for filterRows. Returns the result of a comparison between two values.

     * @param s: indicates which type of comparison is to be made value & threshold are the 2 values to be compared
     * @returns boolean obtained from the comparison
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
                    // console.log(ORFilteredData);
                    for (let obj of ORFilteredData) {
                        ORReturnData.push(obj);
                    }
                }
            }
            return ORReturnData;
        }
        else {
            let Cvalue: any;
            let keys: any = Object.keys(queryData);
            for (let key of keys) {
                var replaceKey = key.replace(/[\[\]']+/g,'');
            }
            for (let i in queryData) {
                Cvalue = queryData[i];
            }

            data.forEach(function (x: any) {
                if (that.compare(field, x[replaceKey], Cvalue)) filteredData.push(x);
            });
            return filteredData;
        }
    }

    public query(query: QueryRequest): any {
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');
        //define a function to process the query. use this to check
        let id = query.GET[0].split('_')[0];
        let dataID = Object.keys(this.datasets)[0];

        let data: any = this.datasets[dataID];
        // console.log(data);
        let isEmpty = this.isDataSetEmpty(data);
        if (isEmpty === true) {
            let response: QueryResponse = {render: query.AS, result: [{}]};
            return response;
        }
        var parsedData = JSON.parse(data);

        let operands: stringArray = Object.keys(query.WHERE);
        var key: any = operands[0];
        var value: any;
        for (let i in query.WHERE) {
            var where: any = query.WHERE;
            value = where[i];
        }
        let filteredResults: {}[] = this.filterRows(key, value, parsedData);
        if (query.ORDER !== 'undefined') {
            var orderedResults = this.orderResponse(query, filteredResults);
        }
        let results = this.filterColumns(query, orderedResults);
        var response: QueryResponse = {render: query.AS, result: results};
        return response;

    }
}