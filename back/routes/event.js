const express = require("express");
var { CronJob } = require("cron");

const {
  sequelize,
  User,
  Event,
  Alert,
  Calendar,
  ProfileImage,
  PrivateCalendar,
  CalendarMember,
  EventMember,
  PrivateEvent,
} = require("../models");

const router = express.Router();
const { Op } = require("sequelize");
const authJWT = require("../utils/authJWT");

router.post("/getAllEvent", authJWT, async (req, res, next) => {
  try {
    const me = await User.findOne({ where: { id: req.myId } });
    req.body.endDate = req.body.endDate.split("-");
    req.body.endDate[2] = String(Number(req.body.endDate[2]) + 1);
    req.body.endDate = req.body.endDate.join("-");

    const privateEvents = await me.getPrivateCalendar({
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      include: [
        {
          model: PrivateEvent,
          attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          where: {
            [Op.or]: {
              startTime: {
                [Op.and]: {
                  [Op.gte]: req.body.startDate,
                  [Op.lte]: req.body.endDate,
                },
              },
              endTime: {
                [Op.and]: {
                  [Op.gte]: req.body.startDate,
                  [Op.lte]: req.body.endDate,
                },
              },
            },
          },
          separate: true,
        },
      ],
    });

    const groupCalendars = await CalendarMember.findAll({
      where: { UserId: req.myId },
    });

    var groupEvents = [];
    await Promise.all(
      groupCalendars.map(async (groupCalendar) => {
        var groupEvent = await Calendar.findAll({
          where: { id: groupCalendar.CalendarId },
          attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          include: [
            {
              model: Event,
              as: "GroupEvents",
              attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
              where: {
                [Op.and]: {
                  [Op.or]: {
                    startTime: {
                      [Op.and]: {
                        [Op.gte]: req.body.startDate,
                        [Op.lte]: req.body.endDate,
                      },
                    },
                    endTime: {
                      [Op.and]: {
                        [Op.gte]: req.body.startDate,
                        [Op.lte]: req.body.endDate,
                      },
                    },
                  },
                  permission: { [Op.lte]: groupCalendar.authority },
                },
              },
              separate: true,
            },
          ],
        });

        groupEvent.push({ authority: groupCalendar.authority });
        groupEvents.push(groupEvent);
      })
    );

    return res
      .status(200)
      .send({ privateEvents: privateEvents, groupEvents: groupEvents });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/getGroupEvent", authJWT, async (req, res, next) => {
  try {
    const events = await Event.findOne({
      where: { id: req.body.eventId },
      attributes: [
        "id",
        "name",
        "color",
        "permission",
        "busy",
        "memo",
        "startTime",
        "endTime",
        "EventHostId",
        "CalendarId",
      ],
      include: [
        {
          model: User,
          as: "EventHost",
          attributes: {
            exclude: [
              "password",
              "checkedCalendar",
              "createdAt",
              "updatedAt",
              "deletedAt",
            ],
          },
        },
        {
          model: User,
          as: "EventMembers",
          attributes: ["id", "email", "nickname"],
          include: [
            {
              model: ProfileImage,
              attributes: ["src"],
            },
          ],
        },
      ],
    });
    return res.status(200).send(events);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/getEventByDate", authJWT, async (req, res, next) => {
  try {
    const me = await User.findOne({ where: { id: req.myId } });
    var start = req.body.date;
    var end = req.body.date.split("-");
    end[2] = String(Number(end[2]) + 1);
    end = end.join("-");

    const privateEvents = await me.getPrivateCalendar({
      attributes: {
        exclude: [
          "name",
          "color",
          "UserId",
          "createdAt",
          "updatedAt",
          "deletedAt",
        ],
      },
      include: [
        {
          model: PrivateEvent,
          attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          where: {
            [Op.or]: {
              startTime: {
                [Op.and]: {
                  [Op.gte]: start,
                  [Op.lte]: end,
                },
              },
              endTime: {
                [Op.and]: {
                  [Op.gte]: start,
                  [Op.lte]: end,
                },
              },
            },
          },
          separate: true,
        },
      ],
    });

    const groupCalendars = await CalendarMember.findAll({
      where: { UserId: req.myId },
    });

    var groupEvents = [];
    await Promise.all(
      groupCalendars.map(async (groupCalendar) => {
        var groupEvent = await Calendar.findAll({
          where: { id: groupCalendar.CalendarId },
          attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          include: [
            {
              model: Event,
              as: "GroupEvents",
              attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
              where: {
                [Op.and]: {
                  [Op.or]: {
                    startTime: {
                      [Op.and]: {
                        [Op.gte]: start,
                        [Op.lte]: end,
                      },
                    },
                    endTime: {
                      [Op.and]: {
                        [Op.gte]: start,
                        [Op.lte]: end,
                      },
                    },
                  },
                  permission: { [Op.lte]: groupCalendar.authority },
                },
              },
            },
          ],
        });

        if (groupEvent.length !== 0) {
          groupEvents.push(groupEvent);
        }
      })
    );

    return res
      .status(200)
      .send({ privateEvents: privateEvents, groupEvents: groupEvents });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/createGroupEvent", authJWT, async (req, res, next) => {
  try {
    // const me = await User.findOne({
    //   where: { id: req.myId },
    // });
    const isGroupMember = await CalendarMember.findOne({
      where: {
        [Op.and]: { UserId: req.myId, CalendarId: req.body.groupCalendarId },
      },
    });

    if (!isGroupMember) {
      return res
        .status(400)
        .send({ message: "???????????? ????????? ???????????? ????????? ??? ????????????." });
    }

    await sequelize.transaction(async (t) => {
      const newGroupEvent = await Event.create(
        {
          name: req.body.eventName,
          color: req.body.color,
          priority: req.body.priority,
          memo: req.body.memo,
          startTime: req.body.startTime,
          endTime: req.body.endTime,
          allDay: req.body.allDay,
          EventHostId: req.myId,
          CalendarId: req.body.groupCalendarId,
        },
        { transaction: t }
      );

      // await EventMember.create(
      //   {
      //     state: 4,
      //     UserId: req.myId,
      //     EventId: newGroupEvent.id,
      //   },
      //   { transaction: t }
      // );

      // const privateCalendar = await me.getPrivateCalendar();
      // await privateCalendar.createPrivateEvent(
      //   {
      //     name: newGroupEvent.name,
      //     color: newGroupEvent.color,
      //     priority: newGroupEvent.priority,
      //     memo: newGroupEvent.memo,
      //     startTime: newGroupEvent.startTime,
      //     endTime: newGroupEvent.endTime,
      //     allDay: req.body.allDay,
      //     groupEventId: newGroupEvent.id,
      //     state: 4,
      //   },
      //   { transaction: t }
      // );

      return res.status(200).send(newGroupEvent);
    });
  } catch (error) {
    console.error(error);
    await t.rollback();
    next(error);
  }
});

router.post("/inviteGroupEvent", authJWT, async (req, res, next) => {
  try {
    const guest = await User.findOne({
      where: { email: req.body.guestEmail },
    });
    if (!guest) {
      return res.status(400).send({ message: "???????????? ?????? ???????????????!" });
    }

    const isGroupMember = await CalendarMember.findOne({
      where: {
        [Op.and]: { UserId: guest.id, CalendarId: req.body.groupCalendarId },
      },
    });
    if (!isGroupMember) {
      return res
        .status(400)
        .send({ message: "?????? ???????????? ???????????? ?????? ???????????????!" });
    }

    const groupEvent = await Event.findOne({
      where: { id: req.body.groupEventId },
    });

    const alreadyEventMember = await EventMember.findOne({
      where: {
        [Op.and]: { UserId: guest.id, EventId: groupEvent.id, state: 1 },
      },
    });
    if (alreadyEventMember) {
      return res
        .status(402)
        .send({ message: "?????? ?????? ???????????? ???????????????!" });
    }

    const alreadyInvite = await EventMember.findOne({
      where: {
        [Op.and]: { UserId: guest.id, EventId: groupEvent.id },
      },
    });
    if (alreadyInvite) {
      return res.status(405).send({ message: "?????? ????????? ?????? ???????????????!" });
    }

    await sequelize.transaction(async (t) => {
      const privateCalendar = await guest.getPrivateCalendar();
      await privateCalendar.createPrivateEvent(
        {
          name: groupEvent.name,
          color: groupEvent.color,
          priority: groupEvent.priority,
          memo: groupEvent.memo,
          startTime: groupEvent.startTime,
          endTime: groupEvent.endTime,
          groupEventId: groupEvent.id,
          state: 0,
        },
        { transaction: t }
      );

      await groupEvent.addEventMembers(guest, { transaction: t });

      await Alert.create(
        {
          UserId: guest.id,
          type: "event",
          eventCalendarId: req.body.groupCalendarId,
          eventDate: groupEvent.startTime,
          content: `${groupEvent.name} ???????????? ?????????????????????!`,
        },
        { transaction: t }
      );
    });

    return res.status(200).send(guest);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/changeEventInviteState", authJWT, async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const me = await User.findOne({ where: { id: req.myId } });

    const invitedEvent = await Event.findOne({
      where: { id: req.body.invitedEventId },
    });

    if (!invitedEvent) {
      await t.rollback();
      return res.status(400).send({ message: "???????????? ?????? ????????? ?????????!" });
    }
    // var nowDate = new Date();
    // if (invitedEvent.endTime < nowDate) {
    //   await t.rollback();
    //   return res.status(400).send({ message: "?????? ????????? ????????? ?????????!" });
    // }

    const changeState = await EventMember.findOne({
      where: {
        [Op.and]: {
          UserId: req.myId,
          EventId: invitedEvent.id,
        },
      },
    });

    await changeState.update(
      {
        state: req.body.state,
      },
      {
        transaction: t,
      }
    );

    const privateCalendar = await me.getPrivateCalendar();
    const copiedPrivateEvent = await PrivateEvent.findOne({
      where: {
        [Op.and]: {
          PrivateCalendarId: privateCalendar.id,
          groupEventId: req.body.invitedEventId,
        },
      },
    });
    await copiedPrivateEvent.update(
      {
        state: req.body.state,
      },
      {
        transaction: t,
      }
    );

    //?????????????????? ?????? ????????? ??????
    const members = await invitedEvent.getEventMembers();
    if (req.body.state === 1) {
      await Promise.all(
        members.map(async (member) => {
          if (member.id !== me.id) {
            await Alert.create(
              {
                UserId: member.id,
                type: "event",
                eventCalendarId: invitedEvent.CalendarId,
                eventDate: invitedEvent.startTime,
                content: `${me.nickname}?????? ${invitedEvent.name}???????????? ???????????????!`,
              },
              { transaction: t }
            );
          }
        })
      );
    } else if (req.body.state === 3) {
      await Promise.all(
        members.map(async (member) => {
          if (member.id !== me.id) {
            await Alert.create(
              {
                UserId: member.id,
                type: "event",
                eventCalendarId: invitedEvent.CalendarId,
                eventDate: invitedEvent.startTime,
                content: `${me.nickname}?????? ${invitedEvent.name}??????????????? ???????????????!!`,
              },
              { transaction: t }
            );
          }
        })
      );
    }

    await t.commit();
    return res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    await t.rollback();
    next(error);
  }
});

router.post("/editGroupEvent", authJWT, async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const me = await User.findOne({ where: { id: req.myId } });
    const groupEvent = await Event.findOne({
      where: { id: req.body.groupEventId },
    });

    if (!groupEvent) {
      await t.rollback();
      return res.status(400).send({ message: "???????????? ?????? ????????? ?????????!" });
    }

    const hasAuthority = await CalendarMember.findOne({
      where: {
        [Op.and]: { UserId: req.myId, CalendarId: req.body.groupCalendarId },
      },
    });

    if (hasAuthority.authority < 2) {
      await t.rollback();
      return res.status(400).send({ message: "?????? ????????? ????????????!" });
    }

    await groupEvent.update(
      {
        name: req.body.eventName,
        color: req.body.color,
        priority: req.body.priority,
        memo: req.body.memo,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        allDay: req.body.allDay,
      },
      { transaction: t }
    );

    const privateCalendar = await me.getPrivateCalendar();
    const changePrivateEvent = await PrivateEvent.findOne({
      where: {
        [Op.and]: {
          groupEventId: req.body.groupEventId,
          PrivateCalendarId: privateCalendar.id,
        },
      },
    });
    changePrivateEvent.update(
      {
        name: req.body.name,
        color: req.body.color,
        priority: req.body.priority,
        memo: req.body.memo,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        allDay: req.body.allDay,
      },
      { transaction: t }
    );

    const members = await groupEvent.getEventMembers();
    await Promise.all(
      members.map(async (member) => {
        if (member.id !== req.myId) {
          await Alert.create(
            {
              UserId: member.id,
              type: "event",
              eventCalendarId: groupEvent.CalendarId,
              eventDate: groupEvent.startTime,
              content: `${groupEvent.name} ???????????? ??????????????????!`,
            },
            { transaction: t }
          );
        }
      })
    );

    await t.commit();
    return res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    await t.rollback();
    next(error);
  }
});

router.post("/deleteGroupEvent", authJWT, async (req, res, next) => {
  try {
    const me = await User.findOne({ where: { id: req.myId } });
    const groupEvent = await Event.findOne({
      where: { id: req.body.groupEventId },
    });

    if (!groupEvent) {
      await t.rollback();
      return res.status(400).send({ message: "???????????? ?????? ????????? ?????????!" });
    }

    const hasAuthority = await CalendarMember.findOne({
      where: {
        [Op.and]: { UserId: req.myId, CalendarId: req.body.groupCalendarId },
      },
    });

    if (hasAuthority.authority < 2) {
      await t.rollback();
      return res.status(400).send({ message: "?????? ????????? ????????????!" });
    }

    await sequelize.transaction(async (t) => {
      const gruopEventName = groupEvent.name;

      await Event.destroy({
        where: { id: req.body.groupEventId },
        force: true,
        transaction: t,
      });

      const privateCalendar = await me.getPrivateCalendar();
      await PrivateEvent.destroy({
        where: {
          [Op.and]: {
            groupEventId: req.body.groupEventId,
            PrivateCalendarId: privateCalendar.id,
          },
        },
        force: true,
        transaction: t,
      });

      const members = await groupEvent.getEventMembers();
      await Promise.all(
        members.map(async (member) => {
          if (member.id !== req.myId) {
            await Alert.create(
              {
                UserId: member.id,
                type: "eventRemoved",
                content: `${gruopEventName} ???????????? ??????????????????!`,
              },
              { transaction: t }
            );
          }
        })
      );
    });

    return res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/searchEvent", authJWT, async (req, res, next) => {
  try {
    const searchWord = req.body.searchWord;

    const me = await User.findOne({ where: { id: req.myId } });

    const searchEvents = await me.getGroupEvents({
      where: { name: { [Op.like]: "%" + searchWord + "%" } },
      attributes: {
        exclude: [
          "color",
          "priority",
          "memo",
          "createdAt",
          "updatedAt",
          "deletedAt",
          "EventHostId",
        ],
      },
      joinTableAttributes: [],
      separate: true,
    });

    return res.status(200).send(searchEvents);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// ????????? ????????? ??? ??? ?????? ????????? ????????????,,

// ?????? ????????? hooks??? ?????? ????????? ???????????? ??????. ?

// db??? ?????? ???????????? ????????? ???????????? ??????????????? ??? ????????? ?????? ????????? ?????????????

//,,????????? ???????????? ???????????? ????????? ?????????????

// db??? cron table??? ??????????????? -> ?????? ????????? ????????????. event userId column??? ?????? ?????? ????????????

// ????????? ? -> ?????? ?????? ?????? ?????? ?????????

// ?????? ? -> ?????? ??????

router.post("/test2", async (req, res, next) => {
  try {
    new CronJob(
      "* * * * * *",
      async function () {
        await Alert.create({
          UserId: 1,
          type: "eventAlarm",
          content: req.body.testCode,
        });
      },
      null,
      true
    );

    return res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
