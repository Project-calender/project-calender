const express = require("express");

const { sequelize } = require("../models");
const { Alert } = require("../models");
const router = express.Router();
const authJWT = require("../utils/authJWT");

router.get("/getAlerts", authJWT, async (req, res, next) => {
  try {
    const alerts = await Alert.findAll({
      where: { UserId: req.myId },
      attributes: [
        "type",
        "content",
        "checked",
        "eventCalendarId",
        "eventDate",
      ],
    });

    return res.status(200).send(alerts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/read", authJWT, async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const alert = await Alert.find({
      where: { id: req.body.alertId },
    });

    await alert.update(
      {
        checked: true,
      },
      { transaction: t }
    );

    await t.commit();
    return res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    await t.rollback();
    next(error);
  }
});
``;
module.exports = router;