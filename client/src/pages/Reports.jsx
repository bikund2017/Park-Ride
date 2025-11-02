import React from "react";

function Reports({ reports, onUpvote, onRefreshReports, isLoadingReports }) {
  return (
    <div className="container-page">
      <div className="card">
        <div className="card-header">
          <h2>Community Reports</h2>
          <button
            className="btn"
            onClick={onRefreshReports}
            disabled={isLoadingReports}
          >
            {isLoadingReports ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        <div className="card-body">
          {reports.length === 0 && <p>No reports yet.</p>}
          <ul className="list">
            {reports.map((r) => (
              <li key={r.id} className="list-item">
                <div>
                  <div className="title">{r.title}</div>
                  <div className="meta">
                    {r.location} •{" "}
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                  </div>
                </div>
                <div className="actions">
                  <button className="btn" onClick={() => onUpvote(r.id)}>
                    ▲ {r.upvotes || 0}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Reports;
