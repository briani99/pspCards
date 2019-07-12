sap.ui.define([
    "./library",
    "sap/ui/core/XMLComposite",
    "sap/me/cards/Card"
], function(library, XMLComposite, Card) {
    // shortcut for sap.me.cards.CardState
    var CardState = library.CardState;

    var PspSuccessFactorsRecruitingMarketingCard = XMLComposite.extend("sap.me.cards.PspSuccessFactorsRecruitingMarketingCard", {
        metadata: {
            properties: {
                text: { type: "string", defaultValue: "Default Text"}
            }
        }
    });

    PspSuccessFactorsRecruitingMarketingCard.prototype.init = function() {
        XMLComposite.prototype.init.apply(this, arguments);

        Card.setBusy(this, true);
        setTimeout(function() {
            Card.setBusy(this, false);
        }.bind(this), 1000 + Math.random() * 3000);
    };

    PspSuccessFactorsRecruitingMarketingCard.prototype.applySettings = function() {
        XMLComposite.prototype.applySettings.apply(this, arguments);

        if (!this._bCardInitialized) {
            var oContent = this.getAggregation("_content"), oContext = this.data("context");

            // access the translation file by getting the libraries bundle
            var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.me.cards");

            // to check for a single authorization either use the context attribute ...
            if (!oContext.authorization.check("GOSAP", "DEBITOR", "0001208936")) {
                // set the unauthorizedMessage first, incl. the authorization to request
                oContent.setUnauthorizedMessage(oBundle.getText("unauthorizedMessage", oBundle.getText("authorizationREADM")));
                oContent.transitionToState(CardState.Unauthorized);
            }

            // ... or use the convenience method of card, also to check for multiple authorizations (any of the authorizations must apply,
            // in case you'd like to check for multiple authorizations which have to be all present, use boolean "true" as a second argument)
            // this method gets varargs passed as arrays, in case the notation is ["OBJECT"] only a "exists" check will be performed,
            // otherwise the array will be used as arguments for the check method e.g. ["OBJECT", "GLOBAL"] will check for the global
            // authorization being set, ["OBJECT", "FIELD", "VALUE"] will check for the value of a authorization object. Any number of
            // arguments might be passed!
            if (!oContent.authorizationCheck(oContext.authorization, /*true, */["READM"], ["ANLEG", "INSTALL", "0020659001"])) {
                // ... do something here if required (e.g. not finish initialization, or return to not load any data)
            }

            // also add further initialization, such as setting the OData model to the card
            oContent.setModel(oContext.model, "$" + this.alias + ".odata");

            this._bCardInitialized = true;
        }
    };

    PspSuccessFactorsRecruitingMarketingCard.prototype.formatLastUpdated = function (sDate) {
        var dateValue = new Date(sDate);
        var sYear = dateValue.getFullYear();
        var sMonth = dateValue.getMonth() + 1;
        var sDay = dateValue.getDate();
        if (sMonth < 10){
            sMonth = "0"+ sMonth;
        }

        if (sDay < 10){
            sDay = "0"+ sDay;
        }
        return sDay + "/" + sMonth + "/" + sYear;
    };

    return PspSuccessFactorsRecruitingMarketingCard;
}, /* bExport= */true);