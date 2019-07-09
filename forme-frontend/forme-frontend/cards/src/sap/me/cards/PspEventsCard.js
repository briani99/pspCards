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

    var PspEventsCard = XMLComposite.extend("sap.me.cards.PspEventsCard", {
        metadata: {
            properties: {
                growing: {type: "boolean", defaultValue: false, group: "Designtime"},
                growingThreshold: {type: "int", defaultValue: 10, group: "Designtime"}
            }
        }
    });

    PspEventsCard.prototype.init = function() {
        XMLComposite.prototype.init.apply(this, arguments);

        Card.setBusy(this, true);
    };

    PspEventsCard.prototype.applySettings = function() {
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

    PspEventsCard.prototype.onAfterRendering = function() {
        this.i18n = sap.ui.getCore().getLibraryResourceBundle("sap.me.cards");
        this.setSorterDialog();
    };

    PspEventsCard.prototype.onUpdateFinished = function(oEvent) {
        var tableGrowing = this.byId("eventsTable");
        tableGrowing.setGrowingThreshold(this.getGrowingThreshold());
        tableGrowing.setGrowing(this.getGrowing());

        Card.setBusy(this, false);
    };

    PspEventsCard.prototype.setProductTypeFilterModel = function() {
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

    PspEventsCard.prototype.setSorterDialog = function() {
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

    PspEventsCard.prototype.setSortProperty = function(sSortProperty) {
        var aSorterDialogData = this._oSorterDialogModel.getData();

        aSorterDialogData.forEach(function(oProperty) {
            oProperty.sortProperty = sSortProperty;
        });
    };

    PspEventsCard.prototype.filterProductsByType = function(sSelectedKey) {
        this._bInitialProductCounter = false;
        var oEventsTable = this.byId("eventsTable"),
            oEventsTableFilter;

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

        oEventsTable.getBinding("items").filter(oEventsTableFilter);
    };

    PspEventsCard.prototype.filterPortfolioCategories = function(sSelectedProductTypeKey) {
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

    PspEventsCard.prototype.getSelectedProduct = function(oItem) {
        var oContext = oItem.getBindingContext("$" + this.alias + ".odata"),
            sPath = oContext.getPath(),
            oSelectedProduct = oContext.getObject(sPath);

        return oSelectedProduct;
    };

    PspEventsCard.prototype.navigateToDetailPage = function(oEvent, sTab) {
        var oItem = oEvent.getSource(),
            sSelectedProductId = encodeURIComponent(this.getSelectedProduct(oItem).ID),
            oRouter = Router.getRouter("shellRouter");

        oRouter.navTo("productDetail", {
            productKey: sSelectedProductId,
            tab: sTab
        });
    };

    PspEventsCard.prototype.navigateToProductDetailPage = function(oEvent) {
        this.navigateToDetailPage(oEvent, "overview");
    };

    PspEventsCard.prototype.navigateToSystems = function(oEvent) {
        this.navigateToDetailPage(oEvent, "systems");
    };

    PspEventsCard.prototype.navigateToEvents = function(oEvent) {
        this.navigateToDetailPage(oEvent, "events");
    };

    PspEventsCard.prototype.navigateToOpenIncidents = function(oEvent) {
        this.navigateToDetailPage(oEvent, "openIncidents");
    };

    PspEventsCard.prototype.navigateToLicenses = function(oEvent) {
        this.navigateToDetailPage(oEvent, "licenses");
    };

    PspEventsCard.prototype.navigateToOrders = function(oEvent) {
        this.navigateToDetailPage(oEvent, "orders");
    };

    PspEventsCard.prototype.onSort = function(oEvent) {
        var oSource = oEvent.getSource();

        this.byId("sorterDialog").openBy(oSource);
    };

    PspEventsCard.prototype.handleSortDialogConfirm = function(oEvent) {
        var oTable = this.byId("eventsTable"),
            oBinding = oTable.getBinding("items"),
            oSource = oEvent.getSource(),
            oContext = oSource.getBindingContext("$" + this.alias + ".SorterDialog"),
            bDescending = oContext.getProperty("bDescending"),
            sSortColumn = oContext.getProperty("sortProperty"),
            aSorters = [];

        aSorters.push(new Sorter(sSortColumn, bDescending));
        oBinding.sort(aSorters);

    };

    PspEventsCard.prototype._formatLink = function(iVisibleCount, iTotalCount) {
        return iVisibleCount > 0 ? " / " + iTotalCount : iTotalCount;
    };

    return PspEventsCard;
}, /* bExport= */true);