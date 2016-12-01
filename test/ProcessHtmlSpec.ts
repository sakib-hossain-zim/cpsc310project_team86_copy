// /**
//  * Created by rtholmes on 2016-10-04.
//  */
//
// import fs = require('fs');
// import Log from "../src/Util";
// import {expect} from 'chai';
// import InsightFacade from "../src/controller/InsightFacade";
// import {InsightResponse} from "../src/controller/IInsightFacade";
// import {QueryRequest} from "../src/controller/QueryController";
// import ProcessHtml from "../src/controller/ProcessHtml";
//
// describe("ProcessHtml", function () {
//     var zipFileContents_room: string = null;
//     var facade: InsightFacade = null;
//
//     before(function () {
//         // Log.info('InsightController::before() - start');
//         // // this zip might be in a different spot for you
//         // zipFileContents_room = new Buffer(fs.readFileSync('310rooms.1.1.zip')).toString('base64');
//         // try {
//         //     // what you delete here is going to depend on your impl, just make sure
//         //     // all of your temporary files and directories are deleted
//         //     fs.unlinkSync('./data/courses.json');
//         //     fs.unlinkSync('./data/rooms.json');
//         // } catch (err) {
//         //     // silently fail, but don't crash; this is fine
//         //     Log.warn('InsightController::before() - courses.json not removed (probably not present)');
//         // }
//         // Log.info('InsightController::before() - done');
//     });
//
//     beforeEach(function () {});
//
//     it("Should be able to get LatLon data", function () {
//         // var that = this;
//         // Log.trace("Starting test: " + that.test.title);
//         // return facade.addDataset('roomsTest', zipFileContents_room).then(function (response: InsightResponse) {
//         //     expect(response.code).to.equal(204);
//         // })catch(function (response: InsightResponse) {
//         //     expect.fail('Should not happen');
//         // });
//
//         let testHtmlProcess = new ProcessHtml();
//         return testHtmlProcess.getLatLon("6245 Agronomy Road V6T 1Z4").then(function(latLonData) {
//             console.log(latLonData);
//             expect(latLonData.hasOwnProperty('error')).to.equal(false);
//         }).catch(function(e) {
//             console.log(e);
//             expect.fail('Should not happen');
//         });
//     });
//
//     it("Should return an error getting LatLon data", function () {
//         let testHtmlProcess = new ProcessHtml();
//         return testHtmlProcess.getLatLon("6245Agronomy Road V6T 1Z4").then(function(latLonData) {
//             console.log(latLonData);
//             expect.fail('Should not happen');
//         }).catch(function(e) {
//             console.log(e);
//             expect(e.hasOwnProperty('error')).to.equal(true);
//         });
//     });
// });