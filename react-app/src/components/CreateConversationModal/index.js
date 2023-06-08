import React, { useState } from "react";
import { useModal } from "../../context/Modal";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useDispatch } from "react-redux";
import { Redirect } from 'react-router-dom'
import { createNewConversationThunk, getConversationsThunk } from "../../store/userconversations";

import "./CreateConvo.css"

export default function CreateConversationModal({ users }) {
    const history = useHistory()
    const [username, setUsername] = useState("")
    const dispatch = useDispatch()
    const { closeModal } = useModal();
    const handleSubmit = async (e) => {
        let user = users.find(user => user.username === username)
        // console.log("This is our user: ", user)
        e.preventDefault();
        const data = await dispatch(createNewConversationThunk(username))
        // .then(dispatch(getConversationsThunk()))
        const { conversation_id } = data[user.userId]

        closeModal()
        return history.push(`/conversations/${conversation_id}`)
        // return (<Redirect to={`/conversations/${conversation_id}`} />)



    }

    // dispatch to create a new conversation


    return (
        // make it so that you have an input field and uner you display all users in a multiple select
        <>
            <div >
                <h1 className="form-title"></h1>
                <form onSubmit={handleSubmit}>

                    <label className="signup-labels">
                        User
                        <input
                            type="text"
                            className="input-area"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        ></input>

                    </label>


                    {users.map((user) => {
                        return (
                            <div>
                                <label>
                                    <input type="checkbox" value={user.username}
                                        key={user.userId}
                                        onChange={(e) => { setUsername(e.target.value) }}
                                        checked={username === user.username}
                                    /> {user.username}</label>
                            </div>
                        )
                        // return (<input type="checkbox"
                        //     value={username} key={user.userId}>{user.username}
                        //     onClick = {(e) => setUsername(e.target.value)}
                        // </input>)
                    })}
                    <div>
                        <button type="submit">Create DM</button>
                    </div>

                </form>


            </div>
        </>
    )
}