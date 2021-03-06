import React from 'react';
import PropTypes from 'prop-types';
import CreateEventModal from '../../component/CreateEventModal';
import { CreateEventModalContext } from '../../../context/EventModalContext';
import useEventModal from '../../../hooks/useEventModal';

const Index = ({ children }) => {
  const { isModalShown, modalData, setModalData, showModal, hideModal } =
    useEventModal();
  const modalContextData = { isModalShown, setModalData, showModal, hideModal };
  return (
    <>
      {isModalShown && (
        <CreateEventModal hideModal={hideModal} style={modalData.style} />
      )}
      <CreateEventModalContext.Provider value={modalContextData}>
        {children}
      </CreateEventModalContext.Provider>
    </>
  );
};

Index.propTypes = {
  children: PropTypes.node,
};
export default Index;
