const passport = require('passport')

// exports.isLoggedIn = (req, res, next) => {
//     if (req.isAuthenticated()) {
//         next();
//     } else {
//         res.status(401).send('로그인이 필요합니다.');
//     }
// };

// exports.isNotLoggedIn = (req, res, next) => {
//     if (!req.isAuthenticated()) {
//         next();
//     } else {
//         res.status(401).send('로그인하지 않은 사용자만 접근 가능합니다.');
//     }
// };

exports.verifyToken = async (req, res, next) => {
    console.log(req.headers.authorization)
    if(!req.headers.authorization) {
      return res.status(419).send({ error: "noTokenError" });
    }
    passport.authenticate('jwt', { session: false}, (err, user, info) => {
        try {
            if (err) {    
                console.log("여기")
                console.error(err);
                return next(err)
            }
            console.log("44515243241456356356456456")
            if(info) {
                if (info?.name === "TokenExpiredError") {
                    return res.status(403).send({ error: info.name });
                }
                if(info?.name === "JsonWebTokenError") {
                    return res.status(419).send({ error: info.name })
                }
            }
            req.user = user;
            // return
            next();
        } catch (error) {
            console.log(error)
            next(error);
        }
    })
}