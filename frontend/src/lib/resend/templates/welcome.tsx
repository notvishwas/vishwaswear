import { Button, Heading, Text } from "@react-email/components";
import { siteConfig } from "@/config/site";
import { EmailLayout, emailButton, emailColors, emailHeading, emailText } from "./email-layout";

export function WelcomeEmail() {
  return (
    <EmailLayout preview={`Welcome to ${siteConfig.name}`}>
      <Heading as="h1" style={emailHeading}>
        Welcome to {siteConfig.name}
      </Heading>
      <Text style={emailText}>
        Thanks for joining the list. You&apos;ll be the first to hear about new arrivals, styling notes and
        seasonal offers, roughly once a fortnight.
      </Text>
      <Button href={new URL("/shop", siteConfig.url).toString()} style={{ ...emailButton, margin: "8px 0 20px" }}>
        Browse the collection
      </Button>
      <Text style={{ ...emailText, fontSize: "13px", color: emailColors.navyMuted, margin: 0 }}>
        Changed your mind? Reply to this email with &ldquo;unsubscribe&rdquo; and we&apos;ll remove you.
      </Text>
    </EmailLayout>
  );
}
