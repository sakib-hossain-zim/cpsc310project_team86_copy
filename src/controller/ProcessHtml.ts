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

    public divRecursion(child: any, childArr:any,  infoFound: boolean) {

        // console.log('in recursion');
        // console.log(child.nodeName);

        let tba: toBeAddedHtml = <any>{};
        let processedDataset: any = [];
        let next_child: any;


        if (infoFound == true) {         //found what we want - goal reached
            // console.log('info found');
            return child;
        }

        else {                              // goal not reached

            // console.log('find key value');
            for (let keys in child.attrs) {             // get attribute value
                var key = child.attrs[keys].value
            }

            // console.log(key);
            // console.log('goal not reached');

                if (child.nodeName !== '#text' && child.nodeName !== '#comment' && key == 'building-info') {// attributes we want
                    // console.log('made it here');
                    // console.log('finally');
                    tba.rooms_fullname = child.childNodes[1].childNodes[0].childNodes[0].value;
                    tba.rooms_address = child.childNodes[3].childNodes[0].childNodes[0].value;
                    // console.log(tba.rooms_address);
                    // console.log(tba.rooms_fullname);

                    processedDataset.push(tba);
                    infoFound = true;
                    return this.divRecursion(processedDataset, childArr, infoFound);

                }


            else {                                      // don't have attributes we want
                    // console.log('hello');
                    // console.log('have not found what we want');

                    if (child.nodeName == '#text' || child.nodeName == '#comment') {             // doesn't have children
                        // console.log('no kids');
                        next_child = childArr.shift();          // gives you FIFO element from existing array
                        return this.divRecursion(next_child, childArr, infoFound)
                    }

                    else if (child.childNodes.length > 0) {                      // if you have children
                        // console.log('has kids');
                        for (let original_child of child.childNodes) {
                            // console.log('didnt find attributes go to next child');
                            var recurseChild = original_child;  // recurseChild gives you next set of children
                            childArr.push(recurseChild);        // add next set of children to array

                        }
                    }

                    // console.log(childArr.length);
                    next_child = childArr.shift();    // gives you FIFO from updated array
                    // console.log(childArr.length);
                    return this.divRecursion(next_child, childArr, infoFound);
                }


        }
    }

    public process(files: any, processedDataset: any, invalidDataset: any): any {
        console.log('parsing html');
        let HTMLprocessedDataset: any = [];
        let buildingFullName: string;
        let buildingAddress: string;
        let foundInfo: boolean = false;

        let divArray: any = [];

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
                    // console.log("made it to body");
                    var bodyNode = child;
                }
            }


            for (let child of bodyNode.childNodes) {
                // console.log('looking through body children');
                if (child.nodeName == 'div') {
                    // console.log('made it to div');
                    var divNode = child;
                    divArray.push(divNode);             // array of original divs
                    }
                }

            // console.log(divArray.length);

            if (divArray.length > 0) {
                var div = divArray.shift();          // gives you first child in array
                // console.log(divArray.length);
                // console.log(typeof div.attrs);

                HTMLprocessedDataset =  this.divRecursion(div, divArray, foundInfo);        //uses depth first searchish
            }
            console.log(HTMLprocessedDataset);
        }
        return HTMLprocessedDataset;
    }

}

