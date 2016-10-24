/**
 * Created by rtholmes on 2016-06-14.
 */
import restify = require('restify');
import fs = require('fs');

import DatasetController from '../controller/DatasetController';
import {Datasets} from '../controller/DatasetController';
import QueryController from '../controller/QueryController';

import {QueryRequest} from "../controller/QueryController";
import Log from '../Util';

export default class RouteHandler {

    private static datasetController = new DatasetController();


    public static getHomepage(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getHomepage(..)');
        fs.readFile('./src/rest/views/index.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }

    public static  putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            var id: string = req.params.id;

            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any) {
                Log.trace('RouteHandler::postDataset(..) on data; chunk length: ' + chunk.length);
                buffer.push(chunk);
            });

            req.once('end', function () {
                let concated = Buffer.concat(buffer);
                req.body = concated.toString('base64');
                Log.trace('RouteHandler::postDataset(..) on end; total length: ' + req.body.length);

                let controller = RouteHandler.datasetController;

                controller.process(id, req.body).then(function (result) {
                    Log.trace('RouteHandler::postDataset(..) - processed');
                    if (controller.invalidDataSet) {
                        res.json(400, {error: "not valid dataset"});
                    } else {
                        if (fs.existsSync('./data/' + id + '.json')){
                            res.json(201, {success: result});
                        }
                        else{
                            res.json(204, {success: result});
                        }

                    }
                }).catch(function (err: Error) {
                    Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.message);
                    res.json(400, {error: err.message});
                });
            });

        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            res.send(400, {error: err.message});
        }
        return next();
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));
        try {
            let query: QueryRequest = req.params;
            //console.log(typeof query);
            //    if (typeof query === 'undefined') res.send(400,'query is undefined');
            let datasets: Datasets = RouteHandler.datasetController.getDatasets();

            let controller = new QueryController(datasets);

            let isValid = controller.isValid(query);

            let id = query.GET[0].split('_')[0];

            if (isValid === true) {
                let result = controller.query(query);
                if (!fs.existsSync('./data/' + id + '.json')) {
                    res.send(424,{missing: [id]});
                }
                else{
                    res.json(200, result);
                }

            } else {
                res.json(400, {status: 'invalid query'});
            }
        } catch (err) {
            //  console.log("we are here");
            Log.error('RouteHandler::postQuery(..) - ERROR: ' + err);
            res.send(400);
        }
        return next();
    }

    public static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next){
        var id: string = req.params.id;
        let controller = RouteHandler.datasetController;
        let datasets = controller.getDatasets();
        if (fs.existsSync('./data/' + id + '.json')){
            fs.unlink('./data/' + id + '.json');
            datasets[id] = null;
            res.send(204);
        }

        else {
            res.send(404,{error: 'resource with id: ' + id + ' was not previously PUT'})
        }
        return next();
    }
}