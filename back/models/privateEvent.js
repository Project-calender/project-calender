const DataTypes = require("sequelize");
const { Model } = DataTypes;

module.exports = class PrivateEvent extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING(30),
          allowNull: false,
          unique: true,
        },
        color: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        priority: {
          type: DataTypes.INTEGER,
        },
        memo: {
          type: DataTypes.TEXT,
        },
        startTime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        endTime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        modelName: "PrivateEvent",
        tableName: "PrivateEvents",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
        sequelize,
      }
    );
  }
  static associate(db) {
    db.PrivateEvent.belongsTo(db.User, {
      onDelete: 'CASCADE'
    });
    // db.PrivateEvent.belongsTo(db.PrivateCalendar);
  }
};
