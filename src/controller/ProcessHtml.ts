import {ASTNode} from "parse5";
let parse5 = require('parse5');
import fs = require('fs');
let http = require('http');
import DatasetController from "./DatasetController";
import Log from "../Util";
import JSZip = require('jszip');

interface toBeAddedHtml {
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

interface GeoResponse {
    lat?: number;
    lon?: number;
    error?: string;
}

export default class ProcessHtml {


    public process(id:any , data: any, invalidDataset: any): Promise<boolean> {

        let that = this;
        let datasetController = new DatasetController();
        let htmlProcessedDataset = [];
        let promises2: Promise<any>[] = [];


        return new Promise(function (fulfill, reject) {
            try {

                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.var myCourses: JSZipObject;

                    let promises1: Promise<string>[] = [];

                        let zip1 = zip.folder('campus');
                        let zip2 = zip1.folder('discover');
                        zip2.folder('buildings-and-classrooms').forEach(function(relativePath, file) {
                            let p1 : Promise<string> = file.async("string");
                            promises1.push(p1);
                        });

                    Promise.all(promises1).then(function(files: any[]) {
                        if (typeof files === 'undefined' || files.length < 1) {
                            invalidDataset = true;
                        }

                        console.log("parsing html files");
        let count: number = 0;

            for (let file of files) {

                var document: ASTNode = parse5.parse(file);
                for (let child of document.childNodes) {

                    if (child.nodeName == 'html') {
                        var htmlNode = child;
                    }
                }
                for (let child of htmlNode.childNodes) {

                    if (child.nodeName == 'head') {
                        var headNode = child;
                        var headAttrs = headNode.childNodes[9];
                        if (typeof headAttrs !== 'undefined') {
                            var shortName = headAttrs.attrs[1].value;
                            // console.log(shortName);
                        }
                    }
                    if (shortName !== "MAUD" && shortName !== "NIT") {

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
                                let promise2 = that.getLatLon(ucll_roomAddress, shortName);
                                promises2.push(promise2);
                                for (let child of ucll_tbody.childNodes) {

                                    if (child.nodeName == 'tr') {
                                        let tba: toBeAddedHtml = <any>{};
                                        tba.rooms_fullname = ucll_roomsFullName;
                                        tba.rooms_shortname = shortName;
                                        tba.rooms_address = ucll_roomAddress;
                                        tba.rooms_number = child.childNodes[1].childNodes[1].childNodes[0].value;
                                        tba.rooms_href = child.childNodes[1].childNodes[1].attrs[0].value;
                                        var ucllroomnumber = tba.rooms_number;
                                        tba.rooms_name = shortName + "_" + ucllroomnumber;
                                        tba.rooms_seats = Number(child.childNodes[3].childNodes[0].value.trim());
                                        tba.rooms_furniture = child.childNodes[5].childNodes[0].value.trim();
                                        tba.rooms_type = child.childNodes[7].childNodes[0].value.trim();
                                        htmlProcessedDataset.push(tba);

                                        //  let promise = that.getLatLon(ucll_roomAddress);
                                        //  promises.push(promise);
                                    }

                                }
                            } else if (bodyNode.childNodes[31].childNodes[10].childNodes[1].childNodes[3].childNodes[1].childNodes[5].childNodes[1].value == 'undefined') {
                                console.log("inside building only if statement");
                                let tba: toBeAddedHtml = <any>{};
                                tba.rooms_fullname = bodyNode.childNodes[31].childNodes[10].childNodes[1].childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[0].value;
                                tba.rooms_address = bodyNode.childNodes[31].childNodes[10].childNodes[1].childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[3].childNodes[0].childNodes[0].value;
                                tba.rooms_shortname = shortName;
                                htmlProcessedDataset.push(tba);
                            } else {

                                var roomsFullName = bodyNode.childNodes[31].childNodes[10].childNodes[1].childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[0].value;
                                // console.log(roomsFullName);
                                var roomsAddress = bodyNode.childNodes[31].childNodes[10].childNodes[1].childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[3].childNodes[0].childNodes[0].value;
                                var room_info_path = bodyNode.childNodes[31].childNodes[10].childNodes[1].childNodes[3].childNodes[1].childNodes[5].childNodes[1].childNodes[3];
                                let promise2: Promise<any> = that.getLatLon(roomsAddress, shortName);
                                promises2.push(promise2);
                                if (typeof room_info_path == 'undefined') {
                                    break;
                                }

                                var tbody = bodyNode.childNodes[31].childNodes[10].childNodes[1].childNodes[3].childNodes[1].childNodes[5].childNodes[1].childNodes[3].childNodes[1].childNodes[3];
                                //console.log(tbody.nodeName);
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
                                        tba.rooms_seats = Number(child.childNodes[3].childNodes[0].value.trim());
                                        tba.rooms_furniture = child.childNodes[5].childNodes[0].value.trim();
                                        tba.rooms_type = child.childNodes[7].childNodes[0].value.trim();
                                        htmlProcessedDataset.push(tba);

                                    }

                                }
                            }
                        }
                    }
                }
            }

            Promise.all(promises2).then(function (values: any[]) {
                console.log(htmlProcessedDataset.length);
                let building = htmlProcessedDataset[0].rooms_shortname;
                let i = 0;      //count
                let j = 0;

                for (var obj of htmlProcessedDataset) {         //htmlArray
                    // console.log(obj.rooms_shortname);
                    for (var jsonObj of values) {                //jsonLatLon array

                        if (jsonObj.short === obj.rooms_shortname) {         // if they both have same short name
                            // console.log('matched');
                            break;
                        }
                        else {
                            // console.log('still looking');
                            i++
                        }


                    }
                    // console.log('here');
                    if (obj.rooms_shortname !== building) {     //short name is not AERL
                        building = obj.rooms_shortname;
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
                    j++;
                    i = 0;              //reset count

                }

                datasetController.save(id, htmlProcessedDataset);
                fulfill(true);


            }).catch(function (err) {
                reject(err);
            });
            }).catch(function(err){
            console.log('Error in promise.all ' + err);
            reject(err);
        });
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

    // source: http://stackoverflow.com/questions/6968448/where-is-body-in-a-nodejs-http-get-response

    public getLatLon(address: any, shortname:string) {

        return new Promise(function (fulfill, reject) {

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
                    let jsonlatlon = JSON.parse(chunk);
                    jsonlatlon['short'] = shortname;
                    fulfill(jsonlatlon);
                });

                // console.log('in here');

            }).on('error', function (e: any) {
                // console.log('error in http.get ' + e.message);
                reject(e);
            });

        });
    }
}