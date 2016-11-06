import {ASTNode} from "parse5";
let parse5 = require('parse5');


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
        let HTMLprocessedDataset: any = [];

        for (let file of files) {
            console.log("newfile");

            var document: ASTNode = parse5.parse(file);
            for (let child of document.childNodes) {
                if (child.nodeName == 'html') {
                    var htmlNode = child;
                }
            }
            for (let child of htmlNode.childNodes) {
                if (child.nodeName == 'body') {
                    console.log("made it to body");
                    var bodyNode = child;
                }
            }
            let count1: number = 0;
            let no_room_data: boolean = true;
            for (let child of bodyNode.childNodes) {
                if (child.nodeName == 'div') {
                    no_room_data = false;
                    count1++;
                    if (count1 == 4) {
                        console.log("made it to div1");
                        var div1 = child;
                        break;
                    }
                }
            }
            console.log("made it after div1");
            if (!no_room_data) {
                let count2: number = 0;
                for (let child of div1.childNodes) {
                    if (child.nodeName == 'div') {
                        count2++;
                        if (count2 == 2) {
                            console.log("made it to div2");
                            var div2 = child;
                            break;
                        }
                    }
                }
                console.log("made it after div2");
                let count3: number = 0;
                for (let child of div2.childNodes) {
                    if (child.nodeName == 'div') {
                        count3++;
                        if (count3 == 1) {
                            console.log("made it to div3");
                            var div3 = child;
                            break;
                        }
                    }
                }
                console.log("made it after div3");
                for (let child of div3.childNodes) {
                    if (child.nodeName == 'section') {
                        console.log("made it to section");
                        var section = child;
                        break;
                    }
                }
                for (let child of section.childNodes) {
                    if (child.nodeName == 'div') {
                        console.log("made it to div4");
                        var div4 = child;
                        break;
                    }
                }
                let count4: number = 0;
                for (let child of div4.childNodes) {
                    if (child.nodeName == 'div') {
                        count4++;
                        if (count4 == 3) {
                            console.log("made it to div5");
                            var div5 = child;
                            break;
                        }
                    }
                }
                for (let child of div5.childNodes) {
                    if (child.nodeName == 'div') {
                        console.log("made it to div6");
                        var div6 = child;
                        break;
                    }
                }
                let no_room_data_check_2: boolean = true;
                let count5: number = 0;
                for (let child of div6.childNodes) {
                    if (child.nodeName == 'div') {
                        count5++;
                        if (count5 == 2) {
                            no_room_data_check_2 = false;
                            console.log("made it to div7");
                            var div7 = child;
                            break;
                        }
                    }
                }
                if (!no_room_data_check_2) {
                    for (let child of div7.childNodes) {
                        if (child.nodeName == 'table') {
                            console.log("made it to table");
                            var table = child;
                        }
                    }

                    for (let child of table.childNodes) {
                        if (child.nodeName == 'tbody') {
                            console.log("made it to tbody");
                            var tbody = child;
                        }
                    }
                    for (let child of tbody.childNodes) {
                        let tba: toBeAddedHtml = <any>{};

                        if (child.nodeName == 'tr') {
                            console.log("made it to tr");
                            var tr = child;
                            let firstTDchild: boolean = true;
                            let counter: number = 0;

                            for (let child of tr.childNodes) {

                                if (child.nodeName == 'td') {
                                    if (firstTDchild) {
                                        let firstTD = child;
                                        for (let child of firstTD.childNodes) {
                                            if (child.nodeName == 'a') {
                                                let a = child;
                                                for (let child of a.childNodes) {
                                                    if (child.nodeName == '#text') {
                                                        tba.rooms_number = child.value;
                                                    }
                                                }
                                            }
                                        }
                                        firstTDchild = false;
                                    } else {

                                        let td = child;

                                        for (let child of td.childNodes) {

                                            if (child.nodeName == '#text') {
                                                console.log("made it to text");
                                                console.log(child.value);
                                                if (counter == 0) {
                                                    tba.rooms_seats = child.value;
                                                    counter++;
                                                } else if (counter == 1) {
                                                    tba.rooms_furniture = child.value;
                                                    counter++;
                                                } else if (counter == 2) {
                                                    tba.rooms_type = child.value;
                                                    counter++;
                                                } else {
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        HTMLprocessedDataset.push(tba);
                    }
                }
            }
        }
        console.log(HTMLprocessedDataset);
    }
}


//         files.forEach(function (file) {
//
//             let results: any[];
//             if (file !== null) {
//                 var o = JSON.parse(file);
//                 results = o.result;
//             }
//
//             if((!(o.hasOwnProperty("result"))) || (typeof o !== 'object' )) {
//                 invalidDataset = true;
//             }
//
//             if (results.length > 0) {
//                 results.forEach(function (arrObject: any) {
//                     let tba: toBeAddedHtml = <any>{};
//
//                     tba.rooms_fullname = arrObject['Subject'];
//                     tba.rooms_shortname = arrObject['Course'];
//                     tba.rooms_number = arrObject['Avg'];
//                     tba.rooms_name = arrObject['Professor'];
//                     tba.rooms_address = arrObject['Title'];
//                     tba.rooms_lat = arrObject['Pass'];
//                     tba.rooms_lon = arrObject['Fail'];
//                     tba.rooms_seats = arrObject['id'];
//                     tba.rooms_type = arrObject['Audit'];
//                     tba.rooms_furniture = arrObject['idk'];
//                     tba.rooms_href = arrObject['idk url'];
//                     processedDataset.push(tba);
//                 });
//             }
//         });
//         console.log("parsing html");
//     }
// }