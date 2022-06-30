const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require("jsonwebtoken");
const Sequelize = require('Sequelize')
const Op = Sequelize.Op;

const { User, Event, PrivateEvent } = require('../models');
const router = express.Router()

const { verifyToken } = require('./middlewares');

// 페이지 접속시 때와 같은 라우터- 완
// 처음 접속했을 때 단위는 달이며 오늘날짜를 기준으로 조회
router.get('/inquireTodayCalendar', async (req, res, next) => {
    const exUser = await User.findOne({
        where: {
            id: 1
        }
    })
    date = new Date(); // new Date(2022, 0, 1)은 1월 1일 
    let month = date.getMonth()+1;
    let year = date.getFullYear();
    standard = String(year)+ '-' + String(month)
    let lastMonthDate = new Date(year, month-1, 0 ).getDate()
    let currentMonthDate = new Date(year, month+1, 0 ).getDate()
    if(35 - currentMonthDate % 2 == 1)
        lastmonthDate -= 1
            
    let dividedate = parseInt((35 - currentMonthDate) / 2)
    console.log(dividedate)
    let startYear = year
    let startMonth = month
    if(month == 1){
        startYear = year -1
        startMonth = 13
        lastMonthDate = 31
    }
    lastMonthDate -= dividedate
    const startdate = String(startYear)+'-'+ String(startMonth-1)+'-'+String(lastMonthDate) // 첫날짜도 수정
    const endDate = String(year)+ '-' + String(month+1)+'-'+String(dividedate+1) // 끝날짜도 수정
    console.log(startdate, endDate, '기간을 조회')
    const exEvent = await exUser.getMyEvent({
        attributes: ['StartTime','name'],
        where: {
            startTime: {
                [Op.between]: [startdate, endDate]
            }
        }
    })  
    return res.json({exEvent : exEvent})
})

// 개인 일정 가져오기(년) - 완
router.get('/year/:year/:month/:day', async (req, res, next) => {
    const exUser = await User.findOne({
        where: {
            id: 1
        }
    })
    date = new Date();
    let year = req.params.year;
    let month = req.params.month;
    standard = String(year)+ '-' + String(month)
    const startdate = standard
    const endDate = String(Number(req.params.year)+1)+'-1'
    const exEvent = await exUser.getMyEvent({
        attributes: ['StartTime'],
        where: {
            startTime: {
                [Op.between]: [startdate, endDate]
            }
        }
    })  
    return res.json({exEvent : exEvent})
})


// 개인 일정 가져오기(달)
router.get('/month/:year/:month/:day', async (req, res, next) => {
    const exUser = await User.findOne({
        where: {
            id: 1
        }
    })
    date = new Date(req.params.year, req.params.month-1, req.params.day); // new Date(2022, 0, 1)은 1월 1일 
    console.log(date,"역ㅁㅇㄱㅇㄷㄱㄴ기야",req.year, req.month-1, req.day)
    let month = date.getMonth()+1;
    let year = date.getFullYear();
    standard = String(year)+ '-' + String(month)
    let lastMonthDate = new Date(year, month-1, 0 ).getDate()
    let currentMonthDate = new Date(year, month+1, 0 ).getDate()
    if(35 - currentMonthDate % 2 == 1)
        lastmonthDate -= 1
            
    let dividedate = parseInt((35 - currentMonthDate) / 2)
    console.log(dividedate)
    let startYear = year
    let startMonth = month
    if(month == 1){
        startYear = year -1
        startMonth = 13
        lastMonthDate = 31
    }
    lastMonthDate -= dividedate
    const startdate = String(startYear)+'-'+ String(startMonth-1)+'-'+String(lastMonthDate) // 첫날짜도 수정
    const endDate = String(year)+ '-' + String(month+1)+'-'+String(dividedate+1) // 끝날짜도 수정
    console.log(startdate, endDate, '기간을 조회')
    const exEvent = await exUser.getMyEvent({
        attributes: ['StartTime','name'],
        where: {
            startTime: {
                [Op.between]: [startdate, endDate]
            }
        }
    })  
    return res.json({exEvent : exEvent})
})

// 개인 일정 가져오기(주)
router.post('/week/:year/:month/:day', async (req, res, next) => {
    const exUser = await User.findOne({
        where: {
            id: 1
        }
    })
    date = new Date(req.params.year, req.params.month-1, req.params.day); // new Date(2022, 0, 1)은 1월 1일 
    startDate = req.body.startdate
    endDate = req.body.endDate
    console.log(startDate, endDate, '기간을 조회')
    const exEvent = await exUser.getMyEvent({
        attributes: ['StartTime','name'],
        where: {
            startTime: {
                [Op.between]: [startDate, endDate]
            }
        }
    })  
    return res.json({exEvent : exEvent})
})

// 개인 일정 가져오기(일)
router.get('/day/:year/:month/:day', async (req, res, next) => {
    const exUser = await User.findOne({
        where: {
            id: 1
        }
    })
    const startDate = req.params.year + '-' + req.params.month + '-' + String(Number(req.params.day)+1)
    const endData = req.params.year + '-' + req.params.month + '-' + String(Number(req.params.day))
    console.log(startDate, endData)
    const exEvent = await exUser.getMyEvent({
        attributes: ['StartTime','name'],
        where: {
            startTime: {
                [Op.gte]: startDate, 
                [Op.lte]: endData, 
            }
        }
    })  
    console.log(startDate, endData, "뭐지")
    return res.json({exEvent : exEvent})
})

