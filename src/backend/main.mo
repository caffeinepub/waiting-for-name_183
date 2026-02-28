import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

import Text "mo:core/Text";


actor {
  include MixinStorage();

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat; // price in cents
    category : Text;
    imageUrl : Text;
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

  let products = Map.empty<Nat, Product>();
  let portfolioItems = Map.empty<Nat, PortfolioItem>();
  let orders = Map.empty<Nat, Order>();
  let customDesignRequests = Map.empty<Nat, CustomDesignRequest>();

  var nextProductId = 1;
  var nextPortfolioId = 1;
  var nextOrderId = 1;
  var nextCustomDesignRequestId = 1;

  var aboutUs : Text = "Default About Us";
  var shippingInfo : Text = "Default Shipping Info";

  // Product Management
  public shared ({ caller }) func addProduct(name : Text, description : Text, price : Nat, category : Text, imageUrl : Text) : async Nat {
    let id = nextProductId;
    let product : Product = {
      id;
      name;
      description;
      price;
      category;
      imageUrl;
    };
    products.add(id, product);
    nextProductId += 1;
    id;
  };

  public shared ({ caller }) func updateProduct(id : Nat, name : Text, description : Text, price : Nat, category : Text, imageUrl : Text) : async () {
    switch (products.get(id)) {
      case (?_) {
        let product : Product = {
          id;
          name;
          description;
          price;
          category;
          imageUrl;
        };
        products.add(id, product);
      };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    products.remove(id);
  };

  public query ({ caller }) func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  // Portfolio Management
  public shared ({ caller }) func addPortfolioItem(title : Text, description : Text, category : Text, imageUrl : Text, clientName : Text) : async Nat {
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

  public shared ({ caller }) func updatePortfolioItem(id : Nat, title : Text, description : Text, category : Text, imageUrl : Text, clientName : Text) : async () {
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
    portfolioItems.remove(id);
  };

  public query ({ caller }) func getPortfolioItem(id : Nat) : async PortfolioItem {
    switch (portfolioItems.get(id)) {
      case (?item) { item };
      case (null) { Runtime.trap("Portfolio item not found") };
    };
  };

  public query ({ caller }) func getAllPortfolioItems() : async [PortfolioItem] {
    portfolioItems.values().toArray();
  };

  // Orders
  public shared ({ caller }) func createOrder(
    customerName : Text,
    email : Text,
    shippingAddress : Text,
    items : [OrderItem],
    createdAt : Text,
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

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : Text, trackingNumber : Text) : async () {
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
    switch (orders.get(id)) {
      case (?order) { order };
      case (null) { Runtime.trap("Order not found") };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  // Company Info
  public query ({ caller }) func getAboutUs() : async Text {
    aboutUs;
  };

  public shared ({ caller }) func updateAboutUs(newText : Text) : async () {
    aboutUs := newText;
  };

  public query ({ caller }) func getShippingInfo() : async Text {
    shippingInfo;
  };

  public shared ({ caller }) func updateShippingInfo(newText : Text) : async () {
    shippingInfo := newText;
  };

  // Custom Design Requests
  public shared ({ caller }) func addCustomDesignRequest(
    customerName : Text,
    email : Text,
    productType : Text,
    description : Text,
    colorPreferences : Text,
    fileUrls : [Text],
    createdAt : Text,
    chatEscalation : Bool,
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
    id;
  };

  public query ({ caller }) func getAllCustomDesignRequests() : async [CustomDesignRequest] {
    customDesignRequests.values().toArray();
  };

  public query ({ caller }) func getCustomDesignRequest(id : Nat) : async CustomDesignRequest {
    switch (customDesignRequests.get(id)) {
      case (?request) { request };
      case (null) { Runtime.trap("Custom design request not found") };
    };
  };

  public shared ({ caller }) func updateCustomDesignRequestStatus(id : Nat, status : Text) : async () {
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
    customDesignRequests.remove(id);
  };
};
