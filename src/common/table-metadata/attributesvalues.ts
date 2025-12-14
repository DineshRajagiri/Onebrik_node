export const attributesValuesTableMetadata = {
    tableKey: "attributesValues",
    tableName: "Attributes Values",

    columns: [
        { field: "attributename", title: "Attribute Name" },
        { field: "value", title: "Attribute Value" }
    ],

    actions: {
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canView: true,
        canToggleStatus: true
    }
};