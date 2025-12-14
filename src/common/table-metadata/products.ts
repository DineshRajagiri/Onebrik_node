export const productsTableMetadata = {
    tableKey: "products",
    tableName: "Products",

    columns: [
        { field: "productName", title: "Product Name" },
        { field: "description", title: "Description" },
        { field: "sku", title: "Code" },
        { field: "price", title: "Price" },
        { field: "mainCategoryName", title: "Main Category Name" },
        { field: "subCategoryName", title: "Sub Category Name" },
        { field: "subChildCategoryName", title: "SubChild Category Name" }
    ],

    actions: {
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canView: true,
        canToggleStatus: true
    }
};
