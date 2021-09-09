import React, { useState } from 'react';
import FilterButton from "./components/FilterButton";
import Form from "./components/Form";
import { nanoid } from "nanoid";
import Todo from "./components/Todo";

export default App;


/*----------------------------------------------------------------------------*/

const FILTER_MAP = {
    All: () => true,
    Wishlist: task => task.statusName === "Wishlist",
    Purchased: task => task.statusName === "Purchased",
    Archived: task => task.statusName === "Archived"
};

const FILTER_NAMES = Object.keys(FILTER_MAP);


/*----------------------------------------------------------------------------*/

function App() {

    // state
    const [tasks, setTasks] = useLocalStorage("tasks", [])
    const [filter, setFilter] = useState('Wishlist');

    // task list

    const taskList = tasks
        .filter(FILTER_MAP[filter])
        .map(task =>
        <Todo
            name={task.name}
            id={task.id}
            key={task.id}
            statusNamed={task.statusName}
            toggleTaskStatus={toggleTaskStatus}
            editTask={editTask}
            deleteTask={deleteTask}
            />);

    // add

    function addTask(name) {
        const newTask = {
            id: "todo-" + nanoid(),
            name: name,
            statusName: "Wishlist"
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
                return {...task, statusName: statusName};
            }
        });
        setTasks(updatedTasks);
        }

    // task count

    // Filter button

    function getFilterSize(filterName) {
        return tasks
            .filter(FILTER_MAP[filterName])
            .length
    }

    const filterList = FILTER_NAMES.map(name => (
        <FilterButton
        key={name}
        name={name}
        isPressed={name === filter}
        setFilter={setFilter}
        length={getFilterSize(name)}
        />
    ));

    // App

    return (
        <div className="todoapp stack-large">
        <Form onSubmit={addTask}/>

        <div className="filters btn-group stack-exception">
        {filterList}
        </div>

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
