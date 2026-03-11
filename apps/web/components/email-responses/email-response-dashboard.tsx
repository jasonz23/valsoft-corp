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
  EMAIL_RESPONSE_STATUSES,
  EMAIL_RESPONSE_STATUS_LABELS,
  type AiCategory,
  type EmailResponseStatus,
} from '@valsoft/shared';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  addEmailResponseNote,
  approveEmailResponse,
  getEmailResponse,
  listEmailResponses,
  listUsers,
  sendEmailResponsePlaceholder,
  updateEmailCategory,
  updateEmailResponse,
} from '../../lib/api/client';
import type { ApiUser, EmailResponseDetail, EmailResponseListItem } from '../../lib/api/types';

function formatDate(value: string | null): string {
  if (!value) {
    return '\u2014';
  }

  return new Date(value).toLocaleString();
}

type EmailCardProps = {
  response: EmailResponseListItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

function EmailCard({ response, isSelected, onSelect }: EmailCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: response.id,
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
      onClick={() => onSelect(response.id)}
      {...attributes}
      {...listeners}
    >
      <div className="card-title">{response.incomingEmail.subject}</div>
      <span className="card-subtitle">{response.incomingEmail.senderEmail}</span>
      <span className="badge" data-category={response.incomingEmail.aiCategory || ''}>
        {response.incomingEmail.aiCategory
          ? AI_CATEGORY_LABELS[response.incomingEmail.aiCategory]
          : 'Unclassified'}
      </span>
      <div className="card-meta">
        <div className="card-meta-left">
          {response.assignee ? (
            <span className="avatar">
              {response.assignee.name.charAt(0).toUpperCase()}
            </span>
          ) : null}
          <small>{response.assignee ? response.assignee.name : 'Unassigned'}</small>
        </div>
        <small>{formatDate(response.incomingEmail.processedAt)}</small>
      </div>
      <div className="card-preview">
        {response.draft.slice(0, 120)}
        {response.draft.length > 120 ? '\u2026' : ''}
      </div>
    </article>
  );
}

type EmailDropColumnProps = {
  status: EmailResponseStatus;
  items: EmailResponseListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
};

