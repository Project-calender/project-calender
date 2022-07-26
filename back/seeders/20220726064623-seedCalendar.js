"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    var dummyCalendars = [];
    var dummyCalendarOwner = [];

    for (var i = 0; i < 5; i++) {
      var calendar = {
        id: i + 1,
        name: `calendar no.${i + 1}`,
        color: "#" + Math.round(Math.random() * 0xffffff).toString(16),
        createdAt: new Date(),
        updatedAt: new Date(),
        OwnerId: 1,
      };
      dummyCalendars.push(calendar);

      var Owner = {
        authority: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        UserId: 1,
        CalendarId: i + 1,
      };
      dummyCalendarOwner.push(Owner);
    }

    await queryInterface.bulkInsert("calendars", dummyCalendars);

    await queryInterface.bulkInsert("calendarMembers", dummyCalendarOwner);
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
