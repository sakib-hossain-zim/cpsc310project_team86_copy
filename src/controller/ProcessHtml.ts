import {ASTNode} from "parse5";
let parse5 = require('parse5');
import fs = require('fs');


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
                        console.log(tbody.nodeName);
                        for (let child of tbody.childNodes) {

                            if (child.nodeName == 'tr') {
                                let tba: toBeAddedHtml = <any>{};
                                tba.rooms_fullname = roomsFullName;
                                tba.rooms_address = roomsAddress;
                                tba.rooms_number = child.childNodes[1].childNodes[1].childNodes[0].value;
                                tba.rooms_seats = child.childNodes[3].childNodes[0].value.trim();
                                tba.rooms_furniture = child.childNodes[5].childNodes[0].value.trim();
                                tba.rooms_type = child.childNodes[7].childNodes[0].value.trim();
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
}
//             let count1: number = 0;[
//             let no_room_data: boolean = true;
//             for (let child of bodyNode.childNodes) {
//                 if (child.nodeName == 'div') {
//                     no_room_data = false;
//                     count1++;
//                     if (count1 == 4) {
//                         console.log("made it to div1");
//                         var div1 = child;
//                         break;
//                     }
//                 }
//             }
//          //   console.log("made it after div1");
//             if (!no_room_data) {
//                 let count2: number = 0;
//                 for (let child of div1.childNodes) {
//                     if (child.nodeName == 'div') {
//                         count2++;
//                         if (count2 == 2) {
//                             console.log("made it to div2");
//                             var div2 = child;
//                             break;
//                         }
//                     }
//                 }
//               //  console.log("made it after div2");
//                 let count3: number = 0;
//                 for (let child of div2.childNodes) {
//                     if (child.nodeName == 'div') {
//                         count3++;
//                         if (count3 == 1) {
//                             console.log("made it to div3");
//                             var div3 = child;
//                             break;
//                         }
//                     }
//                 }
//                 console.log("made it after div3");
//                 for (let child of div3.childNodes) {
//                     if (child.nodeName == 'section') {
//                      //  console.log("made it to section");
//                         var section = child;
//                         break;
//                     }
//                 }
//                 for (let child of section.childNodes) {
//                     if (child.nodeName == 'div') {
//                      //   console.log("made it to div4");
//                         var div4 = child;
//                         break;
//                     }
//                 }
//                 // where we need to extract building information as well
//                 let count4: number = 0;
//                 for (let child of div4.childNodes) {
//                     if (child.nodeName == 'div') {
//                         count4++;
//                         if (count4 == 2) {
//                             var buildingDiv = child;
//                         }
//                         if (count4 == 3) {
//                             console.log("made it to div5");
//                             var div5 = child;
//                             break;
//                         }
//                     }
//                 }
//                 //get building info
//                 for (let child of buildingDiv.childNodes) {
//                     if (child.nodeName == 'div') {
//                         var buildingDiv2 = child;
//                         break;
//                     }
//                 }
//                 for (let child of buildingDiv2.childNodes) {
//                     if (child.nodeName == 'div') {
//                         var buildingDiv3 = child;
//                         break;
//                     }
//                 }
//                 for (let child of buildingDiv3.childNodes) {
//                     if (child.nodeName == 'div') {
//                         var buildingDiv4 = child;
//                         break;
//                     }
//                 }
//                 for (let child of buildingDiv4.childNodes) {
//                     if (child.nodeName == 'h2') {
//                         var h2 = child;
//                     }
//                     if (child.nodeName == 'div') {
//                         var buildingDiv5 = child;
//                     }
//                 }
//                 // extracting building full name
//                 for (let child of h2.childNodes) {
//                     if (child.nodeName == 'span') {
//                         var span = child;
//                         break;
//                     }
//                 }
//                 for (let child of span.childNodes) {
//                     if (child.nodeName == '#text') {
//                         buildingFullName = child.value;
//                     }
//                 }
//                 // extracting building address
//
//                 for (let child of buildingDiv5.childNodes) {
//                     if (child.nodeName == 'div') {
//                         var buildingDiv6 = child;
//                         break;
//                     }
//                 }
//                 for (let child of buildingDiv6.childNodes) {
//                     if (child.nodeName == '#text') {
//                         buildingAddress = child.value;
//                     }
//                 }
//
// // end of extracting building info
//                 for (let child of div5.childNodes) {
//                     if (child.nodeName == 'div') {
//                      //   console.log("made it to div6");
//                         var div6 = child;
//                         break;
//                     }
//                 }
//                 let no_room_data_check_2: boolean = true;
//                 let count5: number = 0;
//                 for (let child of div6.childNodes) {
//                     if (child.nodeName == 'div') {
//                         count5++;
//                         if (count5 == 2) {
//                             no_room_data_check_2 = false;
//                          //   console.log("made it to div7");
//                             var div7 = child;
//                             break;
//                         }
//                     }
//                 }
//                 if (!no_room_data_check_2) {
//                     for (let child of div7.childNodes) {
//                         if (child.nodeName == 'table') {
//                          //   console.log("made it to table");
//                             var table = child;
//                         }
//                     }
//
//                     for (let child of table.childNodes) {
//                         if (child.nodeName == 'tbody') {
//                          //   console.log("made it to tbody");
//                             var tbody = child;
//                         }
//                     }
//                     for (let child of tbody.childNodes) {
//                         let tba: toBeAddedHtml = <any>{};
//                         tba.rooms_fullname = buildingFullName;
//                         tba.rooms_address = buildingAddress;
//
//                         if (child.nodeName == 'tr') {
//                            // console.log("made it to tr");
//                             var tr = child;
//                             let firstTDchild: boolean = true;
//                             let counter: number = 0;
//
//                             for (let child of tr.childNodes) {
//
//                                 if (child.nodeName == 'td') {
//                                     if (firstTDchild) {
//                                         let firstTD = child;
//                                         for (let child of firstTD.childNodes) {
//                                             if (child.nodeName == 'a') {
//                                                 let a = child;
//                                                 for (let child of a.childNodes) {
//                                                     if (child.nodeName == '#text') {
//                                                         tba.rooms_number = child.value;
//                                                     }
//                                                 }
//                                             }
//                                         }
//                                         firstTDchild = false;
//                                     } else {
//
//                                         let td = child;
//
//                                         for (let child of td.childNodes) {
//
//                                             if (child.nodeName == '#text') {
//                                                // console.log("made it to text");
//                                                // console.log(child.value);
//                                                 if (counter == 0) {
//                                                     tba.rooms_seats = child.value;
//                                                     counter++;
//                                                 } else if (counter == 1) {
//                                                     tba.rooms_furniture = child.value;
//                                                     counter++;
//                                                 } else if (counter == 2) {
//                                                     tba.rooms_type = child.value;
//                                                     counter++;
//                                                 } else {
//                                                 }
//                                             }
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                         HTMLprocessedDataset.push(tba);
//                     }
//                 }
//             }
//         }
//        // console.log(HTMLprocessedDataset);
//
// }
