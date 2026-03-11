import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"

const createToken = (payload: JwtPayload, secret: string, { expiresIn }: SignOptions) => {
  return jwt.sign(payload, secret, { expiresIn });
}

const verifyToken = (token: string, secret:string) => {
  try{
    const decoded = jwt.verify(token, secret) as JwtPayload;

    return {
      success: true,
      data: decoded
    };

  } catch(error: unknown) {
    return {
      success: false,
      message: "Failed to verify token",
      error: error
    }
  }
}

const decodeToken = (token: string) => {
  return jwt.decode(token) as JwtPayload;
}


export const jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
}