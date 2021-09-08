import React, { useState } from 'react';
import FilterButton from "./components/FilterButton";
import Form from "./components/Form";
import { nanoid } from "nanoid";
import Todo from "./components/Todo";

export default App;


/*----------------------------------------------------------------------------*/

const FILTER_MAP = {
    All: () => true,
    Active: task => !task.completed,
    Completed: task => task.completed
};

const FILTER_NAMES = Object.keys(FILTER_MAP);


function App(props) {

    // state
    const [tasks, setTasks] = useState(props.tasks);
    const [filter, setFilter] = useState('All');

    // task list

    const taskList = tasks
        .filter(FILTER_MAP[filter])
        .map(task =>
        <Todo
        name={task.name}
        id={task.id}
        key={task.id}
        completed={task.completed}
        toggleTaskCompleted={toggleTaskCompleted}
        editTask={editTask}
        deleteTask={deleteTask}
        />);

    // add

    function addTask(name) {
        const newTask = {
            id: "todo-" + nanoid(),
            name: name,
            completed: false
        };
        setTasks([...tasks, newTask]);
    };

    // edit
    function editTask(id, newName) {
        const editedTaskList = tasks.map(task => {
            return (id === task.id) ? {...task, name: newName} : task;
        });
        setTasks(editedTaskList);
    }

    // delete
    function deleteTask(id) {
        const updatedTasks = tasks.filter(task => {
            return (task.id !== id)
        });
        setTasks(updatedTasks);
    }


    // checkbox 
    function toggleTaskCompleted(id) {
        const updatedTasks = tasks.map(task => {
            return (task.id === id) ? {...task, completed: !task.completed} : task
        });
        setTasks(updatedTasks);
        }

    // task count

    const tasksNoun = taskList.length !== 1 ? 'tasks' : 'task';
    const headingText = `${taskList.length} ${tasksNoun} remaining`;

    // Filter button

    const filterList = FILTER_NAMES.map(name => (
        <FilterButton
        key={name}
        name={name}
        isPressed={name === filter}
        setFilter={setFilter}
        />
    ));

    // App

    return (
        <div className="todoapp stack-large">
        <h1>TodoMatic</h1>
        <Form onSubmit={addTask}/>

        <div className="filters btn-group stack-exception">

        {filterList}

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


