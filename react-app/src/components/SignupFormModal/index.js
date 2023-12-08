import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { useModal } from "../../context/Modal";
import { signUp } from "../../store/session";
import "./SignupForm.css";
import { useHistory } from "react-router-dom";

function SignupFormModal() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      setIsLoading(true);

      dispatch(signUp(formData)).then((data) => {
        if (data) {
          setErrors(data);
          setIsLoading(false);
        } else {
          closeModal();
          history.push("/home");
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div id="create-server-container" style={{ width: "fit-content" }}>
        <h1 style={{ color: "var(--text)", padding: ".6rem", width: "100%" }}>
          Creating New Account...
        </h1>
      </div>
    );
  }

  return (
    <>
      <div id="sign-up-container">
        <h1 className="form-title">Sign Up</h1>
        <form
          className="form-box"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <ul className="errors">
            {Object.values(errors).map((error, idx) => {
              return (
                <li key={idx} style={{ paddingBottom: ".6rem" }}>
                  * {error}
                </li>
              );
            })}
          </ul>
          <label className="image-label">
            <div className="image-upload">
              {image ? (
                <p className="upload-name">{image.name}</p>
              ) : (
                <>
                  <i className="fa-regular fa-image"></i>
                  <p>Upload</p>
                </>
              )}
              <div className="image-dot">
                <p>+</p>
              </div>
            </div>
            <input
              type="file"
              className="image-upload-input"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>
          <label className="signup-labels">
            Email
            <input
              type="email"
              className="input-area"
              size={30}
              value={email}
              onChange={(e) => {
                if (!email.includes("@") && !email.includes(".")) {
                  setErrors((prev) => {
                    let err = { ...prev };
                    err.email = "Not a valid email";
                    return err;
                  });
                } else {
                  setErrors((prev) => {
                    let err = { ...prev };
                    delete err.email;
                    return err;
                  });
                }
                setEmail(e.target.value);
              }}
              required
            />
          </label>
          <label className="signup-labels">
            Username
            <input
              type="text"
              className="input-area"
              value={username}
              onChange={(e) => {
                if (e.target.value.trim().length >= 30) {
                  setErrors((prev) => {
                    let err = { ...prev };
                    err.username = "Username cannot be more than 30 characters";
                    return err;
                  });
                } else {
                  setErrors((prev) => {
                    let err = { ...prev };
                    delete err.username;
                    return err;
                  });
                }
                setUsername(e.target.value);
              }}
              required
            />
          </label>
          <label className="signup-labels">
            Password
            <input
              type="password"
              className="input-area"
              value={password}
              onChange={(e) => {
                if (e.target.value.trim().length < 8) {
                  setErrors((prev) => {
                    const err = { ...prev };
                    err.passwordLength =
                      "Password must be 8 characters or more.";
                    return err;
                  });
                } else {
                  setErrors((prev) => {
                    const err = { ...prev };
                    delete err.passwordLength;
                    return err;
                  });
                }
                setPassword(e.target.value.trim());
              }}
              required
            />
          </label>
          <label className="signup-labels">
            Confirm Password
            <input
              type="password"
              className="input-area"
              value={confirmPassword}
              onChange={(e) => {
                if (password !== e.target.value.trim()) {
                  setErrors((prev) => {
                    const err = { ...prev };
                    err.confirmPassword =
                      "Confirm Password field must match the Password field";
                    return err;
                  });
                } else {
                  setErrors((prev) => {
                    const err = { ...prev };
                    delete err.confirmPassword;
                    return err;
                  });
                }
                setConfirmPassword(e.target.value.trim());
              }}
              required
            />
          </label>
          <button className="form-button" type="submit">
            Sign Up
          </button>
        </form>
      </div>
    </>
  );
}

export default SignupFormModal;
