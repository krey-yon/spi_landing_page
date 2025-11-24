"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Keypair } from "@solana/web3.js";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const CART_ITEMS: CartItem[] = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299.99,
    quantity: 1,
    image: "🎧",
  },
  {
    id: 2,
    name: "Smart Watch Pro",
    price: 449.99,
    quantity: 1,
    image: "⌚",
  },
  {
    id: 3,
    name: "USB-C Cable (3-Pack)",
    price: 29.99,
    quantity: 2,
    image: "🔌",
  },
];

const LOYALTY_OPTIONS = [0, 25, 50, 75, 100];

const Page = () => {
  const router = useRouter();
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = CART_ITEMS.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal;

  const handleCheckout = () => {
    setIsProcessing(true);

    // Generate random Solana public key as reference
    const keypair = Keypair.generate();
    const referenceKey = keypair.publicKey.toBase58();

    // Navigate to payment page with reference and amounts
    const amount = total.toFixed(2);
    const discount = selectedDiscount;

    router.push(`/payment/${referenceKey}-${amount}-${discount}`);
  };

  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#F1F3E0" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#778873" }}>
            Checkout
          </h1>
          <p className="text-lg" style={{ color: "#778873", opacity: 0.8 }}>
            Review your items and apply loyalty tokens
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl shadow-lg p-6 mb-6"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <h2
                className="text-2xl font-semibold mb-6 flex items-center"
                style={{ color: "#778873" }}
              >
                <span className="mr-2">🛒</span>
                Shopping Cart ({CART_ITEMS.length} items)
              </h2>

              <div className="space-y-4">
                {CART_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                    style={{ backgroundColor: "#F1F3E0" }}
                  >
                    <div className="text-4xl flex-shrink-0">{item.image}</div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-lg font-medium truncate"
                        style={{ color: "#778873" }}
                      >
                        {item.name}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "#778873", opacity: 0.7 }}
                      >
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-lg font-semibold"
                        style={{ color: "#778873" }}
                      >
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "#778873", opacity: 0.6 }}
                      >
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty Tokens Section - Minimalist */}
            <div
              className="rounded-2xl shadow-lg p-6"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <h2
                className="text-lg font-semibold mb-3 flex items-center"
                style={{ color: "#778873" }}
              >
                <span className="mr-2">🪙</span>
                Loyalty Tokens
              </h2>

              <div className="flex items-center gap-2">
                {LOYALTY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedDiscount(option)}
                    className="flex-1 py-2 px-3 rounded-lg border-2 transition-all duration-200 font-semibold"
                    style={{
                      borderColor:
                        selectedDiscount === option ? "#A1BC98" : "#D2DCB6",
                      backgroundColor:
                        selectedDiscount === option ? "#A1BC98" : "#FFFFFF",
                      color:
                        selectedDiscount === option ? "#FFFFFF" : "#778873",
                    }}
                  >
                    <div className="text-sm">{option}%</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl shadow-lg p-6 sticky top-6"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <h2
                className="text-2xl font-semibold mb-6"
                style={{ color: "#778873" }}
              >
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div
                  className="flex justify-between"
                  style={{ color: "#778873" }}
                >
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                <div
                  className="border-t pt-4"
                  style={{ borderColor: "#D2DCB6" }}
                >
                  <div
                    className="flex justify-between text-xl font-bold"
                    style={{ color: "#778873" }}
                  >
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {selectedDiscount > 0 && (
                  <div
                    className="border rounded-lg p-3"
                    style={{
                      backgroundColor: "#F1F3E0",
                      borderColor: "#D2DCB6",
                    }}
                  >
                    <p
                      className="text-xs text-center font-medium"
                      style={{ color: "#778873" }}
                    >
                      {selectedDiscount}% loyalty tokens will be applied
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: isProcessing ? "#D2DCB6" : "#A1BC98",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.backgroundColor = "#778873";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.backgroundColor = "#A1BC98";
                  }
                }}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🔒</span>
                    Proceed to Payment
                  </span>
                )}
              </button>

              <div
                className="mt-4 flex items-center justify-center space-x-4 text-xs"
                style={{ color: "#778873", opacity: 0.7 }}
              >
                <span className="flex items-center">
                  <span className="mr-1">🔒</span>
                  Secure
                </span>
                <span className="flex items-center">
                  <span className="mr-1">⚡</span>
                  Solana Pay
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
