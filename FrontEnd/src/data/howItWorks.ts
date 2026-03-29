export type HowItWorksStep = {
  id: string;
  title: string;
  description: string;
  cta: string;
  to: string;
};

export const howItWorksSteps: HowItWorksStep[] = [
  {
    id: "join",
    title: "Join Us",
    description:
      "Quick and easy registration to start your personalized coaching journey.",
    cta: "Register Now",
    to: "/signup",
  },
  {
    id: "choose",
    title: "Select Coaches",
    description:
      "Browse real coach profiles, specialties and availability before booking.",
    cta: "Go To Coaches",
    to: "/coaches",
  },
  {
    id: "book",
    title: "Book & Pay",
    description:
      "Pick a slot, confirm booking, and pay securely in a few clicks.",
    cta: "Book Now",
    to: "/coaches",
  },
];
