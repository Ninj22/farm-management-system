"""
Central permission registry. Permissions are "resource.action" strings.
Phase 1: roles map to static permission sets defined here in code — not yet
a database-driven role/permission system (that's a later phase, if the farm's
actual usage ever needs custom roles beyond these eight).
"""
from app.models.user import UserRole

ROLE_PERMISSIONS: dict[UserRole, set[str]] = {
    UserRole.ADMIN: {"*"},  # wildcard — matches everything, including future permissions

    UserRole.FARM_MANAGER: {
        "farms.view", "farms.create", "farms.update",
        "stores.view", "stores.create",
        "inventory.view", "inventory.create", "inventory.update", "inventory.adjust",
        "suppliers.view", "suppliers.create", "suppliers.update",
        "purchases.view", "purchases.create",
        "livestock.view", "livestock.create", "livestock.update", "livestock.verify",
        "veterinary.view", "veterinary.create",
        "fields.view", "fields.create", "fields.update",
        "crops.view", "crops.create", "crops.update",
        "customers.view", "customers.create",
        "sales.view", "sales.create",
        "expenses.view", "expenses.create",
        "equipment.view", "equipment.create", "equipment.update", "equipment.maintain",
        "production.view", "production.create",
        "reports.view", "reports.export",
    },

    UserRole.INVENTORY_STAFF: {
        "inventory.view", "inventory.create", "inventory.update", "inventory.adjust",
        "suppliers.view", "suppliers.create",
        "purchases.view", "purchases.create",
        "equipment.view",
        "production.view",
        "reports.view", "reports.export",
    },

    UserRole.VETERINARY_STAFF: {
        "livestock.view", "livestock.update",  # create removed — farm manager/admin registers animals, vet clears/updates health status
        "veterinary.view", "veterinary.create",
        "inventory.view",  # needs to see medicine stock, not manage it
        "production.view",
        "reports.view",
    },

    UserRole.SALES_STAFF: {
        "sales.view", "sales.create",
        "customers.view", "customers.create",
        "livestock.view",   # needed to sell an animal
        "inventory.view",   # needed to sell a product
        "reports.view",
    },

    UserRole.GENERAL_STAFF: {
        "inventory.view",
        "livestock.view",
        "production.view", "production.create",  # logging milk/eggs collected is their core daily job
    },
}


def has_permission(role: UserRole, permission: str) -> bool:
    granted = ROLE_PERMISSIONS.get(role, set())
    if "*" in granted:
        return True
    if permission in granted:
        return True
    # supports coarse "resource.*" grants if ever added to a role's set
    resource = permission.split(".")[0]
    return f"{resource}.*" in granted
