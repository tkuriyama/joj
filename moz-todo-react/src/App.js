import React from 'react';
import FilterButton from "./components/FilterButton";
import Form from "./components/Form";
import Todo from "./components/Todo";

export default App;


/*----------------------------------------------------------------------------*/

function App(props) {
    
    const taskList = props.tasks.map(task =>
        <Todo
        name={task.name}
        id={task.id}
        completed={task.completed}
        key={task.id}
        />);

    return (
        <div className="todoapp stack-large">
        <h1>TodoMatic</h1>
        <Form />

        <div className="filters btn-group stack-exception">
        <FilterButton />
        <FilterButton />
        <FilterButton />
        </div>

        <h2 id="list-heading">
        {taskList.length} tasks remaining
        </h2>

        <ul className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading">
        {taskList}
        </ul>

        </div>
    );
}


