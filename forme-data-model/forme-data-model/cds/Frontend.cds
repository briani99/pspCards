namespace Frontend;

// All entities are alphabetically sorted.  Please keep it this way!

service FrontendService {
  entity PreferredSuccess @readonly as projection on Frontend.PreferredSuccess;
  entity Overview @readonly as projection on Frontend.Overview;
  entity UpcomingEvents @readonly as projection on Frontend.UpcomingEvents;
  entity Recordings @readonly as projection on Frontend.Recordings;
  entity HotTopics @readonly as projection on Frontend.HotTopics;
  entity Contacts @readonly as projection on Frontend.Contacts;
  entity ServicesDelivered @readonly as projection on Frontend.ServicesDelivered;
  entity ServicesPortfolio @readonly as projection on Frontend.ServicesPortfolio;
  entity NewLearningsOnboarding @readonly as projection on Frontend.NewLearningsOnboarding;
  entity NewLearningsRecruitingMarketing @readonly as projection on Frontend.NewLearningsRecruitingMarketing;
}

entity PreferredSuccess {
    key ID: Integer;
    goals: Integer;
    services: Integer;
    qbr: Integer;
    learnings: Integer;
  }

entity Overview {
    key ID: Integer;
    asset: String;
    sapsuccessfactors: Integer;
    sapsforhanacloud: Integer;
    total: Integer;
  }

 entity UpcomingEvents {
    key ID: Integer;
    customerId: String;
    customerName: String;
    solutionId: String;
    solution: String;
    webinarTitle: String;
    webinarSubtitle: String;
    link: String;
    date: String;
    betweenHours: String;
  }

 entity Recordings {
	key ID: Integer;
	customerId: String;
	customerName: String;
    businessGoalId: String;
	businessGoal: String;
	valueDriver: String;
	serviceType: String;
	serviceItem: String;
	link: String;
	solutionId: String;
	solution: String;
	moduleId: String;
	module: String;
	deliveryDate: String;
}

 entity HotTopics {
	key ID: Integer;
	description: String;
    link: String;
    icon: String;
}

entity Contacts {
    key ID: Integer;
    customerID: String;
    customerName: String;
    contactID: String;
    lastName: String;
    firstName: String;
    email: String;
    phone: String;
    role: String;
    imagePath: String;
}

entity ServicesDelivered {
    key ID: Integer;
    customerID: String;
    customerName: String;
    businessGoalID: String;
    businessGoal: String;
    valueDriver: String;
    serviceType: String;
    serviceItem: String;
    linkServiceItem: String;
    solutionID: String;
    solution: String;
    moduleID: String;
    module: String;
    deliveryDate: String;
}

entity ServicesPortfolio {
    key ID: Integer;
    customerID: String;
    customerName: String;
    businessGoalID: String;
    businessGoal: String;
    valueDriver: String;
    serviceType: String;
    serviceItem: String;
    linkServiceItem: String;
    solutionID: String;
    solution: String;
    moduleID: String;
    module: String;
}

entity NewLearningsOnboarding {
    key ID : Integer;
    sfOnboarding : String;
    learningItems : Integer;
    lastUpdated : DateTime;
}

entity NewLearningsRecruitingMarketing {
    key ID : Integer;
    sfRecruitingMarketing : String;
    learningItems : Integer;
    lastUpdated : DateTime;
}
