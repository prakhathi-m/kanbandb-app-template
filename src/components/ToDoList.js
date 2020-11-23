import React from "react";
import KanbanDB from "kanbandb/dist/KanbanDB";
import Popup from "./Popup";
import ToDoForm from "./ToDoForm";

const STATUS = {
  TODO: "TODO",
  DOING: "DOING",
  DONE: "DONE",
};

const LIST = [
  {
    name: "Test",
    description: "Write tests for TextField",
    status: STATUS.TODO,
  },
  { name: "Feat", description: "New TextPoll component", status: STATUS.DOING },
];

class ToDoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todo: [],
      doing: [],
      done: [],
      kanbandb: KanbanDB.connect(), // Initialize DB communications.
      openPopup: false,
      selectedCard: {},
    };
  }

  initialize() {
    // Add default cards initially
    LIST.forEach(({ name, description, status }) => {
      this.state.kanbandb.then((db) => {
        this.addCard(name, description, status);
      });
    });
  }

  componentDidMount() {
    this.initialize();
  }

  handleError(err) {
    if (err.message === "No data found.") {
      this.setState({ todo: [], doing: [], done: [] });
    }
    console.error("error", err.message);
  }

  togglePopupstatus = () => {
    this.setState({ openPopup: !this.state.openPopup });
  };

  getCardDetails = (db) => {
    // Get the cards from db and set it to the corresponding state value.
    db.getCards()
      .then((cards) => {
        console.log("all cards from DB", cards);
        const todo = [],
          doing = [],
          done = [];
        cards.forEach((card) => {
          const { status } = card;
          if (status === STATUS.TODO) {
            todo.push(card);
          } else if (status === STATUS.DOING) {
            doing.push(card);
          } else {
            done.push(card);
          }
        });
        this.setState({ todo, doing, done });
      })
      .catch((err) => this.handleError(err));
  };

  allowDrop = (ev) => {
    ev.preventDefault();
  };

  drag = (ev) => {
    ev.dataTransfer.setData("text", ev.target.id);
  };

  drop = (ev) => {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const status = ev.target.id;

    this.state.kanbandb.then((db) => {
      this.updateCardDetails(db, data, status);
    });
  };

  updateCardDetails = (db, id, status) => {
    db.updateCardById(id, { status })
      .then((success) => {
        if (success) {
          this.getCardDetails(db);
        }
      })
      .catch((err) => this.handleError(err));
  };

  editCard = ({ id, status, name, description }) => {
    this.state.kanbandb.then((db) => {
      db.updateCardById(id, { status, name, description })
        .then((success) => {
          if (success) {
            this.getCardDetails(db);
          }
        })
        .catch((err) => this.handleError(err));
    });
  };

  addCard = (name, desc, status) => {
    this.state.kanbandb.then((db) => {
      db.addCard({
        name,
        description: desc,
        status,
      })
        .then((cardId) => {
          console.log("card added with ID " + cardId);
          this.getCardDetails(db);
        })
        .catch((err) => this.handleError(err));
    });
  };

  deleteCard = (id) => {
    this.state.kanbandb.then((db) => {
      db.deleteCardById(id)
        .then((cardId) => {
          console.log("card added with ID " + cardId);
          this.getCardDetails(db);
        })
        .catch((err) => this.handleError(err));
    });
  };

  handleSubmit = ({ status, name, description }) => {
    if (status && name && description) {
      this.addCard(name, description, status);
    }
  };

  renderCards(list) {
    return list.length > 0 && list.map((card) => this.renderCardDetails(card));
  }

  renderCardDetails(card) {
    const { id, status, name, description } = card;

    return (
      <div
        key={id}
        className="card"
        draggable
        onDragStart={this.drag}
        id={id}
        data-status={status}
      >
        {name}: {description}
        <div>
          <button
            className="edit-btn"
            onClick={() => {
              this.setState({ selectedCard: card, openPopup: true });
            }}
          >
            /
          </button>
          <button className="delete-btn" onClick={() => this.deleteCard(id)}>
            X
          </button>
        </div>
      </div>
    );
  }

  renderSection(label, id, value) {
    return (
      <section>
        <h2>{label}</h2>
        <div
          id={id}
          className="container"
          onDrop={this.drop}
          onDragOver={this.allowDrop}
        >
          {this.renderCards(value)}
        </div>
      </section>
    );
  }

  render() {
    const { todo, doing, done, openPopup, selectedCard } = this.state;
    return (
      <React.Fragment>
        <section className="row">
          {this.renderSection("To-do", STATUS.TODO, todo)}
          {this.renderSection("In Progress", STATUS.DOING, doing)}
          {this.renderSection("Done", STATUS.DONE, done)}
        </section>

        <ToDoForm onSave={this.handleSubmit} label="Add New" />
        {openPopup && (
          <Popup
            card={selectedCard}
            togglePopupstatus={this.togglePopupstatus}
            editCard={this.editCard}
          />
        )}
      </React.Fragment>
    );
  }
}

export { ToDoList, STATUS };
