import { Request, Response } from 'express';
export declare class LeaveController {
    getLeaveBalances(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getLeaveApplications(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getLeaveTypes(req: Request, res: Response): Promise<void>;
    createLeaveApplication(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getUpcomingLeaves(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createCompensatoryLeaveRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCompensatoryLeaveRequests(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=leaveController.d.ts.map