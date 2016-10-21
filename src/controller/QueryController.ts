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


    public isValid(query: QueryRequest): boolean {

        //console.log(query.GET.includes(query.ORDER));
        if (typeof query === 'undefined') return false;
        if (query.AS != 'TABLE') return false;
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
            return true;
        }
        return false;
    }

    public isDataSetEmpty(data: any): boolean {
        if (typeof data !== 'undefined' && data.length > 0) {
            return false;
        } else {
            return true;
        }
    }

    public filterColumns(query: QueryRequest, data: any): any {

        let respObjArray: responseObject[] = [];
        let applyKeyArray: any = [];

        for (let objApply of query.APPLY) {
            for (let prop in objApply) {
                let innerObj = objApply[prop];
                for (let innerProp in innerObj) {
                    let applyKey = innerObj[innerProp];
                    applyKeyArray.push(applyKey);
                }
            }
        }
        data.forEach(function (obj: any) {
            var respObj: responseObject = <any>{};
            let i:number = 0;

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

            for (let obj of query.APPLY) {
                let newProp: any = Object.keys(obj)[0];
                respObj[newProp] = "";
            }
            respObjArray.push(respObj);
        });
        return respObjArray;
    }

    public orderResponse(query: QueryRequest, data: any, i: number) {
        let that = this;
        let key:any = query.ORDER;
        console.log(key);
        let dir: any = Object.keys(key)[0];
        let keys: any = Object.keys(key)[1];
        let dirValue: any = key[dir];
        let keysValue: any = key[keys];
        console.log(dir);
        console.log(keys);
        console.log(dirValue);
        console.log(keysValue);
        console.log(keysValue[0]);
        let properties = (Object.keys(key).length);

        if (properties == 0) {

        } else if (properties == 1) {
            return data.sort(function (result1: any, result2: any) {
                if (result1[key] < result2[key]) {
                    return -1;
                }
                else if (result1[key] > result2[key]) {
                    return 1;
                }
                return 0;
            });
        } else {
             console.log("in orderresponse else")
            if (dirValue == 'UP') {
                 console.log("in order response UP case")
                return data.sort(function (result1: any, result2: any) {
                    console.log(result1);
                    console.log(keysValue);
                    console.log(keysValue[0]);
                    console.log(result1[keysValue[i]]);
                    if (result1[keysValue[i]] < result2[keysValue[i]]) {
                        console.log("in less than branch");
                        return -1;
                    } else if (result1[keysValue[i]] > result2[keysValue[i]]) {
                        console.log("in greater than branch");
                        return 1;
                    } else {
                        console.log('in recurison branch');
                        let equalDataArray: any = [];
                        equalDataArray.push(result1);
                        equalDataArray.push(result2);
                    return that.orderResponse(query, equalDataArray, i= i + 1);
                    }
                });
            }
            if (dirValue == 'DOWN') {
                return data.sort(function (result1: any, result2: any) {
                    if (result1[keysValue[i]] > result2[keysValue[i]]) {
                        return -1;
                    }
                    else if (result1[keysValue[i]] < result2[keysValue[i]]) {
                        return 1;
                    } else {
                        return this.orderResponse(query, data, i = i + 1);
                    }
                });
            }
        }
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
    public getValuesforKey (key:any, data:any): any {
        let arrOfKeyValues: any = [];
        let i:number;
        for (i =0; i < data.length; i++) {
            let keyToMatch: any = data[i][key];
            if (!(arrOfKeyValues.indexOf(keyToMatch)> -1)) {
                arrOfKeyValues.push(keyToMatch);
            }
            i++;
        }
        return arrOfKeyValues;
    }

    public group(query: QueryRequest, data: any): any {
        console.log("in group method");
        let groupKeys : any = query.GROUP;
        var arr: any = data;
        var groups: any = [];
        for(var i = 0, len = arr.length; i<len; i+=1){
            var obj = arr[i];
            if(groups.length == 0){
                groups.push([obj]);
            }
            else{
                var equalGroup: any = false;
                for(var a = 0, glen = groups.length; a<glen;a+=1){
                    var group : any = groups[a];
                    var equal : any = true;
                    var firstElement = group[0];
                    groupKeys.forEach(function(property){

                        if(firstElement[property] !== obj[property]){
                            equal = false;
                        }

                    });
                    if(equal){
                        equalGroup = group;
                    }
                }
                if(equalGroup){
                    equalGroup.push(obj);
                }
                else {
                    groups.push([obj]);
                }
            }
        }
       // console.log(groups);
        return groups;
    }

    //     let groupKeys : any = query.GROUP;
    //     let firstTime: boolean = true;
    //     let arrValueGroups: any = [];
    //     for (let key of groupKeys) {
    //         let arr: any = this.getValuesforKey(key, data);
    //         arrValueGroups.push(arr);
    //     }
    //     console.log(arrValueGroups[0][0];
    //         let count:number = 0;
    //     for (let group of arrValueGroups) {
    //
    //         for (let value of group) {
    //             console.log(value);
    //         }
    //     }
    // }

            // if (firstTime) {
            //     firstTime = false;
            //     var retArray: any = [];
            //     let arr: any = this.getValuesforKey(key, data);
            //     for (let group of arr) {
            //         let groupArray: any = [];
            //         data.forEach(function (obj: any) {
            //             if (group == obj[key]) {
            //                 groupArray.push(obj);
            //             }
            //         });
            //         retArray.push(groupArray);
            //     }
            // } else {
            //     // console.log(retArray)
            //     let arr: any = this.getValuesforKey(key, data);
            //     for (let group of arr) {
            //         console.log(group);
            //         // // let groupArray: any = [];
            //          for (let array of retArray) {
            //            console.log(array);
            //         // //     array.forEach(function (obj: any) {
            //         // //     if (group == obj[key]) {
            //         // //         groupArray.push(obj);
            //         // //     }
            //         //     });
            //         //     retArray.push(groupArray);
            //         }
            //     }
            // }
      //  console.log(retArray);
      //  return retArray;

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
                    for (let val of compareArray) {
                        if (val !== obj[value]) {
                            count++;
                            compareArray.push(compareVal);
                        }
                    }
                    if(!query.GET.hasOwnProperty(value)) {
                        delete obj[value];
                    }
                }
                return count;
        }
    }
    public apply(query: QueryRequest, data: any): any {
        console.log("in apply method");
      //  console.log(data);
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
        console.log(respArray);
        return respArray;
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
        let GET_results = this.filterColumns(query, parsedData);

        if (typeof query.WHERE == 'undefined'|| Object.keys(query.WHERE).length == 0) {
            console.log("in if branch");
            let groupedData: any = this.group(query, GET_results);

        } else {
                console.log("in else branch");
                console.log(query.WHERE);
                let operands: stringArray = Object.keys(query.WHERE);
                var key: any = operands[0];
                var value: any;
                for (let i in query.WHERE) {
                    value = query.WHERE[i];
                }
                let WHERE_Results: {}[] = this.filterRows(key, value, GET_results);
                var groupedData: any = this.group(query, WHERE_Results);
        }

        let appliedData: any = this.apply(query, groupedData);

        if (typeof query.ORDER !== 'undefined') {
            let i:number = 0
            var orderedResults = this.orderResponse(query, appliedData, i);
        }
        var response: QueryResponse = {render: query.AS, result: orderedResults};
        console.log(response);
        return response;
    }
}