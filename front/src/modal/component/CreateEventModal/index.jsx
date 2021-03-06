import React, { useContext } from 'react';
import styles from './style.module.css';
import PropTypes from 'prop-types';
import Modal from '../../../components/common/Modal';
import { EventBarContext } from '../../../context/EventBarContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBarsStaggered,
  faBell,
  faBriefcase,
  faCalendarDay,
  faCaretDown,
  faCircleQuestion,
  faClock,
  faGripLines,
  faLocationDot,
  faLock,
  faPaperclip,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons';

import axios from '../../../utils/token';
import Input from '../../../components/common/Input';
import CheckBox from '../../../components/common/CheckBox';

import Moment from '../../../utils/moment';
import useEventModal from '../../../hooks/useEventModal';
import ListModal from '../ListModal';
import EventColorListModal from '../EventColorListModal';

import { useSelector } from 'react-redux';
import { selectAllCalendar } from '../../../store/selectors/calendars';

const Index = ({ hideModal, style }) => {
  const { selectedDateRange, setNewEventBars } = useContext(EventBarContext);
  const { standardDateTime, endDateTime } = selectedDateRange;
  const [startDate, endDate] = [standardDateTime, endDateTime]
    .sort((a, b) => a - b)
    .map(time => new Moment(time));

  const {
    isModalShown: isListModalShown,
    modalData: listModalData,
    showModal: showListModal,
    hideModal: hideListModal,
  } = useEventModal();

  const {
    isModalShown: isColorListModalShown,
    modalData: colorListModalData,
    showModal: showColorListModal,
    hideModal: hideColorListModal,
  } = useEventModal();

  const calendars = useSelector(selectAllCalendar);

  function handleCreateEventModal() {
    setNewEventBars([]);
    hideModal();
  }

  function handleSubModal(e, showSubModal, data) {
    const { top, left } = e.currentTarget.getBoundingClientRect();
    hideListModal();
    hideColorListModal();
    setTimeout(
      () =>
        showSubModal({
          data,
          position: { top, left },
        }),
      10,
    );
    e.stopPropagation();
  }

  return (
    <>
      <Modal
        hideModal={handleCreateEventModal}
        isCloseButtom={true}
        isBackground={true}
        style={{
          ...style,
          boxShadow: '2px 10px 24px 10px rgb(0, 0, 0, 0.25)',
        }}
      >
        {isListModalShown && (
          <ListModal hideModal={hideListModal} modalData={listModalData} />
        )}
        {isColorListModalShown && (
          <EventColorListModal
            hideModal={hideColorListModal}
            modalData={colorListModalData}
          />
        )}
        <div className={styles.modal_container}>
          <div className={styles.modal_header}>
            <FontAwesomeIcon icon={faGripLines} />
          </div>
          <div className={styles.modal_context}>
            <div>
              <div />
              <Input
                type="text"
                placeholder="?????? ??? ?????? ??????"
                className={styles.event_title}
                inputClassName={styles.event_title_input}
                onBlur={e => {
                  setNewEventBars(bars =>
                    bars.map(bar => ({ ...bar, name: e.target.value })),
                  );
                }}
              />
            </div>

            <div>
              <div />
              <div className={styles.modal_context_category}>
                <button className={styles.category_active}>?????????</button>
                <button>??? ???</button>
              </div>
            </div>

            <div>
              <FontAwesomeIcon icon={faClock} />
              <div className={styles.time_title}>
                <h3>
                  {startDate.month}??? {startDate.date}??? ({startDate.weekDay}
                  ??????)
                </h3>
                <h3>-</h3>
                <h3>
                  {endDate.month}??? {endDate.date}??? ({endDate.weekDay}??????)
                </h3>
                {/* <h5>?????? ??????</h5> */}
              </div>
              {/* <button className={styles.time_add_button}>?????? ??????</button> */}
            </div>

            <div>
              <div />
              <div>
                <CheckBox onClick={() => {}}>
                  <h3>??????</h3>
                </CheckBox>
              </div>
            </div>

            <div>
              <div />
              <div>
                <h3
                  className={styles.list_modal}
                  onClick={e =>
                    handleSubModal(e, showListModal, [
                      '?????? ??????',
                      '??????',
                      `?????? ${startDate.weekDay}??????`,
                      `?????? ????????? ${startDate.weekDay}??????`,
                      `?????? ${startDate.month}??? ${startDate.date}???`,
                      '?????? ??????(???-???)',
                      '??????...',
                    ])
                  }
                >
                  ?????? ??????
                  <FontAwesomeIcon
                    className={styles.caret_down}
                    icon={faCaretDown}
                  />
                </h3>
              </div>
            </div>

            <div className={styles.time_find}>
              <div />
              <button className={styles.time_find_button}>?????? ??????</button>
            </div>

            <div>
              <FontAwesomeIcon icon={faUserGroup} />
              <Input
                type="text"
                placeholder="????????? ??????"
                className={styles.event_data}
                inputClassName={styles.event_data_input}
              />
            </div>

            <div className={styles.google_meet}>
              <img
                className={styles.google_meet_img}
                src={`${process.env.PUBLIC_URL}/img/google_meet_icon.png`}
                alt="?????? ??????"
              />
              <button>
                <b>Google Meet</b> ?????? ?????? ??????
              </button>
            </div>

            <div className={styles.modal_line} />
            <div>
              <FontAwesomeIcon icon={faLocationDot} />
              <Input
                type="text"
                placeholder="?????? ??????"
                className={styles.event_data}
                inputClassName={styles.event_data_input}
              />
            </div>

            <div className={styles.modal_line} />
            <div>
              <FontAwesomeIcon icon={faBarsStaggered} />
              <Input
                type="text"
                placeholder="?????? ??????"
                className={styles.memo}
                inputClassName={styles.memo_input}
              />
            </div>
            <div>
              <FontAwesomeIcon
                icon={faPaperclip}
                className={styles.clip_icon}
              />
              <h4>???????????? ??????</h4>
            </div>

            <div className={styles.modal_line} />
            <div>
              <FontAwesomeIcon icon={faCalendarDay} />
              <div className={styles.calendar_info}>
                <h3
                  className={styles.list_modal}
                  onClick={e =>
                    handleSubModal(
                      e,
                      showListModal,
                      calendars.map(calendar => calendar.name),
                    )
                  }
                >
                  ??? ?????????
                  <FontAwesomeIcon
                    className={styles.caret_down}
                    icon={faCaretDown}
                  />
                </h3>
                <div
                  className={`${styles.list_modal} ${styles.calendar_info}`}
                  id="event_color"
                  onClick={e => handleSubModal(e, showColorListModal)}
                >
                  <div className={styles.calendar_info_colors} />
                  <FontAwesomeIcon
                    className={styles.caret_down}
                    icon={faCaretDown}
                  />
                </div>
              </div>
            </div>

            <div>
              <FontAwesomeIcon icon={faBriefcase} />

              <div
                onClick={e =>
                  handleSubModal(e, showListModal, ['??????', '?????????'])
                }
              >
                <h3 className={styles.list_modal}>
                  ?????????
                  <FontAwesomeIcon
                    className={styles.caret_down}
                    icon={faCaretDown}
                  />
                </h3>
              </div>
            </div>

            <div>
              <FontAwesomeIcon icon={faLock} />
              <div className={styles.calendar_info}>
                <h3
                  className={styles.list_modal}
                  onClick={e =>
                    handleSubModal(e, showListModal, [
                      '?????? ?????? ??????',
                      '?????? ??????',
                      '?????????',
                    ])
                  }
                >
                  ?????? ?????? ??????
                  <FontAwesomeIcon
                    className={styles.caret_down}
                    icon={faCaretDown}
                  />
                </h3>
                <FontAwesomeIcon icon={faCircleQuestion} />
              </div>
            </div>
            <div>
              <FontAwesomeIcon icon={faBell} />
              <div>
                <h4 className={styles.list_modal}>?????? ??????</h4>
              </div>
            </div>
          </div>
          <div className={styles.modal_line} />
          <div className={styles.modal_footer}>
            <button>?????? ?????????</button>
            <button
              onClick={() => {
                axios
                  .post('event/createGroupEvent', {
                    groupCalendarId: 1,
                    eventName: '?????????2',
                    color: '#ff602b',
                    priority: 1,
                    memo: '???????????????.',
                    startTime: '2022-08-01T00:00:00',
                    endTime: '2022-08-02T00:00:00',
                    allDay: true,
                  })
                  .then(res => console.log(res))
                  .catch(e => console.log(e));
              }}
            >
              ??????
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

Index.propTypes = {
  hideModal: PropTypes.func,
  style: PropTypes.object,
};

export default Index;
