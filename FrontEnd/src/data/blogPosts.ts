import blogImg1 from "../assets/booking-01.jpg";
import blogImg2 from "../assets/booking-02.jpg";
import blogImg3 from "../assets/booking-03.jpg";
import blogImg4 from "../assets/booking-04.jpg";
import blogImg5 from "../assets/booking-05.jpg";
import blogImg6 from "../assets/booking-06.jpg";
import avatar1 from "../assets/avatar-01.jpg";
import avatar2 from "../assets/avatar-02.jpg";
import avatar3 from "../assets/avatar-03.jpg";
import avatar4 from "../assets/avatar-04.jpg";
import avatar5 from "../assets/avatar-05.jpg";
import avatar6 from "../assets/avatar-06.jpg";

export type BlogPost = {
  id: number;
  category: string;
  image: string;
  author: string;
  authorAvatar: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  likes: number;
  comments: number;
  readTime: string;
};

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    category: "Badminton",
    image: blogImg1,
    author: "Orlando Waters",
    authorAvatar: avatar1,
    date: "15 May 2023",
    title: "Mastering the Badminton Basics: A Guide for Beginners",
    excerpt: "Les fondamentaux pour bien debuter: prise, placements et rythme.",
    content:
      "Commencer le badminton efficacement passe par des bases solides: position d'attente, prise de raquette et deplacements simples. Travaillez d'abord la regularite avant la puissance, puis construisez vos sequences avec des objectifs courts.",
    likes: 45,
    comments: 40,
    readTime: "10 Min To Read",
  },
  {
    id: 2,
    category: "Sports Activities",
    image: blogImg2,
    author: "Claire Nichols",
    authorAvatar: avatar2,
    date: "16 Jun 2023",
    title: "Unleashing Your Badminton Potential: Tips for Skill Growth",
    excerpt: "Une methode progressive pour monter en niveau sans se blesser.",
    content:
      "Pour progresser durablement, alternez technique, physique et recuperation. Filmez vos seances pour identifier les habitudes a corriger, et suivez votre progression semaine par semaine avec des objectifs mesurables.",
    likes: 32,
    comments: 21,
    readTime: "5 Min To Read",
  },
  {
    id: 3,
    category: "Rules of Game",
    image: blogImg3,
    author: "Joanna Le",
    authorAvatar: avatar3,
    date: "17 May 2023",
    title: "The Art of Footwork: Enhancing Agility in Badminton",
    excerpt: "Ameliorez vos appuis pour gagner du temps sur chaque echange.",
    content:
      "Le jeu de jambes est la base de l'efficacite. Priorisez les pas chasses, la reprise d'appui et le retour au centre. Une meilleure coordination reduit la fatigue et augmente la precision des frappes.",
    likes: 55,
    comments: 32,
    readTime: "4 Min To Read",
  },
  {
    id: 4,
    category: "Badminton",
    image: blogImg4,
    author: "Andrew",
    authorAvatar: avatar4,
    date: "17 May 2023",
    title: "How to Build Match Stamina with Smarter Weekly Drills",
    excerpt: "Structure d'entrainement hebdomadaire pour mieux tenir en match.",
    content:
      "Construisez votre endurance avec des intervalles courts, des blocs de rallyes intensifs et des phases de recuperation active. La qualite du sommeil et l'hydratation jouent un role majeur dans la performance.",
    likes: 55,
    comments: 32,
    readTime: "4 Min To Read",
  },
  {
    id: 5,
    category: "Rules of Game",
    image: blogImg5,
    author: "Mart Sublin",
    authorAvatar: avatar5,
    date: "16 Jun 2023",
    title: "Common Faults Explained: Serve, Foot Fault, and Net Touch",
    excerpt:
      "Comprendre les fautes les plus frequentes pour les eviter en competition.",
    content:
      "Service, position des pieds et contact avec le filet sont des causes classiques de perte de points. Entrainement video et routines pre-service permettent de limiter ces erreurs rapidement.",
    likes: 32,
    comments: 21,
    readTime: "5 Min To Read",
  },
  {
    id: 6,
    category: "Sports Activities",
    image: blogImg6,
    author: "Rebecca",
    authorAvatar: avatar6,
    date: "15 May 2023",
    title: "From Practice to Performance: Structuring Better Sessions",
    excerpt:
      "Comment transformer l'entrainement en resultats visibles en match.",
    content:
      "Chaque seance doit combiner echauffement, objectif principal et retour au calme. Avec un journal d'entrainement simple, vous pouvez relier chaque exercice a un indicateur concret de progression.",
    likes: 45,
    comments: 40,
    readTime: "10 Min To Read",
  },
];
