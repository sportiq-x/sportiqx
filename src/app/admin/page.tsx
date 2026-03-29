import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(value);
}

export default async function AdminPage() {
  const users = await prisma.waitlistEntry.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="admin-wrap">
      <section className="admin-head">
        <div>
          <h1>SportIQX Admin</h1>
          <p>Early access waitlist entries ({users.length})</p>
        </div>
        <form method="post" action="/api/admin/logout?next=/admin/login">
          <button type="submit" className="admin-logout-btn">
            Logout
          </button>
        </form>
      </section>

      <section className="admin-card">
        {users.length === 0 ? (
          <p className="admin-empty">No waitlist users found.</p>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Sports</th>
                  <th>Features</th>
                  <th>Feedback</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.location}</td>
                    <td>{user.sports || "-"}</td>
                    <td>{user.features || "-"}</td>
                    <td>{user.feedback || "-"}</td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
