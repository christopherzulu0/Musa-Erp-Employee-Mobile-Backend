import { Request, Response } from 'express';
export declare const getCurrentShift: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAvailableShifts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getShiftHistory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requestShiftChange: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=shiftController.d.ts.map