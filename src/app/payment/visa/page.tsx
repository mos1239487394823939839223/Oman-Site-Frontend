import { redirect } from "next/navigation";

// This used to be a mock card form that showed "payment successful" without
// charging or creating an order. Real card payments go through Thawani from
// the cart, so send anyone landing here (old links, bookmarks) there.
export default function VisaPaymentPage() {
  redirect("/cart");
}
