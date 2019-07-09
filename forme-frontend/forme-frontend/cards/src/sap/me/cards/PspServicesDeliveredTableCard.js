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

    var PspServicesDeliveredTableCard = XMLComposite.extend("sap.me.cards.PspServicesDeliveredTableCard", {
        metadata: {
            properties: {
                growing: {type: "boolean", defaultValue: false, group: "Designtime"},
                growingThreshold: {type: "int", defaultValue: 10, group: "Designtime"}
            }
        }
    });

    PspServicesDeliveredTableCard.prototype.init = function() {
        XMLComposite.prototype.init.apply(this, arguments);

        Card.setBusy(this, true);
    };

    PspServicesDeliveredTableCard.prototype.applySettings = function() {
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

    PspServicesDeliveredTableCard.prototype.onAfterRendering = function() {
        this.i18n = sap.ui.getCore().getLibraryResourceBundle("sap.me.cards");
        this.setSorterDialog();
    };

    PspServicesDeliveredTableCard.prototype.onUpdateFinished = function(oEvent) {
        var tableGrowing = this.byId("servicesDeliveredTable");
        tableGrowing.setGrowingThreshold(this.getGrowingThreshold());
        tableGrowing.setGrowing(this.getGrowing());

        Card.setBusy(this, false);
    };

    PspServicesDeliveredTableCard.prototype.setProductTypeFilterModel = function() {
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

    PspServicesDeliveredTableCard.prototype.setSorterDialog = function() {
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

    PspServicesDeliveredTableCard.prototype.setSortProperty = function(sSortProperty) {
        var aSorterDialogData = this._oSorterDialogModel.getData();

        aSorterDialogData.forEach(function(oProperty) {
            oProperty.sortProperty = sSortProperty;
        });
    };

    PspServicesDeliveredTableCard.prototype.filterProductsByType = function(sSelectedKey) {
        this._bInitialProductCounter = false;
        var oServicesDeliveredTable = this.byId("servicesDeliveredTable"),
            oServicesDeliveredTableFilter;

        if (sSelectedKey) {
            oServicesDeliveredTableFilter = new Filter({
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

        oServicesDeliveredTable.getBinding("items").filter(oServicesDeliveredTableFilter);
    };

    PspServicesDeliveredTableCard.prototype.filterPortfolioCategories = function(sSelectedProductTypeKey) {
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

    PspServicesDeliveredTableCard.prototype.getSelectedProduct = function(oItem) {
        var oContext = oItem.getBindingContext("$" + this.alias + ".odata"),
            sPath = oContext.getPath(),
            oSelectedProduct = oContext.getObject(sPath);

        return oSelectedProduct;
    };

    PspServicesDeliveredTableCard.prototype.navigateToDetailPage = function(oEvent, sTab) {
        var oItem = oEvent.getSource(),
            sSelectedProductId = encodeURIComponent(this.getSelectedProduct(oItem).ID),
            oRouter = Router.getRouter("shellRouter");

        oRouter.navTo("productDetail", {
            productKey: sSelectedProductId,
            tab: sTab
        });
    };

    PspServicesDeliveredTableCard.prototype.navigateToProductDetailPage = function(oEvent) {
        this.navigateToDetailPage(oEvent, "overview");
    };

    PspServicesDeliveredTableCard.prototype.navigateToSystems = function(oEvent) {
        this.navigateToDetailPage(oEvent, "systems");
    };

    PspServicesDeliveredTableCard.prototype.navigateToEvents = function(oEvent) {
        this.navigateToDetailPage(oEvent, "events");
    };

    PspServicesDeliveredTableCard.prototype.navigateToOpenIncidents = function(oEvent) {
        this.navigateToDetailPage(oEvent, "openIncidents");
    };

    PspServicesDeliveredTableCard.prototype.navigateToLicenses = function(oEvent) {
        this.navigateToDetailPage(oEvent, "licenses");
    };

    PspServicesDeliveredTableCard.prototype.navigateToOrders = function(oEvent) {
        this.navigateToDetailPage(oEvent, "orders");
    };

    PspServicesDeliveredTableCard.prototype.onSort = function(oEvent) {
        var oSource = oEvent.getSource();

        this.byId("sorterDialog").openBy(oSource);
    };

    PspServicesDeliveredTableCard.prototype.handleSortDialogConfirm = function(oEvent) {
        var oTable = this.byId("servicesDeliveredTable"),
            oBinding = oTable.getBinding("items"),
            oSource = oEvent.getSource(),
            oContext = oSource.getBindingContext("$" + this.alias + ".SorterDialog"),
            bDescending = oContext.getProperty("bDescending"),
            sSortColumn = oContext.getProperty("sortProperty"),
            aSorters = [];

        aSorters.push(new Sorter(sSortColumn, bDescending));
        oBinding.sort(aSorters);

    };

    PspServicesDeliveredTableCard.prototype._isNumberGreaterThanZero = function(iNumber) {
        return iNumber > 0 ? true : false;
    };

    PspServicesDeliveredTableCard.prototype._formatPortfolioCategoryName = function(sKey, sText) {
        return sText || sKey;
    };

    PspServicesDeliveredTableCard.prototype._formatLicensesOverConsumption = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? "sap-icon://message-warning" : "";
    };

    PspServicesDeliveredTableCard.prototype._formatLicensesOverConsumptionState = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? "Warning" : "None";
    };

    PspServicesDeliveredTableCard.prototype._formatTenantsDisrupted = function(iTenantsDisrupted) {
        return iTenantsDisrupted > 0 ? "sap-icon://message-warning" : "";
    };

    PspServicesDeliveredTableCard.prototype._formatTenantsDisruptedState = function(iTenantsDisrupted) {
        return iTenantsDisrupted > 0 ? "Warning" : "None";
    };

    PspServicesDeliveredTableCard.prototype._formatIncidentsRequiringAttentionState = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? "Error" : "None";
    };

    PspServicesDeliveredTableCard.prototype._formatIncidentsRequiringAttentionIcon = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? "sap-icon://message-error" : "";
    };

    PspServicesDeliveredTableCard.prototype._formatVisibility = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? true : false;
    };

    PspServicesDeliveredTableCard.prototype._formatLink = function(iVisibleCount, iTotalCount) {
        return iVisibleCount > 0 ? " / " + iTotalCount : iTotalCount;
    };

    PspServicesDeliveredTableCard.prototype._formatLinkExtended = function(bAuth, iVisibleCount, iTotalCount) {
        return (iVisibleCount > 0 && bAuth) ? " / " + iTotalCount : iTotalCount;
    };

    PspServicesDeliveredTableCard.prototype._formatDateToString = function(sDate) {
        var stringDate = sDate.replace("/Date(", "");
            stringDate = stringDate.replace(")/", "");
        var newDate = new Date();
        newDate.setTime(stringDate);
        var sYear  = (newDate.getFullYear()).toString();
        var sMonth = (newDate.getMonth()+1).toString();
        if (sMonth.length < 2){
            sMonth = "0"+ sMonth;
        }
        var sDay   = (newDate.getDate()).toString();
        var sFinalDate;
        if (sDate) {
            sFinalDate = sDay + "/" + sMonth + "/" + sYear;
        } else {
            sFinalDate = "";
        }
        return sFinalDate;
    };

    return PspServicesDeliveredTableCard;
}, /* bExport= */true);
