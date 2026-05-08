"use client";

import { useState } from "react";
import { api } from "@/services/api";
import { useAuth } from "./AuthProvider";

// Define types
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: "cash" | "card";
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardName?: string;
}

// Mock payment service
const paymentService = {
  async processPayment(data: {
    amount: number;
    currency: string;
    method: string;
    shippingInfo?: any;
    paymentInfo?: any;
  }) {
    // console.log("Processing payment with data:", data);
    return { success: true }; // simulate success
  },
};

export default function PaymentComponent({ cart }: { cart: CartItem[] }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Egypt",
    paymentMethod: "cash",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    setLoading(true);
    setMessage("");

    try {
      const paymentData = {
        amount: total,
        currency: "EGP",
        method: formData.paymentMethod,
        paymentInfo:
          formData.paymentMethod === "card"
            ? {
                cardNumber: formData.cardNumber,
                expiryDate: formData.expiryDate,
                cvv: formData.cvv,
                cardName: formData.cardName,
              }
            : undefined,
        shippingInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      };

      const paymentResponse = await paymentService.processPayment(paymentData);

      if (paymentResponse.success) {
        setMessage("✅ Payment successful! Thank you for your order.");
        // هنا تقدر تمسح الكارت من localStorage أو تعمل redirect
      } else {
        setMessage("❌ Payment failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ Error processing payment.");
    }

    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Checkout</h2>

      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        className="border p-2 w-full mb-2"
        value={formData.firstName}
        onChange={handleChange}
      />
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        className="border p-2 w-full mb-2"
        value={formData.lastName}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="border p-2 w-full mb-2"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        type="text"
        name="phone"
        placeholder="Phone"
        className="border p-2 w-full mb-2"
        value={formData.phone}
        onChange={handleChange}
      />
      <input
        type="text"
        name="address"
        placeholder="Address"
        className="border p-2 w-full mb-2"
        value={formData.address}
        onChange={handleChange}
      />
      <input
        type="text"
        name="city"
        placeholder="City"
        className="border p-2 w-full mb-2"
        value={formData.city}
        onChange={handleChange}
      />
      <input
        type="text"
        name="postalCode"
        placeholder="Postal Code"
        className="border p-2 w-full mb-2"
        value={formData.postalCode}
        onChange={handleChange}
      />
      <input
        type="text"
        name="country"
        placeholder="Country"
        className="border p-2 w-full mb-2"
        value={formData.country}
        onChange={handleChange}
      />

      <select
        name="paymentMethod"
        className="border p-2 w-full mb-2"
        value={formData.paymentMethod}
        onChange={handleChange}
      >
        <option value="cash">Cash on Delivery</option>
        <option value="card">Credit Card</option>
      </select>

      {formData.paymentMethod === "card" && (
        <div className="mb-2">
          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number"
            className="border p-2 w-full mb-2"
            value={formData.cardNumber || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            name="expiryDate"
            placeholder="Expiry Date"
            className="border p-2 w-full mb-2"
            value={formData.expiryDate || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            name="cvv"
            placeholder="CVV"
            className="border p-2 w-full mb-2"
            value={formData.cvv || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            name="cardName"
            placeholder="Cardholder Name"
            className="border p-2 w-full mb-2"
            value={formData.cardName || ""}
            onChange={handleChange}
          />
        </div>
      )}

      <button
        onClick={handlePayment}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        disabled={loading}
      >
        {loading ? "Processing..." : `Pay ${total} EGP`}
      </button>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
