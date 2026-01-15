export const varientAttributeValuesTableMetadata = {
    tableKey: "varientAttributeValues",
    tableName: "Varient Attribute Values",

    columns: [
        { field: "productVariantSku", title: "Product Variant Code" },
        { field: "attributeName", title: "Attribute Name" },
        { field: "attributeValue", title: "Attribute Value" }
    
    ],

    actions: {
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canView: true,
        canToggleStatus: true
    }
};
