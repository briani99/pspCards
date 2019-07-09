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

    var PspUpcomingEventsCard = XMLComposite.extend("sap.me.cards.PspUpcomingEventsCard", {
        metadata: {
            properties: {
                growing: {type: "boolean", defaultValue: false, group: "Designtime"},
                growingThreshold: {type: "int", defaultValue: 10, group: "Designtime"}
            }
        }
    });

    PspUpcomingEventsCard.prototype.init = function() {
        XMLComposite.prototype.init.apply(this, arguments);

        Card.setBusy(this, true);
    };

    PspUpcomingEventsCard.prototype.applySettings = function() {
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

    PspUpcomingEventsCard.prototype.onAfterRendering = function() {
        this.i18n = sap.ui.getCore().getLibraryResourceBundle("sap.me.cards");
        this.setSorterDialog();
    };

    PspUpcomingEventsCard.prototype.onUpdateFinished = function(oEvent) {
        var tableGrowing = this.byId("upcomingEventsTable");
        tableGrowing.setGrowingThreshold(this.getGrowingThreshold());
        tableGrowing.setGrowing(this.getGrowing());

        Card.setBusy(this, false);
    };

    PspUpcomingEventsCard.prototype.setProductTypeFilterModel = function() {
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

    PspUpcomingEventsCard.prototype.setSorterDialog = function() {
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

    PspUpcomingEventsCard.prototype.setSortProperty = function(sSortProperty) {
        var aSorterDialogData = this._oSorterDialogModel.getData();

        aSorterDialogData.forEach(function(oProperty) {
            oProperty.sortProperty = sSortProperty;
        });
    };

    PspUpcomingEventsCard.prototype.filterProductsByType = function(sSelectedKey) {
        this._bInitialProductCounter = false;
        var oOverViewTable = this.byId("upcomingEventsTable"),
            oOverviewTableFilter;

        if (sSelectedKey) {
            oOverviewTableFilter = new Filter({
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

        oOverViewTable.getBinding("items").filter(oOverviewTableFilter);
    };

    PspUpcomingEventsCard.prototype.filterPortfolioCategories = function(sSelectedProductTypeKey) {
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

    PspUpcomingEventsCard.prototype.getSelectedProduct = function(oItem) {
        var oContext = oItem.getBindingContext("$" + this.alias + ".odata"),
            sPath = oContext.getPath(),
            oSelectedProduct = oContext.getObject(sPath);

        return oSelectedProduct;
    };

    PspUpcomingEventsCard.prototype.navigateToDetailPage = function(oEvent, sTab) {
        var oItem = oEvent.getSource(),
            sSelectedProductId = encodeURIComponent(this.getSelectedProduct(oItem).ID),
            oRouter = Router.getRouter("shellRouter");

        oRouter.navTo("productDetail", {
            productKey: sSelectedProductId,
            tab: sTab
        });
    };

    PspUpcomingEventsCard.prototype.navigateToProductDetailPage = function(oEvent) {
        this.navigateToDetailPage(oEvent, "overview");
    };

    PspUpcomingEventsCard.prototype.navigateToSystems = function(oEvent) {
        this.navigateToDetailPage(oEvent, "systems");
    };

    PspUpcomingEventsCard.prototype.navigateToEvents = function(oEvent) {
        this.navigateToDetailPage(oEvent, "events");
    };

    PspUpcomingEventsCard.prototype.navigateToOpenIncidents = function(oEvent) {
        this.navigateToDetailPage(oEvent, "openIncidents");
    };

    PspUpcomingEventsCard.prototype.navigateToLicenses = function(oEvent) {
        this.navigateToDetailPage(oEvent, "licenses");
    };

    PspUpcomingEventsCard.prototype.navigateToOrders = function(oEvent) {
        this.navigateToDetailPage(oEvent, "orders");
    };

    PspUpcomingEventsCard.prototype.onSort = function(oEvent) {
        var oSource = oEvent.getSource();

        this.byId("sorterDialog").openBy(oSource);
    };

  
    PspUpcomingEventsCard.prototype.handleSortDialogConfirm = function(oEvent) {
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

    PspUpcomingEventsCard.prototype._formatVisibility = function(iLicensesOverConsumption) {
        return iLicensesOverConsumption > 0 ? true : false;
    };

    PspUpcomingEventsCard.prototype._formatLink = function(iVisibleCount, iTotalCount) {
        return iVisibleCount > 0 ? " / " + iTotalCount : iTotalCount;
    };

    PspUpcomingEventsCard.prototype._formatLinkExtended = function(bAuth, iVisibleCount, iTotalCount) {
        return (iVisibleCount > 0 && bAuth) ? " / " + iTotalCount : iTotalCount;
    };

    PspUpcomingEventsCard.prototype._formatDay = function(sKey, sText) {
        var day = sKey.split("/")[0];
        if (day){
            if (day.length<2){
                day = "0"+ day;
            }
        }
        return day || sKey;
    };
    PspUpcomingEventsCard.prototype._formatMonth = function(sKey, sText) {
        var month = sKey.split("/")[1];
        var sMonth = "";
        switch(month) {
            case "01":
                sMonth = "JANUARY";
                break;
            case "02":
                sMonth = "FEBRUARY";
                break;
            case "03":
                sMonth = "MARCH";
                break;
            case "04":
                sMonth = "APRIL";
            break;
            case "05":
                sMonth = "MAY";
            break;
            case "06":
                sMonth = "JUNE";
            break;                                
            case "07":
                sMonth = "JULY";
            break;
            case "08":
                sMonth = "AUGUST";
            break;
            case "09":
                sMonth = "SEPTEMBER";
            break;
            case "10":
                sMonth = "OCTOBER";
            break;
            case "11":
                sMonth = "NOVEMBER";
            break;
            case "12":
                sMonth = "DECEMBER";
            break;
            default:
                
          }
        return sMonth;
    };

    return PspUpcomingEventsCard;
}, /* bExport= */true);
