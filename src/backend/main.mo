import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

import Array "mo:core/Array";

// Apply migration on upgrade

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat; // price in cents
    category : Text;
    imageUrl : Text;
    imageUrls : [Text];
    stock : Nat;
  };

  type PortfolioItem = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    imageUrl : Text;
    clientName : Text;
  };

  type OrderItem = {
    productId : Nat;
    quantity : Nat;
  };

  type Order = {
    id : Nat;
    customerName : Text;
    email : Text;
    shippingAddress : Text;
    items : [OrderItem];
    status : Text;
    trackingNumber : Text;
    createdAt : Text;
  };

  type CustomDesignRequest = {
    id : Nat;
    customerName : Text;
    email : Text;
    productType : Text;
    description : Text;
    colorPreferences : Text;
    fileUrls : [Text];
    status : Text;
    createdAt : Text;
    chatEscalation : Bool;
  };

  type UserProfile = {
    name : Text;
    email : Text;
  };

  type IntegrationSettings = {
    printifyApiKey : Text;
    printifyShopId : Text;
    shopifyDomain : Text;
    shopifyApiToken : Text;
  };

  let products = Map.empty<Nat, Product>();
  let portfolioItems = Map.empty<Nat, PortfolioItem>();
  let orders = Map.empty<Nat, Order>();
  let customDesignRequests = Map.empty<Nat, CustomDesignRequest>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let siteTexts = Map.empty<Text, Text>();

  var nextProductId = 1;
  var nextPortfolioId = 1;
  var nextOrderId = 1;
  var nextCustomDesignRequestId = 1;

  var aboutUs : Text = "Default About Us";
  var shippingInfo : Text = "Default Shipping Info";
  var humanRequestCount : Nat = 0;

  var notificationEmail : Text = "";
  var integrationSettings : IntegrationSettings = {
    printifyApiKey = "";
    printifyShopId = "";
    shopifyDomain = "";
    shopifyApiToken = "";
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Must be authenticated to access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Must be authenticated to save profile") };
    userProfiles.add(caller, profile);
  };

  // Product Management - Admin Only
  public shared ({ caller }) func addProduct(
    name : Text,
    description : Text,
    price : Nat,
    category : Text,
    imageUrl : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let id = nextProductId;
    let product : Product = {
      id;
      name;
      description;
      price;
      category;
      imageUrl;
      imageUrls = [];
      stock = 0;
    };
    products.add(id, product);
    nextProductId += 1;
    id;
  };

  public shared ({ caller }) func addProductWithImages(
    name : Text,
    description : Text,
    price : Nat,
    category : Text,
    imageUrl : Text,
    imageUrls : [Text],
    stock : Nat
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let id = nextProductId;
    let product : Product = {
      id;
      name;
      description;
      price;
      category;
      imageUrl;
      imageUrls;
      stock;
    };
    products.add(id, product);
    nextProductId += 1;
    id;
  };

  public shared ({ caller }) func updateProduct(
    id : Nat,
    name : Text,
    description : Text,
    price : Nat,
    category : Text,
    imageUrl : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(id)) {
      case (?oldProduct) {
        let product : Product = {
          id;
          name;
          description;
          price;
          category;
          imageUrl;
          imageUrls = oldProduct.imageUrls;
          stock = oldProduct.stock;
        };
        products.add(id, product);
      };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public shared ({ caller }) func updateProductWithImages(
    id : Nat,
    name : Text,
    description : Text,
    price : Nat,
    category : Text,
    imageUrl : Text,
    imageUrls : [Text],
    stock : Nat
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(id)) {
      case (?_) {
        let product : Product = {
          id;
          name;
          description;
          price;
          category;
          imageUrl;
          imageUrls;
          stock;
        };
        products.add(id, product);
      };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(id);
  };

  // Product Browsing - Public Access
  public query ({ caller }) func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  // Portfolio Management - Admin Only
  public shared ({ caller }) func addPortfolioItem(
    title : Text,
    description : Text,
    category : Text,
    imageUrl : Text,
    clientName : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add portfolio items");
    };
    let id = nextPortfolioId;
    let item : PortfolioItem = {
      id;
      title;
      description;
      category;
      imageUrl;
      clientName;
    };
    portfolioItems.add(id, item);
    nextPortfolioId += 1;
    id;
  };

  public shared ({ caller }) func updatePortfolioItem(
    id : Nat,
    title : Text,
    description : Text,
    category : Text,
    imageUrl : Text,
    clientName : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update portfolio items");
    };
    switch (portfolioItems.get(id)) {
      case (?_) {
        let item : PortfolioItem = {
          id;
          title;
          description;
          category;
          imageUrl;
          clientName;
        };
        portfolioItems.add(id, item);
      };
      case (null) { Runtime.trap("Portfolio item not found") };
    };
  };

  public shared ({ caller }) func deletePortfolioItem(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete portfolio items");
    };
    portfolioItems.remove(id);
  };

  // Portfolio Browsing - Public Access
  public query ({ caller }) func getPortfolioItem(id : Nat) : async PortfolioItem {
    switch (portfolioItems.get(id)) {
      case (?item) { item };
      case (null) { Runtime.trap("Portfolio item not found") };
    };
  };

  public query ({ caller }) func getAllPortfolioItems() : async [PortfolioItem] {
    portfolioItems.values().toArray();
  };

  // Order Creation - Public Access (customers can create orders)
  public shared ({ caller }) func createOrder(
    customerName : Text,
    email : Text,
    shippingAddress : Text,
    items : [OrderItem],
    createdAt : Text
  ) : async Nat {
    let id = nextOrderId;
    let order : Order = {
      id;
      customerName;
      email;
      shippingAddress;
      items;
      status = "processing";
      trackingNumber = "";
      createdAt;
    };
    orders.add(id, order);
    nextOrderId += 1;
    id;
  };

  // Order Management - Admin Only
  public shared ({ caller }) func updateOrderStatus(id : Nat, status : Text, trackingNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(id)) {
      case (?order) {
        let updatedOrder : Order = {
          id = order.id;
          customerName = order.customerName;
          email = order.email;
          shippingAddress = order.shippingAddress;
          items = order.items;
          status;
          trackingNumber;
          createdAt = order.createdAt;
        };
        orders.add(id, updatedOrder);
      };
      case (null) { Runtime.trap("Order not found") };
    };
  };

  public query ({ caller }) func getOrder(id : Nat) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view orders");
    };
    switch (orders.get(id)) {
      case (?order) { order };
      case (null) { Runtime.trap("Order not found") };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  // Company Info - Public Read, Admin Write
  public query ({ caller }) func getAboutUs() : async Text {
    aboutUs;
  };

  public shared ({ caller }) func updateAboutUs(newText : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update company info");
    };
    aboutUs := newText;
  };

  public query ({ caller }) func getShippingInfo() : async Text {
    shippingInfo;
  };

  public shared ({ caller }) func updateShippingInfo(newText : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update shipping info");
    };
    shippingInfo := newText;
  };

  // Custom Design Requests - Public Create, Admin Manage
  public shared ({ caller }) func addCustomDesignRequest(
    customerName : Text,
    email : Text,
    productType : Text,
    description : Text,
    colorPreferences : Text,
    fileUrls : [Text],
    createdAt : Text,
    chatEscalation : Bool
  ) : async Nat {
    let id = nextCustomDesignRequestId;
    let customDesignRequest : CustomDesignRequest = {
      id;
      customerName;
      email;
      productType;
      description;
      colorPreferences;
      fileUrls;
      status = "pending";
      createdAt;
      chatEscalation;
    };
    customDesignRequests.add(id, customDesignRequest);
    nextCustomDesignRequestId += 1;

    // Increment human request count if chat escalation is true
    if (chatEscalation) {
      humanRequestCount += 1;
    };

    id;
  };

  public query ({ caller }) func getAllCustomDesignRequests() : async [CustomDesignRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all custom design requests");
    };
    customDesignRequests.values().toArray();
  };

  public query ({ caller }) func getCustomDesignRequest(id : Nat) : async CustomDesignRequest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view custom design requests");
    };
    switch (customDesignRequests.get(id)) {
      case (?request) { request };
      case (null) { Runtime.trap("Custom design request not found") };
    };
  };

  public shared ({ caller }) func updateCustomDesignRequestStatus(id : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update custom design request status");
    };
    switch (customDesignRequests.get(id)) {
      case (?request) {
        let updatedRequest : CustomDesignRequest = {
          id = request.id;
          customerName = request.customerName;
          email = request.email;
          productType = request.productType;
          description = request.description;
          colorPreferences = request.colorPreferences;
          fileUrls = request.fileUrls;
          status;
          createdAt = request.createdAt;
          chatEscalation = request.chatEscalation;
        };
        customDesignRequests.add(id, updatedRequest);
      };
      case (null) { Runtime.trap("Custom design request not found") };
    };
  };

  public shared ({ caller }) func deleteCustomDesignRequest(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete custom design requests");
    };
    customDesignRequests.remove(id);
  };

  // Site Text Management
  public query ({ caller }) func getSiteText(key : Text) : async Text {
    switch (siteTexts.get(key)) {
      case (?value) { value };
      case (null) { "" };
    };
  };

  public shared ({ caller }) func setSiteText(key : Text, value : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update site text");
    };
    siteTexts.add(key, value);
  };

  public query ({ caller }) func getAllSiteTexts() : async [(Text, Text)] {
    siteTexts.toArray();
  };

  // Human Request Count
  public query ({ caller }) func getHumanRequestCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access human request count");
    };
    humanRequestCount;
  };

  // Integration Settings Management
  public query ({ caller }) func getIntegrationSettings() : async IntegrationSettings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access integration settings");
    };
    integrationSettings;
  };

  public shared ({ caller }) func setIntegrationSettings(settings : IntegrationSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update integration settings");
    };
    integrationSettings := settings;
  };

  // Notification Email Management
  public query ({ caller }) func getNotificationEmail() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access notification email");
    };
    notificationEmail;
  };

  public shared ({ caller }) func setNotificationEmail(email : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update notification email");
    };
    notificationEmail := email;
  };

  // Stripe Integration
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
