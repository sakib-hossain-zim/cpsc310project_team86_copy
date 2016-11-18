/**
 * Created by rtholmes on 2016-06-14.
 */
import restify = require('restify');
import fs = require('fs');

import {QueryRequest} from "../controller/QueryController";
import Log from '../Util';
import InsightFacade from "../controller/InsightFacade";
import {InsightResponse} from "../controller/IInsightFacade";

export default class RouteHandler {

    private static insightFacade = new InsightFacade();

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

    public static putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            var id: string = req.params.id;
            res.contentType
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
                RouteHandler.insightFacade.addDataset(id, req.body).then(function (response: InsightResponse) {
                    res.json(response.code, response.body);
                }).catch(function (response) {
                    res.json(response.code, response.body);
                });
            });

        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            RouteHandler.insightFacade.addDataset(id, req.body).then(function (response: InsightResponse) {
                res.json(response.code, response.body);
            }).catch(function(err: InsightResponse) {
                res.json(err.code, err.body);
            });
        }
        return next();
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));
        let query: QueryRequest = req.params;
        try {
            RouteHandler.insightFacade.performQuery(query).then(function (response) {
                res.json(response.code, response.body);
            }).catch(function(err: InsightResponse) {
                res.json(err.code, err.body);
            });
        } catch (err) {
            Log.error('RouteHandler::postQuery(..) - ERROR: ' + err);
            RouteHandler.insightFacade.performQuery(query).then(function (response) {
                res.json(response.code, response.body);
            }).catch(function(err: InsightResponse) {
                res.json(err.code, err.body);
            });
        }
        return next();
    }

    public static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next){
        var id: string = req.params.id;
        try {
            RouteHandler.insightFacade.removeDataset(id).then(function (response) {
                res.json(response.code, response.body);
            }).catch(function(err: InsightResponse) {
                res.json(err.code, err.body);
            });
        } catch (err) {
            Log.error('RouteHandler::deleteDataset(..) - ERROR: ' + err);
            RouteHandler.insightFacade.removeDataset(id).then(function (response) {
                res.json(response.code, response.body);
            }).catch(function(err: InsightResponse) {
                res.json(err.code, err.body);
            });
        }
        return next();
    }
}