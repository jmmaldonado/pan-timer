export type BreadWeight = 1000 | 1250 | 1500;
export type CrustLevel = 'Claro' | 'Media' | 'Oscuro';
export type FlourType = 'Normal' | 'Integral' | 'Fuerza' | 'Mixta' | 'Espelta' | 'Centeno';

export interface Step {
  name: string;
  duration: number; // in minutes
  isAdd?: boolean;
  isRmv?: boolean;
}

export interface Program {
  id: number;
  name: string;
  timings: {
    [weight in BreadWeight]?: {
      total: number; // minutes
      steps: Step[];
    };
  };
}

export interface UserRecipe {
  id: string;
  name: string;
  programId: number;
  weight: BreadWeight;
  crust: CrustLevel;
  water: number; // ml
  flours: {
    [key in FlourType]?: number; // g
  };
  yeast: number; // g
  salt: number; // g
  otherIngredients: string;
  notes: string;
  createdAt: number;
}

export const DEFAULT_PROGRAMS: Program[] = [
  {
    id: 1,
    name: "Normal",
    timings: {
      1000: { total: 180, steps: [{ name: "Precalentamiento", duration: 15 }, { name: "Amasado 1", duration: 13 }, { name: "Fermentación 1", duration: 25 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 7 }, { name: "Fermentación 2", duration: 30, isRmv: true }, { name: "Fermentación 3", duration: 30 }, { name: "Horneado", duration: 55 }] },
      1250: { total: 185, steps: [{ name: "Precalentamiento", duration: 15 }, { name: "Amasado 1", duration: 13 }, { name: "Fermentación 1", duration: 25 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 7 }, { name: "Fermentación 2", duration: 30, isRmv: true }, { name: "Fermentación 3", duration: 30 }, { name: "Horneado", duration: 60 }] },
      1500: { total: 195, steps: [{ name: "Precalentamiento", duration: 20 }, { name: "Amasado 1", duration: 13 }, { name: "Fermentación 1", duration: 25 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 7 }, { name: "Fermentación 2", duration: 30, isRmv: true }, { name: "Fermentación 3", duration: 30 }, { name: "Horneado", duration: 65 }] }
    }
  },
  {
    id: 2,
    name: "Esponjoso",
    timings: {
      1000: { total: 190, steps: [{ name: "Precalentamiento", duration: 10 }, { name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 20 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 10 }, { name: "Fermentación 2", duration: 38, isRmv: true }, { name: "Fermentación 3", duration: 35 }, { name: "Horneado", duration: 60 }] },
      1250: { total: 195, steps: [{ name: "Precalentamiento", duration: 10 }, { name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 20 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 10 }, { name: "Fermentación 2", duration: 38, isRmv: true }, { name: "Fermentación 3", duration: 35 }, { name: "Horneado", duration: 65 }] },
      1500: { total: 205, steps: [{ name: "Precalentamiento", duration: 15 }, { name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 20 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 10 }, { name: "Fermentación 2", duration: 38, isRmv: true }, { name: "Fermentación 3", duration: 35 }, { name: "Horneado", duration: 70 }] }
    }
  },
  {
    id: 3,
    name: "Integral",
    timings: {
      1000: { total: 200, steps: [{ name: "Precalentamiento", duration: 15 }, { name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 30 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 10 }, { name: "Fermentación 2", duration: 38, isRmv: true }, { name: "Fermentación 3", duration: 35 }, { name: "Horneado", duration: 55 }] },
      1250: { total: 205, steps: [{ name: "Precalentamiento", duration: 15 }, { name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 30 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 10 }, { name: "Fermentación 2", duration: 38, isRmv: true }, { name: "Fermentación 3", duration: 35 }, { name: "Horneado", duration: 60 }] },
      1500: { total: 215, steps: [{ name: "Precalentamiento", duration: 20 }, { name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 30 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 10 }, { name: "Fermentación 2", duration: 38, isRmv: true }, { name: "Fermentación 3", duration: 35 }, { name: "Horneado", duration: 65 }] }
    }
  },
  {
    id: 4,
    name: "Dulce",
    timings: {
      1000: { total: 175, steps: [{ name: "Precalentamiento", duration: 10 }, { name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 25 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 8 }, { name: "Fermentación 2", duration: 35, isRmv: true }, { name: "Fermentación 3", duration: 30 }, { name: "Horneado", duration: 50 }] },
      1250: { total: 180, steps: [{ name: "Precalentamiento", duration: 10 }, { name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 25 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 8 }, { name: "Fermentación 2", duration: 35, isRmv: true }, { name: "Fermentación 3", duration: 30 }, { name: "Horneado", duration: 55 }] },
      1500: { total: 190, steps: [{ name: "Precalentamiento", duration: 15 }, { name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 25 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 8 }, { name: "Fermentación 2", duration: 35, isRmv: true }, { name: "Fermentación 3", duration: 30 }, { name: "Horneado", duration: 60 }] }
    }
  },
  {
    id: 5,
    name: "Low Carb",
    timings: {
      1000: { total: 189, steps: [{ name: "Precalentamiento", duration: 15 }, { name: "Amasado 1", duration: 20 }, { name: "Fermentación 1", duration: 15 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 12 }, { name: "Fermentación 2", duration: 15, isRmv: true }, { name: "Fermentación 3", duration: 22 }, { name: "Horneado", duration: 80 }] },
      1250: { total: 201, steps: [{ name: "Precalentamiento", duration: 15 }, { name: "Amasado 1", duration: 21 }, { name: "Fermentación 1", duration: 15 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 14 }, { name: "Fermentación 2", duration: 17, isRmv: true }, { name: "Fermentación 3", duration: 24 }, { name: "Horneado", duration: 85 }] },
      1500: { total: 213, steps: [{ name: "Precalentamiento", duration: 15 }, { name: "Amasado 1", duration: 22 }, { name: "Fermentación 1", duration: 15 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 16 }, { name: "Fermentación 2", duration: 19, isRmv: true }, { name: "Fermentación 3", duration: 26 }, { name: "Horneado", duration: 90 }] }
    }
  },
  {
    id: 6,
    name: "Sin gluten",
    timings: {
      1000: { total: 220, steps: [{ name: "Precalentamiento", duration: 15 }, { name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 20 }, { name: "Amasado 2 (ADD)", duration: 3, isAdd: true }, { name: "Amasado 2 (Final)", duration: 10 }, { name: "Fermentación 2", duration: 50, isRmv: true }, { name: "Fermentación 3", duration: 50 }, { name: "Horneado", duration: 60 }] },
      1250: { total: 225, steps: [{ name: "Precalentamiento", duration: 15 }, { name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 20 }, { name: "Amasado 2 (ADD)", duration: 3, isAdd: true }, { name: "Amasado 2 (Final)", duration: 10 }, { name: "Fermentación 2", duration: 50, isRmv: true }, { name: "Fermentación 3", duration: 50 }, { name: "Horneado", duration: 65 }] },
      1500: { total: 235, steps: [{ name: "Precalentamiento", duration: 20 }, { name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 20 }, { name: "Amasado 2 (ADD)", duration: 3, isAdd: true }, { name: "Amasado 2 (Final)", duration: 10 }, { name: "Fermentación 2", duration: 50, isRmv: true }, { name: "Fermentación 3", duration: 50 }, { name: "Horneado", duration: 70 }] }
    }
  },
  {
    id: 7,
    name: "Exprés",
    timings: {
      1000: { total: 75, steps: [{ name: "Amasado 1", duration: 8 }, { name: "Amasado 2 (Final)", duration: 7 }, { name: "Fermentación 3", duration: 10 }, { name: "Horneado", duration: 50 }] },
      1250: { total: 78, steps: [{ name: "Amasado 1", duration: 8 }, { name: "Amasado 2 (Final)", duration: 7 }, { name: "Fermentación 3", duration: 10 }, { name: "Horneado", duration: 53 }] },
      1500: { total: 80, steps: [{ name: "Amasado 1", duration: 8 }, { name: "Amasado 2 (Final)", duration: 7 }, { name: "Fermentación 3", duration: 10 }, { name: "Horneado", duration: 55 }] }
    }
  },
  {
    id: 8,
    name: "Pastel",
    timings: {
      1000: { total: 90, steps: [{ name: "Amasado 1", duration: 25 }, { name: "Horneado", duration: 65 }] },
      1250: { total: 95, steps: [{ name: "Amasado 1", duration: 25 }, { name: "Horneado", duration: 70 }] },
      1500: { total: 100, steps: [{ name: "Amasado 1", duration: 25 }, { name: "Horneado", duration: 75 }] }
    }
  },
  {
    id: 9,
    name: "Amasar",
    timings: {
      1000: { total: 10, steps: [{ name: "Amasado 1", duration: 10 }] },
      1250: { total: 10, steps: [{ name: "Amasado 1", duration: 10 }] },
      1500: { total: 10, steps: [{ name: "Amasado 1", duration: 10 }] }
    }
  },
  {
    id: 10,
    name: "Masa",
    timings: {
      1000: { total: 100, steps: [{ name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 10 }, { name: "Amasado 2 (ADD)", duration: 3, isAdd: true }, { name: "Amasado 2 (Final)", duration: 5 }, { name: "Fermentación 2", duration: 25, isRmv: true }, { name: "Fermentación 3", duration: 45 }] },
      1250: { total: 100, steps: [{ name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 10 }, { name: "Amasado 2 (ADD)", duration: 3, isAdd: true }, { name: "Amasado 2 (Final)", duration: 5 }, { name: "Fermentación 2", duration: 25, isRmv: true }, { name: "Fermentación 3", duration: 45 }] },
      1500: { total: 100, steps: [{ name: "Amasado 1", duration: 12 }, { name: "Fermentación 1", duration: 10 }, { name: "Amasado 2 (ADD)", duration: 3, isAdd: true }, { name: "Amasado 2 (Final)", duration: 5 }, { name: "Fermentación 2", duration: 25, isRmv: true }, { name: "Fermentación 3", duration: 45 }] }
    }
  },
  {
    id: 11,
    name: "Masa para pasta",
    timings: {
      1000: { total: 15, steps: [{ name: "Amasado 1", duration: 15 }] },
      1250: { total: 15, steps: [{ name: "Amasado 1", duration: 15 }] },
      1500: { total: 15, steps: [{ name: "Amasado 1", duration: 15 }] }
    }
  },
  {
    id: 12,
    name: "Masa de pizza",
    timings: {
      1000: { total: 45, steps: [{ name: "Amasado 1", duration: 15 }, { name: "Fermentación 1", duration: 10 }, { name: "Amasado 2 (Final)", duration: 10 }, { name: "Fermentación 2", duration: 10 }] },
      1250: { total: 45, steps: [{ name: "Amasado 1", duration: 15 }, { name: "Fermentación 1", duration: 10 }, { name: "Amasado 2 (Final)", duration: 10 }, { name: "Fermentación 2", duration: 10 }] },
      1500: { total: 45, steps: [{ name: "Amasado 1", duration: 15 }, { name: "Fermentación 1", duration: 10 }, { name: "Amasado 2 (Final)", duration: 10 }, { name: "Fermentación 2", duration: 10 }] }
    }
  },
  {
    id: 13,
    name: "Yogur",
    timings: {
      1000: { total: 480, steps: [{ name: "Fermentación", duration: 480 }] },
      1250: { total: 480, steps: [{ name: "Fermentación", duration: 480 }] },
      1500: { total: 480, steps: [{ name: "Fermentación", duration: 480 }] }
    }
  },
  {
    id: 14,
    name: "Mermelada",
    timings: {
      1000: { total: 80, steps: [{ name: "Fermentación 1", duration: 15 }, { name: "Fermentación 3", duration: 45 }, { name: "Horneado", duration: 20 }] },
      1250: { total: 80, steps: [{ name: "Fermentación 1", duration: 15 }, { name: "Fermentación 3", duration: 45 }, { name: "Horneado", duration: 20 }] },
      1500: { total: 80, steps: [{ name: "Fermentación 1", duration: 15 }, { name: "Fermentación 3", duration: 45 }, { name: "Horneado", duration: 20 }] }
    }
  },
  {
    id: 15,
    name: "Hornear",
    timings: {
      1000: { total: 60, steps: [{ name: "Horneado", duration: 60 }] },
      1250: { total: 60, steps: [{ name: "Horneado", duration: 60 }] },
      1500: { total: 60, steps: [{ name: "Horneado", duration: 60 }] }
    }
  },
  {
    id: 16,
    name: "Programable",
    timings: {
      1000: { total: 180, steps: [{ name: "Precalentamiento", duration: 15 }, { name: "Amasado 1", duration: 13 }, { name: "Fermentación 1", duration: 25 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 7 }, { name: "Fermentación 2", duration: 30, isRmv: true }, { name: "Fermentación 3", duration: 30 }, { name: "Horneado", duration: 55 }] },
      1250: { total: 185, steps: [{ name: "Precalentamiento", duration: 15 }, { name: "Amasado 1", duration: 13 }, { name: "Fermentación 1", duration: 25 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 7 }, { name: "Fermentación 2", duration: 30, isRmv: true }, { name: "Fermentación 3", duration: 30 }, { name: "Horneado", duration: 60 }] },
      1500: { total: 195, steps: [{ name: "Precalentamiento", duration: 20 }, { name: "Amasado 1", duration: 13 }, { name: "Fermentación 1", duration: 25 }, { name: "Amasado 2 (ADD)", duration: 5, isAdd: true }, { name: "Amasado 2 (Final)", duration: 7 }, { name: "Fermentación 2", duration: 30, isRmv: true }, { name: "Fermentación 3", duration: 30 }, { name: "Horneado", duration: 65 }] }
    }
  }
];
