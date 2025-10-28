import { Request, Response } from 'express';
export declare class AdvanceController {
    createAdvanceRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAdvanceRequests(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAdvanceRequestById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=advanceController.d.ts.map