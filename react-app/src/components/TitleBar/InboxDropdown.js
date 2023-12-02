import React, {useEffect} from 'react';

function InboxDropdown() {

    useEffect(() => {

        // Start listening to the server for server sent events.
        const eventSource = new EventSource('/api/invites/listen', { withCredentials: true });

        eventSource.onmessage = (event) => {

            // const newMessage = event.data;
            // setMessages((prevMessages) => [...prevMessages, newMessage]);
        };

        eventSource.onerror = (error) => {
            console.error('SSE error:', error);
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <div className='inbox'>
            <i class="fa-solid fa-inbox fa-2xs"></i>
        </div>
    )
}

export default InboxDropdown;