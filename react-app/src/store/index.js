import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import userConversations from "./userconversations";
import userConversationMessages from "./userConversationMessages";
import session from "./session";
import servers from "./servers";
import users from "./users";
import channels from "./channels";
import onlineStatus from "./onlineStatusStore";
import voiceChannels from "./voiceChannels";
import serverInvites from "./serverInvites";

const rootReducer = combineReducers({
  session,
  userConversations,
  userConversationMessages,
  servers,
  users,
  channels,
  onlineStatus,
  voiceChannels,
  serverInvites,
});

let enhancer;

if (process.env.NODE_ENV === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = require("redux-logger").default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
