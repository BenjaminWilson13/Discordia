import React, {useEffect} from 'react';

function InboxDropdown() {

    useEffect(() => {

        // Start listening to the server for server sent events.
        const eventSource = new EventSource('/api/invites/listen', { withCredentials: true });
        console.log("🍓🍓🍓🍓🍓🍓🍓🍓🍓🍓", eventSource)

        eventSource.onmessage = (event) => {
            console.log('Received message:', event.data);
            // Handle the message as needed
        };

        eventSource.addEventListener("Server Invite", e => {
            console.log("Server Invitation: ", e.data)
        })

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <div className='inbox'>
            <i className="fa-solid fa-inbox fa-2xs"></i>
        </div>
    )
}

export default InboxDropdown;