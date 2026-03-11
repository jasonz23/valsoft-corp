'use client';

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  AI_CATEGORIES,
  AI_CATEGORY_LABELS,
  ISSUE_STATUSES,
  ISSUE_STATUS_LABELS,
  type AiCategory,
  type IssueStatus,
} from '@valsoft/shared';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  addIssueNote,
  getIssue,
  listIssues,
  listUsers,
  updateIssue,
  updateIssueCategory,
} from '../../lib/api/client';
import type { ApiUser, IssueDetail, IssueListItem } from '../../lib/api/types';

function formatDate(value: string | null): string {
  if (!value) {
    return '\u2014';
  }

  return new Date(value).toLocaleString();
}

type IssueCardProps = {
  issue: IssueListItem;
  onSelect: (id: string) => void;
  isSelected: boolean;
};

function IssueCard({ issue, onSelect, isSelected }: IssueCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 9999 : undefined,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`card${isSelected ? ' selected' : ''}`}
      onClick={() => onSelect(issue.id)}
      {...attributes}
      {...listeners}
    >
      <div className="card-title">{issue.title}</div>
      <span className="card-subtitle">{issue.incomingEmail.subject}</span>
      <span className="badge" data-category={issue.incomingEmail.aiCategory || ''}>
        {issue.incomingEmail.aiCategory
          ? AI_CATEGORY_LABELS[issue.incomingEmail.aiCategory]
          : 'Unclassified'}
      </span>
      <div className="card-meta">
        <div className="card-meta-left">
          {issue.assignee ? (
            <span className="avatar">{issue.assignee.name.charAt(0).toUpperCase()}</span>
          ) : null}
          <small>{issue.assignee ? issue.assignee.name : 'Unassigned'}</small>
        </div>
        <small>{formatDate(issue.updatedAt)}</small>
      </div>
    </article>
  );
}

type DropColumnProps = {
  status: IssueStatus;
  issues: IssueListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function DropColumn({ status, issues, selectedId, onSelect }: DropColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className="kanban-column"
      data-status={status}
      style={isOver ? { outline: '2px solid var(--accent)', outlineOffset: '-2px' } : undefined}
    >
      <div className="kanban-column-header">
        {ISSUE_STATUS_LABELS[status]}
        <span className="count">{issues.length}</span>
      </div>
      <div className="kanban-column-cards">
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onSelect={onSelect}
            isSelected={selectedId === issue.id}
          />
        ))}
      </div>
    </div>
  );
}

