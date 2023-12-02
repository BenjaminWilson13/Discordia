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
            for i in reversed(range(len(self.clients[user_id]))):
                try:
                    self.clients[user_id][i].put_nowait(msg)
                except queue.Full:
                    del self.clients[user_id][i]



manager = SSE_Manager()

                