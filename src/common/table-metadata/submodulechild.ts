export const SubModuleChildTableMetadata = {
  tableKey: "submodulechild",
  tableName: "Submodule Child",

  columns: [
    { field: "title", title: "Title" },
    // { field: "subModuleId.title", title: "Submodule" },
    // { field: "url", title: "URL" },
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
