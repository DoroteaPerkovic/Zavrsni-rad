import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = "SuperSecretAccessToken"; 
const REFRESH_TOKEN_SECRET = "DrugiSecretZaRefresh";  

export function generateTokens(user) {
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" } 
  );

  const refreshToken = jwt.sign(
    { userId: user.id, role: user.role },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}