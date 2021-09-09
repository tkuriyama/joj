import React, { useState } from "react";


export default function Todo(props) {

    const [isEditing, setEditing] = useState(false);
    const [newName, setNewName] = useState('');

    function handleChange(e) {
        setNewName(e.target.value);
    }

    function handleSubmit(e) {
        e.preventDefault();
        props.editTask(props.id, newName);
        setNewName("");
        setEditing(false);
    }

    function tryAutofill(e) {
        if (e.target.value === "" && e.keyCode === 9) {
            e.preventDefault();
            const text =
                e.target.placeholder.split(" (press")[0]
            e.target.value = text;
            setNewName(e.target.placeholder);
        }
    }

    function handleStatusChange(e) {
        props.toggleTaskStatus(props.id, e.target.value);
    }

            // Edit

            const editingTemplate = (
                <form className="stack-small" onSubmit={handleSubmit}>
                <div className="form-group">

                <input
                id={props.id}
        className="todo-edittext"
        type="text"
        placeholder={props.name + " (press tab to fill"}
        onChange={handleChange}
        onKeyDown={tryAutofill}
        />
        </div>

        <div className="btn-group">
        <button
        type="button"
        className="btn todo-cancel"
        onClick={() => setEditing(false)}>
        Cancel
        <span className="visually-hidden">renaming {props.name}</span>
        </button>q

        <button
        type="submit"
        className="btn btn__primary todo-edit"
        >
        Save
        <span className="visually-hidden">new name for {props.name}</span>
        </button>
        </div>
        </form>
    );

    // View

    const viewTemplate = (
        <div className="stack-small">
        <div className="todo-item">

        <label className="todo-text" htmlFor={props.id}>
        {props.name}
        </label>
        </div>
        <div className="btn-group">
        <button type="button" className="btn" onClick={() => setEditing(true)}>
        Edit <span className="visually-hidden">{props.name}</span>
        </button>

        <button
        type="button"
        className="btn btn__danger"
        onClick={() => props.deleteTask(props.id)}
        >
        Delete <span className="visually-hidden">{props.name}</span>
        </button>

        <select
        onChange={handleStatusChange}
        value={props.statusName}
        >
        <option
        value="Wishlist"
        >
        Wishlist
        </option>
        <option
        value="Purchased"
        >
        Purchased
        </option>
        <option
        value="Archived"
        >
        Archived</option>
        </select>
        </div>

        </div>
    );

    // Todo 

    return <li className="todo">{isEditing ? editingTemplate : viewTemplate}</li>;

};



/* <input
 * id={props.id}
 * type="checkbox"
 * defaultChecked={props.wishlist}
 * onChange={() => props.toggleTaskWishlist(props.id)}
   /> */
