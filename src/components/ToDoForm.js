import React, { useState } from "react";
import PropTypes from "prop-types";
import { STATUS } from "./ToDoList";

const ToDoForm = ({ card, onSave, label }) => {
  const [name, setName] = useState(card.name);
  const [description, setDesc] = useState(card.description);
  const [status, setStatus] = useState(card.status);
  return (
    <form
      className="input-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ id: card.id, status, name, description });
        setName("");
        setDesc("");
        setStatus(STATUS.TODO);
      }}
    >
      <input
        type="text"
        placeholder="Task name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      ></input>
      <input
        type="text"
        placeholder="Task Description"
        value={description}
        onChange={(e) => setDesc(e.target.value)}
        required
      ></input>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value={STATUS.TODO}>To-do</option>
        <option value={STATUS.DOING}>In-progress</option>
        <option value={STATUS.DONE}>Done</option>
      </select>
      <input type="submit" className="button" value={label} />
    </form>
  );
};

export default ToDoForm;

ToDoForm.propTypes = {
  card: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  label: PropTypes.string,
};

ToDoForm.defaultProps = {
  card: {
    name: "",
    description: "",
    status: "TODO",
  },
  label: "Save",
};
