'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createUser, listUsers, updateUser } from '../../lib/api/client';
import type { ApiUser } from '../../lib/api/types';

export function UsersDashboard() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [message, setMessage] = useState('');

  async function hydrateUsers(): Promise<void> {
    const data = await listUsers();
    setUsers(data);
  }

  useEffect(() => {
    void hydrateUsers();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!newName.trim() || !newEmail.trim()) {
      return;
    }

    await createUser({
      name: newName.trim(),
      email: newEmail.trim(),
    });

    setNewName('');
    setNewEmail('');
    setMessage('User created.');
    await hydrateUsers();
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!editingId) {
      return;
    }

    await updateUser(editingId, {
      name: editingName,
      email: editingEmail,
    });

    setEditingId(null);
    setEditingName('');
    setEditingEmail('');
    setMessage('User updated.');
    await hydrateUsers();
  }

  return (
    <div>
      <header className="page-header">
        <h1>Team</h1>
        <p>Create and manage assignees used by response and issue workflows.</p>
      </header>

      {message ? (
        <div className="toast">
          {message}
          <button type="button" className="toast-close" onClick={() => setMessage('')}>
            &times;
          </button>
        </div>
      ) : null}

      <div className="section-card">
        <h2>Add Team Member</h2>
        <form
          onSubmit={(event) => void handleCreate(event)}
          style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
        >
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            style={{ flex: 1, minWidth: '160px' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            style={{ flex: 1, minWidth: '160px' }}
          />
          <button type="submit">Create</button>
        </form>
      </div>

      {editingId ? (
        <div className="section-card">
          <h2>Edit Member</h2>
          <form
            onSubmit={(event) => void handleUpdate(event)}
            style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
          >
            <input
              type="text"
              value={editingName}
              onChange={(event) => setEditingName(event.target.value)}
              style={{ flex: 1, minWidth: '160px' }}
            />
            <input
              type="email"
              value={editingEmail}
              onChange={(event) => setEditingEmail(event.target.value)}
              style={{ flex: 1, minWidth: '160px' }}
            />
            <button type="submit">Save</button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setEditingId(null);
                setEditingName('');
                setEditingEmail('');
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      ) : null}

      <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
        <h2 style={{ padding: '20px 20px 0' }}>Team Members</h2>
        <table className="data-table" style={{ marginTop: '14px' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th style={{ width: '80px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
                    {user.name}
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                <td>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setEditingId(user.id);
                      setEditingName(user.name);
                      setEditingEmail(user.email);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '32px' }}>
                  No team members yet. Add one above.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
