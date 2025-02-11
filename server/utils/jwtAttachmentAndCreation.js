import jwt from 'jsonwebtoken'

export const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

export const attachCookiesToResponse = ({ res, data }) => {
  const accessTokenJWT = createJWT({ payload: data });

  res.cookie('stto', accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sign: true
  });
};
