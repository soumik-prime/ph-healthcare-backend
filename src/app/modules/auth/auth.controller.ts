import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.registerPatient(req.headers, payload);
  // For Sending cookies
  const cookies = result.headers.get("Set-Cookie");
  if (cookies) {
    res.setHeader("Set-Cookie", cookies);
  }

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Patient Registered Successfully!",
    data: result.response,
  });
});

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await AuthService.loginUser(payload);
        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: "User logged in successfully",
            data: result,
        })
    }
)

export const AuthController = {
  registerPatient,
  loginUser
};
