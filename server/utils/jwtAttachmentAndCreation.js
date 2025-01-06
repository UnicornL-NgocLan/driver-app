import jwt from 'jsonwebtoken'

export const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET,{expiresIn:'1h'});
  return token;
};

export const attachCookiesToResponse = ({ res, data }) => {
  const accessTokenJWT = createJWT({ payload: data });

  const oneHour = 1000 * 60 * 60;
  res.cookie('stto', accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(Date.now() + oneHour),
    sign: true
  });
};
