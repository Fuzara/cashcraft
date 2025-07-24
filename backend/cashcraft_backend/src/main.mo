actor {
  // This canister is now primarily for the frontend,
  // but we can add a simple function to show it's working.
  public query func hello() : async Text {
    return "Hello from the main backend canister!";
  };
};
