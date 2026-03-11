import type { AiCategory, EmailResponseStatus, IssueStatus } from '@valsoft/shared';
import type {
  ApiUser,
  EmailResponseDetail,
  EmailResponseListItem,
  EmailResponseListFilters,
  IssueDetail,
  IssueListItem,
  IssueListFilters,
  IncomingEmailDetail,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function toQueryString(filters: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function listEmailResponses(filters: EmailResponseListFilters = {}) {
  const query = toQueryString({
    status: filters.status,
    aiCategory: filters.aiCategory,
    assigneeId: filters.assigneeId,
    senderEmail: filters.senderEmail,
    search: filters.search,
  });

  return apiFetch<EmailResponseListItem[]>(`/email-responses${query}`);
}

export async function getEmailResponse(id: string) {
  return apiFetch<EmailResponseDetail>(`/email-responses/${id}`);
}

export async function updateEmailResponse(
  id: string,
  payload: {
    draft?: string;
    status?: EmailResponseStatus;
    assigneeId?: string | null;
  },
) {
  return apiFetch<EmailResponseDetail>(`/email-responses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function approveEmailResponse(id: string) {
  return apiFetch<EmailResponseDetail>(`/email-responses/${id}/approve`, {
    method: 'POST',
  });
}

export async function sendEmailResponsePlaceholder(id: string) {
  return apiFetch<{ message: string; id: string }>(`/email-responses/${id}/send`, {
    method: 'POST',
  });
}

export async function addEmailResponseNote(
  id: string,
  payload: { content: string; authorId?: string },
) {
  return apiFetch(`/email-responses/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateEmailCategory(id: string, aiCategory: AiCategory) {
  return apiFetch<IncomingEmailDetail>(`/emails/${id}/category`, {
    method: 'PATCH',
    body: JSON.stringify({ aiCategory }),
  });
}

export async function listIssues(filters: IssueListFilters = {}) {
  const query = toQueryString({
    status: filters.status,
    aiCategory: filters.aiCategory,
    assigneeId: filters.assigneeId,
  });

  return apiFetch<IssueListItem[]>(`/issues${query}`);
}

export async function getIssue(id: string) {
  return apiFetch<IssueDetail>(`/issues/${id}`);
}

export async function updateIssue(
  id: string,
  payload: {
    title?: string;
    description?: string;
    status?: IssueStatus;
    assigneeId?: string | null;
  },
) {
  return apiFetch<IssueDetail>(`/issues/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function addIssueNote(id: string, payload: { content: string; authorId?: string }) {
  return apiFetch(`/issues/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateIssueCategory(id: string, aiCategory: AiCategory) {
  return apiFetch(`/issues/${id}/category`, {
    method: 'PATCH',
    body: JSON.stringify({ aiCategory }),
  });
}

export async function listUsers() {
  return apiFetch<ApiUser[]>('/users');
}

export async function createUser(payload: { name: string; email: string }) {
  return apiFetch<ApiUser>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateUser(id: string, payload: { name?: string; email?: string }) {
  return apiFetch<ApiUser>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
