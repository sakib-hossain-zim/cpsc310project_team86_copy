/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import Log from "../src/Util";

import JSZip = require('jszip');
import {expect} from 'chai';

describe("DatasetController", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to process valid dataset", function () {
        Log.test('Creating dataset');
        let content = [{
            "tier_eighty_five": 1,
            "tier_ninety": 3,
            "Title": "fnd bdy dsgn:bsc",
            "Section": "001",
            "Detail": "",
            "tier_seventy_two": 0,
            "Other": 0,
            "Low": 87,
            "tier_sixty_four": 0,
            "id": 38892,
            "tier_sixty_eight": 0,
            "tier_zero": 0,
            "tier_seventy_six": 0,
            "tier_thirty": 0,
            "tier_fifty": 0,
            "Professor": "krebs, claudia",
            "Audit": 0,
            "tier_g_fifty": 0,
            "tier_forty": 0,
            "Withdrew": 0,
            "Year": "2014",
            "tier_twenty": 0,
            "Stddev": 3.83,
            "Enrolled": 4,
            "tier_fifty_five": 0,
            "tier_eighty": 0,
            "tier_sixty": 0,
            "tier_ten": 0,
            "High": 95,
            "Course": "511",
            "Session": "w",
            "Pass": 4,
            "Fail": 0,
            "Avg": 92,
            "Campus": "ubc",
            "Subject": "anat"
        }, {
            "tier_eighty_five": 1,
            "tier_ninety": 3,
            "Title": "fnd bdy dsgn:bsc",
            "Section": "overall",
            "Detail": "",
            "tier_seventy_two": 0,
            "Other": 0,
            "Low": 87,
            "tier_sixty_four": 0,
            "id": 38893,
            "tier_sixty_eight": 0,
            "tier_zero": 0,
            "tier_seventy_six": 0,
            "tier_thirty": 0,
            "tier_fifty": 0,
            "Professor": "",
            "Audit": 0,
            "tier_g_fifty": 0,
            "tier_forty": 0,
            "Withdrew": 0,
            "Year": "2014",
            "tier_twenty": 0,
            "Stddev": 3.83,
            "Enrolled": 4,
            "tier_fifty_five": 0,
            "tier_eighty": 0,
            "tier_sixty": 0,
            "tier_ten": 0,
            "High": 95,
            "Course": "511",
            "Session": "w",
            "Pass": 4,
            "Fail": 0,
            "Avg": 92,
            "Campus": "ubc",
            "Subject": "anat"
        }];
        let zip = new JSZip();
        zip.file('content.obj', JSON.stringify(content));
        console.log("length of content is " + content.length);
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };

        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            let controller = new DatasetController();
            return controller.process('setA', data);
        }).then(function (result) {
            Log.test('Dataset processed; result: ' + result); // result should be true
            expect(result).to.equal(true); // zip file was valid, should pass
        });
    });

    it("Should be able to receive a Dataset", function () {
        Log.test('Creating dataset');
        let content = {key: 'value'};
        let zip = new JSZip();
        zip.file('content.obj', JSON.stringify(content));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            let controller = new DatasetController();
            return controller.process('setA', data);
        }).then(function (result) {
            Log.test('Dataset processed; result: ' + result);
            expect(result).to.equal(true);
        });

    });

    it("Should be able to not process invalid dataset", function () {
        Log.test('Creating dataset');
        let content = [];
        let zip = new JSZip();
        zip.file('content.obj', JSON.stringify(content));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            let controller = new DatasetController();
            return controller.process('setA', data);
        }).then(function (result) {
            Log.test('Dataset processed; result: ' + result);
            expect(result).to.equal(false);
        });

    });


});




