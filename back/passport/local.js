const passport = require('passport');
const bcrypt = require('bcrypt');

const { Strategy: LocalStrategy } = require('passport-local');
const { ExtractJwt, Strategy: JWTStrategy } = require("passport-jwt");
const { User } = require('../models');

module.exports = () => {
    passport.use(
        "signin",
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
    }, async (email, password, done) => {
        try {
            const user = await User.findOne({
                where: { email }
            });
            if(!user) {
                return done(null, false, { reason: '존재하지 않는 아이디입니다!' })
            }
            const result = await bcrypt.compare(password, user.password);
            if(result) {
                return done(null, user);
            }
            return done(null, false, { reason: '비밀번호가 틀렸습니다' });
        } catch(error) {
            return done(error);
        }
    }));
}


passport.use(
    "jwt",
    new JWTStrategy(
        {
            secretOrKey: "jwt-secret-key",
            jwtFromRequest:ExtractJwt.fromHeader("authorization"),
        },
        async (jwtPayload, done) => {
            console.log("왜 여기까지 안오지")
            try {
                const user = await User.findOne({
                    where: {
                        username: jwtPayload.username
                    }
                })
                if (user) {
                    done(null, user);
                }
            } catch (error) {
                console.log("여기도 안오잖아")
                console.error(error);
                return done(error);
            }
        }
    )
)  
