export const ModulesTableMetadata = {
  tableKey: "modules",
  tableName: "Modules",

  columns: [
    { field: "title", title: "Title" },
    { field: "key", title: "Key" },
    { field: "icon", title: "Icon" },
    { field: "sortOrder", title: "Sort Order" },
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
