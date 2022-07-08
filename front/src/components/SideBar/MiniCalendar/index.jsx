import React from 'react';
import styles from './style.module.css';

import CalendarHeader from './CalendarHeader';
import CalendarBody from './CalendarBody';
import { useSelector } from 'react-redux';
import { selectedDateSelector } from '../../../store/selectors/date';

const Index = () => {
  const { year, month } = useSelector(selectedDateSelector);

  return (
    <div className={styles.calendar_wrap}>
      <CalendarHeader />
      <CalendarBody year={year} month={month} />
    </div>
  );
};

export default Index;
