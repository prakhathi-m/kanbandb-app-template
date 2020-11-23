import React from "react";
import PropTypes from "prop-types";
import ToDoForm from "./ToDoForm";

const Popup = ({ card, togglePopupstatus, editCard }) => {
  return (
    <div className="popup">
      <div className="close-btn" onClick={togglePopupstatus}>
        X
      </div>
      <ToDoForm
        card={card}
        onSave={(args) => {
          editCard(args);
          togglePopupstatus();
        }}
        label="Save Edits"
      />
    </div>
  );
};

export default Popup;

Popup.propTypes = {
  card: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  togglePopupstatus: PropTypes.func,
  editCard: PropTypes.func,
};

Popup.defaultProps = {
  togglePopupstatus: {},
  editCard: {},
};