export function IssuesDashboard() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<IssueDetail | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IssueStatus | ''>('');
  const [category, setCategory] = useState<AiCategory | ''>('');
  const [assigneeId, setAssigneeId] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  const [filterStatus, setFilterStatus] = useState<IssueStatus | ''>('');
  const [filterCategory, setFilterCategory] = useState<AiCategory | ''>('');
  const [filterAssignee, setFilterAssignee] = useState('');

  const drawerOpen = selected !== null;

  const closeDrawer = useCallback(() => {
    setSelectedId(null);
    setSelected(null);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && drawerOpen) {
        closeDrawer();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen, closeDrawer]);

  async function hydrateUsers(): Promise<void> {
    const data = await listUsers();
    setUsers(data);
  }

  async function hydrateIssues(): Promise<void> {
    const data = await listIssues({
      status: filterStatus || undefined,
      aiCategory: filterCategory || undefined,
      assigneeId: filterAssignee || undefined,
    });
    setIssues(data);

    if (selectedId && !data.find((item) => item.id === selectedId)) {
      setSelectedId(null);
      setSelected(null);
    }
  }

  async function hydrateSelected(id: string): Promise<void> {
    const detail = await getIssue(id);
    setSelected(detail);
    setTitle(detail.title);
    setDescription(detail.description ?? '');
    setStatus(detail.status);
    setCategory(detail.incomingEmail.aiCategory ?? '');
    setAssigneeId(detail.assigneeId ?? '');
  }

  useEffect(() => {
    void hydrateUsers();
  }, []);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    void hydrateIssues();
  }, [filterStatus, filterCategory, filterAssignee]);
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    if (selectedId) {
      void hydrateSelected(selectedId);
    }
  }, [selectedId]);

  const grouped = useMemo(
    () =>
      ISSUE_STATUSES.map((state) => ({
        state,
        items: issues.filter((item) => item.status === state),
      })),
    [issues],
  );

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    if (!event.over) {
      return;
    }

    const draggedIssueId = String(event.active.id);
    const targetStatus = String(event.over.id) as IssueStatus;
    const draggedIssue = issues.find((item) => item.id === draggedIssueId);

    if (!draggedIssue || draggedIssue.status === targetStatus) {
      return;
    }

    await updateIssue(draggedIssueId, { status: targetStatus });
    setIssues((current) =>
      current.map((issue) =>
        issue.id === draggedIssueId ? { ...issue, status: targetStatus } : issue,
      ),
    );

    if (selectedId === draggedIssueId) {
      setStatus(targetStatus);
    }
  }

  async function handleSave(): Promise<void> {
    if (!selected) {
      return;
    }

    await updateIssue(selected.id, {
      title,
      description,
      status: status || undefined,
      assigneeId: assigneeId || null,
    });

    if (category && category !== selected.incomingEmail.aiCategory) {
      await updateIssueCategory(selected.id, category);
    }

    setMessage('Issue saved.');
    await Promise.all([hydrateIssues(), hydrateSelected(selected.id)]);
  }

  async function handleAddNote(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selected || !note.trim()) {
      return;
    }

    await addIssueNote(selected.id, { content: note.trim() });
    setNote('');
    setMessage('Note added.');
    await hydrateSelected(selected.id);
  }

  return (
    <div>
      <header className="page-header">
        <h1>Issues</h1>
        <p>Track internal resolution with drag-and-drop workflow status.</p>
      </header>

      <div className="filter-bar">
        <select
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value as IssueStatus | '')}
        >
          <option value="">All statuses</option>
          {ISSUE_STATUSES.map((value) => (
            <option key={value} value={value}>
              {ISSUE_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(event) => setFilterCategory(event.target.value as AiCategory | '')}
        >
          <option value="">All categories</option>
          {AI_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {AI_CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
        <select
          value={filterAssignee}
          onChange={(event) => setFilterAssignee(event.target.value)}
        >
          <option value="">All assignees</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <button type="button" className="secondary" onClick={() => void hydrateIssues()}>
          Refresh
        </button>
      </div>

      {message ? (
        <div className="toast">
          {message}
          <button type="button" className="toast-close" onClick={() => setMessage('')}>
            &times;
          </button>
        </div>
      ) : null}

      <DndContext sensors={sensors} onDragEnd={(event) => void handleDragEnd(event)}>
        <div className="kanban">
          {grouped.map((column) => (
            <DropColumn
              key={column.state}
              status={column.state}
              issues={column.items}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      </DndContext>

      {/* Drawer backdrop */}
      <div
        className={`drawer-backdrop${drawerOpen ? ' open' : ''}`}
        onClick={closeDrawer}
      />

      {/* Drawer panel */}
      <aside className={`drawer${drawerOpen ? ' open' : ''}`}>
        {selected ? (
          <>
            <div className="drawer-header">
              <h2>{selected.title}</h2>
              <button type="button" className="drawer-close" onClick={closeDrawer}>
                &times;
              </button>
            </div>
            <div className="drawer-body">
              <div className="meta-list">
                <div>
                  <span className="meta-label">Email</span>
                  <span className="meta-value">{selected.incomingEmail.subject}</span>
                </div>
                <div>
                  <span className="meta-label">Sender</span>
                  <span className="meta-value">{selected.incomingEmail.senderEmail}</span>
                </div>
                <div>
                  <span className="meta-label">Updated</span>
                  <span className="meta-value">{formatDate(selected.updatedAt)}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as IssueStatus | '')}
                  >
                    {ISSUE_STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {ISSUE_STATUS_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value as AiCategory | '')}
                  >
                    <option value="">Select category</option>
                    {AI_CATEGORIES.map((value) => (
                      <option key={value} value={value}>
                        {AI_CATEGORY_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Assignee</label>
                <select
                  value={assigneeId}
                  onChange={(event) => setAssigneeId(event.target.value)}
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>

              <div className="button-row">
                <button type="button" onClick={() => void handleSave()}>
                  Save Issue
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    if (selected) void hydrateSelected(selected.id);
                  }}
                >
                  Reload
                </button>
              </div>

              <section className="notes-section">
                <h3>Notes</h3>
                <form
                  onSubmit={(event) => void handleAddNote(event)}
                  style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}
                >
                  <input
                    type="text"
                    placeholder="Add issue note..."
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit">Add</button>
                </form>
                {selected.notes.map((item) => (
                  <div key={item.id} className="note-item">
                    <div className="note-content">{item.content}</div>
                    <div className="note-meta">
                      {item.author?.name ?? 'Unknown'} &middot; {formatDate(item.createdAt)}
                    </div>
                  </div>
                ))}
              </section>
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
}
