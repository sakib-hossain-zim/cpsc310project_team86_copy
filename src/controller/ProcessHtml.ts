import {ASTNode} from "parse5";
let parse5 = require('parse5');
import fs = require('fs');
let http = require('http');
import DatasetController from "./DatasetController";
import Log from "../Util";


interface toBeAddedHtml {
    rooms_fullname: string;
    rooms_shortname: string;
    rooms_number: string;
    rooms_name: string;
    rooms_address: string;
    rooms_lat: number;
    rooms_lon: number;
    rooms_seats: string;
    rooms_type: string;
    rooms_furniture: string;
    rooms_href: string;
}

interface GeoResponse {
    lat?: number;
    lon?: number;
    error?: string;
}

export default class ProcessHtml {

    public process(id, files: any, invalidDataset: any, htmlDataset: any): Promise<boolean> {

        console.log('parsing html file');

        let count: number = 0;
        let htmlProcessedDataset: any = [];
        let promises: Promise<any>[] = [];
        let that = this;

        return new Promise(function(fulfill, reject)  {

            try {

                for (let file of files) {


                    var document: ASTNode = parse5.parse(file);
                    for (let child of document.childNodes) {

                        if (child.nodeName == 'html') {
                            var htmlNode = child;
                        }
                    }
                    for (let child of htmlNode.childNodes) {

                        if (child.nodeName == 'head') {
                            // console.log('made it here');
                            var headNode = child;
                            var headAttrs = headNode.childNodes[9];
                            if (typeof headAttrs !== 'undefined') {
                                // console.log(headAttrs.attrs[1].value);
                                var shortName = headAttrs.attrs[1].value;
                                //console.log(shortName);
                            }
                        }

                        if (child.nodeName == 'body') {
                            var bodyNode = child;
                            if (count == 0) {
                                count++;
                                break;
                            }

                            else if (shortName === 'UCLL') {

                                var ucll_roomsFullName = bodyNode.childNodes[31].childNodes[12].childNodes[1].childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[0].value;
                                var ucll_roomAddress = bodyNode.childNodes[31].childNodes[12].childNodes[1].childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[3].childNodes[0].childNodes[0].value;
                                var ucll_tbody = bodyNode.childNodes[31].childNodes[12].childNodes[1].childNodes[3].childNodes[1].childNodes[5].childNodes[1].childNodes[3].childNodes[1].childNodes[3];
                                let promise = that.getLatLon(ucll_roomAddress);
                                promises.push(promise);
                                for (let child of ucll_tbody.childNodes) {

                                    if (child.nodeName == 'tr') {
                                        let tba: toBeAddedHtml = <any>{};
                                        tba.rooms_fullname = ucll_roomsFullName;
                                        tba.rooms_shortname = shortName;
                                        tba.rooms_address = ucll_roomAddress;
                                        tba.rooms_number = child.childNodes[1].childNodes[1].childNodes[0].value;
                                        tba.rooms_href = child.childNodes[1].childNodes[1].attrs[0].value;
                                        var ucllroomnumber = tba.rooms_number;
                                        //console.log (ucllroomnumber);
                                        // console.log(roomnumber);
                                        tba.rooms_name = shortName + "_" + ucllroomnumber;
                                        tba.rooms_seats = child.childNodes[3].childNodes[0].value.trim();
                                        tba.rooms_furniture = child.childNodes[5].childNodes[0].value.trim();
                                        tba.rooms_type = child.childNodes[7].childNodes[0].value.trim();
                                        htmlProcessedDataset.push(tba);
                                        // console.log('start');

                                        //  let promise = that.getLatLon(ucll_roomAddress);
                                        //  promises.push(promise);
                                    }

                                    else {
                                    }

                                }
                            }

                            else {

                                var roomsFullName = bodyNode.childNodes[31].childNodes[10].childNodes[1].childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[0].value;
                                var roomsAddress = bodyNode.childNodes[31].childNodes[10].childNodes[1].childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[3].childNodes[0].childNodes[0].value;
                                var room_info_path = bodyNode.childNodes[31].childNodes[10].childNodes[1].childNodes[3].childNodes[1].childNodes[5].childNodes[1].childNodes[3];
                                let promise: Promise<any> = that.getLatLon(roomsAddress);
                                promises.push(promise);
                                if (typeof room_info_path == 'undefined') {
                                    break;
                                }

                                var tbody = bodyNode.childNodes[31].childNodes[10].childNodes[1].childNodes[3].childNodes[1].childNodes[5].childNodes[1].childNodes[3].childNodes[1].childNodes[3];

                                for (let child of tbody.childNodes) {
                                    if (child.nodeName == 'tr') {
                                        let tba: toBeAddedHtml = <any>{};
                                        tba.rooms_fullname = roomsFullName;
                                        tba.rooms_shortname = shortName;
                                        tba.rooms_address = roomsAddress;
                                        tba.rooms_number = child.childNodes[1].childNodes[1].childNodes[0].value;
                                        tba.rooms_href = child.childNodes[1].childNodes[1].attrs[0].value;
                                        var roomnumber = tba.rooms_number;
                                        tba.rooms_name = shortName + "_" + roomnumber;
                                        tba.rooms_seats = child.childNodes[3].childNodes[0].value.trim();
                                        tba.rooms_furniture = child.childNodes[5].childNodes[0].value.trim();
                                        tba.rooms_type = child.childNodes[7].childNodes[0].value.trim();
                                        // console.log('push');
                                        htmlProcessedDataset.push(tba);

                                        //   let promise: Promise<any> = that.getLatLon(roomsAddress);
                                        //   promises.push(promise);
                                    }

                                }
                                // console.log('done tbody');
                            }
                        }
                    }
                }
                var htmlLength = htmlProcessedDataset.length;
                for (var i = 0; htmlLength >0; i++) {
                    var j = i;
                    htmlLength = htmlLength -1;
                    htmlDataset[j] = htmlProcessedDataset[i];
                }
                Promise.all(promises).then(function (values: any[]) {
                    let building = htmlProcessedDataset[0].rooms_shortname;
                    let i = 0;
                    for (var obj of htmlProcessedDataset) {
                        if (obj.rooms_shortname !== building) {
                            building = obj.rooms_shortname;
                            i++;
                        }
                        let geo: GeoResponse = <any>{};
                        if (!values[i].hasOwnProperty('error')) {
                            geo.lat = values[i].lat;
                            geo.lon = values[i].lon;
                        }
                        else {
                            geo.error = values[i].error;
                        }

                        obj.rooms_lat = geo.lat;
                        obj.rooms_lon = geo.lon;
                    }
                    // let controller = new DatasetController();
                    console.log('done promise.all');
                    fulfill(true);
                }).catch (function (err) {
                    console.log(err);
                    reject(err);
                });
                // fulfill(true);
            } catch (err) {
                console.log(err);
                reject(err);
            }
            // fulfill(true);
        });
    }


    public getLatLon(address: any) {

        return new Promise(function (fulfill, reject) {

            // console.log('latlon');

            let encodedAddress = encodeURI(address);
            let url = "skaha.cs.ubc.ca";
            let path = "/api/v1/team86/" + encodedAddress;

            var options = {
                host: url,
                port: 8022,
                path: path
            };

            // console.log('in promise');

            http.get(options, function (res) {
                res.on("data", function (chunk) {
                    var jsonlatlon = JSON.parse(chunk);
                    console.log('fulfilled json');
                    fulfill(jsonlatlon);
                });

                // console.log('in here');

            }).on('error', function (e: any) {
                reject(e);
            });

        });
    }
}