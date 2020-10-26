import React from "react";
import "./App.css";
import KanbanDB from "kanbandb/dist/KanbanDB";

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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todo: [],
      doing: [],
      done: [],
      kanbandb: KanbanDB.connect(), // Initialize DB communications.
      name: "",
      desc: "",
      status: STATUS.TODO,
    };
    this.getCardDetails = this.getCardDetails.bind(this);
    this.updateCardDetails = this.updateCardDetails.bind(this);
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

  getCardDetails(db) {
    // Get the cards from db and set it to the corresponding state value.
    db.getCards()
      .then((cards) => {
        console.log("all cards from DB", cards);
        const todo = [],
          doing = [],
          done = [];
        cards.forEach((card) => {
          const { status } = card;
          if (status.toLowerCase() === "todo") {
            todo.push(card);
          } else if (status.toLowerCase() === "doing") {
            doing.push(card);
          } else {
            done.push(card);
          }
        });
        this.setState({ todo, doing, done });
      })
      .catch((err) => this.handleError(err));
  }

  renderCardDetails({ id, status, name, description }) {
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
        <button className="delete-btn" onClick={() => this.deleteCard(id)}>
          X
        </button>
      </div>
    );
  }

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
      db.deleteCardById(id).then((cardId) => {
        console.log("card added with ID " + cardId);
        this.getCardDetails(db);
      });
    });
  };

  renderCards(list) {
    return list.length > 0 && list.map((card) => this.renderCardDetails(card));
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { status, name, desc } = this.state;
    if (status && name && desc) {
      console.log("submitted", status, name, desc);
      this.addCard(name, desc, status);
      this.setState({ name: "", desc: "", status: STATUS.TODO });
    }
  };

  handleChange(key, value) {
    this.setState({ [key]: value });
  }

  render() {
    const { todo, doing, done, status, name, desc } = this.state;
    return (
      <div className="App">
        <h1>Trello</h1>
        <main>
          <section className="row">
            <section>
              <h2>To-do</h2>
              <div
                id={STATUS.TODO}
                className="container"
                onDrop={this.drop}
                onDragOver={this.allowDrop}
              >
                {this.renderCards(todo)}
              </div>
            </section>
            <section>
              <h2>In Progress</h2>
              <div
                id={STATUS.DOING}
                className="container"
                onDrop={this.drop}
                onDragOver={this.allowDrop}
              >
                {this.renderCards(doing)}
              </div>
            </section>
            <section>
              <h2>Done</h2>
              <div
                id={STATUS.DONE}
                className="container"
                onDrop={this.drop}
                onDragOver={this.allowDrop}
              >
                {this.renderCards(done)}
              </div>
            </section>
          </section>
          <form className="input-form" onSubmit={this.handleSubmit}>
            <input
              type="text"
              placeholder="Task name"
              value={name}
              onChange={(e) => this.handleChange("name", e.target.value)}
              required
            ></input>
            <input
              type="text"
              placeholder="Task Description"
              value={desc}
              onChange={(e) => this.handleChange("desc", e.target.value)}
              required
            ></input>
            <select
              value={status}
              onChange={(e) => this.handleChange("status", e.target.value)}
            >
              <option value={STATUS.TODO}>To-do</option>
              <option value={STATUS.DOING}>In-progress</option>
              <option value={STATUS.DONE}>Done</option>
            </select>
            <input type="submit" className="button" value="Add New" />
          </form>
        </main>
      </div>
    );
  }
}

export default App;
