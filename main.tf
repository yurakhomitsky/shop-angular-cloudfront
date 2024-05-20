terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.92.0"
    }
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
}


resource "azurerm_resource_group" "front_end_rg" {
  name     = "rg-frontend-sand-ne-001"
  location = "northeurope"
}

resource "azurerm_storage_account" "front_end_sa" {
  name     = "stfrontend001"
  location = azurerm_resource_group.front_end_rg.location

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"
  resource_group_name      = azurerm_resource_group.front_end_rg.name

  static_website {
    index_document = "index.html"
  }
}


resource "azurerm_resource_group" "product_service_rg" {
  location = "northeurope"
  name     = "rg-product-service-sand-ne-001"
}

resource "azurerm_app_configuration" "products_config" {
  location            = "northeurope"
  name                = "appconfig-products-service-sand-ne-001"
  resource_group_name = azurerm_resource_group.product_service_rg.name

  sku = "free"
}

/*

"stg": This could be an abbreviation for "storage", indicating that this resource is a storage account.
"sang": This could be an abbreviation for "sandbox" or "sangeet" or any other term that is relevant to your project or organization.
"products": This likely indicates that this storage account is related to a "products" service or feature in your application.
"fane": This could be an abbreviation for "function app north europe", indicating that this storage account is associated with a Function App in the North Europe region.
"002": This could be a version or instance number, indicating that this is the second storage account of this type.
*/

resource "azurerm_storage_account" "products_service_fa" {
  name     = "stgsangproductsfane777"
  location = "northeurope"

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"

  resource_group_name = azurerm_resource_group.product_service_rg.name
}

resource "azurerm_storage_share" "products_service_fa" {
  name  = "fa-products-service-share"
  quota = 2

  storage_account_name = azurerm_storage_account.products_service_fa.name
}

resource "azurerm_service_plan" "product_service_plan" {
  name     = "asp-product-service-sand-ne-001"
  location = "northeurope"

  os_type  = "Windows"
  sku_name = "Y1"

  resource_group_name = azurerm_resource_group.product_service_rg.name
}

resource "azurerm_application_insights" "products_service_fa" {
  name             = "appins-fa-products-service-sand-ne-001"
  application_type = "web"
  location         = "northeurope"


  resource_group_name = azurerm_resource_group.product_service_rg.name
}

/*
 To publish functions
 cd /path/to/your/functionapp
 npm run build
 az login
 func azure functionapp publish fa-products-service-ne-001
*/
resource "azurerm_windows_function_app" "products_service" {
  name     = "fa-products-service-ne-001"
  location = "northeurope"

  service_plan_id     = azurerm_service_plan.product_service_plan.id
  resource_group_name = azurerm_resource_group.product_service_rg.name

  storage_account_name       = azurerm_storage_account.products_service_fa.name
  storage_account_access_key = azurerm_storage_account.products_service_fa.primary_access_key

  functions_extension_version = "~4"
  builtin_logging_enabled     = false

  site_config {
    always_on = false

    application_insights_key               = azurerm_application_insights.products_service_fa.instrumentation_key
    application_insights_connection_string = azurerm_application_insights.products_service_fa.connection_string

    # For production systems set this to false, but consumption plan supports only 32bit workers
    use_32_bit_worker = true

    # Enable function invocations from Azure Portal.
    cors {
      allowed_origins = ["https://portal.azure.com"]
    }

    application_stack {
      node_version = "~16"
    }
  }

  app_settings = {
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.products_service_fa.primary_connection_string
    WEBSITE_CONTENTSHARE                     = azurerm_storage_share.products_service_fa.name
  }

  # The app settings changes cause downtime on the Function App. e.g. with Azure Function App Slots
  # Therefore it is better to ignore those changes and manage app settings separately off the Terraform.
  lifecycle {
    ignore_changes = [
      app_settings,
      site_config["application_stack"], // workaround for a bug when azure just "kills" your app
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-conn-string"]
    ]
  }
}

resource "azurerm_resource_group" "rg" {
  name     = "resource-group-products-service"
  location = "West Europe"
}

resource "azurerm_storage_account" "sa" {
  name                             = "productsservicesa777"
  resource_group_name              = azurerm_resource_group.rg.name
  location                         = azurerm_resource_group.rg.location
  account_tier                     = "Standard"
  account_replication_type         = "LRS" /*  GRS, RAGRS, ZRS, GZRS, RAGZRS */
  access_tier                      = "Cool"
  enable_https_traffic_only        = true
  allow_nested_items_to_be_public  = true
  shared_access_key_enabled        = true
  public_network_access_enabled    = true
}

resource "azurerm_storage_container" "sa_container" {
  name                  = "products-service-container"
  storage_account_name  = azurerm_storage_account.sa.name
  container_access_type = "private"
}

resource "azurerm_storage_blob" "sa_blob" {
  name                   = "products-service-blob"
  storage_account_name   = azurerm_storage_account.sa.name
  storage_container_name = azurerm_storage_container.sa_container.name
  type                   = "Block"
  access_tier            = "Cool"
}

resource "azurerm_windows_function_app" "import_service" {
  name     = "fa-import-service-ne-777"
  location = "northeurope"

  service_plan_id     = azurerm_service_plan.product_service_plan.id
  resource_group_name = azurerm_resource_group.rg.name

  storage_account_name       = azurerm_storage_account.sa.name
  storage_account_access_key = azurerm_storage_account.sa.primary_access_key

  functions_extension_version = "~4"
  builtin_logging_enabled     = false

  site_config {
    always_on = false
    # For production systems set this to false, but consumption plan supports only 32bit workers
    use_32_bit_worker = true

    # Enable function invocations from Azure Portal.
    cors {
      allowed_origins = ["https://portal.azure.com"]
    }

    application_stack {
      node_version = "~16"
    }
  }

  # The app settings changes cause downtime on the Function App. e.g. with Azure Function App Slots
  # Therefore it is better to ignore those changes and manage app settings separately off the Terraform.
  lifecycle {
    ignore_changes = [
      app_settings,
      site_config["application_stack"], // workaround for a bug when azure just "kills" your app
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-conn-string"]
    ]
  }
}



