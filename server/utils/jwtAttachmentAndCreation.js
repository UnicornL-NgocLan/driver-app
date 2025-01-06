import jwt from 'jsonwebtoken'

export const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET,{expiresIn:'1h'});
  return token;
};

export const attachCookiesToResponse = ({ res, data }) => {
  const accessTokenJWT = createJWT({ payload: data });

  const thirtyDays = 1000 * 60 * 60 * 24 * 30;
  res.cookie('stto', accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(Date.now() + thirtyDays),
    sign: true
  });
};
