import React, { useState } from 'react';
import FilterButton from "./components/FilterButton";
import Form from "./components/Form";
import { nanoid } from "nanoid";
import Todo from "./components/Todo";

export default App;


/*----------------------------------------------------------------------------*/

const FILTER_MAP = {
    All: () => true,
    Wishlist: task => task.wishlist,
    Purchased: task => task.purchased,
    Archived: task => task.archived
};

const FILTER_NAMES = Object.keys(FILTER_MAP);


/*----------------------------------------------------------------------------*/

function App() {

    // state
    const [tasks, setTasks] = useLocalStorage("tasks", [])
    const [filter, setFilter] = useState('All');

    // task list

    const taskList = tasks
        .filter(FILTER_MAP[filter])
        .map(task =>
        <Todo
            name={task.name}
            id={task.id}
            key={task.id}
            wishlist={task.wishlist}
            purchased={task.purchased}
            archived={task.archived}
            toggleTaskStatus={toggleTaskStatus}
            editTask={editTask}
            deleteTask={deleteTask}
            />);

    // add

    function addTask(name) {
        const newTask = {
            id: "todo-" + nanoid(),
            name: name,
            wishlist: true,
            purchased: false,
            archived: false
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
    function toggleTaskStatus(id, statusName) {
        const updatedTasks = tasks.map(task => {
            if (task.id !== id) {
                return task;
            } else {
                if (statusName === "Wishlist") {
                    return {...task, wishlist: true, purchased: false, archived: false};
                } else if (statusName === "Purchased") {
                        return {...task, wishlist: false, purchased: true, archived: false};
                    } else if (statusName === "Archived") {
                        return {...task, wishlist: false, purchased: false, archived: true};
                } else {
                    return task;
                }
            }
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



/*----------------------------------------------------------------------------*/

// Hook
function useLocalStorage(key, initialValue) {

    const [storedValue, setStoredValue] = useState(() => {

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.log(error);
        }
    };
    return [storedValue, setValue];
}
