import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { EVENT_URL } from '../../../constants/api';
import { EventDetailModalContext } from '../../../context/EventModalContext';
import axios from '../../../utils/token';
import styles from './style.module.css';

const Index = ({
  event,
  calendarColor,
  eventBar,
  left = false,
  right = false,
  outerRight = false,
  handleEventDetailMadal = () => {},
}) => {
  // const event = useSelector(state => eventSelector(state, eventBar?.id));
  // const calendar = useSelector(state =>
  //   calendarByEventIdSelector(state, event),
  // );

  const { setModalData: setEventDetailModalData } = useContext(
    EventDetailModalContext,
  );

  const eventBarStyle = {
    container: {
      width: `calc(100% * ${eventBar?.scale} + ${eventBar?.scale}px - 5px)`,
    },
    main: {
      background: `linear-gradient(to right, ${calendarColor} 5px, ${
        event?.color || calendarColor
      } 5px)`,
    },
    left: { borderRightColor: calendarColor },
    right: { borderLeftColor: event?.color },
  };

  async function clickEventBar(e) {
    const { offsetTop = 0, offsetLeft = 0 } = handleEventDetailMadal(e);
    const { top, left } = e.currentTarget.getBoundingClientRect();

    const { data } = await axios.post(EVENT_URL.GET_EVENT_DETAIL, {
      eventId: event.PrivateCalendarId ? event.groupEventId : event.id,
    });
    const { EventMembers, EventHost } = data;
    setEventDetailModalData(data => ({
      ...data,
      event: { ...event, EventMembers, EventHost },
      style: {
        position: {
          top: top + offsetTop,
          left: left + offsetLeft,
        },
      },
    }));
  }

  if (!eventBar || !eventBar.scale) {
    return <div className={styles.empty_event_bar} />;
  }

  return (
    <div
      className={styles.event_container}
      style={eventBarStyle.container}
      onClick={clickEventBar}
    >
      {left && <div className={styles.event_left} style={eventBarStyle.left} />}

      <div className={styles.event_bar} style={eventBarStyle.main}>
        <em>{event?.name || eventBar.name || '(?????? ??????)'}</em>
      </div>

      {right && (
        <div
          className={`${styles.event_right} ${
            outerRight ? styles.event_right_outer : null
          }`}
          style={eventBarStyle.right}
        />
      )}
    </div>
  );
};

Index.propTypes = {
  event: PropTypes.object,
  calendarColor: PropTypes.string,
  eventBar: PropTypes.object,
  left: PropTypes.bool,
  right: PropTypes.bool,
  outerRight: PropTypes.bool,
  handleEventDetailMadal: PropTypes.func,
};

export default Index;
