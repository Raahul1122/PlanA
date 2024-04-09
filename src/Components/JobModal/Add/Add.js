import React, { useEffect, useRef, useState } from "react";
import "./style.scss";
import Slider from "react-slick";
import { AllStages, StageList, StatusList } from "../../../helper";
import { Calendar } from "react-date-range";
import { AddIcon, User } from "../../../assets/svg";
import { createJobs, getUserByRole } from "../../../services/auth";
import { Bars } from "react-loader-spinner";
import { toast } from "react-toastify";

const Add = ({ handleClose, fetchJobs }) => {
  const [state, setState] = useState({
    title: "",
    description: "",
    location: "",
    due_date: "",
    latest_update: "",
    status: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [activeCardId, setActiveCardId] = useState(1);
  const [selectDueDate, setSelectDueDate] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState(null);
  const [showStatuses, setShowStatuses] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    stageTitle: "",
    status: "to-do",
  });
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState();
  const [showStages, setShowStages] = useState(false);
  const [loader, setLoader] = useState(false);
  const addTaskRef = useRef(null);
  const [usersList, setUsersList] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState([]);
  const [userDropdownStates, setUserDropdownStates] = useState(
    Array(19).fill(false)
  );
  const [taskSelectedAssignee, setTaskSelectedAssignee] = useState([]);

  const handleCardChange = (index) => {
    setActiveCardId(index + 1);
  };

  const [showAssignee, setShowAssignee] = useState(false);

  const settings = {
    afterChange: handleCardChange,
    className: "center",
    centerMode: false,
    infinite: false,
    // centerPadding: "60px",
    slidesToShow: 3,
    speed: 500,
    arrow: false,
  };

  const sliderData = [
    {
      title: "",
    },
    {
      title: "No Tasks?",
      para: "Try adding a task below!",
      button: "Add Task",
    },
    {
      title: "",
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      let response = await getUserByRole(authToken);
      if (response.res) {
        setUsersList(response.res);
        console.log("users-", response.res);
      } else {
        console.error("Failed to fetch Users:", response.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleAllStages = () => {
    const allStages = addDueDatesToTasks();
    console.log("allstages", allStages);
    setTasks(allStages);
  };

  function addDueDatesToTasks() {
    // Get the current date
    const currentDate = new Date();

    // Loop through each stage
    AllStages.forEach((task) => {
      // Calculate the due date based on the days from the current date
      const dueDate = new Date(currentDate);
      dueDate.setDate(dueDate.getDate() + task.days);

      // Format the due date to 'YYYY-MM-DD'
      const formattedDueDate = dueDate.toISOString().split("T")[0];

      // Add the due date to the task
      task.due_date = formattedDueDate;
    });

    return AllStages;
  }

  const handleOnChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const handleIsEdit = () => {
    setIsEdit(!isEdit);
  };

  const handleSelectDueDate = (date) => {
    setSelectDueDate(false);
    setSelectedDueDate(date);
    console.log("in handleSelectDueDate", date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let formattedDueDate = `${year}-${month}-${day}`;
    setState({
      ...state,
      due_date: formattedDueDate,
    });
  };

  const handleTasksCheckBoxSelect = (e, id) => {
    console.log("checked", e.target.checked, id);
    const { checked } = e.target;
    if (checked) {
      setSelectedTasks((prevIds) => (prevIds ? [...prevIds, id] : [id]));
    } else {
      setSelectedTasks((prevIds) =>
        prevIds ? prevIds.filter((selectedId) => selectedId !== id) : []
      );
    }
  };

  const handleCreateJob = async () => {
    if (state.title === "" || state.title?.trim() === "") {
      toast.error(
        <>
          <div>
            <h3>Trouble Creating Job?</h3>
          </div>
          <p>
            Please Enter the Job Title.
          </p>
        </>
      );
      return;
    }
    if (state.location === "" || state.location?.trim() === "") {
      toast.error(
        <>
          <div>
            <h3>Trouble Creating Job?</h3>
          </div>
          <p>
            Please Enter the Job Location.
          </p>
        </>
      );
      return;
    }
    if (state.description === "" || state.description?.trim() === "") {
      toast.error(
        <>
          <div>
            <h3>Trouble Creating Job?</h3>
          </div>
          <p>
            Please Enter the Job Description.
          </p>
        </>
      );
      return;
    }
    if(!tasks.length || (newTask.title === "" && newTask.stageTitle === "")){
      toast.error(
        <>
          <div>
            <h3>Trouble Creating Job?</h3>
          </div>
          <p>
            Please Add Tasks in your job.
          </p>
        </>
      );
      return;
    }
    if (state.due_date === "") {
      toast.error(
        <>
          <div>
            <h3>Trouble Creating Job?</h3>
          </div>
          <p>
            Please Select a Due Date for the Job.
          </p>
        </>
      );
      return;
    }
    if (state.latest_update === "" ) {
      toast.error(
        <>
          <div>
            <h3>Trouble Creating Job?</h3>
          </div>
          <p>
            Please Enter the Job Latest Update.
          </p>
        </>
      );
      return;
    }

    if (state.status === "" ) {
      toast.error(
        <>
          <div>
            <h3>Trouble Creating Job?</h3>
          </div>
          <p>
            Please Select the Job Status.
          </p>
        </>
      );
      return;
    }
    
    let stages = [];
    // Group tasks by stageTitle
    if (tasks.length > 0) {
      const groupedTasks = tasks.reduce((acc, task) => {
        if (!acc[task.stageTitle]) {
          acc[task.stageTitle] = [];
        }
        acc[task.stageTitle].push(task);
        return acc;
      }, {});

      // Transform grouped tasks into the desired format
      stages = Object.entries(groupedTasks).map(([stageTitle, tasks]) => ({
        title: stageTitle,
        tasks: tasks.map(({ title, due_date, status, users }) => ({
          title,
          due_date,
          status,
          users,
        })),
      }));
    }

    if (!tasks.length && newTask.title !== "" && newTask.stageTitle !== "") {
      // Get the current date
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      let month = currentDate.getMonth() + 1;
      let day = currentDate.getDate();

      // Ensure month and day are two digits
      month = month < 10 ? "0" + month : month;
      day = day < 10 ? "0" + day : day;

      // Format the current date as YYYY-MM-DD
      const formattedDate = `${year}-${month}-${day}`;
      stages.push({
        title: newTask.stageTitle,
        tasks: [
          {
            title: newTask.title,
            due_date: formattedDate,
            status: newTask.status,
            users: newTask.users ?? [],
          },
        ],
      });
    }

    if (tasks.length && newTask.title !== "" && newTask.stageTitle !== "") {
      const stageIndex = stages.findIndex(
        (stage) => stage.title === newTask.stageTitle
      );
      // Get the current date
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      let month = currentDate.getMonth() + 1;
      let day = currentDate.getDate();

      // Ensure month and day are two digits
      month = month < 10 ? "0" + month : month;
      day = day < 10 ? "0" + day : day;

      // Format the current date as YYYY-MM-DD
      const formattedDate = `${year}-${month}-${day}`;
      if (stageIndex !== -1) {
        stages[stageIndex].tasks.push({
          title: newTask.title,
          due_date: formattedDate,
          status: newTask.status,
          users: newTask.users ?? [],
        });
      }
    }

    console.log("stages", stages);

    try {
      setLoader(true);
      let reqBody = state;
      reqBody = { ...reqBody, stages };
      const response = await createJobs(reqBody);
      console.log("request body for create job", response);
      if (response.res) {
        toast.success(`${response.res.message}`);
      } else {
        console.error("jobs update failed:", response.error);
        toast.error(`${response.error.message}`);
      }
    } catch (error) {
      console.log("error in updating jobs", error);
    } finally {
      setLoader(false);
      fetchJobs();
      handleClose();
    }
  };

  const handleAssigneeClick = (user) => {
    setSelectedAssignee((prevUsers) => {
      if (prevUsers?.some((item) => item.id === user.id)) {
        return prevUsers?.filter((item) => item.id !== user.id);
      } else {
        return [...prevUsers, user];
      }
    });
  };

  const handleCloseAddAssignee = async () => {
    setSelectedAssignee([]);
  };

  const handleAddAssignee = () => {
    setNewTask({
      ...newTask,
      users: selectedAssignee,
    });
    setUserDropdownStates(Array(19).fill(false));
    setShowAssignee(false);
  };

  const handleTaskAssigneeClick = (user) => {
    console.log("selected task assignee", taskSelectedAssignee);

    setTaskSelectedAssignee((prevUsers) => {
      if (prevUsers.some((item) => item.id === user.id)) {
        return prevUsers.filter((item) => item.id !== user.id);
      } else {
        return [...prevUsers, user];
      }
    });
  };

  const toggleUserDropdown = (index) => {
    setUserDropdownStates((prevStates) => {
      const newState = prevStates.map((state, i) => {
        return i === index ? true : false;
      });
      return newState;
    });
  };

  const handleTaskAddAssignee = (task) => {
    task.users = taskSelectedAssignee;
    setTaskSelectedAssignee([]);
    setUserDropdownStates(Array(19).fill(false));
  };

  return (
    <>
      {loader && (
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
      <div className="loaderDiv3">
        <div className="pop-wrapper">
          <div className="wrapper">
            <div className="container pop-container">
              <div className="popup-content">
                <div className="popup-section-left">
                  <div
                    className="top-section"
                    style={{ position: "sticky", top: "0", zIndex: "2" }}
                  >
                    <div className="topsection-left">
                      <div className="top-left-content">
                        <div
                          onClick={handleClose}
                          style={{ cursor: "pointer" }}
                        >
                          <img src="/assets/Frame 60.png" alt="" />
                        </div>
                        <div className="position w-100">
                          <div className="">
                            <div className="title">
                              <div className="d-flex flex-column">
                                {!isEdit && (
                                  <>
                                    <h1 onClick={handleIsEdit}>
                                      {state.title === ""
                                        ? "Add Title Here..."
                                        : state.title}{" "}
                                      <span>
                                        <img
                                          className="penImage"
                                          src="/assets/pan.png"
                                          alt=""
                                          onClick={handleIsEdit}
                                        />
                                      </span>
                                    </h1>

                                    <p>
                                      {state.location === ""
                                        ? "Add Location here"
                                        : state.location}
                                    </p>
                                  </>
                                )}
                                {isEdit && (
                                  <div className="d-flex">
                                    <input
                                      onChange={handleOnChange}
                                      className="addInput"
                                      type="text"
                                      name="title"
                                      value={state.title}
                                      id=""
                                      placeholder="Add Title Here.."
                                    />
                                    <span>
                                      <img
                                        className="penImage"
                                        src="/assets/pan.png"
                                        alt=""
                                        onClick={handleIsEdit}
                                      />
                                    </span>
                                  </div>
                                )}
                                {isEdit && (
                                  <input
                                    className="LocationInput"
                                    type="text"
                                    name="location"
                                    id=""
                                    onChange={handleOnChange}
                                    value={state.location}
                                    placeholder="Add Location"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="progress-bar-container">
                            <div
                              className="progress-upper"
                              style={{ width: 0 }}
                            >
                              <div className="progress-text">
                                <p>Progress:&nbsp;0%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="top-right-content">
                    <div className="discription-heading">
                      <h1>Description</h1>
                      <textarea
                        type="text"
                        name="description"
                        id=""
                        rows={3}
                        value={state.description}
                        onChange={handleOnChange}
                        placeholder="Add Description Here..."
                      />
                      {/* <p className='text-start'>Add Description Here...</p> */}
                    </div>

                    <div className="Addslider-container">
                      <Slider {...settings}>
                        {sliderData.map((item, index) => (
                          <div>
                            <div
                              key={index}
                              className={` slider-box ${
                                index === activeCardId ? "active" : ""
                              }`}
                              onChange={() => handleCardChange(index)}
                            >
                              <div className={`card-slider `}>
                                <h1>{item.title}</h1>
                                <p>{item.para}</p>
                                <button
                                  className="d-flex justify-content-between align-items-center gap-2"
                                  onClick={() => {
                                    if (index === 1) {
                                      addTaskRef.current.focus();
                                    }
                                  }}
                                >
                                  <AddIcon />
                                  {item.button}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </Slider>
                    </div>
                  </div>

                  <div className="table-section">
                    <div className="table-top-section">
                      <div className="tableTopLeft">
                        <h1>Tasks</h1>
                        {tasks.length === 0 && (
                          <p onClick={handleAllStages}>+ Add All Stages</p>
                        )}
                      </div>
                      <div className="tableTopRight">
                        <button>To Do</button>
                        <img src="/assets/doubleArrow.png" alt="" />
                        <button>Completed</button>
                      </div>
                    </div>
                    <div className="table-main-section mt-4">
                      <ul>
                        {tasks?.length > 0 &&
                          tasks?.map((task, index) => (
                            <li key={index}>
                              <label
                                htmlFor={`task_select_${index}`}
                                className="align-self-center"
                              >
                                <input
                                  type="checkbox"
                                  id={`task_select_${index}`}
                                  style={{ display: "none" }}
                                  checked={selectedTasks?.includes(index)}
                                  onChange={(e) =>
                                    handleTasksCheckBoxSelect(e, index)
                                  }
                                />
                                {selectedTasks?.includes(index) ? (
                                  <div className="svg-box-2 mx-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="15"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <path
                                        d="M10 16.4L6 12.4L7.4 11L10 13.6L16.6 7L18 8.4L10 16.4Z"
                                        fill="black"
                                      />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="svg-box mx-2"></div>
                                )}
                              </label>
                              <div className="w-100  d-flex align-items-center position-relative ">
                                <div
                                  className="d-flex justify-content-between application-lodge "
                                  style={{ "min-width": "92%" }}
                                >
                                  <div className="d-flex gap-3 align-items-center ">
                                    <img
                                      src="/assets/Group 87.png"
                                      alt=""
                                      style={{ width: "18px", height: "18px" }}
                                    />
                                    <p className={`text_${task.stageTitle}`}>
                                      {task.title}
                                    </p>
                                  </div>

                                  <button className={`btn_${task.stageTitle}`}>
                                    {StageList[task.stageTitle]}
                                  </button>
                                </div>
                                <div className="card-image user-cards listContent d-flex align-items-center gap-2 justify-content-center navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                                  <div className=" d-flex align-items-center justify-content-center">
                                    {task?.users?.length > 0 ? (
                                      <>
                                        {task.users?.map((user, i) => (
                                          <>
                                            <div
                                              key={i}
                                              className={` UserImg addedUserImages ${
                                                i === task.users.length - 1
                                                  ? "withAddBtn"
                                                  : ""
                                              }`}
                                              style={{
                                                minWidth: "40px",
                                                zIndex: i,
                                              }}
                                              onClick={() => {
                                                console.log(
                                                  "task users",
                                                  task.users
                                                );
                                                if (task.users) {
                                                  setTaskSelectedAssignee(
                                                    task.users
                                                  );
                                                } else {
                                                  setTaskSelectedAssignee([]);
                                                }
                                                toggleUserDropdown(index);
                                              }}
                                            >
                                              {user.profile_pic !== "" ? (
                                                <img
                                                  alt={user.name}
                                                  src={
                                                    process.env
                                                      .REACT_APP_USER_API_CLOUD_IMG_PATH +
                                                    user.profile_pic
                                                  }
                                                />
                                              ) : (
                                                <User />
                                              )}
                                            </div>
                                          </>
                                        ))}
                                      </>
                                    ) : (
                                      <div
                                        className="UserImg withAddBtn"
                                        onClick={() => {
                                          if (task.users) {
                                            setTaskSelectedAssignee(task.users);
                                          } else {
                                            setTaskSelectedAssignee([]);
                                          }
                                          toggleUserDropdown(index);
                                        }}
                                        style={{ minWidth: "40px" }}
                                      >
                                        <User />
                                      </div>
                                    )}
                                    {userDropdownStates[index] && (
                                      <div className="addAssigneeDropdown ">
                                        <div className="addTaskJobListScroll">
                                          <div className="addTaskJobListItems">
                                            <label className="addedAssignees">
                                              Assignees
                                            </label>
                                            <div className="addedAssigneeBorder">
                                              {usersList &&
                                                usersList
                                                  .filter((user) =>
                                                    taskSelectedAssignee?.some(
                                                      (item) =>
                                                        item.id === user.id
                                                    )
                                                  )
                                                  .map((user) => (
                                                    <>
                                                      <div
                                                        key={user.id}
                                                        className={`addAssigneeDiv  ${
                                                          taskSelectedAssignee?.some(
                                                            (item) =>
                                                              item.id ===
                                                              user.id
                                                          ) && "active"
                                                        }`}
                                                        onClick={() =>
                                                          handleTaskAssigneeClick(
                                                            user
                                                          )
                                                        }
                                                      >
                                                        <div
                                                          className={` UserImg addedUserImages `}
                                                          style={{
                                                            minWidth: "40px",
                                                          }}
                                                        >
                                                          {user.profile_pic !==
                                                          "" ? (
                                                            <img
                                                              alt={user.name}
                                                              src={
                                                                process.env
                                                                  .REACT_APP_USER_API_CLOUD_IMG_PATH +
                                                                user.profile_pic
                                                              }
                                                            />
                                                          ) : (
                                                            <User />
                                                          )}
                                                        </div>
                                                        <div>
                                                          <h4>{user.name}</h4>
                                                          <p>{user.email}</p>
                                                        </div>
                                                        <div className="checkAddBtn">
                                                          {taskSelectedAssignee?.some(
                                                            (item) =>
                                                              item.id ===
                                                              user.id
                                                          )
                                                            ? "-"
                                                            : "+"}
                                                        </div>
                                                      </div>
                                                    </>
                                                  ))}
                                            </div>
                                            <label className="">
                                              Add Assignees
                                            </label>
                                            {usersList
                                              .filter(
                                                (user) =>
                                                  !taskSelectedAssignee?.some(
                                                    (item) =>
                                                      item.id === user.id
                                                  )
                                              )
                                              .map((user) => (
                                                <>
                                                  <div
                                                    key={user.id}
                                                    className={`addAssigneeDiv ${
                                                      taskSelectedAssignee?.some(
                                                        (item) =>
                                                          item.id === user.id
                                                      ) && "active"
                                                    }`}
                                                    onClick={() =>
                                                      handleTaskAssigneeClick(
                                                        user
                                                      )
                                                    }
                                                  >
                                                    <div
                                                      className={` UserImg addedUserImages `}
                                                      style={{
                                                        minWidth: "40px",
                                                      }}
                                                    >
                                                      {user.profile_pic !==
                                                      "" ? (
                                                        <img
                                                          alt={user.name}
                                                          src={
                                                            process.env
                                                              .REACT_APP_USER_API_CLOUD_IMG_PATH +
                                                            user.profile_pic
                                                          }
                                                        />
                                                      ) : (
                                                        <User />
                                                      )}
                                                    </div>
                                                    <div>
                                                      <h4>{user.name}</h4>
                                                      <p>{user.email}</p>
                                                    </div>
                                                    <div className="checkAddBtn">
                                                      {taskSelectedAssignee?.some(
                                                        (item) =>
                                                          item.id === user.id
                                                      )
                                                        ? "-"
                                                        : "+"}
                                                    </div>
                                                  </div>
                                                </>
                                              ))}
                                          </div>
                                          <div className="d-flex flex-wrap gap-3 align-content-center justify-content-between mt-3">
                                            <button
                                              className="colorOutlineBtn"
                                              onClick={() => {
                                                handleTaskAddAssignee(task);
                                              }}
                                            >
                                              Add Assignee
                                            </button>
                                            <button
                                              className="colorOutlineBtn"
                                              onClick={() => {
                                                setUserDropdownStates(
                                                  Array(19).fill(false)
                                                );
                                                setTaskSelectedAssignee([]);
                                              }}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}

                        <li>
                          <label
                            htmlFor={`task_select_${tasks?.length}`}
                            className="align-self-center "
                          >
                            <input
                              type="checkbox"
                              id={`task_select_${tasks?.length}`}
                              style={{ display: "none" }}
                              checked={selectedTasks?.includes(tasks?.length)}
                              onChange={(e) =>
                                handleTasksCheckBoxSelect(e, tasks?.length)
                              }
                              ref={addTaskRef}
                            />
                            {selectedTasks?.includes(tasks?.length) ? (
                              <div className="svg-box-2 mx-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="15"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M10 16.4L6 12.4L7.4 11L10 13.6L16.6 7L18 8.4L10 16.4Z"
                                    fill="black"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="svg-box mx-2"></div>
                            )}
                          </label>
                          <div className="w-100  d-flex align-items-center position-relative">
                            <div
                              className="d-flex justify-content-between application-lodge"
                              style={{ "min-width": "92%" }}
                            >
                              <div className="d-flex gap-3 align-items-center ">
                                <img
                                  src="/assets/Group 87.png"
                                  alt=""
                                  style={{ width: "18px", height: "18px" }}
                                />
                                <p className={`text_${newTask.stageTitle}`}>
                                  <input
                                    type="text"
                                    placeholder="Add description here..."
                                    className="task-desc-input"
                                    value={newTask.title}
                                    onChange={(e) =>
                                      setNewTask({
                                        ...newTask,
                                        title: e.target.value,
                                      })
                                    }
                                  />
                                </p>
                              </div>

                              <div className="stage-addTaskJobDiv">
                                {newTask.stageTitle === "" ? (
                                  <div
                                    className="addStage-btn "
                                    onClick={() => setShowStages(!showStages)}
                                  >
                                    + Add Stage
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setShowStages(!showStages)}
                                    className={`btn_${newTask?.stageTitle}`}
                                  >
                                    {StageList[newTask?.stageTitle]}
                                  </button>
                                )}
                                {showStages && (
                                  <div className="stage-addTaskJobDropdown">
                                    <div className="addTaskJobListScroll">
                                      <div className="addTaskJobListItems">
                                        {Object.keys(StageList).map((key) => (
                                          <div
                                            key={key}
                                            className={`addTaskJobStageItem ${key}`}
                                            onClick={() => {
                                              console.log("keyyy", key);
                                              setNewTask({
                                                ...newTask,
                                                stageTitle: key,
                                              });
                                              setShowStages(false);
                                            }}
                                          >
                                            {StageList[key]}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                              <div className=" d-flex align-items-center justify-content-end">
                                {selectedAssignee.length > 0 ? (
                                  <>
                                    {usersList
                                      .filter((user) =>
                                        selectedAssignee?.some(
                                          (item) => item.id === user.id
                                        )
                                      )
                                      .map((user, index) => (
                                        <>
                                          <div
                                            key={index}
                                            className={`UserImg addedUserImages ${index}`}
                                            style={{
                                              minWidth: "40px",
                                              zIndex: index,
                                            }}
                                          >
                                            {user.profile_pic !== "" ? (
                                              <img
                                                alt={user.name}
                                                src={
                                                  process.env
                                                    .REACT_APP_USER_API_CLOUD_IMG_PATH +
                                                  user.profile_pic
                                                }
                                              />
                                            ) : (
                                              <User />
                                            )}
                                          </div>
                                        </>
                                      ))}
                                    <div
                                      className="UserImg withAddBtn m-0"
                                      onClick={() =>
                                        setShowAssignee(!showAssignee)
                                      }
                                      style={{ minWidth: "40px", zIndex: "99" }}
                                    >
                                      <User />
                                    </div>
                                  </>
                                ) : (
                                  <div
                                    className="UserImg withAddBtn"
                                    onClick={() =>
                                      setShowAssignee(!showAssignee)
                                    }
                                    style={{ minWidth: "40px" }}
                                  >
                                    <User />
                                  </div>
                                )}
                                {showAssignee && (
                                  <div className="addAssigneeDropdown1">
                                    <div className="addTaskJobListScroll">
                                      <div className="addTaskJobListItems">
                                        <label className="addedAssignees">
                                          Assignees
                                        </label>
                                        <div className="addedAssigneeBorder">
                                          {usersList &&
                                            usersList
                                              .filter((user) =>
                                                selectedAssignee?.some(
                                                  (item) => item.id === user.id
                                                )
                                              )
                                              .map((user) => (
                                                <>
                                                  <div
                                                    key={user.id}
                                                    className={`addAssigneeDiv  ${
                                                      selectedAssignee?.some(
                                                        (item) =>
                                                          item.id === user.id
                                                      ) && "active"
                                                    }`}
                                                    onClick={() => {
                                                      console.log(
                                                        "user on click",
                                                        user
                                                      );
                                                      handleAssigneeClick(user);
                                                    }}
                                                  >
                                                    <div
                                                      className={` UserImg addedUserImages `}
                                                      style={{
                                                        minWidth: "40px",
                                                      }}
                                                    >
                                                      {user.profile_pic !==
                                                      "" ? (
                                                        <img
                                                          alt={user.name}
                                                          src={
                                                            process.env
                                                              .REACT_APP_USER_API_CLOUD_IMG_PATH +
                                                            user.profile_pic
                                                          }
                                                        />
                                                      ) : (
                                                        <User />
                                                      )}
                                                    </div>
                                                    <div>
                                                      <h4>{user.name}</h4>
                                                      <p>{user.email}</p>
                                                    </div>
                                                    <div className="checkAddBtn">
                                                      {selectedAssignee?.some(
                                                        (item) =>
                                                          item.id === user.id
                                                      )
                                                        ? "-"
                                                        : "+"}
                                                    </div>
                                                  </div>
                                                </>
                                              ))}
                                        </div>
                                        <label className="">
                                          Add Assignees
                                        </label>
                                        {usersList
                                          .filter(
                                            (user) =>
                                              !selectedAssignee?.some(
                                                (item) => item.id === user.id
                                              )
                                          )
                                          .map((user) => (
                                            <>
                                              <div
                                                key={user.id}
                                                className={`addAssigneeDiv ${
                                                  selectedAssignee?.some(
                                                    (item) =>
                                                      item.id === user.id
                                                  ) && "active"
                                                }`}
                                                onClick={() =>
                                                  handleAssigneeClick(user)
                                                }
                                              >
                                                <div
                                                  className={` UserImg addedUserImages `}
                                                  style={{ minWidth: "40px" }}
                                                >
                                                  {user.profile_pic !== "" ? (
                                                    <img
                                                      alt={user.name}
                                                      src={
                                                        process.env
                                                          .REACT_APP_USER_API_CLOUD_IMG_PATH +
                                                        user.profile_pic
                                                      }
                                                    />
                                                  ) : (
                                                    <User />
                                                  )}
                                                </div>
                                                <div>
                                                  <h4>{user.name}</h4>
                                                  <p>{user.email}</p>
                                                </div>
                                                <div className="checkAddBtn">
                                                  {selectedAssignee?.some(
                                                    (item) =>
                                                      item.id === user.id
                                                  )
                                                    ? "-"
                                                    : "+"}
                                                </div>
                                              </div>
                                            </>
                                          ))}
                                      </div>
                                      <div className="d-flex flex-wrap gap-3 align-content-center justify-content-between mt-3">
                                        <button
                                          className="colorOutlineBtn"
                                          onClick={handleAddAssignee}
                                        >
                                          Add Assignee
                                        </button>
                                        <button
                                          className="colorOutlineBtn"
                                          onClick={() =>
                                            handleCloseAddAssignee()
                                          }
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <p className="read-more">
                      Hide Task{" "}
                      <span className="downArrow">
                        <img src="/assets/downArrow.svg" alt="" />
                      </span>
                    </p>
                  </div>

                  <div className="progressInputSection">
                    <div
                      className="d-flex gap-3 "
                      style={{ marginBottom: "6px" }}
                    >
                      <p>Due/FUPOn</p>
                      <div
                        className="input-box position-relative"
                        style={{ textAlign: "left", cursor: "pointer" }}
                      >
                        <div
                          className="addTaskDueDateBtn my-2 "
                          onClick={() => setSelectDueDate(!selectDueDate)}
                        >
                          {state.due_date === ""
                            ? "DD/MM/YYYY"
                            : state.due_date}
                        </div>
                        {selectDueDate && (
                          <div className="datePickerDiv">
                            <Calendar
                              date={selectedDueDate}
                              onChange={handleSelectDueDate}
                              value={selectedDueDate}
                              calendarType="ISO 8601"
                              minDate={new Date()}
                              rangeColors={["#E2E31F"]}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className="d-flex gap-3 "
                      style={{ marginBottom: "6px" }}
                    >
                      <p>Latest Update</p>
                      <input
                        type="text"
                        name="latest_update"
                        id="latest_update"
                        placeholder="lorem ultrices, condimentum magna feugiat"
                        value={state.latest_update}
                        onChange={handleOnChange}
                        className="text-white"
                      />
                    </div>
                    <div
                      className="d-flex gap-3 "
                      style={{ marginBottom: "6px" }}
                    >
                      <p>Status</p>
                      <div className="status-addTaskJobDiv">
                        <button
                          className={`btm-statusBtn ${state.status} h-100`}
                          onClick={() => setShowStatuses(!showStatuses)}
                        >
                          {StatusList[state.status]
                            ? StatusList[state.status]
                            : "Select Status"}
                        </button>
                        {showStatuses && (
                          <div className="status-addTaskJobDropdown">
                            <div className="addTaskJobListScroll">
                              <div className="addTaskJobListItems">
                                {Object.keys(StatusList).map((key) => (
                                  <div
                                    key={key}
                                    className={`addTaskJobStageItem ${key}`}
                                    onClick={() => {
                                      setState({
                                        ...state,
                                        status: key,
                                      });
                                      setShowStatuses(false);
                                    }}
                                  >
                                    {StatusList[key]}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="d-flex gap-3 showMore  align-items-center my-5 justify-content-end">
                      {/* <img src="/assets/Frame 32.png" className="" alt="" />
                      <div className="showMoreLine ">
                        <p>Show More</p>
                        <p>+ Add Field</p>
                      </div> */}
                      <button
                        className={`save-btn h-100`}
                        onClick={handleCreateJob}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
                <div className="popup-section-right"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Add;
