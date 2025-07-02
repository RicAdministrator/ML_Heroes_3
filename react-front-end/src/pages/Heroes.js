import useFetch from '../useFetch';
import '../App.css';
import { useState } from 'react';

const Heroes = () => {
  const [heroesData, setHeroesData] = useFetch("http://localhost:3001/api/heroes");
  const [rolesData, setRolesData] = useFetch("http://localhost:3001/api/roles");
  const [showUpsert, setShowUpsert] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [upsertErrorMsg, setUpsertErrorMsg] = useState([]);

  // Form state
  const [name, setName] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Update handler
  const handleUpdate = (heroObj) => {
    setName(heroObj.name);
    setImageURL(heroObj.image_url);

    const arRoles = heroObj.roles.split(" / ").map(item => item.toLowerCase().trim());
    const selectedIds = rolesData
      .filter(role => arRoles.includes(role.role.toLowerCase()))
      .map(role => role.id);
    setSelectedRoles(selectedIds);

    setDescription(heroObj.description);
    setEditingId(heroObj.id);
    setShowUpsert(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hero?")) return;
    try {
      const res = await fetch(`http://localhost:3001/api/heroes/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHeroesData((prev) => prev.filter((hero) => hero.id !== id));
        showSuccess("Hero deleted successfully!");
      } else {
        alert("Failed to delete hero.");
      }
    } catch (err) {
      alert("Error deleting hero.");
    }
  };

  // Save handler for add/update
  const handleSave = async (e) => {
    e.preventDefault();

    let saveErrors = [];

    if (name === "") {
      saveErrors.push("Name is required.");
    }
    else {
      const duplicateHero = heroesData.filter(hero => hero.name.toLowerCase() === name.trim().toLowerCase() && hero.id !== editingId);

      if (duplicateHero.length > 0) {
        saveErrors.push("Hero with this name already exists.");
      }
    }

    if (selectedRoles.length === 0) {
      saveErrors.push("At least one role must be selected.");
    }

    if (saveErrors.length > 0) {
      setUpsertErrorMsg(saveErrors);
      return;
    }

    let roleNames = [];
    selectedRoles.forEach(roleId => {
      const found = rolesData.find(r => r.id === roleId);
      if (found) {
        roleNames.push(found.role);
      }
    });

    const roleNamesString = roleNames.join(' / ');

    const newHero = {
      name,
      image_url: imageURL,
      roles: selectedRoles,
      rolesDisplay: roleNamesString,
      description: description,
    };

    try {
      let res, updated;
      if (editingId) {
        // UPDATE
        res = await fetch(`http://localhost:3001/api/heroes/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newHero),
        });
        if (res.ok) {
          updated = await res.json();
          setHeroesData((prev) =>
            prev.map((r) => (r.id === editingId ? updated : r))
          );
          showSuccess("Hero updated successfully!");
        } else {
          alert("Failed to update hero.");
          return;
        }
      } else {
        // ADD
        res = await fetch("http://localhost:3001/api/heroes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newHero),
        });
        if (res.ok) {
          updated = await res.json();
          setHeroesData((prev) => [...prev, updated]);
          showSuccess("Hero created successfully!");
        } else {
          alert("Failed to add hero.");
          return;
        }
      }
      setShowUpsert(false);
      clearUpsertForm();
      setEditingId(null);
    } catch (err) {
      alert("Error saving hero.");
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const clearUpsertForm = () => {
    setName('');
    setImageURL('');
    setSelectedRoles([]);
    setDescription('');
    setEditingId(null);
    setUpsertErrorMsg([]);
  };

  return <>
    {/* Show dvSearch only if showUpsert is false */}
    {!showUpsert && (
      <div id="dvSearch">
        <a
          id="lnkAddHero"
          className="link-style"
          onClick={() => { clearUpsertForm(); setShowUpsert(true); }}
          style={{ cursor: "pointer" }}
        >
          Add Hero
        </a>
        {successMsg && (
          <div id="dvSuccessMsg" className="w3-panel w3-pale-green w3-border">
            <h3>Success!</h3>
            <p>{successMsg}</p>
          </div>
        )}
        <table id="tblHeroes" style={{ marginTop: "5px" }}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Roles</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(heroesData) && heroesData.map((hero) => (
              <tr key={hero.id}>
                <td>
                  {hero.image_url
                    ? <img src={hero.image_url} alt="Avatar" style={{ height: "150px" }} />
                    : null}
                </td>
                <td>{hero.name}</td>
                <td>{hero.roles}</td>
                <td>{hero.description}</td>
                <td>
                  <button
                    className="w3-btn w3-blue"
                    onClick={() => handleUpdate(hero)}
                  >
                    Update
                  </button>
                  &nbsp;
                  <button
                    className="w3-btn w3-blue"
                    onClick={() => handleDelete(hero.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    {/* Show dvUpsert only if showUpsert is true */}
    {showUpsert && (
      <div id="dvUpsert">
        {Array.isArray(upsertErrorMsg) && upsertErrorMsg.length > 0 && (
          <div id="dvUpsertErrorMsg" className="w3-panel w3-pale-red w3-border">
            <h3>Please correct the following errors:</h3>
            {upsertErrorMsg.map((msg, idx) => <div key={idx}>{msg}</div>)}
            <p />
          </div>
        )}
        <div className="w3-card-4">
          <div className="w3-container w3-black" style={{ marginBottom: "5px" }}>
            <h2>{editingId ? "Update Hero" : "Add Hero"}</h2>
          </div>
          <form className="w3-container" onSubmit={handleSave}>
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="txtName">Name</label>
              <input
                id="txtName"
                className="w3-input w3-border"
                type="text"
                maxLength="50"
                onChange={e => setName(e.target.value)}
                value={name}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="txtImageURL">Image URL</label>
              <input
                id="txtImageURL"
                className="w3-input w3-border"
                type="text"
                maxLength="150"
                onChange={e => setImageURL(e.target.value)}
                value={imageURL}
              />
            </div>
            <div id="dvRoles" style={{ marginBottom: "20px" }}>
              Roles
              <br />
              {Array.isArray(rolesData) && rolesData.map((role) => (
                <span key={role.id} style={{ marginRight: "35px" }}>
                  <label htmlFor={`chk${role.id}`} style={{ marginRight: "5px" }}>{role.role}</label>
                  <input
                    type="checkbox"
                    id={`chk${role.id}`}
                    value={role.id}
                    checked={selectedRoles.includes(role.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedRoles(prev => [...prev, role.id]);
                      } else {
                        setSelectedRoles(prev => prev.filter(id => id !== role.id));
                      }
                    }}
                  />
                </span>
              ))}
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="txtDescription">Description</label>
              <input
                id="txtDescription"
                className="w3-input w3-border"
                type="text"
                maxLength="150"
                onChange={e => setDescription(e.target.value)}
                value={description}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <button id="btnSave" className="w3-btn w3-black" type="submit">
                Save
              </button>
              <button
                className="w3-btn w3-black"
                style={{ marginLeft: "5px" }}
                onClick={() => { clearUpsertForm(); setShowUpsert(false); }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>;
};

export default Heroes;