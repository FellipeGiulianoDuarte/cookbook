import type { ClientCatalog, Derived } from "@/lib/derive";
import type { Selection, WizardEvent } from "@/lib/machine";

export interface StepProps {
  selection: Selection;
  send: (event: WizardEvent) => void;
}

export interface CatalogStepProps extends StepProps {
  catalog: ClientCatalog;
}

export interface DerivedStepProps extends StepProps {
  derived: Derived;
}
