import { Body, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

// Design tokens mirror the site: cream background, navy text, gold accent line.
export const emailColors = {
  cream: "#faf7f2",
  creamDark: "#f3ede2",
  border: "#e8dfcf",
  navy: "#0f1b2d",
  navyMuted: "#52627d",
  gold: "#b08d57",
} as const;

export const emailFont = "Manrope, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

export const emailText = {
  margin: "0 0 12px",
  fontFamily: emailFont,
  fontSize: "15px",
  lineHeight: "24px",
  color: emailColors.navy,
} as const;

export const emailHeading = {
  margin: "0 0 12px",
  fontFamily: emailFont,
  fontSize: "24px",
  lineHeight: "32px",
  fontWeight: 600,
  color: emailColors.navy,
} as const;

export const emailButton = {
  display: "inline-block",
  backgroundColor: emailColors.navy,
  color: "#ffffff",
  fontFamily: emailFont,
  fontSize: "15px",
  fontWeight: 600,
  textDecoration: "none",
  padding: "13px 26px",
  borderRadius: "4px",
} as const;

type EmailLayoutProps = {
  preview: string;
  children: ReactNode;
};

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, padding: "24px 12px", backgroundColor: emailColors.cream }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
          <Section style={{ textAlign: "center", padding: "8px 0 20px" }}>
            <Text
              style={{
                margin: 0,
                fontFamily: emailFont,
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: emailColors.navy,
              }}
            >
              {siteConfig.name}
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: "#ffffff",
              border: `1px solid ${emailColors.border}`,
              borderTop: `3px solid ${emailColors.gold}`,
              borderRadius: "4px",
              padding: "32px 28px",
            }}
          >
            {children}
          </Section>

          <Section style={{ textAlign: "center", padding: "20px 0 0" }}>
            <Hr style={{ borderColor: emailColors.border, margin: "0 0 16px" }} />
            <Text style={{ ...emailText, fontSize: "13px", color: emailColors.navyMuted, margin: "0 0 4px" }}>
              Questions? Write to{" "}
              <Link href={`mailto:${siteConfig.supportEmail}`} style={{ color: emailColors.navy }}>
                {siteConfig.supportEmail}
              </Link>
            </Text>
            <Text style={{ ...emailText, fontSize: "12px", color: emailColors.navyMuted, margin: 0 }}>
              © {new Date().getFullYear()} {siteConfig.name}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
