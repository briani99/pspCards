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

    var PspOverviewCard = XMLComposite.extend("sap.me.cards.PspOverviewCard", {
        metadata: {
            properties: {
                growing: {type: "boolean", defaultValue: false, group: "Designtime"},
                growingThreshold: {type: "int", defaultValue: 10, group: "Designtime"}
            }
        }
    });

    PspOverviewCard.prototype.init = function() {
        XMLComposite.prototype.init.apply(this, arguments);

        Card.setBusy(this, true);
    };

    PspOverviewCard.prototype.applySettings = function() {
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

    PspOverviewCard.prototype.onAfterRendering = function() {
        this.i18n = sap.ui.getCore().getLibraryResourceBundle("sap.me.cards");
        this.setSorterDialog();
    };

    PspOverviewCard.prototype.onUpdateFinished = function(oEvent) {
        var tableGrowing = this.byId("overviewTable");
        tableGrowing.setGrowingThreshold(this.getGrowingThreshold());
        tableGrowing.setGrowing(this.getGrowing());

        Card.setBusy(this, false);
    };

    PspOverviewCard.prototype.setProductTypeFilterModel = function() {
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

    PspOverviewCard.prototype.setSorterDialog = function() {
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

    PspOverviewCard.prototype.setSortProperty = function(sSortProperty) {
        var aSorterDialogData = this._oSorterDialogModel.getData();

        aSorterDialogData.forEach(function(oProperty) {
            oProperty.sortProperty = sSortProperty;
        });
    };


    PspOverviewCard.prototype.getSelectedProduct = function(oItem) {
        var oContext = oItem.getBindingContext("$" + this.alias + ".odata"),
            sPath = oContext.getPath(),
            oSelectedProduct = oContext.getObject(sPath);

        return oSelectedProduct;
    };

    PspOverviewCard.prototype.navigateToDetailPage = function(oEvent, sTab) {
        var oItem = oEvent.getSource(),
            sSelectedProductId = encodeURIComponent(this.getSelectedProduct(oItem).ID),
            oRouter = Router.getRouter("shellRouter");

        oRouter.navTo("productDetail", {
            productKey: sSelectedProductId,
            tab: sTab
        });
    };

    PspOverviewCard.prototype.navigateToProductDetailPage = function(oEvent) {
        this.navigateToDetailPage(oEvent, "overview");
    };

    PspOverviewCard.prototype.navigateToSystems = function(oEvent) {
        this.navigateToDetailPage(oEvent, "systems");
    };

    PspOverviewCard.prototype.navigateToEvents = function(oEvent) {
        this.navigateToDetailPage(oEvent, "events");
    };

    PspOverviewCard.prototype.navigateToOpenIncidents = function(oEvent) {
        this.navigateToDetailPage(oEvent, "openIncidents");
    };

    PspOverviewCard.prototype.navigateToLicenses = function(oEvent) {
        this.navigateToDetailPage(oEvent, "licenses");
    };

    PspOverviewCard.prototype.navigateToOrders = function(oEvent) {
        this.navigateToDetailPage(oEvent, "orders");
    };

    PspOverviewCard.prototype.onSort = function(oEvent) {
        var oSource = oEvent.getSource();

        this.byId("sorterDialog").openBy(oSource);
    };

 
    PspOverviewCard.prototype.handleSortDialogConfirm = function(oEvent) {
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

     PspOverviewCard.prototype._formatVisibility = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? true : false;
    };

    PspOverviewCard.prototype._formatLink = function(iVisibleCount, iTotalCount) {
        return iVisibleCount > 0 ? " / " + iTotalCount : iTotalCount;
    };

    PspOverviewCard.prototype._formatLinkExtended = function(bAuth, iVisibleCount, iTotalCount) {
        return (iVisibleCount > 0 && bAuth) ? " / " + iTotalCount : iTotalCount;
    };

    return PspOverviewCard;
}, /* bExport= */true);