// 개인이벤트 만들기
router.post('/createPrivateEvent', async (req, res, next) => {
    const exUser = await User.findOne({
        where: {
            id: 1
        }
    })
    const event = await PrivateEvent.create({
            name: req.body.name,
            color: req.body.color,
            priority: req.body.priority,
            memo: req.body.memo,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
    })
    try {
        const privateEvent = await exUser.addMyEvent(event)


        console.log("개인 이벤트 만들기 성공")
        res.status(201).json(privateEvent)
    } catch(error) {
        console.error(error)
        next(error)
    }
})

// 개인이벤트 업데이트
router.patch('/editPrivateEvent', async (req, res, next) => {
    try {
        exUser = User.findOne({
            where: {
                id: 1
            }
        })
        
        const event = exUser.getMyEvent({
            where: {
                id : 1
            }
        })
        privateEvent = event.update({
            name: req.body.name,
            color: req.body.color,
            priority: req.body.priority,
            memo: req.body.memo,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
        }) 
        console.log("개인 이벤트 수정 성공")
        res.status(201).json(privateEvent)
    } catch (err) {
        console.error(err);
        next(err)
    }
})

//개인 이벤트 삭제
router.delete('/deletePrivateEvent', async (req, res, next) => {
    try{

        console.log("fdafdfsdfaewweaac")
        exUser = await User.findOne({
            where: {
                id: 1
            }
        })
        console.log(exUser," 어디양ㅁㄴㅇㄴㅁㅇㅁㅇㅁㅇ")
        const event = await exUser.getMyEvent({
            where: {
                id: 5
            }
        })
        await exUser.removeMyEvent(event)
        console.log("개인 이벤트 삭제 성공")
        // await PrivateEvent.destroy({
        //     where:{
        //         id: 5
        //     }
        // })
        res.status(204).json({"dasdas":"dasda"})
    } catch(err) {
        console.error(err)
        next(err)
    }
    
})

// 로그인
router.post('/login', (req, res, next) => {
    passport.authenticate('signin' ,(err, user, info) => {
        try{
            console.log(user)
            if (err) {
                console.error(err);
                next(err);
            }
            if(info) {
                return res.status(401).send(info);
            }
            return req.login(user, { session: false },async (loginErr) => {
                if (loginErr) {
                    return next(loginErr);
                }
                const refreshToken = jwt.sign(
                    {
                        sub: "refresh",
                        email: user.email,
                    },
                    "jwt-secret-key",
                    { expiresIn: "24h" }
                );
                const accessToken = jwt.sign(
                    {
                        sub: "access",
                        email: user.email
                    },
                    "jwt-secret-key",
                    {
                        expiresIn: "5m",
                    }
                );
                const fullUserWithoutPassword = await User.findOne({
                    where: { email: user.email },
                    attributes: {
                        exclude: ['password']
                    }
                })
                console.log("로그인 성공 확인")
                return res.status(200).send({
                    fullUserWithoutPassword,
                    refreshToken,
                    accessToken,
                });
            })
        } catch (error) {
            console.log(error);
            next(error);
        }
    })(req, res, next);
});

router.post('/signup', async (req, res, next) => {
    try{
        const exUser = await User.findOne({
            where: {
                email: req.body.email,
            }
        });
        if (exUser) {
            return res.status(403).send('이미 사용중인 아이디입니다.')
        }   
        const hashedPassword = await bcrypt.hash(req.body.password, 12)
        await User.create({
            email: req.body.email,
            password: hashedPassword,
            nickname: req.body.nickname,
        })
        res.status(201).send('ok');
        // res.status(201).send('회원가입이 완료되었습니다.')
        console.log("회원가입 확인")
    } catch (error) {
        console.log(error);
        next(error)
    }
})

router.post("/refreshToken", async (req, res, next) => {
    passport.authenticate(("jwt", { session: false }, (err, user, info) => {
        try {
            if(err) {
                console.error(err);
                return next(err);
            }
            if(info) {
                if (info?.name === "TokenExpiredError") {
                //refresh토큰 마저 만료
                    return res.status(419).send({ error: info.name });
                }
                if (info?.name === "JsonWebTokenError") {
                //refresh토큰 잘못됨
                    return res.status(419).send({ error: info.name });
                }
            }
            //토큰 재발급
            const refreshToken = jwt.sign(
                {
                    sub: "refresh",
                    email: user.email,
                },
                "jwt-secret-key",
                { expiresIn: "24h" }
            );
            const accessToken = jwt.sign(
                { 
                    sub: "access",
                    email: user.email
                },
                "jwt-secret-key",
                {
                    expiresIn: "5m",
                }
            );
            return res.status(200).send({
                email: email,

                refreshToken,
                accessToken,
            })
        } catch(error) {
            console.error(error);
            next(error);
        }
    }))
})

router.post('/user/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.send('ok');
});


module.exports = router