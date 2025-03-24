import { useEffect, useState } from "react";

export default function Todo() {
  const [title, setTitle] = useState("");
  const [description, setDesciption] = useState("");
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState(-1);

  // Edit
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDesciption] = useState("");
  const [editTime, setEditTime] = useState(""); // Time for editing a task

  // Time setter state for new task
  const [taskTime, setTaskTime] = useState("");

  // State to hold the current time
  const [currentTime, setCurrentTime] = useState("");

  const apiUrl = "http://localhost:8000";

  const handleSubmit = () => {
    setError(""); // Clear error before making the request
    if (title.trim() !== "" && description.trim() !== "") {
      fetch(apiUrl + "/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, time: taskTime }),
      })
        .then((res) => {
          if (res.ok) {
            // Add item to the list
            setTodos([...todos, { title, description, time: taskTime }]);
            setTitle("");
            setDesciption("");
            setTaskTime(""); // Clear task time
            setMessage("Item added successfully");
            setTimeout(() => {
              setMessage("");
            }, 3000);
          } else {
            setError("Unable to create Todo item");
          }
        })
        .catch(() => {
          setError("Unable to create Todo item");
        });
    } else {
      setError("Title and Description cannot be empty");
    }
  };

  useEffect(() => {
    // Fetch existing todos
    getItems();

    // Update the current time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const getItems = () => {
    fetch(apiUrl + "/todos")
      .then((res) => res.json())
      .then((res) => {
        setTodos(res);
      });
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditTitle(item.title);
    setEditDesciption(item.description);
    setEditTime(item.time); // Set the time for editing
    setError(""); // Clear error when starting edit
  };

  const handleUpdate = () => {
    setError(""); // Clear error before making the request

    if (editTitle.trim() !== "" && editDescription.trim() !== "") {
      fetch(apiUrl + "/todos/" + editId, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          time: editTime, // Update time
        }),
      })
        .then((res) => {
          if (res.ok) {
            // Update item in the list
            const updatedTodos = todos.map((item) => {
              if (item._id === editId) {
                item.title = editTitle;
                item.description = editDescription;
                item.time = editTime; // Update the time of the task
              }
              return item;
            });

            setTodos(updatedTodos);
            setEditTitle("");
            setEditDesciption("");
            setEditTime(""); // Reset edit time
            setMessage("Item updated successfully");
            setTimeout(() => {
              setMessage("");
            }, 3000);

            setEditId(-1);
          } else {
            setError("Unable to update Todo item. Server error.");
            console.error("Update request failed with status:", res.status);
          }
        })
        .catch(() => {
          setError("Unable to update Todo item. Network error.");
          console.error("Network error when updating item.");
        });
    } else {
      setError("Title and Description cannot be empty");
    }
  };

  const handleEditCancel = () => {
    setEditId(-1);
    setEditTitle("");
    setEditDesciption("");
    setEditTime(""); // Reset time when canceling edit
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure want to delete?")) {
      fetch(apiUrl + "/todos/" + id, {
        method: "DELETE",
      })
        .then(() => {
          const updatedTodos = todos.filter((item) => item._id !== id);
          setTodos(updatedTodos);
          setMessage("Item deleted successfully");
          setTimeout(() => {
            setMessage("");
          }, 3000);
          setError(""); // Clear error after successful delete
        })
        .catch(() => {
          setError("Unable to delete Todo item");
        });
    }
  };

  return (
    <>
      <div className="container-fluid" style={{ backgroundColor: "#121212" }}>
        <div className="row p-4 bg-dark text-light rounded shadow-lg mb-4">
          <h1 className="display-4 font-weight-bold text-center">ToDo List</h1>
        </div>

        <div className="row mb-4">
          <div className="col-12 text-center">
            <h4 className="text-white">
              Current Time: <span>{currentTime}</span>
            </h4>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12 col-md-6 offset-md-3">
            <h3 className="text-white">Add Item +</h3>
            {message && <p className="text-success">{message}</p>}
            <div className="form-group d-flex gap-3">
              <input
                placeholder="Title"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                className="form-control"
                type="text"
              />
              <input
                placeholder="Description"
                onChange={(e) => setDesciption(e.target.value)}
                value={description}
                className="form-control"
                type="text"
              />
              <input
                type="time"
                onChange={(e) => setTaskTime(e.target.value)}
                value={taskTime}
                className="form-control"
              />
              <button className="btn btn-primary" onClick={handleSubmit}>
                Submit
              </button>
            </div>
            {error && <p className="text-danger">{error}</p>}
          </div>
        </div>

        <div className="row">
          <div className="col-12 col-md-8 offset-md-2">
            <h3 className="text-white">Tasks</h3>
            <div className="list-group shadow-lg bg-dark rounded p-3">
              {todos.map((item) => (
                <li
                  key={item._id}
                  className="list-group-item bg-dark text-white d-flex justify-content-between align-items-center my-2 rounded"
                  style={{
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <div className="d-flex flex-column me-2">
                    {editId === -1 || editId !== item._id ? (
                      <>
                        <span className="fw-bold">{item.title}</span>
                        <span>{item.description}</span>
                        <span>Time: {item.time || "No time set"}</span>
                      </>
                    ) : (
                      <>
                        <div className="form-group d-flex gap-3">
                          <input
                            placeholder="Title"
                            onChange={(e) => setEditTitle(e.target.value)}
                            value={editTitle}
                            className="form-control"
                            type="text"
                          />
                          <input
                            placeholder="Description"
                            onChange={(e) => setEditDesciption(e.target.value)}
                            value={editDescription}
                            className="form-control"
                            type="text"
                          />
                          <input
                            type="time"
                            onChange={(e) => setEditTime(e.target.value)}
                            value={editTime}
                            className="form-control"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    {editId === -1 ? (
                      <button className="btn btn-warning" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                    ) : (
                      <button className="btn btn-warning" onClick={handleUpdate}>
                        Update
                      </button>
                    )}
                    {editId === -1 ? (
                      <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>
                        Delete
                      </button>
                    ) : (
                      <button className="btn btn-danger" onClick={handleEditCancel}>
                        Cancel
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
