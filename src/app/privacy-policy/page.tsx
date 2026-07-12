import { LegalPage } from "@/app/_components/legal-page";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      body="We collect the information needed to process orders, contact you about pickups, and manage marketing preferences you explicitly opt into. Payment details are handled by Stripe, and private order reference images are stored in restricted cloud storage."
    />
  );
}
