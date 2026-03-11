import { IncomingHttpHeaders } from "http";
import { auth } from "../../lib/auth";
import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { tokenUtils } from "../../utils/token";

interface IRegisterPatient {
  name: string;
  email: string;
  password: string;
}

interface ILoginUserPayload {
  email: string;
  password: string;
}

const buildAuthHeaders = (
  headers: IncomingHttpHeaders,
): Record<string, string> => {
  const cleanHeaders: Record<string, string> = {};

  const userAgent = headers["user-agent"];
  if (userAgent) {
    cleanHeaders["user-agent"] = Array.isArray(userAgent)
      ? userAgent.join(" ")
      : userAgent;
  }

  const xForwardedFor = headers["x-forwarded-for"];
  const xRealIp = headers["x-real-ip"];
  const cfConnectingIp = headers["cf-connecting-ip"];

  const rawIp =
    (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor) ??
    (Array.isArray(xRealIp) ? xRealIp[0] : xRealIp) ??
    (Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp);

  if (rawIp) {
    cleanHeaders["x-forwarded-for"] = rawIp.split(",")[0].trim();
  }

  return cleanHeaders;
};

const registerPatient = async (
  headers: IncomingHttpHeaders,
  payload: IRegisterPatient,
) => {
  const { name, email, password } = payload;
  const cleanHeaders = buildAuthHeaders(headers);

  const data = await auth.api.signUpEmail({
    headers: cleanHeaders,
    body: {
      name,
      email,
      password,
    },
  });
  const user = data.user;

  if (!user) {
    // throw new Error("Faild to register patient!");
    throw new AppError(status.BAD_REQUEST, "Faild to register patient!");
  }

  try {
    const patient = await prisma.$transaction(async (tsx) => {
      return await tsx.patient.create({
        data: {
          userId: user.id,
          name: user.name,
          email: user.email,
        },
      });
    });
    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });
    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });
    return {
      accessToken,
      refreshToken,
      patient,
      ...data,
    };
  } catch (error) {
    console.log("Transection error", error);
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
    throw error;
  }
};

const loginUser = async (
  headers: IncomingHttpHeaders,
  payload: ILoginUserPayload,
) => {
  const { email, password } = payload;
  const cleanHeaders = buildAuthHeaders(headers);

  const data = await auth.api.signInEmail({
    headers: cleanHeaders,
    body: {
      email,
      password,
    },
  });
  if (data.user.status === UserStatus.BLOCKED) {
    // throw new Error("User is blocked");
    throw new AppError(status.FORBIDDEN, "User is blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    // throw new Error("User is deleted");
    throw new AppError(status.NOT_FOUND, "User is deleted");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return {
    accessToken,
    refreshToken,
    ...data,
  };
};

export const AuthService = {
  registerPatient,
  loginUser,
};
