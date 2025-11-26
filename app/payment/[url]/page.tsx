"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import bs58 from "bs58"
import { Keypair, PublicKey } from "@solana/web3.js";
import { SpiClient } from "@kreyon/spi_library/client";
import confetti from "canvas-confetti";
import toast, { Toaster } from "react-hot-toast";

const PaymentPage = () => {
  const params = useParams();
  const url = params.url as string;

  const [referenceKey, amount, discount] = url
    ? url.split("-")
    : ["", "0", "0"];

  console.log(process.env.NEXT_PUBLIC_PRIVATE_KEY)
  const secret = bs58.decode(process.env.NEXT_PUBLIC_PRIVATE_KEY!);
  const keypair = Keypair.fromSecretKey(secret);
  const spiClient = new SpiClient(keypair, "https://api.devnet.solana.com")

  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "expired" | "completed">(
    "pending",
  );
  const [isChecking, setIsChecking] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // QR Code generation effect
  useEffect(() => {
    const qrcode = spiClient.get_qr_code(`https://spi-tawny.vercel.app/api/create-transaction/${referenceKey}-${amount}-${discount}`, 350);

    if(qrContainerRef.current){
      qrContainerRef.current.innerHTML = "";
      qrcode.append(qrContainerRef.current);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (paymentStatus === "completed") {
      return; // Stop timer if payment is completed
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPaymentStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus]);

  // Confetti animation
  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#A1BC98', '#778873', '#D2A855', '#D2DCB6'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#A1BC98', '#778873', '#D2A855', '#D2DCB6'],
      });
    }, 250);
  };

  // Check payment status
  const handleCheckPayment = async () => {
    setIsChecking(true);
    
    try {
      // Call the SPI client to check if payment is done
      const isPaid = await spiClient.confirm_payment(new PublicKey(referenceKey));
      
      if (isPaid) {
        // Payment successful!
        setPaymentStatus("completed");
        triggerConfetti();
        toast.success("🎉 Payment successful! Thank you!", {
          duration: 5000,
          style: {
            background: '#A1BC98',
            color: '#fff',
            fontWeight: 'bold',
            padding: '16px',
          },
        });
      } else {
        // Payment not yet received
        toast.error("⏳ Payment not received yet. Please try again.", {
          duration: 4000,
          style: {
            background: '#C85A54',
            color: '#fff',
            fontWeight: 'bold',
            padding: '16px',
          },
        });
      }
    } catch (error) {
      console.error("Error checking payment:", error);
      toast.error("❌ Error checking payment status. Please try again.", {
        duration: 4000,
        style: {
          background: '#C85A54',
          color: '#fff',
          fontWeight: 'bold',
          padding: '16px',
        },
      });
    } finally {
      setIsChecking(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 180) return "#A1BC98"; // Green
    if (timeLeft > 60) return "#D2A855"; // Yellow
    return "#C85A54"; // Red
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#F1F3E0" }}
    >
      <Toaster position="top-center" />
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl p-8"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {paymentStatus === "completed" ? (
          /* Payment Successful State */
          <div className="text-center py-8">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ backgroundColor: "#E8F5E9" }}
            >
              <span className="text-5xl">✅</span>
            </div>
            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: "#A1BC98" }}
            >
              Payment Successful!
            </h1>
            <p
              className="text-base mb-6"
              style={{ color: "#778873", opacity: 0.8 }}
            >
              Your payment of ${amount} has been confirmed on the Solana blockchain.
            </p>

            <div
              className="rounded-2xl p-6 mb-6 text-left"
              style={{ backgroundColor: "#F1F3E0" }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm" style={{ color: "#778873" }}>
                  Amount Paid
                </span>
                <span className="text-xl font-bold" style={{ color: "#A1BC98" }}>
                  ${amount}
                </span>
              </div>
              {discount !== "0" && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm" style={{ color: "#778873" }}>
                    Loyalty Tokens
                  </span>
                  <span className="text-lg font-semibold" style={{ color: "#D2A855" }}>
                    🪙 {discount}%
                  </span>
                </div>
              )}
              <div className="pt-4 border-t" style={{ borderColor: "#D2DCB6" }}>
                <p
                  className="text-xs mb-2"
                  style={{ color: "#778873", opacity: 0.6 }}
                >
                  Transaction Reference
                </p>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: "#D2DCB6" }}
                >
                  <code
                    className="text-xs font-mono break-all block"
                    style={{ color: "#778873" }}
                  >
                    {referenceKey}
                  </code>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.history.back()}
              className="w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ backgroundColor: "#A1BC98" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#778873";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#A1BC98";
              }}
            >
              ✨ Continue Shopping
            </button>
          </div>
        ) : paymentStatus === "pending" ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ backgroundColor: "#F1F3E0" }}
              >
                <span className="text-3xl">💳</span>
              </div>
              <h1
                className="text-2xl font-bold mb-2"
                style={{ color: "#778873" }}
              >
                Complete Payment
              </h1>
              <p className="text-sm" style={{ color: "#778873", opacity: 0.7 }}>
                Scan QR code with your Solana wallet
              </p>
            </div>

            {/* Amount Display */}
            <div
              className="rounded-2xl p-4 mb-6 text-center"
              style={{ backgroundColor: "#F1F3E0" }}
            >
              <p
                className="text-sm mb-1"
                style={{ color: "#778873", opacity: 0.7 }}
              >
                Amount to Pay
              </p>
              <p className="text-4xl font-bold" style={{ color: "#778873" }}>
                ${amount}
              </p>
              {discount !== "0" && (
                <p className="text-xs mt-2" style={{ color: "#A1BC98" }}>
                  🪙 {discount}% loyalty tokens applied
                </p>
              )}
            </div>

            {/* QR Code Section */}
            <div
              ref={qrContainerRef}
              className="rounded-2xl p-6 mb-6 flex flex-col items-center"
              style={{ backgroundColor: "#F1F3E0" }}
            >
              {/* QR Code Placeholder */}
              {/*<div
                className="w-64 h-64 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: "#FFFFFF" }}
              >*/}
                <div className="text-center">
                  <div
                    className="w-48 h-48 mx-auto mb-3 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: "#778873",
                      backgroundImage: `repeating-linear-gradient(0deg, #FFFFFF 0px, #FFFFFF 10px, transparent 10px, transparent 20px),
                      repeating-linear-gradient(90deg, #FFFFFF 0px, #FFFFFF 10px, transparent 10px, transparent 20px)`,
                    }}
                  >
                    <span className="text-6xl">📱</span>
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#778873", opacity: 0.6 }}
                  >
                    QR Code
                  </p>
                </div>
              </div>

              {/* Reference Key */}
              <div className="w-full">
                <p
                  className="text-xs mb-2 text-center"
                  style={{ color: "#778873", opacity: 0.6 }}
                >
                  Reference ID
                </p>
                <div
                  className="rounded-lg p-3 break-all text-center"
                  style={{ backgroundColor: "#D2DCB6" }}
                >
                  <code
                    className="text-xs font-mono"
                    style={{ color: "#778873" }}
                  >
                    {referenceKey.substring(0, 32)}...
                  </code>
                </div>
              </div>
            {/*</div>*/}

            {/* Timer */}
            <div className="mb-6">
              <div
                className="rounded-2xl p-4 text-center"
                style={{ backgroundColor: "#F1F3E0" }}
              >
                <p
                  className="text-xs mb-2"
                  style={{ color: "#778873", opacity: 0.7 }}
                >
                  Time Remaining
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="#D2DCB6"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke={getTimerColor()}
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${(timeLeft / 300) * 125.6} 125.6`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs">⏱️</span>
                    </div>
                  </div>
                  <p
                    className="text-3xl font-bold font-mono"
                    style={{ color: getTimerColor() }}
                  >
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
            </div>

            {/* Check Payment Button */}
            <button
              onClick={handleCheckPayment}
              disabled={isChecking}
              className="w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-4"
              style={{
                backgroundColor: isChecking ? "#D2DCB6" : "#A1BC98",
                cursor: isChecking ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isChecking) {
                  e.currentTarget.style.backgroundColor = "#778873";
                }
              }}
              onMouseLeave={(e) => {
                if (!isChecking) {
                  e.currentTarget.style.backgroundColor = "#A1BC98";
                }
              }}
            >
              {isChecking ? (
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
                  Checking...
                </span>
              ) : (
                <span>🔍 Check Payment Status</span>
              )}
            </button>

            {/* Info */}
            <div className="text-center">
              <p className="text-xs" style={{ color: "#778873", opacity: 0.6 }}>
                🔒 Secured by Solana Blockchain
              </p>
            </div>
          </>
        ) : (
          /* Expired State */
          <div className="text-center py-8">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ backgroundColor: "#FFE5E5" }}
            >
              <span className="text-5xl">⏰</span>
            </div>
            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: "#C85A54" }}
            >
              Payment Expired
            </h1>
            <p
              className="text-base mb-6"
              style={{ color: "#778873", opacity: 0.8 }}
            >
              The payment window has closed after 5 minutes.
            </p>

            <div
              className="rounded-2xl p-6 mb-6 text-left"
              style={{ backgroundColor: "#F1F3E0" }}
            >
              <p className="text-sm mb-4" style={{ color: "#778873" }}>
                If you completed the transaction from your end, please contact
                our support team with your reference ID:
              </p>
              <div
                className="rounded-lg p-3 mb-4"
                style={{ backgroundColor: "#D2DCB6" }}
              >
                <code
                  className="text-xs font-mono break-all block"
                  style={{ color: "#778873" }}
                >
                  {referenceKey}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📧</span>
                <a
                  href="mailto:support@solanapay.example.com"
                  className="text-sm font-semibold underline"
                  style={{ color: "#A1BC98" }}
                >
                  support@solanapay.example.com
                </a>
              </div>
            </div>

            <button
              onClick={() => window.history.back()}
              className="w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ backgroundColor: "#778873" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#A1BC98";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#778873";
              }}
            >
              ← Return to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
