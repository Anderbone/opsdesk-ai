import { Form } from "react-router";
import { FileSearch } from "lucide-react";
import { EmptyState } from "~/shared/ui/ui";
import type { TicketDocument } from "~/features/documents/domain/types";

export function DocumentExtractionPanel() {
  return (
    <div className="surface content-block">
      <h2>Document extraction demo</h2>
      <Form method="post" className="form-grid">
        <input type="hidden" name="intent" value="extract-document" />
        <div className="field full">
          <label htmlFor="documentText">Paste document text</label>
          <textarea
            id="documentText"
            name="documentText"
            defaultValue="PO-4481. Supplier invoice quantity 24 smoke detector bases. Delivery note quantity 20 received."
          />
        </div>
        <div className="field full">
          <button className="button button-secondary" type="submit">
            <FileSearch size={15} />
            Extract fields
          </button>
        </div>
      </Form>
    </div>
  );
}

export function DocumentsPanel({ documents }: { documents: TicketDocument[] }) {
  return (
    <div className="surface content-block">
      <h2>Documents</h2>
      {documents.length ? (
        <ul className="split-list">
          {documents.map((document) => (
            <li key={document.id}>
              <span>
                {document.fileName}
                <br />
                <span className="muted">{document.mismatchFlags[0] ?? "No mismatch flags"}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No documents" body="Paste sample text to create an extraction run." />
      )}
    </div>
  );
}
