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
  // Initialize DB communications.
  constructor(props) {
    super(props);
    this.state = {
      todo: [],
      doing: [],
      done: [],
      kanbandb: KanbanDB.connect(),
    };
    this.getCardDetails = this.getCardDetails.bind(this);
    this.updateCardDetails = this.updateCardDetails.bind(this);
  }

  initialize() {
    // Add some cards
    LIST.forEach(({ name, description, status }) => {
      this.state.kanbandb.then((db) => {
        db.addCard({ name, description, status })
          .then((cardId) => console.log("card added with ID " + cardId))
          .catch((err) => console.error(err.message));
      });
    });
  }

  componentDidMount() {
    this.initialize();
    this.state.kanbandb.then((db) => this.getCardDetails(db));
  }

  getCardDetails(db) {
    console.log(db);

    db.getCards()
      .then((cards) => {
        console.log("all cards from DB", cards);
        const todo = [],
          doing = [],
          done = [];
        cards.map((card) => {
          // const newArray = this.state.[card.status.toLowerCase()].concat(card);
          // this.setState({ [card.status.toLowerCase()]: newArray });
          if (card.status.toLowerCase() === "todo") {
            todo.push(card);
          } else if (card.status.toLowerCase() === "doing") {
            doing.push(card);
          } else {
            done.push(card);
          }
        });
        this.setState({ todo, doing, done });
      })
      .catch((err) => {
        console.error("error", err.message);
      });
  }

  renderCard(card) {
    return (
      <div
        key={card}
        className="card"
        draggable="true"
        onDragStart={this.drag}
        id={card.id}
        data-status={card.status}
      >
        {card.name}: {card.description}
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
    ev.target.appendChild(document.getElementById(data));
    const status = ev.target.id;

    this.state.kanbandb.then((db) => {
      this.updateCardDetails(db, data, status);
    });
  };

  updateCardDetails = (db, id, status) => {
    db.updateCardById(id, { status })

      .then((success) => {
        if (success) {
          // this.getCardDetails(db);
          const d = document
            .getElementById(id)
            .getAttribute("data-status")
            .toLowerCase();
          const oldstatusarr = this.state[d].filter((item) => item.id != id);
          const newarr = this.state[d].filter((item) => item.id === id);
          newarr[0].status = status;
          console.log(oldstatusarr, newarr);
          this.setState({
            [d]: oldstatusarr,
            [status.toLowerCase()]: newarr[0],
          });
        }
      })
      .catch((err) => {
        console.error("error", err.message);
      });
    this.addCard();
  };

  addCard = () => {
    this.state.kanbandb.then((db) => {
      db.addCard({
        name: "Bug",
        description: "Production bugs need immediate action",
        status: "TODO",
      })
        .then((cardId) => {
          console.log("card added with ID " + cardId);
          // this.getCardDetails(db);
        })
        .catch((err) => console.error(err.message));
    });
  };

  renderCards(list) {
    return list.length > 0 && list.map((card) => this.renderCard(card));
  }

  render() {
    const { todo, doing, done } = this.state;
    return (
      <div className="App">
        <main>
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
        </main>
      </div>
    );
  }
}

export default App;
