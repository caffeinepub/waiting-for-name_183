import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import List "mo:core/List";

actor {
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
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

  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  type Order = {
    id : Nat;
    customerName : Text;
    email : Text;
    shippingAddress : Text;
    items : [CartItem];
  };

  let products = Map.empty<Nat, Product>();
  let portfolioItems = Map.empty<Nat, PortfolioItem>();
  let cart = List.empty<CartItem>();
  let orders = Map.empty<Nat, Order>();

  var nextProductId = 1;
  var nextPortfolioId = 1;
  var nextOrderId = 1;

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

  // Shopping Cart
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    let newItem : CartItem = { productId; quantity };
    cart.add(newItem);
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    let filtered = cart.filter(func(item) { item.productId != productId });
    cart.clear();
    cart.addAll(filtered.values());
  };

  public shared ({ caller }) func clearCart() : async () {
    cart.clear();
  };

  public query ({ caller }) func getCartItems() : async [CartItem] {
    cart.toArray();
  };

  // Orders
  public shared ({ caller }) func createOrder(customerName : Text, email : Text, shippingAddress : Text, items : [CartItem]) : async Nat {
    let id = nextOrderId;
    let order : Order = {
      id;
      customerName;
      email;
      shippingAddress;
      items;
    };
    orders.add(id, order);
    nextOrderId += 1;
    id;
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
};
