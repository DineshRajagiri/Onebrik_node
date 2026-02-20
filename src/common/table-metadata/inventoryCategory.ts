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
    },
    filters: [
        {
            field: "level",
            type: "select",
            label: "Category Level",
            options: [
                { label: "Main", value: "MAIN" },
                { label: "Sub", value: "SUB" },
                { label: "Sub Child", value: "SUBCHILD" }
            ]
        },
        {
            field: "parentId",
            type: "select",
            label: "Category",
            dataSource: "inventoryCategories",
            labelKey: "categoryName",
            valueKey: "_id"
        },
        {
            field: "search",
            type: "text",
            label: "Search by Name"
        }
    ]

};
