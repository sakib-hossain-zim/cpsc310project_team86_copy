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
    ORDER?: {};
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
    courses_uuid: string;
    courses_year: number;
    rooms_fullname: string;
    rooms_shortname: string;
    rooms_number: string;
    rooms_name: string;
    rooms_address: string;
    rooms_lat: number;
    rooms_lon: number;
    rooms_seats: number;
    rooms_type: string;
    rooms_furniture: string;
    rooms_href: string;
}

interface stringArray {
    [index: number]: string;
}

export default class QueryController {
    private datasets: Datasets = {};
    private count: number = 0;
    private is_NOT: boolean = false;


    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    /**
     * Check if query is valid
     * @param query
     * @returns {boolean}
     */
    public isValid(query: QueryRequest): boolean {
        // Undefined query and no AS value
        if (typeof query === 'undefined' || query.AS != 'TABLE') {
            return false;
        }

        // No keys in GROUP
        if (typeof query.GROUP != 'undefined') {
            if ((query.GROUP.length) == 0) {
                return false;
            }
        }

        // APPLY is defined but GROUP is undefined
        if ((typeof query.APPLY !== 'undefined') && (typeof query.GROUP == 'undefined')) {
            return false;
        }

        // GROUP is defined but APPLY is undefined
        if ((typeof query.GROUP !== 'undefined') && (typeof query.APPLY == 'undefined')) {
            return false;
        }

        // Firefly: a query ORDER by a key not in GET should not be valid.
        if (typeof query.ORDER !== 'undefined') {
            if (typeof query.ORDER === 'string') {
                let is_ORDER_key_in_GET: boolean = false;
                for (let key of query.GET) {
                    if (key == query.ORDER) {
                        is_ORDER_key_in_GET = true;
                    }
                }
                if (!is_ORDER_key_in_GET) {
                    return false;
                }
            }

            if (typeof query.ORDER == 'object') {
                let is_ORDER_key_in_GET: boolean = false;
                if (Object.keys(query.ORDER).length !== 0) {
                    let obj = query.ORDER;
                    let keys = Object.keys(query.ORDER)[1];
                    for (let orderKey of obj[keys]) {
                        for (let getKey of query.GET) {
                            if (orderKey == getKey) {
                                is_ORDER_key_in_GET = true;
                            }
                        }
                        if (!is_ORDER_key_in_GET ){
                            return false;
                        }
                    }
                }
            }
        }

        // Kryptonite: All keys in GROUP should be present in GET.
        if (typeof query.GROUP !== 'undefined'){
            for (let groupKey of query.GROUP) {
                let is_in_GROUP_and_GET: boolean = false;
                for (let getKey of query.GET) {
                    if (getKey == groupKey) {
                        is_in_GROUP_and_GET = true;
                    }
                }

                if (!is_in_GROUP_and_GET) {
                    return false;
                }
            }
        }

        // Kwyjibo: All keys in GET should be in either GROUP or APPLY.
        if (typeof query.GROUP !== 'undefined') {
            for (let getKey of query.GET) {
                let is_in_GROUP_or_APPLY: boolean = false;
                for (let groupKey of query.GROUP) {
                    if (getKey == groupKey) {
                        is_in_GROUP_or_APPLY = true;
                    }
                }
                for (let applyObj of query.APPLY) {
                    for (let applyKey in applyObj) {
                        if (getKey == applyKey) {
                            is_in_GROUP_or_APPLY = true;
                        }
                    }
                }
                if (!is_in_GROUP_or_APPLY) {
                    return false;
                }
            }
        }

        // Laguna: keys in GROUP cannot occur in APPLY and vice versa
        if (typeof query.GROUP !== 'undefined' && typeof query.APPLY !== 'undefined') {
            for (let groupKey of query.GROUP) {
                for (let applyObj of query.APPLY) {
                    let applyKeys = Object.keys(applyObj);
                    for (let key of applyKeys) {
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

        // Liberation: Group should contains only valid keys (separated by underscore).
        if (typeof query.GROUP !== 'undefined') {
            for (let key of query.GROUP) {
                if (key !== 'courses_dept' && key !== 'courses_avg' && key !== 'courses_instructor' && key !== 'courses_pass'
                    && key !== 'courses_fail' && key !== 'courses_title' && key !== 'courses_id' && key !== 'courses_audit' && key !== 'courses_uuid'
                && key !== 'rooms_fullname' && key !== 'rooms_shortname' && key !== 'rooms_fullname' && key !== 'rooms_number' && key !== 'rooms_name'
                && key !== 'rooms_address' && key !== 'rooms_lat' && key !== 'rooms_lon' && key !== 'rooms_seats' && key !== 'rooms_type'
                && key !== 'rooms_furniture' && key !== 'rooms_href' && key !== 'courses_year') {
                    return false;
                }
            }
        }

        // Lorax: All keys in GET that are not separated by an underscore should appear in APPLY.
        if (typeof query.APPLY !== 'undefined') {
            if (query.APPLY.length > 0) {

                for (let getKey of query.GET) {
                    var get_key_in_apply: boolean;
                    if (!getKey.includes("_")) {
                        get_key_in_apply = false;
                        for (let applyObj of query.APPLY) {
                            for (let applyKey in applyObj) {
                                if (getKey == applyKey) {
                                    get_key_in_apply = true;
                                }
                            }
                        }
                        if (!get_key_in_apply) {
                            return false;
                        }
                    }
                }

                for (let applyObj of query.APPLY) {
                    for (let applyKey in applyObj) {
                        var get_key_in_apply: boolean;
                        if (!applyKey.includes("_")) {
                            get_key_in_apply = false;
                            for (let getKey of query.GET) {
                                if (getKey == applyKey) {
                                    get_key_in_apply = true;
                                }
                            }
                            if (!get_key_in_apply) {
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
     * Check if dataset is empty
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
        let respObjArray: responseObject[] = [];
        let applyKeyArray: any = [];

        // If GROUP is present, all GET terms must correspond to either GROUP terms or to terms defined in the APPLY block.
        // GET terms with underscores must occur in GROUP while GET terms without underscores must be defined in APPLY.
        if (typeof query.APPLY !== "undefined") {
            if (query.APPLY.length > 0) {
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
                if (key == "courses_uuid") {
                    respObj.courses_uuid = obj.courses_uuid;
                }
                if (key == "courses_year") {
                    respObj.courses_year = obj.courses_year;
                }
                if (key == "rooms_fullname") {
                    respObj.rooms_fullname = obj.rooms_fullname;
                }
                if (key == "rooms_shortname") {
                    respObj.rooms_shortname = obj.rooms_shortname;
                }
                if (key == "rooms_number") {
                    respObj.rooms_number = obj.rooms_number;
                }
                if (key == "rooms_name") {
                    respObj.rooms_name = obj.rooms_name;
                }
                if (key == "rooms_address") {
                    respObj.rooms_address = obj.rooms_address;
                }
                if (key == "rooms_lat") {
                    respObj.rooms_lat = obj.rooms_lat;
                }
                if (key == "rooms_lon") {
                    respObj.rooms_lon = obj.rooms_lon;
                }
                if (key == "rooms_seats") {
                    respObj.rooms_seats = obj.rooms_seats;
                }
                if (key == "rooms_type") {
                    respObj.rooms_type = obj.rooms_type;
                }
                if (key == "rooms_furniture") {
                    respObj.rooms_furniture = obj.rooms_furniture;
                }
                if (key == "rooms_href") {
                    respObj.rooms_href = obj.rooms_href;
                }
            }

            if (typeof query.APPLY !== 'undefined' && query.APPLY.length > 0) {
                for (let applyKey of applyKeyArray) {
                    respObj[applyKey] = obj[applyKey];
                }
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
    public sortUpFunction (value1: any, value2: any, keys: any, i: number, data: any) {
        if (i != data.length) {
            if (value1[keys[i]] < value2[keys[i]]) {
                return -1;
            } else if (value1[keys[i]] > value2[keys[i]]) {
                return 1;
            } else {
                return this.sortUpFunction(value1, value2, keys, i + 1, data);
            }
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
    public sortDownFunction (value1: any, value2: any, keys: any, i: number, data: any) {
      //  if (i != data.length) {
            if (value1[keys[i]] > value2[keys[i]]) {
                return -1;
            } else if (value1[keys[i]] < value2[keys[i]]) {
                return 1;
            } else {
                return this.sortDownFunction(value1, value2, keys, i + 1, data);
            }
       // }
    }

    /**
     * ORDER results by ascending or descending
     * @param query
     * @param data
     * @param i
     * @returns {any}
     */
    public orderResponse(query: QueryRequest, data: any) { // i always starts 0
        if (typeof query.ORDER == 'undefined') {
            return data;
        }

        let that = this;
        let key: any = query.ORDER;

        if (typeof query.ORDER === 'string') {
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
            let dir: any = Object.keys(key)[0];
            let keys: any = Object.keys(key)[1];
            let dirValue: any = key[dir];
            let keysValue: any = key[keys];
            console.log(keysValue);
            // if (keysValue.length === 1) {
            //     return data.sort(function (result1: any, result2: any) {
            //         if (result1[keysValue[0]] < result2[keysValue[0]]) {
            //             return -1;
            //         }
            //         else if (result1[keysValue[0]] > result2[keysValue[0]]) {
            //             return 1;
            //         }
            //         return 0;
            //     });
            // }
            let i = 0;
            if (i < keysValue.length) {
                if (dirValue == 'UP') {
                    return data.sort(function (result1: any, result2: any) {
                        return that.sortUpFunction(result1, result2, keysValue, i, data);
                    });
                } else  {
                    return data.sort(function (result1: any, result2: any) {
                        return that.sortDownFunction(result1, result2, keysValue, i, data);
                    });
                }
            }
        }
    }

    /**
     * Helper method for filterRows. Returns the result of a comparison between two values.
     * @param field: indicates which type of comparison is to be made value & threshold are the 2 values to be compared
     * @param value
     * @param is_NOT
     * @param threshold
     * @returns {Boolean} obtained from the comparison
     */
    public compare(field: string, value: any, is_NOT: boolean, threshold?: any ) {
        var res: Boolean;
        if (!is_NOT) {
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
                case 'IS':
                    //  console.log("*");
                    if (threshold.includes("*")) {
                        let stringKeys: string[] = threshold.split("*");
                        if (stringKeys.length == 3 ) {
                            if (value.includes(stringKeys[1])) {
                                res = true;
                            }
                        } else if (stringKeys[0] == "" && stringKeys[1] == "") {
                            res = true;

                        }  else if (stringKeys[0] == "") {
                            let endKey = stringKeys[1];
                            if (value.endsWith(endKey)) {
                                res = true;
                            } else {
                                res = false;
                            }
                        } else if (stringKeys[1] == "") {
                            let beforeKey = stringKeys[0];
                            if (value.startsWith(beforeKey)) {
                                res = true;
                            } else {
                                res = false;
                            }
                        }
                    } else {
                        if (threshold === value) {
                            res = true;
                        } else {
                            res = false;
                        }
                    }
                    break;
                default:
                    res = true;
                    break;

            }
            return res;
        }

        if (is_NOT) {
            switch (field) {
                case "GT":
                    res = value <= +threshold;
                    break;
                case 'LT':
                    res = value >= +threshold;
                    break;
                case 'EQ':
                    res = value != threshold;
                    break;
                case 'IS':
                    if (threshold.includes("*")) {
                        let stringKeys: string[] = threshold.split("*");
                        if (stringKeys.length == 3 ) {
                            if (value.includes(stringKeys[1])) {
                                res = false;
                            }
                        } else if (stringKeys[0] == "" && stringKeys[1] == "") {
                            res = false;

                        }  else if (stringKeys[0] == "") {
                            let endKey = stringKeys[1];
                            if (value.endsWith(endKey)) {
                                res = false;
                            } else {
                                res = true;
                            }
                        } else if (stringKeys[1] == "") {
                            let beforeKey = stringKeys[0];
                            if (value.startsWith(beforeKey)) {
                                res = false;
                            } else {
                                res = true;
                            }
                        }
                    } else {
                        if (threshold === value) {
                            res = false;
                        } else {
                            res = true;
                        }
                    }
                    break;
                default:
                    res = true;
                    break;
            }
            return res;
        }
    }

    /**
     * WHERE filter
     * @param field
     * @param queryData
     * @param data
     * @returns {any}
     */

    public filterRows(field: any, queryData: any, data: any, is_NOT: boolean) {
        let that = this;
        var filteredData: any = [];
        var ANDFilteredData: any;
        var count: number = 0;
        var ORFilteredData: any;
        var ORReturnData: any = [];
        var ORretValues: any = [];
        var ORReturnData2: any = [];
        for (let dataObj of data) {
            ORretValues.push(dataObj["courses_uuid"]);
        }

        if (field == 'AND') {
            for (let obj of queryData) {
                var key: any;
                var value: any;
                for (let i in obj) {
                    key = i;
                    value = obj[i];
                    if (count < 1) {
                        ANDFilteredData = this.filterRows(key, value, data, is_NOT);
                    }
                    else {
                        ANDFilteredData = this.filterRows(key, value, ANDFilteredData, is_NOT);
                    }
                    count++;
                }
            }
            return ANDFilteredData;
        }

        else if (field == 'OR') {

            for (let obj of queryData) {
                var key: any;
                var value: any;

                for (let i in obj) {
                    key = i;
                    value = obj[i];
                    ORFilteredData = this.filterRows(key, value, data, is_NOT);
                    for (let obj of ORFilteredData) {
                        // if (typeof obj["duplicate"] == "undefined") {
                        //      obj["duplicate"] = 0;
                        ORReturnData.push(obj);
                        //  }
                    }
                }
            }
            for (let retObj of ORReturnData) {
                for (let value of ORretValues) {
                    if (retObj["courses_uuid"] == value) {
                        ORReturnData2.push(retObj);
                        let index = ORretValues.indexOf(value);
                        ORretValues.splice(index, 1);
                    }
                }
            }
            return ORReturnData2;
        }

        else if (field == "NOT") {
            var key: any;
            var value: any;
            var NOTfilteredData: any;

            for (let prop in queryData) {
                key = prop;
                value = queryData[key];
                if (is_NOT) {
                    NOTfilteredData = this.filterRows(key, value, data, false);
                } else {
                    NOTfilteredData = this.filterRows(key, value, data, true);
                }
            }
            return NOTfilteredData;
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
                if (that.compare(field, x[replaceKey], is_NOT, Cvalue)) {
                    filteredData.push(x);
                }
            });
            return filteredData;
        }
    }

    /**
     * Make an array from an object
     * @param obj
     * @returns {Array}
     */
    public arrayFromObject(obj) {
        var arr = [];
        for (var i in obj) {
            arr.push(obj[i]);
        }
        return arr;
    }

    // Used to find and validate whether or not WHERE keys are from valid dataset

    public getWhereKeys (obj:any, next:any, key:any) {

        let isBoolean: boolean = false;

        if (key !== null) {

            let id = key.split('_')[0]

            if (fs.existsSync('./data/' + id + '.json') || id == 'NOT'){
                isBoolean = true;
            }
            else {
                isBoolean = false;
                let arr_where: any = []
                arr_where.push(id);
                return arr_where;
            }
        }

        if (obj.length > 0){
            obj = obj[0];

        }
        else {
            obj = obj;
        }

        for (let prop in obj) {
            let arr = obj[prop];
            let arrlength = arr.length;
            if (arrlength > 0){
                for (let i = 0; arrlength > 0; i++) {
                    arrlength = arrlength - 1;
                    next.push(arr[i+1]);
                    let x = null;
                    return this.getWhereKeys(arr[i], next, x);
                }

            }
            else {
                for (let key in arr){
                    let empty: any = [];
                    let nextlength = next.length;
                    if (nextlength > 1){                             // if next length is greater than one
                        for (let a =1 ; nextlength > 0; a ++){
                            let ele = next[a];
                            empty.push(ele);
                            nextlength = nextlength -2;
                        }

                        return this.getWhereKeys(next, empty, key)
                    }
                    else {
                        return this.getWhereKeys(next, empty, key);
                    }
                }
            }
        }

        if (isBoolean == true) {
            return true;
        }
    }


    /**
     * Group the list of results into sets by some matching criteria (an array of groups, each of which is an array)
     * @param query
     * @param data
     * @returns {any}
     */
    public group(query: QueryRequest, data: any): any {
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
    public applyFields(field: any, value: any, group: any, query: QueryRequest) {
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

        if (field == 'COUNT') { // value = courses_id, group = the group in data, obj
            let count: number = 0;
            var alreadyInObject: any = {};

            for (let obj of group) {
                var currentValue = obj[value];
                if (!alreadyInObject.hasOwnProperty(currentValue)) {
                    alreadyInObject[currentValue] = 1;
                    count++;
                }
            }

            for (let obj of group)  {
                if(!query.GET.hasOwnProperty(value)) {
                    delete obj[value];
                }
            }
            return count;
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
        let respArray: any = [];
        let applyArray: any = query.APPLY;

        for (let group of data) {
            for (let obj of applyArray) {
                let applyProp: any = Object.keys(obj)[0]; // courseAverage
                for (let prop in obj) {
                    let innerObj: any = obj[prop];
                    for (let innerProp in innerObj) {
                        var field: any = innerProp; // field = MIN
                        var value: any = innerObj[innerProp]; // value = courseAverage
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
        console.log(query.GET[0]);
        let id = query.GET[0].split('_')[0];
        //console.log(this.datasets);
        //     console.log (Object.keys(this.datasets)[0]);
        //     console.log(this.datasets[0]);
        //     console.log(typeof this.datasets[0]);
        var dataID;
        if (fs.existsSync('./data/' + 'courses' + '.json') && fs.existsSync('./data/' + 'rooms' + '.json')){
            if (id === 'courses'){
                dataID = Object.keys(this.datasets)[0];
            }
            if (id === 'rooms'){
               dataID = Object.keys(this.datasets)[1];
            }
        }
        else {
           dataID = Object.keys(this.datasets)[0];
        }


        let data: any = this.datasets[dataID];
        let isEmpty = this.isDataSetEmpty(data);
        //console.log(isEmpty);
        if (isEmpty === true) {
            let response: QueryResponse = {render: query.AS, result: [{}]};
            return response;
        }
        var parsedData = JSON.parse(data);
        //console.log(parsedData);
        // let groupedData: any = [];
        // let GET_results = this.filterColumns(query, parsedData);

        var GET_results: any;
        if (typeof query.WHERE == 'undefined'|| Object.keys(query.WHERE).length == 0) {
            GET_results = this.filterColumns(query, parsedData);
        } else {
            let operands: stringArray = Object.keys(query.WHERE);
            var key: any = operands[0];
            var value: any;
            for (let i in query.WHERE) {
                value = query.WHERE[i];
            }
            let WHERE_Results: {}[] = this.filterRows(key, value, parsedData, false);
           // console.log(WHERE_Results);
            GET_results = this.filterColumns(query, WHERE_Results);
           // console.log(GET_results);

        }
        var groupedData = this.group(query, GET_results);
       // console.log(groupedData);

        let appliedData: any = this.apply(query, groupedData);
       // console.log(appliedData);

        var orderedResults = this.orderResponse(query, appliedData);
       // console.log(orderedResults);
        // }
        var response: QueryResponse = {render: query.AS, result: orderedResults};
        return response;
    }
}
