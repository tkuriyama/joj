import React, { useState } from "react";

/*----------------------------------------------------------------------------*/

export default function Form(props) {
    const [name, setName] = useState("");

    function handleChange(e) {
        setName(e.target.value);
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (name !== "") {
            props.onSubmit(name);
            setName("");
        };
    }
    return (
        <form onSubmit={handleSubmit}>
        <h2 className="label-wrapper">
        <label htmlFor="new-todo-input" className="label__lg">
        What item do you want to track?
        </label>
        </h2>
            <input
        placeholder="Item Name"
        type="text"
        id="new-todo-input"
        className="input input__lg"
        name="text"
        autoComplete="off"
        value={name}
        onChange={handleChange}
        />
        <button type="submit" className="btn btn__primary btn__lg">
        Add
        </button>
        </form>
    );
}
