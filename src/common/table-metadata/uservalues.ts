export const UserTableMetadata = {
  tableKey: "users",
  tableName: "Users",

  columns: [
    { field: "name", title: "Name" },
    { field: "email", title: "Email" },
    { field: "roleId", title: "Role" },
    { field: "isActive", title: "Active" },
    { field: "createdAt", title: "Created At" }
  ],

  actions: {
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canToggleStatus: true
  }
};
