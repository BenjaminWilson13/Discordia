import queue

class SSE_Manager:

    def __init__(self):
        self.clients = {}

    def listen(self, user_id):
        if user_id not in self.clients:
            self.clients[user_id] = queue.Queue(maxsize=5)
        return self.clients[user_id]

    def announce(self, user_id, msg):
        if user_id in self.clients:
            print("🍓🍓🍓🍓🍓🍓🍓", self.clients[user_id].qsize())
            for i in reversed(range(self.clients[user_id].qsize())):
                try:
                    self.clients[user_id][i].put_nowait(msg)
                except queue.Full:
                    del self.clients[user_id][i]

def format_sse(data: str, event=None) -> str:
    msg = f'data: {data}\n\n'
    if event is not None:
        msg = f'event: {event}\n{msg}'
    return msg

manager = SSE_Manager()




                