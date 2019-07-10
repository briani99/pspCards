sap.ui.define([
    "./library",
    "sap/ui/core/XMLComposite",
    "sap/me/cards/Card"
], function(library, XMLComposite, Card) {
    // shortcut for sap.me.cards.CardState
    var CardState = library.CardState;

    var PspNewLearningsSuccessFactorsRecruitingMarketingCard = XMLComposite.extend("sap.me.cards.PspNewLearningsSuccessFactorsRecruitingMarketingCard", {
        metadata: {
            properties: {
                text: { type: "string", defaultValue: "Default Text"}
            }
        }
    });

    NewLearningsSuccessFactorsRecruitingMarketingCard.prototype.init = function() {
        XMLComposite.prototype.init.apply(this, arguments);

        Card.setBusy(this, true);
        setTimeout(function() {
            Card.setBusy(this, false);
        }.bind(this), 1000 + Math.random() * 3000);
    };

    PspNewLearningsSuccessFactorsRecruitingMarketingCard.prototype.applySettings = function() {
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

    PspNewLearningsSuccessFactorsRecruitingMarketingCard.prototype.formatLastUpdated = function (sDate) {
        var monthNames = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"
                            ];
        var dateValue = new Date(sDate);
        var year = dateValue.getFullYear();
        var month = monthNames[dateValue.getMonth()];
        return month + " " + year;
    };

    return PspNewLearningsSuccessFactorsRecruitingMarketingCard;
}, /* bExport= */true);