/**
 * Role-Based Access Control for SLD Editor.
 *
 * Roles:
 *   admin  — full access: import, edit, control, delete, manage users
 *   operator — view, control (open/close breakers), acknowledge alarms
 *   viewer — read-only: view SLD and live data
 */

export const Roles = {
  admin: {
    label: "Admin",
    color: "#dc2626",
    permissions: [
      "view", "edit", "import_scd", "import_dps",
      "control", "delete", "manage_users",
      "configure_layout", "export",
    ],
  },
  operator: {
    label: "Operator",
    color: "#d97706",
    permissions: [
      "view", "control",
      "acknowledge_alarms", "acknowledge_events",
    ],
  },
  viewer: {
    label: "Viewer",
    color: "#2563eb",
    permissions: [
      "view",
    ],
  },
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role, permission) {
  const roleConfig = Roles[role];
  return roleConfig?.permissions?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role.
 */
export function getPermissions(role) {
  return Roles[role]?.permissions || [];
}

/**
 * Default users for demo.
 */
export const defaultUsers = [
  { id: "admin-1", name: "Admin User", role: "admin", avatar: "A" },
  { id: "ops-1", name: "Shift Operator", role: "operator", avatar: "O" },
  { id: "view-1", name: "Viewer", role: "viewer", avatar: "V" },
];
