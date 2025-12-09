export const SubModulesTableMetadata = {
  tableKey: "submodules",
  tableName: "Sub Modules",

  columns: [
    { field: "title", title: "Title" },
    { field: "key", title: "Key" },
    { field: "moduleId.title", title: "Module Name" }, 
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
