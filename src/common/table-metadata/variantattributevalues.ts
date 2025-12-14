export const varientAttributeValuesTableMetadata = {
    tableKey: "varientAttributeValues",
    tableName: "Varient Attribute Values",

    columns: [
        { field: "productVariantSku", title: "Product Variant Code" },
        { field: "attributeValue", title: "Variant Name" },
        { field: "attributeName", title: "Attribute Name" },
        
    
    ],

    actions: {
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canView: true,
        canToggleStatus: true
    }
};
