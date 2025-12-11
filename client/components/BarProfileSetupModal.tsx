import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, ChevronRight, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

interface BarProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: any) => void;
}

export function BarProfileSetupModal({
  isOpen,
  onClose,
  onComplete,
}: BarProfileSetupModalProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    barType: "",
    barAmbiance: "",
    primaryClientele: "",
    priceRange: "",
    businessStage: "",
    yearsFounded: new Date().getFullYear(),
    seatingCapacity: "",
    servingStyle: "",
    specialties: "",
    targetMarket: "",
  });

  const steps = [
    {
      title: "Type d'établissement",
      description: "Quel type de bar exploitez-vous ?",
      field: "barType",
      options: [
        { value: "casual", label: "Bar casual" },
        { value: "upscale", label: "Bar haut de gamme" },
        { value: "dive", label: "Bar populaire" },
        { value: "sports", label: "Bar sportif" },
        { value: "wine-bar", label: "Bar à vin" },
        { value: "cocktail-lounge", label: "Lounge à cocktails" },
        { value: "nightclub", label: "Boîte de nuit" },
        { value: "pub", label: "Pub" },
        { value: "bistro", label: "Bistro" },
        { value: "restaurant-bar", label: "Restaurant-bar" },
      ],
      isSelect: true,
    },
    {
      title: "Ambiance",
      description: "Quelle ambiance caractérise votre établissement ?",
      field: "barAmbiance",
      options: [
        { value: "relaxed", label: "Décontractée" },
        { value: "lively", label: "Animée" },
        { value: "intimate", label: "Intime" },
        { value: "sophisticated", label: "Sophistiquée" },
        { value: "casual", label: "Casual" },
        { value: "energetic", label: "Énergique" },
        { value: "quiet", label: "Calme" },
        { value: "romantic", label: "Romantique" },
      ],
      isSelect: true,
    },
    {
      title: "Clientèle principale",
      description: "Qui sont vos clients principaux ?",
      field: "primaryClientele",
      options: [
        { value: "young-professionals", label: "Jeunes professionnels" },
        { value: "students", label: "Étudiants" },
        { value: "families", label: "Familles" },
        { value: "tourists", label: "Touristes" },
        { value: "locals", label: "Habitués locaux" },
        { value: "mixed", label: "Clientèle mixte" },
        { value: "seniors", label: "Clientèle senior" },
        { value: "business", label: "Affaires" },
      ],
      isSelect: true,
    },
    {
      title: "Gamme de prix",
      description: "Quel est votre positionnement tarifaire ?",
      field: "priceRange",
      options: [
        { value: "budget", label: "Économique ($)" },
        { value: "moderate", label: "Modéré ($$)" },
        { value: "upscale", label: "Haut de gamme ($$$)" },
        { value: "luxury", label: "Luxe ($$$$)" },
      ],
      isSelect: true,
    },
    {
      title: "Stade de développement",
      description: "À quel stade est votre entreprise ?",
      field: "businessStage",
      options: [
        { value: "new", label: "Nouveau (moins d'1 an)" },
        { value: "growing", label: "En croissance (1-3 ans)" },
        { value: "established", label: "Établi (3-10 ans)" },
        { value: "mature", label: "Mature (10+ ans)" },
      ],
      isSelect: true,
    },
    {
      title: "Année de fondation",
      description: "En quelle année votre bar a-t-il été créé ?",
      field: "yearsFounded",
      type: "number",
      isInput: true,
    },
    {
      title: "Capacité d'accueil",
      description: "Combien de places assises avez-vous ?",
      field: "seatingCapacity",
      type: "number",
      isInput: true,
      placeholder: "Ex: 50",
    },
    {
      title: "Style de service",
      description: "Comment servez-vous vos clients ?",
      field: "servingStyle",
      options: [
        { value: "table-service", label: "Service aux tables" },
        { value: "bar-only", label: "Au bar uniquement" },
        { value: "mixed", label: "Mixte" },
        { value: "fast-casual", label: "Casual rapide" },
      ],
      isSelect: true,
    },
    {
      title: "Spécialités de la maison",
      description: "Que proposez-vous de spécial ? (optionnel)",
      field: "specialties",
      type: "text",
      isInput: true,
      placeholder: "Ex: cocktails artisanaux, vins nature, bières locales",
      optional: true,
    },
    {
      title: "Marché cible",
      description: "Quelles sont vos occasions de vente principales ? (optionnel)",
      field: "targetMarket",
      type: "text",
      isInput: true,
      placeholder: "Ex: après-travail, événements privés, rendez-vous",
      optional: true,
    },
  ];

  const currentStep = steps[step];
  const totalSteps = steps.length;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    // Ignorer la question et passer à la suivante
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Filtrer les champs vides optionnels et les vides non remplis
    const cleanProfile = Object.fromEntries(
      Object.entries(profile).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    );
    onComplete(cleanProfile);
    onClose();
  };

  const handleSelectChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      [currentStep.field]: value,
    }));
  };

  const handleInputChange = (value: string | number) => {
    setProfile((prev) => ({
      ...prev,
      [currentStep.field]: value,
    }));
  };

  const isCurrentStepFilled =
    profile[currentStep.field as keyof typeof profile] !== "" &&
    profile[currentStep.field as keyof typeof profile] !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <DialogTitle>Profil de votre bar</DialogTitle>
          </div>
          <DialogDescription>
            Aidez l'IA à mieux comprendre votre établissement
            <div className="text-xs text-muted-foreground mt-2">
              Étape {step + 1} sur {totalSteps} (vous pouvez ignorer à tout moment)
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">{currentStep.title}</h3>
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
          </div>

          <div className="space-y-2">
            {currentStep.isSelect ? (
              <Select
                value={profile[currentStep.field as keyof typeof profile] as string}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une option..." />
                </SelectTrigger>
                <SelectContent>
                  {currentStep.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={currentStep.type || "text"}
                placeholder={currentStep.placeholder || ""}
                value={profile[currentStep.field as keyof typeof profile] as string}
                onChange={(e) =>
                  handleInputChange(
                    currentStep.type === "number" ? parseInt(e.target.value) || "" : e.target.value
                  )
                }
                min={currentStep.type === "number" ? "1" : undefined}
              />
            )}
            {currentStep.optional && (
              <p className="text-xs text-muted-foreground">Cette question est optionnelle</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-between">
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                Précédent
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              {step === totalSteps - 1 ? "Terminer" : "Ignorer"}
            </Button>

            <Button
              onClick={step === totalSteps - 1 ? handleComplete : handleNext}
              disabled={!isCurrentStepFilled && !currentStep.optional}
              className="gap-2"
            >
              {step === totalSteps - 1 ? "Terminer" : "Suivant"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-4 bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
