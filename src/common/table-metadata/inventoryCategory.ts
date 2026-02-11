export const inventoryCategoryTableMetadata = {
    tableKey: "inventoryCategory",
    tableName: "InventoryCategory",

    columns: [
        { field: "categoryName", title: "Category Name" },
        { field: "level", title: "Category Level" },
        { field: "parentCategoryName", title: "Parent Category" },
        { field: "parentCategoryLevel", title: "Parent Level" },
        { field: "imageUrl", title: "Category Image" },

    ],

    actions: {
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canView: true,
        canToggleStatus: true
    }
};