function EmailDropColumn({ status, items, selectedId, onSelect, loading }: EmailDropColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className="kanban-column"
      data-status={status}
      style={isOver ? { outline: '2px solid var(--accent)', outlineOffset: '-2px' } : undefined}
    >
      <div className="kanban-column-header">
        {EMAIL_RESPONSE_STATUS_LABELS[status]}
        <span className="count">{items.length}</span>
      </div>
      <div className="kanban-column-cards">
        {loading && items.length === 0 ? (
          <small style={{ color: 'var(--text-tertiary)', padding: '8px' }}>Loading...</small>
        ) : null}
        {items.map((response) => (
          <EmailCard
            key={response.id}
            response={response}
            isSelected={selectedId === response.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

export function EmailResponseDashboard() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const [responses, setResponses] = useState<EmailResponseListItem[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<EmailResponseDetail | null>(null);
  const [draft, setDraft] = useState('');
  const [category, setCategory] = useState<AiCategory | ''>('');
  const [status, setStatus] = useState<EmailResponseStatus | ''>('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [filterStatus, setFilterStatus] = useState<EmailResponseStatus | ''>('');
  const [filterCategory, setFilterCategory] = useState<AiCategory | ''>('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterSender, setFilterSender] = useState('');
  const [search, setSearch] = useState('');

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

  async function hydrateResponses(): Promise<void> {
    setLoading(true);
    try {
      const data = await listEmailResponses({
        status: filterStatus || undefined,
        aiCategory: filterCategory || undefined,
        assigneeId: filterAssignee || undefined,
        senderEmail: filterSender || undefined,
        search: search || undefined,
      });
      setResponses(data);
      if (selectedId && !data.find((item) => item.id === selectedId)) {
        setSelectedId(null);
        setSelected(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function hydrateSelected(id: string): Promise<void> {
    const detail = await getEmailResponse(id);
    setSelected(detail);
    setDraft(detail.draft);
    setCategory(detail.incomingEmail.aiCategory ?? '');
    setStatus(detail.status);
    setAssigneeId(detail.assigneeId ?? '');
  }

  useEffect(() => {
    void hydrateUsers();
  }, []);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    void hydrateResponses();
  }, [filterStatus, filterCategory, filterAssignee, filterSender, search]);
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    if (selectedId) {
      void hydrateSelected(selectedId);
    }
  }, [selectedId]);

  const grouped = useMemo(() => {
    return EMAIL_RESPONSE_STATUSES.map((state) => ({
      state,
      items: responses.filter((item) => item.status === state),
    }));
  }, [responses]);

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    if (!event.over) {
      return;
    }

    const draggedId = String(event.active.id);
    const targetStatus = String(event.over.id) as EmailResponseStatus;
    const draggedResponse = responses.find((item) => item.id === draggedId);

    if (!draggedResponse || draggedResponse.status === targetStatus) {
      return;
    }

    await updateEmailResponse(draggedId, { status: targetStatus });
    setResponses((current) =>
      current.map((item) =>
        item.id === draggedId ? { ...item, status: targetStatus } : item,
      ),
    );

    if (selectedId === draggedId) {
      setStatus(targetStatus);
    }
  }

  async function handleSave(): Promise<void> {
    if (!selected) {
      return;
    }

    await updateEmailResponse(selected.id, {
      draft,
      status: status || undefined,
      assigneeId: assigneeId || null,
    });

    if (category && category !== selected.incomingEmail.aiCategory) {
      await updateEmailCategory(selected.incomingEmail.id, category);
    }

    setMessage('Saved changes.');
    await Promise.all([hydrateResponses(), hydrateSelected(selected.id)]);
  }

  async function handleApprove(): Promise<void> {
    if (!selected) {
      return;
    }

    await approveEmailResponse(selected.id);
    setMessage('Marked as approved.');
    await Promise.all([hydrateResponses(), hydrateSelected(selected.id)]);
  }

  async function handleSendPlaceholder(): Promise<void> {
    if (!selected) {
      return;
    }

    const result = await sendEmailResponsePlaceholder(selected.id);
    setMessage(result.message);
  }

  async function handleAddNote(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selected || !note.trim()) {
      return;
    }

    await addEmailResponseNote(selected.id, {
      content: note.trim(),
    });

    setNote('');
    setMessage('Note added.');
    await hydrateSelected(selected.id);
  }

  return (
    <div>
      <header className="page-header">
        <h1>Email Responses</h1>
        <p>Review, edit, approve, and track outbound response workflow.</p>
      </header>

      <div className="filter-bar">
        <select
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value as EmailResponseStatus | '')}
        >
          <option value="">All statuses</option>
          {EMAIL_RESPONSE_STATUSES.map((value) => (
            <option key={value} value={value}>
              {EMAIL_RESPONSE_STATUS_LABELS[value]}
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
        <select value={filterAssignee} onChange={(event) => setFilterAssignee(event.target.value)}>
          <option value="">All assignees</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Filter sender email"
          value={filterSender}
          onChange={(event) => setFilterSender(event.target.value)}
        />
        <input
          type="text"
          placeholder="Search subject or sender"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button type="button" className="secondary" onClick={() => void hydrateResponses()}>
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
            <EmailDropColumn
              key={column.state}
              status={column.state}
              items={column.items}
              selectedId={selectedId}
              onSelect={setSelectedId}
              loading={loading}
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
              <h2>{selected.incomingEmail.subject}</h2>
              <button type="button" className="drawer-close" onClick={closeDrawer}>
                &times;
              </button>
            </div>
            <div className="drawer-body">
              <div className="meta-list">
                <div>
                  <span className="meta-label">Sender</span>
                  <span className="meta-value">{selected.incomingEmail.senderEmail}</span>
                </div>
                <div>
                  <span className="meta-label">Received</span>
                  <span className="meta-value">
                    {formatDate(selected.incomingEmail.receivedTimestamp)}
                  </span>
                </div>
                <div>
                  <span className="meta-label">Processed</span>
                  <span className="meta-value">
                    {formatDate(selected.incomingEmail.processedAt)}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Reply Draft</label>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={6}
                />
              </div>

              <div className="form-row">
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
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as EmailResponseStatus | '')
                    }
                  >
                    {EMAIL_RESPONSE_STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {EMAIL_RESPONSE_STATUS_LABELS[value]}
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

              <div className="button-row">
                <button type="button" onClick={() => void handleSave()}>
                  Save Changes
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => void handleApprove()}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => void handleSendPlaceholder()}
                >
                  Send
                </button>
              </div>

              <section className="notes-section">
                <h3>Original Email</h3>
                <div className="original-email">{selected.incomingEmail.body}</div>
              </section>

              <section className="notes-section">
                <h3>Notes</h3>
                <form
                  onSubmit={(event) => void handleAddNote(event)}
                  style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}
                >
                  <input
                    type="text"
                    placeholder="Add internal note..."
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
