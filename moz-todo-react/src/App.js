import React, { useState } from 'react';
import FilterButton from "./components/FilterButton";
import Form from "./components/Form";
import { nanoid } from "nanoid";
import Todo from "./components/Todo";

export default App;


/*----------------------------------------------------------------------------*/

function App(props) {

    const [tasks, setTasks] = useState(props.tasks);

    function addTask(name) {
        const newTask = {
            id: "todo-" + nanoid(),
            name: name,
            completed: false
        };
        setTasks([...tasks, newTask]);
    };

    const taskList = tasks.map(task =>
        <Todo
        name={task.name}
        id={task.id}
        completed={task.completed}
        key={task.id}
        toggleTaskCompleted={toggleTaskCompleted}
        deleteTask={deleteTask}
        />);


    function toggleTaskCompleted(id) {
        const updatedTasks = tasks.map(task => {
            return (task.id === id) ? {...task, completed: !task.completed} : task
        });
        setTasks(updatedTasks);
    }

    function deleteTask(id) {
        const updatedTasks = tasks.filter(task => {
            return (task.id !== id)
        });
        setTasks(updatedTasks);
    }


    const tasksNoun = taskList.length !== 1 ? 'tasks' : 'task';
    const headingText = `${taskList.length} ${tasksNoun} remaining`;

    return (
        <div className="todoapp stack-large">
        <h1>TodoMatic</h1>
        <Form onSubmit={addTask}/>

        <div className="filters btn-group stack-exception">
        <FilterButton />
        <FilterButton />
        <FilterButton />
        </div>

        <h2 id="list-heading">
        {headingText}
        </h2>

        <ul className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading">
        {taskList}
        </ul>

        </div>
    );
}


