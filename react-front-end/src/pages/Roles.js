import useFetch from '../useFetch';
import '../App.css';
import { useState } from 'react';

const Roles = () => {
  const [data, setData] = useFetch("http://localhost:3001/api/roles");
  const [showUpsert, setShowUpsert] = useState(false);
  const [dataHeroRoles, setDataHeroRoles] = useFetch("http://localhost:3001/api/hero_roles");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchErrorMsg, setSearchErrorMsg] = useState("");
  const [upsertErrorMsg, setUpsertErrorMsg] = useState("");

  // Form state
  const [role, setRole] = useState('');
  const [logoURL, setLogoURL] = useState('');
  const [primaryFunction, setPrimaryFunction] = useState('');
  const [keyAttributes, setKeyAttributes] = useState('');
  const [editingId, setEditingId] = useState(null); // <--- NEW

  const handleDelete = async (id) => {
    setSearchErrorMsg("");
    // Prevent delete if role is referenced in dataHeroRoles
    if (Array.isArray(dataHeroRoles) && dataHeroRoles.some(hr => hr.role_id === id)) {
      showSearchError("Cannot delete: This role is assigned to one or more heroes.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      const res = await fetch(`http://localhost:3001/api/roles/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setData((prev) => prev.filter((role) => role.id !== id));
        showSuccess("Role deleted successfully!");
      } else {
        alert("Failed to delete role.");
      }
    } catch (err) {
      alert("Error deleting role.");
    }
  };

  // Update handler
  const handleUpdate = (roleObj) => {
    setRole(roleObj.role);
    setLogoURL(roleObj.logo_url);
    setPrimaryFunction(roleObj.primary_function);
    setKeyAttributes(roleObj.key_attributes);
    setEditingId(roleObj.id); // <--- set editing id
    setShowUpsert(true);
  };

  // Save handler for add/update
  const handleSave = async (e) => {
    e.preventDefault();

    if (role === "") {
      setUpsertErrorMsg("Role is required.");
      return;
    }

    const duplicateRole = data.filter(roleData => roleData.role.toLowerCase() === role.trim().toLowerCase() && roleData.id !== editingId);
    if (duplicateRole.length > 0) {
      setUpsertErrorMsg("Role already exists.");
      return;
    }
    
    const newRole = {
      role,
      logo_url: logoURL,
      primary_function: primaryFunction,
      key_attributes: keyAttributes,
    };
    try {
      let res, updated;
      if (editingId) {
        // UPDATE
        res = await fetch(`http://localhost:3001/api/roles/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRole),
        });
        if (res.ok) {
          updated = await res.json();
          setData((prev) =>
            prev.map((r) => (r.id === editingId ? updated : r))
          );
          showSuccess("Role updated successfully!");
        } else {
          alert("Failed to update role.");
          return;
        }
      } else {
        // ADD
        res = await fetch("http://localhost:3001/api/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRole),
        });
        if (res.ok) {
          updated = await res.json();
          setData((prev) => [...prev, updated]);
          showSuccess("Role created successfully!");
        } else {
          alert("Failed to add role.");
          return;
        }
      }
      setShowUpsert(false);
      clearUpsertForm();
      setEditingId(null);
    } catch (err) {
      alert("Error saving role.");
    }
  };

  const clearUpsertForm = () => {
    setRole('');
    setLogoURL('');
    setPrimaryFunction('');
    setKeyAttributes('');
    setEditingId(null);
    setUpsertErrorMsg('');
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const showSearchError = (msg) => {
    setSearchErrorMsg(msg);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Show dvSearch only if showUpsert is false */}
      {!showUpsert && (
        <div id="dvSearch">
          <a
            id="lnkAddRole"
            className="link-style"
            onClick={() => { clearUpsertForm(); setShowUpsert(true); }}
            style={{ cursor: "pointer" }}
          >
            Add Role
          </a>
          {successMsg && (
            <div id="dvSuccessMsg" className="w3-panel w3-pale-green w3-border">
              <h3>Success!</h3>
              <p>{successMsg}</p>
            </div>
          )}
          {searchErrorMsg && (<div id="dvSearchErrorMsg" className="w3-panel w3-pale-red w3-border">
            <h3>Please correct the following errors:</h3>
            <p>{searchErrorMsg}</p>
          </div>)}
          <table id="tblRoles" style={{ marginTop: "5px" }}>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Role</th>
                <th>Primary Function</th>
                <th>Key Attributes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(data) && data.map((role) => (
                <tr key={role.id}>
                  <td>
                    {role.logo_url
                      ? <img src={role.logo_url} alt="Avatar" style={{ height: "75px" }} />
                      : null}
                  </td>
                  <td>{role.role}</td>
                  <td>{role.primary_function}</td>
                  <td>{role.key_attributes}</td>
                  <td>
                    <button
                      className="w3-btn w3-blue"
                      onClick={() => handleUpdate(role)}
                    >
                      Update
                    </button>
                    &nbsp;
                    <button
                      className="w3-btn w3-blue"
                      onClick={() => handleDelete(role.id)}
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
          {upsertErrorMsg && (<div id="dvUpsertErrorMsg" className="w3-panel w3-pale-red w3-border">
            <h3>Please correct the following errors:</h3>
            <p>{upsertErrorMsg}</p>
          </div>)}
          <div className="w3-card-4">
            <div className="w3-container w3-black" style={{ marginBottom: "5px" }}>
              <h2>{editingId ? "Update Role" : "Add Role"}</h2>
            </div>
            <form className="w3-container" onSubmit={handleSave}>
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="txtRole">Role</label>
                <input
                  id="txtRole"
                  className="w3-input w3-border"
                  type="text"
                  maxLength="50"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                // required
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="txtLogoURL">Logo URL</label>
                <input
                  id="txtLogoURL"
                  className="w3-input w3-border"
                  type="text"
                  maxLength="150"
                  value={logoURL}
                  onChange={e => setLogoURL(e.target.value)}
                // required
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="txtPrimaryFunction">Primary Function</label>
                <input
                  id="txtPrimaryFunction"
                  className="w3-input w3-border"
                  type="text"
                  maxLength="150"
                  value={primaryFunction}
                  onChange={e => setPrimaryFunction(e.target.value)}
                // required
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="txtKeyAttributes">Key Attributes</label>
                <input
                  id="txtKeyAttributes"
                  className="w3-input w3-border"
                  type="text"
                  maxLength="150"
                  value={keyAttributes}
                  onChange={e => setKeyAttributes(e.target.value)}
                // required
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
    </>
  );
};

export default Roles;