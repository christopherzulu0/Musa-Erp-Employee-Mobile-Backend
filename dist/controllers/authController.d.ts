import { Request, Response } from 'express';
export declare class AuthController {
    private readonly JWT_SECRET;
    private readonly JWT_EXPIRES_IN;
    constructor();
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    logout(req: Request, res: Response): Promise<void>;
    getProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    private generateEmployeeId;
}
//# sourceMappingURL=authController.d.ts.map