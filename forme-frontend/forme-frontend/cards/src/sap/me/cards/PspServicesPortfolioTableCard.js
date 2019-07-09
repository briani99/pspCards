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

    var PspServicesPortfolioTableCard = XMLComposite.extend("sap.me.cards.PspServicesPortfolioTableCard", {
        metadata: {
            properties: {
                growing: {type: "boolean", defaultValue: false, group: "Designtime"},
                growingThreshold: {type: "int", defaultValue: 10, group: "Designtime"}
            }
        }
    });

    PspServicesPortfolioTableCard.prototype.init = function() {
        XMLComposite.prototype.init.apply(this, arguments);

        Card.setBusy(this, true);
    };

    PspServicesPortfolioTableCard.prototype.applySettings = function() {
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

    PspServicesPortfolioTableCard.prototype.onAfterRendering = function() {
        this.i18n = sap.ui.getCore().getLibraryResourceBundle("sap.me.cards");
        this.setSorterDialog();
    };

    PspServicesPortfolioTableCard.prototype.onUpdateFinished = function(oEvent) {
        var tableGrowing = this.byId("servicesPortfolioTable");
        tableGrowing.setGrowingThreshold(this.getGrowingThreshold());
        tableGrowing.setGrowing(this.getGrowing());

        Card.setBusy(this, false);
    };

    PspServicesPortfolioTableCard.prototype.setProductTypeFilterModel = function() {
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

    PspServicesPortfolioTableCard.prototype.setSorterDialog = function() {
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

    PspServicesPortfolioTableCard.prototype.setSortProperty = function(sSortProperty) {
        var aSorterDialogData = this._oSorterDialogModel.getData();

        aSorterDialogData.forEach(function(oProperty) {
            oProperty.sortProperty = sSortProperty;
        });
    };

    PspServicesPortfolioTableCard.prototype.filterProductsByType = function(sSelectedKey) {
        this._bInitialProductCounter = false;
        var oServicesPortfolioTable = this.byId("ServicesPortfolioTable"),
            oServicesPortfolioTableFilter;

        if (sSelectedKey) {
            oServicesPortfolioTableFilter = new Filter({
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

        oServicesPortfolioTable.getBinding("items").filter(oServicesPortfolioTableFilter);
    };

    PspServicesPortfolioTableCard.prototype.filterPortfolioCategories = function(sSelectedProductTypeKey) {
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

    PspServicesPortfolioTableCard.prototype.getSelectedProduct = function(oItem) {
        var oContext = oItem.getBindingContext("$" + this.alias + ".odata"),
            sPath = oContext.getPath(),
            oSelectedProduct = oContext.getObject(sPath);

        return oSelectedProduct;
    };

    PspServicesPortfolioTableCard.prototype.navigateToDetailPage = function(oEvent, sTab) {
        var oItem = oEvent.getSource(),
            sSelectedProductId = encodeURIComponent(this.getSelectedProduct(oItem).ID),
            oRouter = Router.getRouter("shellRouter");

        oRouter.navTo("productDetail", {
            productKey: sSelectedProductId,
            tab: sTab
        });
    };

    PspServicesPortfolioTableCard.prototype.navigateToProductDetailPage = function(oEvent) {
        this.navigateToDetailPage(oEvent, "overview");
    };

    PspServicesPortfolioTableCard.prototype.navigateToSystems = function(oEvent) {
        this.navigateToDetailPage(oEvent, "systems");
    };

    PspServicesPortfolioTableCard.prototype.navigateToEvents = function(oEvent) {
        this.navigateToDetailPage(oEvent, "events");
    };

    PspServicesPortfolioTableCard.prototype.navigateToOpenIncidents = function(oEvent) {
        this.navigateToDetailPage(oEvent, "openIncidents");
    };

    PspServicesPortfolioTableCard.prototype.navigateToLicenses = function(oEvent) {
        this.navigateToDetailPage(oEvent, "licenses");
    };

    PspServicesPortfolioTableCard.prototype.navigateToOrders = function(oEvent) {
        this.navigateToDetailPage(oEvent, "orders");
    };

    PspServicesPortfolioTableCard.prototype.onSort = function(oEvent) {
        var oSource = oEvent.getSource();

        this.byId("sorterDialog").openBy(oSource);
    };

     PspServicesPortfolioTableCard.prototype.handleSortDialogConfirm = function(oEvent) {
        var oTable = this.byId("ServicesPortfolioTable"),
            oBinding = oTable.getBinding("items"),
            oSource = oEvent.getSource(),
            oContext = oSource.getBindingContext("$" + this.alias + ".SorterDialog"),
            bDescending = oContext.getProperty("bDescending"),
            sSortColumn = oContext.getProperty("sortProperty"),
            aSorters = [];

        aSorters.push(new Sorter(sSortColumn, bDescending));
        oBinding.sort(aSorters);

    };

    PspServicesPortfolioTableCard.prototype._isNumberGreaterThanZero = function(iNumber) {
        return iNumber > 0 ? true : false;
    };

    PspServicesPortfolioTableCard.prototype._formatPortfolioCategoryName = function(sKey, sText) {
        return sText || sKey;
    };

    PspServicesPortfolioTableCard.prototype._formatLicensesOverConsumption = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? "sap-icon://message-warning" : "";
    };

    PspServicesPortfolioTableCard.prototype._formatLicensesOverConsumptionState = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? "Warning" : "None";
    };

    PspServicesPortfolioTableCard.prototype._formatTenantsDisrupted = function(iTenantsDisrupted) {
        return iTenantsDisrupted > 0 ? "sap-icon://message-warning" : "";
    };

    PspServicesPortfolioTableCard.prototype._formatTenantsDisruptedState = function(iTenantsDisrupted) {
        return iTenantsDisrupted > 0 ? "Warning" : "None";
    };

    PspServicesPortfolioTableCard.prototype._formatIncidentsRequiringAttentionState = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? "Error" : "None";
    };

    PspServicesPortfolioTableCard.prototype._formatIncidentsRequiringAttentionIcon = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? "sap-icon://message-error" : "";
    };

    PspServicesPortfolioTableCard.prototype._formatVisibility = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? true : false;
    };

    PspServicesPortfolioTableCard.prototype._formatLink = function(iVisibleCount, iTotalCount) {
        return iVisibleCount > 0 ? " / " + iTotalCount : iTotalCount;
    };

    PspServicesPortfolioTableCard.prototype._formatLinkExtended = function(bAuth, iVisibleCount, iTotalCount) {
        return (iVisibleCount > 0 && bAuth) ? " / " + iTotalCount : iTotalCount;
    };

    return PspServicesPortfolioTableCard;
}, /* bExport= */true);
