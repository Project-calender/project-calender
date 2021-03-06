import React from 'react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './style.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; //폰트어썸
import {
  faSearch,
  faCog,
  faQuestionCircle,
  faCaretDown,
  faList,
  faCheck,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons'; //폰트어썸
import Tooltip from './../../common/Tooltip';
import { useEffect } from 'react';
import { useRef } from 'react';
import { CALENDAR_PATH } from '../../../constants/path';
import axios from '../../../utils/token';
import { USER_URL } from '../../../constants/api';
//import Axios from 'axios';

const Index = ({
  activeClass,
  setActiveClass,
  dateActive,
  setDateActive,
  userClassAdd,
  setUserClassAdd,
  userActive,
  setUserActive,
}) => {
  let navigate = useNavigate();
  let [changeDate, setChangeDate] = useState(`일`);
  const userProfile = useRef();
  const dateList = useRef();
  let userInfo = localStorage.getItem('userInfo');
  userInfo = JSON.parse(userInfo);
  let change = useLocation(); //url 주소 가지고 오기
  let userImg = localStorage.getItem('userImg'); //사용자 프로필 이미지 가지고 오기
  userImg = userImg.replace(/"/g, ''); //프로필 이미지 "" 제거

  //url 변경에 따른 changeDate 변경
  useEffect(() => {
    if (change.pathname == '/day') {
      setChangeDate('일');
    } else if (change.pathname == '/week') {
      setChangeDate('주');
    } else if (change.pathname == '/month') {
      setChangeDate('월');
    } else if (change.pathname == '/year') {
      setChangeDate('연도');
    } else if (change.pathname == '/agenda') {
      setChangeDate('일정');
    } else if (change.pathname == '/customday') {
      setChangeDate('4일');
    }
  }, [change]);

  //일,주,연 버튼 팝업창 컨트롤
  function dateChange() {
    if (dateActive == false) {
      setDateActive(true);
      setActiveClass(`${styles.active}`);
    } else {
      setDateActive(false);
      setActiveClass(``);
    }
  }

  //사용자 정보 팝업창 컨트롤
  function userPopUp() {
    if (userActive == false) {
      setUserActive(true);
      setUserClassAdd(`${styles.active}`);
    } else {
      setUserActive(false);
      setUserClassAdd(``);
    }
  }

  function onDateChange(e) {
    setDateActive(false);
    setActiveClass(``);
    e.target.children[0]
      ? setChangeDate(e.target.children[0].textContent)
      : null;
  }

  useEffect(() => {
    document.addEventListener('mousedown', clickModalOutside);

    return () => {
      document.removeEventListener('mousedown', clickModalOutside);
    };
  });

  //팝업창 외부 클릭시 창 닫기
  function clickModalOutside(event) {
    if (!userProfile.current.contains(event.target)) {
      setUserActive(false);
      setUserClassAdd(``);
    }
    if (!dateList.current.contains(event.target)) {
      setDateActive(false);
      setActiveClass(``);
    }
  }

  //로그아웃
  function logout() {
    let accessToken = sessionStorage.getItem('accessToken');
    axios
      .post(`${USER_URL.LOGOUT}`, {
        Authorization: accessToken,
      })
      .then(res => {
        console.log('로그아웃 성공', res);
        localStorage.clear();
        sessionStorage.clear();
        navigate(`${USER_URL.LOGIN}`);
      })
      .catch(error => {
        console.log('로그아웃 실패', error);
      });
  }

  //수정2
  function test() {
    axios
      .post(`/calendar/createGroupCalendar`, {
        calendarName: 'ohaas12213',
        calendarColor: 'redasd123',
      })
      .then(res => {
        console.log('테스트 성공', res);
      })
      .catch(error => {
        console.log('테스트 실패', error);
      });
  }

  return (
    <div>
      <div className={styles.right_menu}>
        <div className={styles.menu_icon}>
          <ul>
            <li>
              <FontAwesomeIcon icon={faSearch} className={styles.icon} />
              <em>검색</em>
            </li>
            <li>
              <FontAwesomeIcon
                icon={faQuestionCircle}
                className={styles.icon}
              />
              <em>지원</em>
            </li>
            <li>
              <FontAwesomeIcon icon={faCog} className={styles.icon} />
              <em>설정메뉴</em>
            </li>
          </ul>
        </div>
        <div className={`${styles.date_list} ${activeClass}`} ref={dateList}>
          <div
            className={styles.date_btt}
            onClick={() => {
              dateChange();
            }}
          >
            <strong>{changeDate}</strong>
            <FontAwesomeIcon icon={faCaretDown} className={styles.icon} />
          </div>
          <div className={styles.option_list}>
            <ul>
              <li
                onClick={e => {
                  navigate(CALENDAR_PATH.DAY);
                  onDateChange(e);
                }}
              >
                <strong>일</strong>
                <em>D</em>
              </li>
              <li
                onClick={e => {
                  navigate(`${CALENDAR_PATH.WEEK}`);
                  onDateChange(e);
                }}
              >
                <strong>주</strong>
                <em>W</em>
              </li>
              <li
                onClick={e => {
                  navigate(CALENDAR_PATH.MONTH);
                  onDateChange(e);
                }}
              >
                <strong>월</strong>
                <em>M</em>
              </li>
              <li
                onClick={e => {
                  navigate(CALENDAR_PATH.YEAR);
                  onDateChange(e);
                }}
              >
                <strong>연도</strong>
                <em>Y</em>
              </li>
              <li
                onClick={e => {
                  navigate(CALENDAR_PATH.AGENDA);
                  onDateChange(e);
                }}
              >
                <strong>일정</strong>
                <em>A</em>
              </li>
              <li
                onClick={e => {
                  navigate(CALENDAR_PATH.CUSTOMDAY);
                  onDateChange(e);
                }}
              >
                <strong>4일</strong>
                <em>X</em>
              </li>
            </ul>
            <span className={styles.line}></span>
            <div className={styles.option_check}>
              <ul>
                <li>
                  <FontAwesomeIcon icon={faCheck} className={styles.icon} />
                  <em>주말 표시</em>
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className={styles.icon} />
                  <em>거절한 일정 표시</em>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.more}>
          <Tooltip title="Google 앱">
            <FontAwesomeIcon icon={faList} className={styles.icon} />
          </Tooltip>
        </div>
        <div className={`${styles.user} ${userClassAdd}`} ref={userProfile}>
          <div
            onClick={e => {
              e.stopPropagation();
              userPopUp();
            }}
          >
            <Tooltip title="Google 계정">
              <img src={userImg} alt="" />
            </Tooltip>
          </div>
          <div className={styles.user_inpo}>
            <div className={styles.user_profile}>
              <div className={styles.user_img}>
                <img src={userImg} alt="" />
              </div>
              <h2>{userInfo?.nickname}</h2>
              <em>{userInfo?.email}</em>
              <button>
                <strong
                  onClick={e => {
                    e.stopPropagation();
                    test();
                  }}
                >
                  Google
                </strong>{' '}
                계정 관리
              </button>
            </div>
            <div className={styles.account}>
              <ul>
                <li>
                  <div className={styles.account_img}>
                    <img
                      src={`${process.env.PUBLIC_URL}/img/join/profile.png`}
                      alt=""
                    />
                  </div>
                  <div className={styles.account_text}>
                    <p>userName</p>
                    <p>userEmail@gmail.com</p>
                  </div>
                </li>
              </ul>
              <div className={styles.user_add}>
                <FontAwesomeIcon icon={faUserPlus} className={styles.icon} />
                <p>다른계정 추가</p>
              </div>
            </div>
            <div className={styles.all_logout}>
              <button
                onClick={() => {
                  logout();
                }}
              >
                모든 계정에서 로그아웃
              </button>
            </div>
            <div className={styles.service}>
              <ul>
                <li>
                  <em>개인정보처리방침</em>
                </li>
                <li>
                  <em>•</em>
                </li>
                <li>
                  <em>서비스 약관</em>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
Index.propTypes = {
  activeClass: PropTypes.string,
  setActiveClass: PropTypes.func,
  dateActive: PropTypes.bool,
  setDateActive: PropTypes.func,
  userClassAdd: PropTypes.string,
  setUserClassAdd: PropTypes.func,
  userActive: PropTypes.bool,
  setUserActive: PropTypes.func,
};

export default Index;
