import { Heading, Text } from "@react-email/components";
import { EmailLayout, emailColors, emailHeading, emailText } from "./email-layout";

type ContactMessageEmailProps = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

/** Sent to the support inbox when someone uses the contact form. Reply goes straight to the customer. */
export function ContactMessageEmail({ name, email, topic, message }: ContactMessageEmailProps) {
  return (
    <EmailLayout preview={`New message from ${name}: ${topic}`}>
      <Heading as="h1" style={emailHeading}>
        New message: {topic}
      </Heading>
      <Text style={{ ...emailText, color: emailColors.navyMuted }}>
        From {name} ({email}). Reply to this email to answer them directly.
      </Text>
      <Text style={{ ...emailText, whiteSpace: "pre-wrap" }}>{message}</Text>
    </EmailLayout>
  );
}
