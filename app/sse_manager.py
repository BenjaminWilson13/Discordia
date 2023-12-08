import queue


class SSE_Manager:

    def __init__(self):
        # message queue storage
        self.clients = {}

    def listen(self, user_id):
        # Store a queue with the userId as the key so messages only get sent to the user it is targeting.
        if user_id not in self.clients:
            self.clients[user_id] = queue.Queue()
        return self.clients[user_id]

    def announce(self, user_id, msg):
        # If there is a queue for the client (if they are listening) attach the msg to their queue 
        if user_id in self.clients:
            if (self.clients[user_id].qsize() == 0):
                self.clients[user_id].put(msg)
                return

def format_sse(data: str, event=None) -> str:
    # Required formatting for messages to be sent
    msg = f'data: {data}\n\n'
    if event is not None:
        msg = f'event: {event}\n{msg}'
    return msg

manager = SSE_Manager()




                