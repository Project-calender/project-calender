import React from 'react';
import styles from './style.module.css';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { selectedDateSelector } from '../../../../../../store/selectors/date';
import { selectDate } from '../../../../../../store/date';
import Moment from '../../../../../../utils/moment';
import useNavigateDayCalendar from '../../../../../../hooks/useNavigateDayCalendar';
// import { fetchEvents } from '../../../../../../store/thunk';
// import { useContext } from 'react';
// import { EventListModalContext } from '../../../../../../context/EventListModalContext';

const Index = ({ week, month }) => {
  const dispatch = useDispatch();
  const selectedDate = useSelector(selectedDateSelector);

  const { moveDayCalendar } = useNavigateDayCalendar();
  // const showModal = useContext(EventListModalContext);

  function handleDate(date) {
    dispatch(selectDate(date));
    // dispatch(fetchCalendarsAndEvents(selectedDate.time, selectedDate.time));

    // fetchEvents().t;
    // showModal({
    //   date,
    //   events: events.map(event => ({ ...event, scale: 1 })),
    //   position: {
    //     top: top - 35,
    //     left: minLeft < left ? minLeft : left,
    //   },
    // });
  }
  return (
    <tr className={styles.calendar_tr}>
      {week.map((date, index) => (
        <td
          key={index}
          className={`${initDateClassName(date, month, selectedDate)}`}
          onClick={() => handleDate(date)}
          onDoubleClick={() => moveDayCalendar(date)}
        >
          <em>{date.date}</em>
        </td>
      ))}
    </tr>
  );
};

function initDateClassName(date, month, selectedDate) {
  let className = '';
  if (isOtherMonth(date, month)) className = styles.date_blur;
  else if (isSameDate(date, new Moment())) className = styles.date_today;
  else if (isSameDate(date, selectedDate)) className = styles.date_select;

  return className;
}

function isSameDate(date, otherDate) {
  return date.time === otherDate.time;
}

function isOtherMonth(date, month) {
  return date.month !== month;
}

Index.propTypes = {
  week: PropTypes.array,
  month: PropTypes.number,
};

export default Index;
