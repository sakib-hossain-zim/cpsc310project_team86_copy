
/*
 * This should be in the same namespace as your controllers
 */
import {QueryRequest} from "./QueryController";
import {IInsightFacade, InsightResponse} from "./IInsightFacade";

export default class InsightFacade implements IInsightFacade {

    // TODO: need to implement this
    public addDataset (id:string, content: string) : any //Promise<InsightResponse>
    {}

    public removeDataset (id:string): any //Promise<InsightResponse>
    {}

    public performQuery (query: QueryRequest): any //Promise<InsightResponse>
    {}

}