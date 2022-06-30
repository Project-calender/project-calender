"use strict";
const { faker } = require("@faker-js/faker");
module.exports = {
  async up(queryInterface, Sequelize) {
    for (var i = 0; i < 100; i++) {
      var dummyPrivateEvent = [];
      for (var j = 0; j < 10; j++) {
        var startTime = faker.date.between(
          "2022-06-01T00:00:00.000Z",
          "2022-07-30T00:00:00.000Z"
        );
        var privateEvent = {
          name: faker.word.adjective(),
          color: faker.color.rgb(),
          priority: parseInt(faker.random.numeric(), 10),
          memo: faker.lorem.lines(),
          startTime: startTime,
          endTime: startTime,
          createdAt: new Date(),
          updatedAt: new Date(),
          UserId: i + 1,
        };

        dummyPrivateEvent.push(privateEvent);
      }

      await queryInterface.bulkInsert("privateEvents", dummyPrivateEvent);
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
