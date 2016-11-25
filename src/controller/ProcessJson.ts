interface toBeAddedJson {
    courses_dept: string;
    courses_id: string;
    courses_avg: number;
    courses_instructor: string;
    courses_title: string;
    courses_pass: number;
    courses_fail: number;
    courses_uuid: string;
    courses_audit: number;
}

export default class ProcessJson {
    public process(files: any, processedDataset: any, invalidDataset: any): any {
        console.log('parsing json');
        files.forEach(function (file) {
            let results: any[];
            if (file !== null) {
                var o = JSON.parse(file);
                results = o.result;
            }

            if((!(o.hasOwnProperty("result"))) || (typeof o !== 'object' )) {
                invalidDataset = true;
            }

            if (results.length > 0) {
                results.forEach(function (arrObject: any) {
                    let tba: toBeAddedJson = <any>{};

                    tba.courses_dept = arrObject['Subject'];
                    tba.courses_id = arrObject['Course'];
                    tba.courses_avg = arrObject['Avg'];
                    tba.courses_instructor = arrObject['Professor'];
                    tba.courses_title = arrObject['Title'];
                    tba.courses_pass = arrObject['Pass'];
                    tba.courses_fail = arrObject['Fail'];
                    tba.courses_uuid = arrObject['id'];
                    tba.courses_audit = arrObject['Audit'];
                    processedDataset.push(tba);
                });
            }
        });
    }
}