// Local-only: uses the secret key, which bypasses RLS.
//
// Usage:
//   node --env-file=.env scripts/manage-user.mjs create <username> <password>
//   node --env-file=.env scripts/manage-user.mjs set-password <username> <new-password>
import { createClient } from "@supabase/supabase-js";

// Must match src/lib/supabase.ts's USERNAME_DOMAIN.
const USERNAME_DOMAIN = "stash.invalid";
const usernameToEmail = (username) => `${username}@${USERNAME_DOMAIN}`;

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!supabaseUrl || !secretKey) {
  console.error("Missing PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Run with: node --env-file=.env scripts/manage-user.mjs ...");
  process.exit(1);
}

const admin = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email) {
  // The admin API has no "get by email" — page through listUsers and match.
  const perPage = 200;
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => u.email === email);
    if (match) return match;
    if (data.users.length < perPage) return null;
  }
}

function usage() {
  console.log(
    [
      "Usage:",
      "  node --env-file=.env scripts/manage-user.mjs create <username> <password>",
      "  node --env-file=.env scripts/manage-user.mjs set-password <username> <new-password>",
    ].join("\n"),
  );
}

async function main() {
  const [command, username, password] = process.argv.slice(2);

  if (command === "create") {
    if (!username || !password) return usage();
    const email = usernameToEmail(username);
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) throw error;
    console.log(`Created user ${username} (${data.user.id})`);
  } else if (command === "set-password") {
    if (!username || !password) return usage();
    const email = usernameToEmail(username);
    const user = await findUserByEmail(email);
    if (!user) throw new Error(`No user found with username ${username}`);
    const { data, error } = await admin.auth.admin.updateUserById(user.id, { password });
    if (error) throw error;
    console.log(`Updated password for ${username} (${data.user.id})`);
  } else {
    usage();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
