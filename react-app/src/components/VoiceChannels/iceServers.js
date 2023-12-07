const iceServers = [
  {
    urls: "stun:stun.relay.metered.ca:80",
  },
  {
    urls: "turn:a.relay.metered.ca:80",
    username: "f8da8920e5a37b37131a989b",
    credential: "4IBYYZ5g8t+M2bkP",
  },
  {
    urls: "turn:a.relay.metered.ca:80?transport=tcp",
    username: "f8da8920e5a37b37131a989b",
    credential: "4IBYYZ5g8t+M2bkP",
  },
  {
    urls: "turn:a.relay.metered.ca:443",
    username: "f8da8920e5a37b37131a989b",
    credential: "4IBYYZ5g8t+M2bkP",
  },
  {
    urls: "turn:a.relay.metered.ca:443?transport=tcp",
    username: "f8da8920e5a37b37131a989b",
    credential: "4IBYYZ5g8t+M2bkP",
  },
];

export { iceServers };
