export const timeOptions = ["5am - 11am", "11am - 5pm", "5pm - 11pm", "11pm - 5am"];
export const startingRegisterCash = 150; // daily cash summary starting register cash
export const rolesPriority = {
    employee:0,
    admin :1,
    superadmin:2,
}
export const orderTypes = {
    'sysco' : "Sysco",
    'restaurant-depot' : "Restaurant Depot",
    'uschef' : "Uschef",
    'special-online-order' : "Special Online Order",
}

export const locationAccessRules = {
    superadmin: "Always has access to all locations automatically",
    admin: "Can have one or more location access and can only assign/revoke access for locations they have access to",
    employee: "Can have one or more location access, assigned by an admin or superadmin"
}