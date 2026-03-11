import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import status from "http-status";
import { TErrorResponse, TErrorSource } from "../interfaces/error.interface";
import * as z from "zod";
import { handleZodError } from "../errorHelpers/handleZodError";
import AppError from "../errorHelpers/AppError";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export const globalErrorHandler = ( err: any, req: Request, res: Response, next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error From Global Handler: ", err);
  }

  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let errorSources: TErrorSource[] = [];
  let message: string = "Internal Server Error";
  let stack: string | undefined = undefined;

  if(err instanceof z.ZodError){
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  }
  else if(err instanceof AppError){
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    // errorSources = [
    //   {
    //     path: '',
    //     message: err.message
    //   }
    // ]
  }
  else if (err instanceof Error) {
      statusCode = status.INTERNAL_SERVER_ERROR;
      message = err.message
      stack = err.stack;
      // errorSources = [
      //     {
      //         path: '',
      //         message: err.message
      //     }
      // ]
  }

    let errorResponse: TErrorResponse = {
      success: false,
      message,
      errorSources,
    }
    

    if(envVars.NODE_ENV === "development"){
      errorResponse = {
        ...errorResponse,
        error: err,
        stack: stack
      }
    }

  res.status(statusCode).json(errorResponse);
};
