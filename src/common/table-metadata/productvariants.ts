export const productVarientsTableMetadata = {
    tableKey: "productVarients",
    tableName: "Product Varients",

    columns: [
        { field: "productName", title: "Product Name" },
        { field: "attributeName", title: "Attribute Name" },
        { field: "attributeValue", title: "Attribute Value" },
        { field: "variantSku", title: "Code" },
        { field: "price", title: "Price" },
        { field: "stock",title:"Stock"},
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
