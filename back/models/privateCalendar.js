const DataTypes = require("sequelize");
const { Model } = DataTypes;

module.exports = class PrivateCalendar extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING(30),
          allowNull: false,
        },
      },
      {
        modelName: "PrivateCalendar",
        tableName: "PrivateCalendars",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
        sequelize,
      }
    );
  }
  static associate(db) {
    db.PrivateCalendar.belongsTo(db.User);
    // db.PrivateCalendar.hasMany(db.PrivateEvent, { as: "MyEvent" });
  }
};
