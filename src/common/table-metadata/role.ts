export const RolesTableMetadata = {
  tableKey: "roles",
  tableName: "Roles",

  columns: [
    { field: "name", title: "Role Name" },
    { field: "description", title: "Description" },
    { field: "isActive", title: "Active" }
  ],

  actions: {
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canToggleStatus: true
  }
};
