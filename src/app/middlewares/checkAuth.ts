import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../config/env";

export const checkAuth = (...authRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const sessionToken = cookieUtils.getCookie(
      req,
      "better-auth.session_token",
    );

    if (!sessionToken) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Unauthorized Access! No session token is provided!",
      );
    } else {
      const sessionExist = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });
      if (sessionExist && sessionExist.user) {
        const user = sessionExist.user;
        const now = new Date();
        const expiresAt = new Date(sessionExist.expiresAt);
        const createdAt = new Date(sessionExist.createdAt);
        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const sessionTimeRemaining = expiresAt.getTime() - now.getTime();
        const percentRemaining = (sessionTimeRemaining / sessionLifeTime) * 100;
        if (percentRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", sessionTimeRemaining.toString());
          console.log("Session Expiring soon!!");
        }

        if (
          user.status === UserStatus.BLOCKED ||
          user.status === UserStatus.DELETED
        ) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorize access! User is not active!",
          );
        }

        if (user.isDeleted) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorize access! User is deleted!",
          );
        }

        if (authRoles.length > 0 && !authRoles.includes(user.role)) {
          throw new AppError(
            status.FORBIDDEN,
            "You do not have the permission to access this resource",
          );
        }
        req.user = {
          userId: user.id,
          role: user.role,
          email: user.email,
        };
      }
      //Access Token Verification
      const accessToken = cookieUtils.getCookie(req, "accessToken");

      if (!accessToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! No access token provided.",
        );
      }

      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        envVars.ACCESS_TOKEN_SECRET,
      );

      if (!verifiedToken.success) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! Invalid access token.",
        );
      }

      if (
        authRoles.length > 0 &&
        !authRoles.includes(verifiedToken.data!.role as Role)
      ) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access! You do not have permission to access this resource.",
        );
      }

      next();
    }
  };
};
