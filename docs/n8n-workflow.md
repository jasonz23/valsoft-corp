# n8n Workflow Setup (Gmail Trigger → NestJS)

## Nodes
1. Gmail Trigger
2. Optional IF/Filter node
3. HTTP Request node to backend ingestion endpoint

## HTTP Request
- Method: `POST`
- URL: `http://localhost:4000/api/emails/ingest`
- Headers: `Content-Type: application/json`
- Body (JSON):

```json
{
  "subject": "{{ $json.subject }}",
  "body": "{{ $json.textPlain || $json.snippet || '' }}",
  "senderEmail": "{{ $json.from.email }}",
  "messageId": "{{ $json.id }}",
  "receivedTimestamp": "{{ $json.internalDate }}"
}
```

## Notes
- `receivedTimestamp` may be ISO or Gmail milliseconds. The backend normalizes either format.
- Duplicate `messageId` reprocesses and updates the existing record.
- Endpoint intentionally remains open for current scope.
