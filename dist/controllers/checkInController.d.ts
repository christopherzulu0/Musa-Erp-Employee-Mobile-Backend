import { Request, Response } from 'express';
export declare class CheckInController {
    createCheckIn(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCheckIns(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getTodayCheckIn(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMonthlyStats(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    submitAttendanceRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAttendanceRecords(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=checkInController.d.ts.map