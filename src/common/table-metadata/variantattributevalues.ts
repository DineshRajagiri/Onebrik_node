export const varientAttributeValuesTableMetadata = {
    tableKey: "varientAttributeValues",
    tableName: "Varient Attribute Values",

    columns: [
        { field: "variantName", title: "Variant Name" },
        { field: "attributename", title: "Attribute" },
        { field: "value", title: "Value" },
    
    ],

    actions: {
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canView: true,
        canToggleStatus: true
    }
};
