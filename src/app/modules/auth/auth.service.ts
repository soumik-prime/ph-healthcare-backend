import { IncomingHttpHeaders } from "http";
import { auth } from "../../lib/auth";
import { UserStatus } from "../../../generated/prisma/enums";

interface IRegisterPatient {
  name: string;
  email: string;
  password: string;
}

const registerPatient = async (
  headers: IncomingHttpHeaders,
  payload: IRegisterPatient,
) => {
  const { name, email, password } = payload;

  const cleanHeaders: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (!value) continue;
    cleanHeaders[key] = Array.isArray(value) ? value.join(";") : value;
  }

  const data = await auth.api.signUpEmail({
    returnHeaders: true,
    headers: cleanHeaders,
    body: {
      name,
      email,
      password,
    },
  });

  // if(!data.user) throw new Error("Faild to register patient!");

  return data;
};

interface ILoginUserPayload {
  email: string;
  password: string;
}

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (data.user.status === UserStatus.BLOCKED) {
    throw new Error("User is blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new Error("User is deleted");
  }

  return data;
};

export const AuthService = {
  registerPatient,
  loginUser,
};
