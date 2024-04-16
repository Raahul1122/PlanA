import React, { useEffect, useRef, useState } from "react";
import { BellIcon, CrossIcon, Search, User } from "../assets/svg";
import { getProfile } from "../services/auth";
import { Bars } from "react-loader-spinner";
import eventEmitter from "../Event";
import { Link } from "react-router-dom";

function NavMenu() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [userImg, setUserImg] = useState("");
  const [selectedValue, setSelectedValue] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [notificationDropDown, setNotificationDropDown] = useState(false);
  const notificationRef = useRef(null);

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  useEffect(() => {
    let handler = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setNotificationDropDown(false);
      }

    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  useEffect(() => {
    const bodyScroll = document.getElementById('rightSCroll')
    if (isPopupOpen) {
      bodyScroll.style.overflow = "hidden";
    } else {
      bodyScroll.style.overflow = "auto"; 
    }

    return () => {
      bodyScroll.style.overflow = "auto";
    };
  }, [isPopupOpen]);


  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      let response = await getProfile(authToken);
      if (response.res) {
        setUser(response.res.user.name);
        setUserImg(response.res.user.profile_pic);
        localStorage.setItem("user", response.res.user.name);
      } else {
        console.error("profile error:", response.error);
      }
    } catch (error) {
      console.error("There was an error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  eventEmitter.removeAllListeners("updateProfile");
  eventEmitter.on("updateProfile", fetchProfileData);

  const handleInputFocus = () => {
    setIsPopupOpen(true);
  };
  const handleInputBlur = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      {loading && (
        <div className="loaderDiv">
          <Bars
            height="80"
            width="80"
            color="#E2E31F"
            ariaLabel="bars-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      )}
      <div className="position-relative">
        <nav className="container-fluid navMenuDiv position-relative" style={{zIndex:'91'}}>
          <div className="d-flex justify-content-between">
            <form>
              <div className="searchBox">
                <div className="IconBox">
                  <Search />
                </div>
                <input
                  name="search"
                  placeholder="Search"
                  onChange={(e) => e.preventDefault}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="selectBox">
                <select
                  className="form-select"
                  aria-label="Default select example"
                  placeholder="Select"
                  value={selectedValue}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Job">Job</option>
                  <option value="Task">Task</option>
                  <option value="Invoice">Invoice</option>
                </select>
              </div>
            </form>
            <div>
              <div
                className="d-flex align-items-center justify-content-end"
                style={{ minWidth: "250px" }}
              >
                <Link className="d-flex" style={{textDecoration:'none'}} to="/settings">
                  <div
                    style={{ textAlign: "end" }}
                    className="d-flex flex-column justify-content-center"
                  >
                    <p>{[user]}</p>
                    <span style={{ fontSize: "12px", fontWeight: "300" }}>
                    {[user?.job_title]}
                    </span>
                  </div>
                  <div className="UserImg" style={{ minWidth: "40px" }}>
                    {userImg ? (
                      <img
                        alt={userImg}
                        src={
                          process.env.REACT_APP_USER_API_CLOUD_IMG_PATH + userImg
                        }
                      />
                    ) : (
                      <User />
                    )}
                  </div>
                </Link>
                <div className="addNewTaskDiv">
                  <div className="bellIcon addTaskJobDiv" style={{cursor:'pointer'}}>
                    <div onClick={()=>setNotificationDropDown(!notificationDropDown)}>
                      <BellIcon />
                    </div>
                    {notificationDropDown && (
                      <div
                        className="addTaskJobDropdown notificationDropdown right"
                        ref={notificationRef}
                      >
                        <div className="addTaskJobListScroll">
                          <div className="addTaskJobListItems">

                              <div className="notificationItems">
                                <div className="notificationTime">
                                  1min<br/>Ago
                                </div>
                                <div className="notificationContent">
                                    <div className="notificationIcon">! </div>
                                    <div className="notificationText">
                                      <h3>Notification Heading</h3>
                                      <span>Notification Description goes here</span>
                                    </div>
                                    <div className="notificationCrossIcon"><CrossIcon /> </div>
                                </div>
                              </div>
                              <div className="notificationItems">
                                <div className="notificationTime">
                                  1min<br/>Ago
                                </div>
                                <div className="notificationContent">
                                    <div className="notificationIcon">! </div>
                                    <div className="notificationText">
                                      <h3>Notification Heading</h3>
                                      <span>Notification Description goes here</span>
                                    </div>
                                    <div className="notificationCrossIcon"><CrossIcon /> </div>
                                </div>
                              </div>

                              <div className="notificationItems">
                                <div className="notificationTime">
                                  1min<br/>Ago
                                </div>
                                <div className="notificationContent">
                                    <div className="notificationIcon">! </div>
                                    <div className="notificationText">
                                      <h3>Notification Heading</h3>
                                      <span>Notification Description goes here</span>
                                    </div>
                                    <div className="notificationCrossIcon"><CrossIcon /> </div>
                                </div>
                              </div>

                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {isPopupOpen && (
          <div className="searchPagePopUp">
            <div className="DashboardTopMenu">
              <div className="DashboardHeading d-flex justify-content-between align-items-center">
                <h2>Search Results</h2>
              </div>
              <div className="resultContainer">
                {/* mapping here */}
                <div className="resultMap">
                    <div className="d-flex align-items-center" style={{gap:'16px'}}>
                      <div className="identityBadge">
                        Job
                        {/* Invoice */}
                        {/* Task */}
                      </div>
                      <div className="searchContext">
                        <h3>Title</h3>
                        <span>description</span>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const authToken = localStorage.getItem("authToken");
    const data = await getProfile(authToken);
    return { props: { data } };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { props: { data: null } };
  }
}

export default NavMenu;
