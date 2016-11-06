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

export default class ProcessHtml {
    public process(files: any, processedDataset: any, invalidDataset: any): any {
        // files.forEach(function (file) {
        //
        //     let results: any[];
        //     if (file !== null) {
        //         var o = JSON.parse(file);
        //         results = o.result;
        //     }
        //
        //     if((!(o.hasOwnProperty("result"))) || (typeof o !== 'object' )) {
        //         invalidDataset = true;
        //     }
        //
        //     if (results.length > 0) {
        //         results.forEach(function (arrObject: any) {
        //             let tba: toBeAddedHtml = <any>{};
        //
        //             tba.rooms_fullname = arrObject['Subject'];
        //             tba.rooms_shortname = arrObject['Course'];
        //             tba.rooms_number = arrObject['Avg'];
        //             tba.rooms_name = arrObject['Professor'];
        //             tba.rooms_address = arrObject['Title'];
        //             tba.rooms_lat = arrObject['Pass'];
        //             tba.rooms_lon = arrObject['Fail'];
        //             tba.rooms_seats = arrObject['id'];
        //             tba.rooms_type = arrObject['Audit'];
        //             tba.rooms_furniture = arrObject['idk'];
        //             tba.rooms_href = arrObject['idk url'];
        //             processedDataset.push(tba);
        //         });
        //     }
        // });
        console.log("parsing html");
    }
}