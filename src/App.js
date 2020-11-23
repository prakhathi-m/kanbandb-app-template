import React from "react";
import "./App.css";
import { ToDoList } from "./components/ToDoList";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <h1>Trello</h1>
        <main>
          <ToDoList />
        </main>
      </div>
    );
  }
}

export default App;
