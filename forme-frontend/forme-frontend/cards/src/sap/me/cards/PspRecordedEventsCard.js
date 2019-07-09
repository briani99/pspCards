sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/XMLComposite",
    "sap/me/cards/Card",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/Router",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function(jQuery, XMLComposite, Card, JSONModel, Router, Filter, FilterOperator, Sorter) {
    "use strict";

    var PspRecordedEventsCard = XMLComposite.extend("sap.me.cards.PspRecordedEventsCard", {
        metadata: {
            properties: {
                growing: {type: "boolean", defaultValue: false, group: "Designtime"},
                growingThreshold: {type: "int", defaultValue: 10, group: "Designtime"}
            }
        }
    });

    PspRecordedEventsCard.prototype.init = function() {
        XMLComposite.prototype.init.apply(this, arguments);

        Card.setBusy(this, true);
    };

    PspRecordedEventsCard.prototype.applySettings = function() {
        XMLComposite.prototype.applySettings.apply(this, arguments);
        if (!this._bCardInitialized) {
            var oContent = this.getAggregation("_content"), oContext = this.data("context");

            oContent.setModel(this._oAuthModel = new JSONModel(), "$" + this.alias + ".auth");
            var oAuth = {};
            oAuth.systemStatusVisible = oContext.authorization.exists("INSTDISP") || oContext.authorization.exists("INSTPROD");
            oAuth.ordersVisible = oContext.authorization.exists("S4M_ORDERS") || oContext.authorization.exists("S4M_SWAGRM");

            this._oAuthModel.setData(oAuth);

            oContent.setModel(this._oODataModel = oContext.model, "$" + this.alias + ".odata");

            oContent.setModel(this._oProductTypeFilterModel = new JSONModel(), "$" + this.alias + ".ProductTypeFilter");
            this.setProductTypeFilterModel();
            this._bInitialProductCounter = true;

            oContent.setModel(this._oSorterDialogModel = new JSONModel(), "$" + this.alias + ".SorterDialog");

            this._bCardInitialized = true;
        }
    };

    PspRecordedEventsCard.prototype.onAfterRendering = function() {
        this.i18n = sap.ui.getCore().getLibraryResourceBundle("sap.me.cards");
        this.setSorterDialog();
    };

    PspRecordedEventsCard.prototype.onUpdateFinished = function(oEvent) {
        var tableGrowing = this.byId("recordedEventsTable");
        tableGrowing.setGrowingThreshold(this.getGrowingThreshold());
        tableGrowing.setGrowing(this.getGrowing());

        Card.setBusy(this, false);
    };

    PspRecordedEventsCard.prototype.setProductTypeFilterModel = function() {
        var aProductTypeList = [
            {
                typeName: "On-Premise",
                productsCounter: this._onPremiseProductsCounter
            },
            {
                typeName: "Cloud",
                productsCounter: this._cloudProductsCounter
            }
        ];

        this._oProductTypeFilterModel.setData(aProductTypeList);
    };

    PspRecordedEventsCard.prototype.setSorterDialog = function() {
        var aSorterData = [
            {
                bDescending: false,
                text: this.i18n.getText("products_sortAscending"),
                icon: "/images/ascending.svg",
                sortProperty: ""
            },
            {
                bDescending: true,
                text: this.i18n.getText("products_sortDescending"),
                icon: "/images/descending.svg",
                sortProperty: ""
            }
        ];

        this._oSorterDialogModel.setData(aSorterData);
    };

    PspRecordedEventsCard.prototype.setSortProperty = function(sSortProperty) {
        var aSorterDialogData = this._oSorterDialogModel.getData();

        aSorterDialogData.forEach(function(oProperty) {
            oProperty.sortProperty = sSortProperty;
        });
    };

    PspRecordedEventsCard.prototype.filterProductsByType = function(sSelectedKey) {
        this._bInitialProductCounter = false;
        var oRecordedEventsTable = this.byId("recordedEventsTable"),
            oRecordedEventsTableFilter;

        if (sSelectedKey) {
            oRecordedEventsTableFilter = new Filter({
                filters: [
                    new Filter({
                        path: "typeName",
                        operator: FilterOperator.EQ,
                        value1: sSelectedKey
                    }),
                    new Filter({
                        path: "typeName",
                        operator: FilterOperator.EQ,
                        value1: "Hybrid"
                    })
                ],
                and: false

            });
        }

        oRecordedEventsTable.getBinding("items").filter(oRecordedEventsTableFilter);
    };

    PspRecordedEventsCard.prototype.filterPortfolioCategories = function(sSelectedProductTypeKey) {
        var oPortfolioCategoriesComboBox = this.byId("productPortfolioCategorySelect");
        var oPortfolioCategoriesFilter = new Filter({
            filters: [
                new Filter({
                    path: "productType",
                    operator: FilterOperator.EQ,
                    value1: sSelectedProductTypeKey
                }),
                new Filter({
                    path: "productType",
                    operator: FilterOperator.EQ,
                    value1: "Hybrid"
                })
            ],
            and: false
        });

        oPortfolioCategoriesComboBox.getBinding("items").filter(oPortfolioCategoriesFilter);
    };

    PspRecordedEventsCard.prototype.getSelectedProduct = function(oItem) {
        var oContext = oItem.getBindingContext("$" + this.alias + ".odata"),
            sPath = oContext.getPath(),
            oSelectedProduct = oContext.getObject(sPath);

        return oSelectedProduct;
    };

    PspRecordedEventsCard.prototype.navigateToDetailPage = function(oEvent, sTab) {
        var oItem = oEvent.getSource(),
            sSelectedProductId = encodeURIComponent(this.getSelectedProduct(oItem).ID),
            oRouter = Router.getRouter("shellRouter");

        oRouter.navTo("productDetail", {
            productKey: sSelectedProductId,
            tab: sTab
        });
    };

    PspRecordedEventsCard.prototype.navigateToProductDetailPage = function(oEvent) {
        this.navigateToDetailPage(oEvent, "overview");
    };

    PspRecordedEventsCard.prototype.navigateToSystems = function(oEvent) {
        this.navigateToDetailPage(oEvent, "systems");
    };

    PspRecordedEventsCard.prototype.navigateToEvents = function(oEvent) {
        this.navigateToDetailPage(oEvent, "events");
    };

    PspRecordedEventsCard.prototype.navigateToOpenIncidents = function(oEvent) {
        this.navigateToDetailPage(oEvent, "openIncidents");
    };

    PspRecordedEventsCard.prototype.navigateToLicenses = function(oEvent) {
        this.navigateToDetailPage(oEvent, "licenses");
    };

    PspRecordedEventsCard.prototype.navigateToOrders = function(oEvent) {
        this.navigateToDetailPage(oEvent, "orders");
    };

    PspRecordedEventsCard.prototype.onSort = function(oEvent) {
        var oSource = oEvent.getSource();

        this.byId("sorterDialog").openBy(oSource);
    };

    PspRecordedEventsCard.prototype.sortByProduct = function(oEvent) {
        this.setSortProperty("name");
        this.onSort(oEvent);
    };

    PspRecordedEventsCard.prototype.sortByOrders = function(oEvent) {
        this.setSortProperty("orders");
        this.onSort(oEvent);
    };

    PspRecordedEventsCard.prototype.sortByLicenses = function(oEvent) {
        this.setSortProperty("licenses");
        this.onSort(oEvent);
    };

    PspRecordedEventsCard.prototype.sortByTenants = function(oEvent) {
        this.setSortProperty("tenants");
        this.onSort(oEvent);
    };

    PspRecordedEventsCard.prototype.sortByOpenIncidents = function(oEvent) {
        this.setSortProperty("incidents");

        this.onSort(oEvent);
    };

    PspRecordedEventsCard.prototype.handleSortDialogConfirm = function(oEvent) {
        var oTable = this.byId("overviewTable"),
            oBinding = oTable.getBinding("items"),
            oSource = oEvent.getSource(),
            oContext = oSource.getBindingContext("$" + this.alias + ".SorterDialog"),
            bDescending = oContext.getProperty("bDescending"),
            sSortColumn = oContext.getProperty("sortProperty"),
            aSorters = [];

        aSorters.push(new Sorter(sSortColumn, bDescending));
        oBinding.sort(aSorters);

    };

    PspRecordedEventsCard.prototype._isNumberGreaterThanZero = function(iNumber) {
        return iNumber > 0 ? true : false;
    };

    PspRecordedEventsCard.prototype._formatPortfolioCategoryName = function(sKey, sText) {
        return sText || sKey;
    };

    PspRecordedEventsCard.prototype._formatLicensesOverConsumption = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? "sap-icon://message-warning" : "";
    };

    PspRecordedEventsCard.prototype._formatLicensesOverConsumptionState = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? "Warning" : "None";
    };

    PspRecordedEventsCard.prototype._formatTenantsDisrupted = function(iTenantsDisrupted) {
        return iTenantsDisrupted > 0 ? "sap-icon://message-warning" : "";
    };

    PspRecordedEventsCard.prototype._formatTenantsDisruptedState = function(iTenantsDisrupted) {
        return iTenantsDisrupted > 0 ? "Warning" : "None";
    };

    PspRecordedEventsCard.prototype._formatIncidentsRequiringAttentionState = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? "Error" : "None";
    };

    PspRecordedEventsCard.prototype._formatIncidentsRequiringAttentionIcon = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? "sap-icon://message-error" : "";
    };

    PspRecordedEventsCard.prototype._formatVisibility = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? true : false;
    };

    PspRecordedEventsCard.prototype._formatLink = function(iVisibleCount, iTotalCount) {
        return iVisibleCount > 0 ? " / " + iTotalCount : iTotalCount;
    };

    PspRecordedEventsCard.prototype._formatLinkExtended = function(bAuth, iVisibleCount, iTotalCount) {
        return (iVisibleCount > 0 && bAuth) ? " / " + iTotalCount : iTotalCount;
    };
    
    PspRecordedEventsCard.prototype._formatIcon = function(sModuleId, sText) {
        var sSrcIcon = "sap-icon://calendar";
        switch(sModuleId) {
            case "1":
                sSrcIcon = "sap-icon://crm-sales";
            break;
            case "2":
                sSrcIcon = "sap-icon://e-learning";
            break;
            case "3":
                sSrcIcon = "sap-icon://performance";
            break;
            case "4":
                sSrcIcon = "sap-icon://paid-leave";
            break;
            case "5":
                sSrcIcon = "sap-icon://message-success";
            break;
            case "6":
                sSrcIcon = "sap-icon://batch-payments";
            break;
            case "7":
                sSrcIcon = "sap-icon://puzzle";
            break;
            case "8":
                sSrcIcon = "sap-icon://travel-expense-report";
            break;
            case "9":
                sSrcIcon = "sap-icon://shipping-status";
            break;            
            
            default:
                sSrcIcon = "sap-icon://calendar";
            }
        return sSrcIcon;
    };

    PspRecordedEventsCard.prototype._formatIconColor = function(sModuleId) {
        var sIconColor = "black";
        switch(sModuleId) {
            case "1":
                sIconColor = "#578FD9"; 			// blue
            break;
            case "2":
                sIconColor = "#BF399E";				// purple
            break;
            case "3":
                sIconColor = "#E38B16";				// orange
            break;
            case "4":
                sIconColor = "#7CA10C";				// green
            break;
            case "5":
                sIconColor = "#578FD9"; 			// blue
            break;
            case "6":
                sIconColor = "#DC7474";				// pink
            break;
            case "7":
                sIconColor = "#D04343";				// red
            break;
            case "8":
                sIconColor = "#7CA10C";				// green
            break;
            case "9":
                sIconColor = "#E38B16";				// orange
            break;
            
            default:
                sIconColor = "Black";
            }
        return sIconColor;
    };

    return PspRecordedEventsCard;
}, /* bExport= */true);
