import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  region: string;
  ville: string;
  codePostal: string;
  secteur: string;
  nombreMax: string;
  codeNaf: string;
  tailleEntreprise: string;
  formeJuridique: string;
  caMinimum: string;
  caMaximum: string;
  anneeCreation: string;
  statut: string;
  exclureFranchises: boolean;
}

export default function BusinessScraperForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    region: "",
    ville: "",
    codePostal: "",
    secteur: "",
    nombreMax: "100",
    codeNaf: "",
    tailleEntreprise: "",
    formeJuridique: "",
    caMinimum: "",
    caMaximum: "",
    anneeCreation: "",
    statut: "active",
    exclureFranchises: false,
  });

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const downloadCSV = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare form data for submission
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "" && value !== false) {
          submitData.append(key, value.toString());
        }
      });

      const response = await fetch('/scrape', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Get the CSV data
      const csvData = await response.text();
      const filename = `entreprises_${new Date().toISOString().split('T')[0]}.csv`;
      
      downloadCSV(csvData, filename);

      toast({
        title: "Recherche terminée",
        description: `Les données ont été téléchargées avec succès (${filename})`,
        className: "bg-success text-success-foreground",
      });

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Recherche d'Entreprises Françaises
          </h1>
          <p className="text-muted-foreground text-lg">
            Trouvez et exportez les données d'entreprises selon vos critères
          </p>
        </div>

        <Card className="shadow-elegant border-0">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Search className="h-6 w-6 text-primary" />
              Critères de recherche
            </CardTitle>
            <CardDescription className="text-base">
              Remplissez les champs souhaités pour filtrer votre recherche
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Localisation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  📍 Localisation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Région</Label>
                    <Input
                      id="region"
                      placeholder="ex: Île-de-France"
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ville">Ville spécifique</Label>
                    <Input
                      id="ville"
                      placeholder="ex: Paris"
                      value={formData.ville}
                      onChange={(e) => handleInputChange('ville', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codePostal">Code postal</Label>
                    <Input
                      id="codePostal"
                      placeholder="ex: 75001"
                      value={formData.codePostal}
                      onChange={(e) => handleInputChange('codePostal', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Activité */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🏢 Activité
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="secteur">Secteur d'activité / Mots-clés</Label>
                    <Input
                      id="secteur"
                      placeholder="ex: informatique, restaurant"
                      value={formData.secteur}
                      onChange={(e) => handleInputChange('secteur', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codeNaf">Code NAF</Label>
                    <Input
                      id="codeNaf"
                      placeholder="ex: 6201Z"
                      value={formData.codeNaf}
                      onChange={(e) => handleInputChange('codeNaf', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Taille et forme */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  📊 Taille et forme
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tailleEntreprise">Taille d'entreprise</Label>
                    <Select onValueChange={(value) => handleInputChange('tailleEntreprise', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une taille" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TPE">TPE (Très Petite Entreprise)</SelectItem>
                        <SelectItem value="PE">PE (Petite Entreprise)</SelectItem>
                        <SelectItem value="ME">ME (Moyenne Entreprise)</SelectItem>
                        <SelectItem value="GE">GE (Grande Entreprise)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formeJuridique">Forme juridique</Label>
                    <Input
                      id="formeJuridique"
                      placeholder="ex: SARL, SAS, SA"
                      value={formData.formeJuridique}
                      onChange={(e) => handleInputChange('formeJuridique', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Chiffre d'affaires */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  💰 Chiffre d'affaires
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="caMinimum">CA minimum (k€)</Label>
                    <Input
                      id="caMinimum"
                      type="number"
                      placeholder="ex: 100"
                      value={formData.caMinimum}
                      onChange={(e) => handleInputChange('caMinimum', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caMaximum">CA maximum (k€)</Label>
                    <Input
                      id="caMaximum"
                      type="number"
                      placeholder="ex: 1000"
                      value={formData.caMaximum}
                      onChange={(e) => handleInputChange('caMaximum', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Paramètres */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  ⚙️ Paramètres
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombreMax">Nombre max de résultats</Label>
                    <Input
                      id="nombreMax"
                      type="number"
                      placeholder="ex: 100"
                      value={formData.nombreMax}
                      onChange={(e) => handleInputChange('nombreMax', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anneeCreation">Année de création (à partir de)</Label>
                    <Input
                      id="anneeCreation"
                      type="number"
                      placeholder="ex: 2020"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.anneeCreation}
                      onChange={(e) => handleInputChange('anneeCreation', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Statut de l'entreprise</Label>
                  <RadioGroup
                    value={formData.statut}
                    onValueChange={(value) => handleInputChange('statut', value)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="active" />
                      <Label htmlFor="active">Active uniquement</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all">Toutes</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="franchise"
                    checked={formData.exclureFranchises}
                    onCheckedChange={(checked) => handleInputChange('exclureFranchises', checked as boolean)}
                  />
                  <Label htmlFor="franchise">Exclure les franchises</Label>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary shadow-elegant transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Recherche en cours...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Lancer la recherche
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}