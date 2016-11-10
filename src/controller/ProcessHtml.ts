import {ASTNode} from "parse5";
let parse5 = require('parse5');
import fs = require('fs');
let http = require('http');


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
    public process(files: any, processedDataset: any, invalidDataset: any): any {
        let buildingFullName: string;
        let buildingShortName: string;
        let buildingAddress: string;
        let count: number = 0;
        for (let file of files) {

            var document: ASTNode = parse5.parse(file);
            for (let child of document.childNodes) {

                if (child.nodeName == 'html') {
                    var htmlNode = child;
                }
            }
            for (let child of htmlNode.childNodes) {

                if (child.nodeName == 'head'){
                    // console.log('made it here');
                    var headNode = child;
                    var headAttrs = headNode.childNodes[9];
                    if (typeof headAttrs !== 'undefined'){
                        // console.log(headAttrs.attrs[1].value);
                        var shortName= headAttrs.attrs[1].value;
                    }
                }

                if (child.nodeName == 'body') {
                    var bodyNode = child;
                    if (count == 0) {
                        count++;
                        break;
                    } else {
                        // console.log(bodyNode.childNodes[31]);

                        var roomsFullName = bodyNode.childNodes[31].childNodes[10].childNodes[1].childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[0].value;
                        var roomsAddress = bodyNode.childNodes[31].childNodes[10].childNodes[1].childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[3].childNodes[0].childNodes[0].value;
                        var room_info_path = bodyNode.childNodes[31].childNodes[10].childNodes[1].childNodes[3].childNodes[1].childNodes[5].childNodes[1].childNodes[3];

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
                                var roomnumber= tba.rooms_number;
                                tba.rooms_name = shortName+"_"+roomnumber;
                                tba.rooms_seats = child.childNodes[3].childNodes[0].value.trim();
                                tba.rooms_furniture = child.childNodes[5].childNodes[0].value.trim();
                                tba.rooms_type = child.childNodes[7].childNodes[0].value.trim();
                                var val = this.getLatLon(roomsAddress);
                                processedDataset.push(tba);

                            }
                        }

                        // console.log(tba);
                        console.log(processedDataset);
                    }
                }
            }
        }
    }

    public getLatLon (address: any){

        return new Promise(function (fulfill, reject) {

            let encodedAddress = encodeURI(address);
            let url = "skaha.cs.ubc.ca";
            let path = "/api/v1/team86/" + encodedAddress;

            var options = {
                host: url,
                port: 8022,
                path: path
            };

            //console.log('in promise');

            http.get(options, function (res) {
                //console.log('STATUS: ' + res.statusCode);
                res.on("data", function (chunk) {
                    //console.log("BODY: " + chunk);
                    var jsonlatlon = JSON.parse(chunk);
                    //console.log(jsonlatlon);
                    fulfill(jsonlatlon);
                });

                // console.log('in here');

            }).on('error', function (e: any) {
                console.log("Got error: " + e.message);
                fulfill(e);
            });

        }).then(function (value: any) {

            console.log(value);

            let geo: GeoResponse = <any>{};

            if (value.hasOwnProperty('error')) {
                geo.error = value.error;
            }
            else {
                var lat = geo.lat = value.lat;
                var lon = geo.lon = value.lon;
                console.log(lat);
                console.log(lon);


            }
        });


    }
}