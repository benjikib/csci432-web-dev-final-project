import { useState } from "react";

function Settings() {
  // === required by assignment: a data variable with placeholder data ===
  const [data, setData] = useState({
    username: "Placeholder User",
    theme: "light",
    notifications: true,
  });

  // === simple interactions that update `data` ===
  const toggleNotifications = () =>
    setData(prev => ({ ...prev, notifications: !prev.notifications }));

  const toggleTheme = () =>
    setData(prev => ({ ...prev, theme: prev.theme === "light" ? "dark" : "light" }));

  const onNameChange = (e) =>
    setData(prev => ({ ...prev, username: e.target.value }));

  return (
    <div style={{ padding: 24 }}>
      <h1>Settings</h1>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Display Name
        </label>
        <input
          value={data.username}
          onChange={onNameChange}
          style={{ padding: 8, width: 280 }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={toggleTheme}>Toggle Theme</button>
        <span style={{ marginLeft: 12 }}>Current: {data.theme}</span>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={toggleNotifications}>
          {data.notifications ? "Disable" : "Enable"} Notifications
        </button>
        <span style={{ marginLeft: 12 }}>
          Status: {data.notifications ? "On" : "Off"}
        </span>
      </div>

      <pre style={{ marginTop: 24, background: "#f5f5f5", padding: 12 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default Settings;
