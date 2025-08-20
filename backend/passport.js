const passport = require("passport");

const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const prisma = require("./prisma");

const cookieExtractor = (req) =>
  req && req.cookies ? req.cookies.token || null : null;
const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: jwt_payload.id },
      });
      if (!user) return done(null, false);
      return done(null, { id: user.id, username: user.username });
    } catch (err) {
      console.log(err);
      return done(err, false);
    }
  })
);
module.exports = passport;
