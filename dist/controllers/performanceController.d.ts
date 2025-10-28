import { Request, Response } from 'express';
export declare class PerformanceController {
    getPerformanceMetrics(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getGoals(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getEnergyPoints(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPerformanceReviews(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const performanceController: PerformanceController;
//# sourceMappingURL=performanceController.d.ts.map