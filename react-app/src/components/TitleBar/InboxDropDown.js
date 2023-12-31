import React, { useRef, useEffect } from "react";
import ReactDOM from 'react-dom';
import { useModal } from "../../context/Modal";

function InboxDropDown({onClose, top, left}) {
    const {modalRef} = useModal()
    const inboxRef = useRef()

    useEffect(() => {
        const closeMenu = (e) => {
          // If the area on the page clicked does not contain the value in ulRef.current, close the menu.
          if (!inboxRef.current || !inboxRef.current.contains(e.target)) {
            onClose();
          } else {
            return
          }
        };
    
        // if show menu is set to true, add a click listener to the entire document so it can close the menu when clicking outside the menu.
        document.addEventListener("click", closeMenu);
    
        return () => document.removeEventListener("click", closeMenu);
      }, [onClose])
    
      if (!modalRef.current) return null;


    return ReactDOM.createPortal(
        <div id="inbox-wrapper" ref={inboxRef} style={{ top: top, right: 0 }}>
            Invites
        </div>,
        modalRef.current
    );
}

export default InboxDropDown;