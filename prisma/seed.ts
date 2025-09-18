// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  // Option 1: paste your TASKS array directly here:
  const TASKS = [
  {
    id: 1,
    title: "👻 Name of the Night",
    description:
      "Register your team and discover the ghostly secret",
    detailedDescription:
      "Welcome to the Versent Spooky Race! To begin your Halloween adventure, first register your team with a creative, spooky name. Then discover the mysterious ghostly name that haunts this place. Look for clues left behind by spirits of the past - the answer lies where shadows meet moonlight.",
    points: 10,
    bonusPoints: 5,
    bonusPhotoDescription: "Take a spooky team photo at the starting location with everyone making their best ghost faces!",
  },
  {
    id: 2,
    title: "⚔️ Ripper's Reach",
    description: "Find the legendary blade of the notorious figure",
    detailedDescription:
      "Locate the infamous weapon that once belonged to a dark historical figure. This task will test your knowledge of local legends and your ability to follow cryptic directions through the streets.",
    points: 15,
    bonusPoints: 10,
    bonusPhotoDescription: "Photograph the historical marker or plaque related to this dark figure's story",
    completionCode: "RIPPERSBLADE",
    hint: "Look for the infamous knife display near the old courthouse area",
    hintPenalty: 5,
  },
  {
    id: 3,
    title: "🚂 Platform Poltergeist",
    description: "Encounter the restless spirit at the station",
    detailedDescription:
      "Visit the old railway platform where a ghostly presence is said to linger. Look for signs of supernatural activity and document your findings. The poltergeist only appears to those who know where to look.",
    points: 20,
    bonusPoints: 10,
    bonusPhotoDescription: "Capture a photo of the old railway platform with your team recreating a Victorian-era train waiting pose",
    completionCode: "GHOSTTRAIN",
    hint: "The spirit haunts Platform 1 at Flinders Street Station",
    hintPenalty: 7,
  },
  {
    id: 4,
    title: "🍻 The Slashed Secret",
    description: "Uncover the hidden truth in the tavern",
    detailedDescription:
      "Head to the historic pub where a dark secret has been buried for decades. Search for clues among the old bottles and beneath the ancient floorboards. The truth has been slashed away but not forgotten.",
    points: 15,
    bonusPoints: 10,
    bonusPhotoDescription: "Take a photo of your team toasting with drinks (non-alcoholic is fine) at the historic tavern location",
    completionCode: "SLASHEDSECRET",
    hint: "Check the old Mitre Tavern on Bank Place",
    hintPenalty: 5,
  },
  {
    id: 5,
    title: "🎭 The Final Bow",
    description: "Witness the last performance of the phantom actor",
    detailedDescription:
      "Find the old theater where a legendary performer met their tragic end. Look for traces of their final show and the dramatic conclusion that still echoes through the halls. The curtain never truly fell.",
    points: 25,
    bonusPoints: 15,
    bonusPhotoDescription: "Stage a dramatic theatrical pose with your team in front of the old theater, recreating a final bow scene",
    completionCode: "FINALCURTAIN",
    hint: "The Princess Theatre on Spring Street holds the tragic tale",
    hintPenalty: 8,
  },
  {
    id: 6,
    title: "🏢 Count of the Condemned",
    description: "Tally the souls trapped in the fortress",
    detailedDescription:
      "Visit the imposing structure where many met their fate. Count the markers of those who never left and piece together their stories. Each soul has left a trace for those brave enough to look.",
    points: 20,
    bonusPoints: 10,
    bonusPhotoDescription: "Photograph the imposing fortress structure with your team looking appropriately solemn and respectful",
    completionCode: "CONDEMNED99",
    hint: "Look for the Old Melbourne Gaol on Russell Street",
    hintPenalty: 6,
  },
  {
    id: 7,
    title: "🛒 Underfoot Ancestors",
    description: "Discover what lies beneath the market grounds",
    detailedDescription:
      "Explore the area beneath the old market where ancient secrets are buried. Look for signs of those who came before and the stories written in stone beneath your feet. History runs deep in these grounds.",
    points: 30,
    bonusPoints: 15,
    bonusPhotoDescription: "Take a photo of any historical markers, plaques, or stone inscriptions you find beneath the market area",
    completionCode: "ANCESTORS",
    hint: "The Queen Victoria Market sits atop the old Melbourne Cemetery",
    hintPenalty: 10,
  },
  {
    id: 8,
    title: "🚢 Captain on Collins",
    description: "Follow the maritime ghost's final voyage",
    detailedDescription:
      "Trace the path of the phantom captain who still walks Collins Street. Find the nautical clues he left behind and discover where his final journey ended. The captain's spirit guards his greatest treasure.",
    points: 20,
    bonusPoints: 10,
    bonusPhotoDescription: "Capture your team in a nautical-themed pose on Collins Street, with someone acting as the phantom captain",
    completionCode: "CAPTAINSCOIN",
    hint: "Follow Collins Street to the old shipping district near the Yarra",
    hintPenalty: 6,
  },
  {
    id: 9,
    title: "🚔 Cells to Ales",
    description: "From lockup to liberation, follow the prisoner's path",
    detailedDescription:
      "Trace the journey from the old city jail to the freedom of the local alehouse. Follow the path taken by countless souls who moved from confinement to celebration. Find where justice met jubilation in Melbourne's dark history.",
    points: 25,
    bonusPoints: 15,
    bonusPhotoDescription: "Document the journey with a photo showing both the old jail location and the alehouse destination in one creative shot",
    completionCode: "CELLSTOALES",
    hint: "Start at the Old Melbourne Gaol and end at Young & Jackson's",
    hintPenalty: 8,
  },
  {
    id: 10,
    title: "🍺 Last Orders with the Lady in Black",
    description: "Meet the mysterious woman who never left the bar",
    detailedDescription:
      "Complete your journey at the historic watering hole where the Lady in Black still waits for her last drink. Find her favorite spot and leave an offering. She'll reveal the final secret to those who show proper respect.",
    points: 35,
    bonusPoints: 20,
    bonusPhotoDescription: "Take a respectful final photo of your team raising a glass to the Lady in Black at her favorite spot",
    completionCode: "LADYINBLACK",
    hint: "The Croft Institute on Croft Alley holds her spirit",
    hintPenalty: 12,
  },
];

  for (const t of TASKS) {
    await prisma.task.create({
      data: {
        title: t.title,
        description: t.description ?? "",
        detailedDescription: t.detailedDescription ?? null,
        bonusPhotoDescription: t.bonusPhotoDescription ?? null,
        points: t.points ?? 0,
        bonusPoints: t.bonusPoints ?? 0,
        hint: t.hint ?? null,
        hintPointsPenalty: t.hintPenalty ?? 0,
        completionCode: t.completionCode ?? null,
        order: t.id ?? null,
      },
    });
  }

  console.log(`Seeded ${TASKS.length} tasks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());