export interface CoachOffer {
  id: string;
  title: string;
  description: string;
  pricePerHour: number;
}

export interface CoachProfile {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  bio: string;
  location: string;
  lessonType: string;
  level: string;
  image: string;
  offers: CoachOffer[];
}

import avatar1 from "../assets/avatar-01.jpg";
import avatar2 from "../assets/avatar-02.jpg";
import avatar3 from "../assets/avatar-03.jpg";

export const coachesData: CoachProfile[] = [
  {
    id: "kevin-anderson",
    name: "Kevin Anderson",
    rating: 4.5,
    reviews: 300,
    bio: "Certified badminton coach with a deep understanding of strategy and technique.",
    location: "Port Alsworth, AK",
    lessonType: "Lesson 1",
    level: "Professional",
    image: avatar1,
    offers: [
      {
        id: "session",
        title: "Only Book a Coach for Session",
        description: "Réserve une séance simple avec le coach.",
        pricePerHour: 150,
      },
      {
        id: "training",
        title: "Commit To Training With Coach & Lessons",
        description: "Pack d'entraînement avec suivi.",
        pricePerHour: 120,
      },
    ],
  },
  {
    id: "angela-roudrigez",
    name: "Angela Roudrigez",
    rating: 4.8,
    reviews: 215,
    bio: "Coach spécialisée en préparation physique et performance.",
    location: "Guysville, OH",
    lessonType: "Lesson 1",
    level: "Rookie",
    image: avatar2,
    offers: [
      {
        id: "session",
        title: "Only Book a Coach for Session",
        description: "Séance individuelle orientée objectifs.",
        pricePerHour: 170,
      },
      {
        id: "training",
        title: "Commit To Training With Coach & Lessons",
        description: "Plan structuré sur plusieurs semaines.",
        pricePerHour: 135,
      },
    ],
  },
  {
    id: "evon-raddick",
    name: "Evon Raddick",
    rating: 4.6,
    reviews: 186,
    bio: "Coach certifié pour progression technique et mobilité.",
    location: "Malibu, CA",
    lessonType: "Lesson 2",
    level: "Professional",
    image: avatar3,
    offers: [
      {
        id: "session",
        title: "Only Book a Coach for Session",
        description: "Réservation rapide pour une session.",
        pricePerHour: 140,
      },
      {
        id: "training",
        title: "Commit To Training With Coach & Lessons",
        description: "Programme progressif avec coaching.",
        pricePerHour: 115,
      },
    ],
  },
];
