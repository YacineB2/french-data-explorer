import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Download, Search, MapPin, Wifi, WifiOff, Calendar, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  location: string;
  searchTerms: string;
  maxResults: string;
  fiberEligibility: string;
  nafCodes: string;
  legalForms: string;
  employeeSize: string;
  creationYearMin: string;
  creationYearMax: string;
  excludeFranchises: string;
}

export default function BusinessScraperForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    location: "",
    searchTerms: "",
    maxResults: "100",
    fiberEligibility: "already-fiber",
    nafCodes: "",
    legalForms: "",
    employeeSize: "all",
    creationYearMin: "",
    creationYearMax: "",
    excludeFranchises: "no",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
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
      const response = await fetch('/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

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

  const fiberOptions = [
    { 
      value: "no-fiber", 
      label: "Pas de fibre", 
      icon: <XCircle className="h-5 w-5 text-destructive" />,
      description: "Aucune infrastructure fibre"
    },
    { 
      value: "planned-fiber", 
      label: "Fibre programmée", 
      icon: <Calendar className="h-5 w-5 text-warning" />,
      description: "Déploiement prévu"
    },
    { 
      value: "recent-fiber", 
      label: "Fibre récente", 
      icon: <Wifi className="h-5 w-5 text-info" />,
      description: "Installée récemment"
    },
    { 
      value: "already-fiber", 
      label: "Déjà fibré", 
      icon: <CheckCircle className="h-5 w-5 text-success" />,
      description: "Infrastructure complète"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Recherche d'Entreprises Françaises
          </h1>
          <p className="text-muted-foreground text-lg">
            Trouvez et exportez les données d'entreprises selon leurs critères et éligibilité fibre
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-background/90 shadow-2xl border-primary/10">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Search className="h-6 w-6 text-primary" />
              Critères de recherche
            </CardTitle>
            <CardDescription className="text-base">
              Configurez vos filtres pour cibler les entreprises selon leurs caractéristiques
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Core Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Informations de base
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Localisation</Label>
                      <Input
                        id="location"
                        placeholder="ex: Paris, Île-de-France, 75001"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="searchTerms">Termes de recherche</Label>
                      <Input
                        id="searchTerms"
                        placeholder="ex: informatique, restaurant, conseil"
                        value={formData.searchTerms}
                        onChange={(e) => handleInputChange('searchTerms', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxResults">Nombre maximum de résultats</Label>
                      <Select value={formData.maxResults} onValueChange={(value) => handleInputChange('maxResults', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50 entreprises</SelectItem>
                          <SelectItem value="100">100 entreprises</SelectItem>
                          <SelectItem value="200">200 entreprises</SelectItem>
                          <SelectItem value="500">500 entreprises</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Fiber Eligibility Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                      <Wifi className="h-5 w-5 text-primary" />
                      Éligibilité Fibre
                    </h3>
                    
                    <RadioGroup
                      value={formData.fiberEligibility}
                      onValueChange={(value) => handleInputChange('fiberEligibility', value)}
                      className="space-y-3"
                    >
                      {fiberOptions.map((option) => (
                        <div 
                          key={option.value}
                          className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                        >
                          <RadioGroupItem value={option.value} id={option.value} />
                          <div className="flex items-center gap-3 flex-1">
                            {option.icon}
                            <div>
                              <Label htmlFor={option.value} className="font-medium cursor-pointer">
                                {option.label}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                  🔍 Filtres avancés
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nafCodes">Codes NAF</Label>
                    <Input
                      id="nafCodes"
                      placeholder="ex: 6201Z, 5610A"
                      value={formData.nafCodes}
                      onChange={(e) => handleInputChange('nafCodes', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalForms">Formes juridiques</Label>
                    <Input
                      id="legalForms"
                      placeholder="ex: SARL, SAS, SA"
                      value={formData.legalForms}
                      onChange={(e) => handleInputChange('legalForms', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeSize">Taille (employés)</Label>
                    <Select value={formData.employeeSize} onValueChange={(value) => handleInputChange('employeeSize', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes tailles</SelectItem>
                        <SelectItem value="micro">Micro (0-9)</SelectItem>
                        <SelectItem value="small">Petite (10-49)</SelectItem>
                        <SelectItem value="medium">Moyenne (50-249)</SelectItem>
                        <SelectItem value="large">Grande (250+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creationYearMin">Année création min</Label>
                    <Input
                      id="creationYearMin"
                      type="number"
                      placeholder="ex: 2020"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.creationYearMin}
                      onChange={(e) => handleInputChange('creationYearMin', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creationYearMax">Année création max</Label>
                    <Input
                      id="creationYearMax"
                      type="number"
                      placeholder="ex: 2024"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.creationYearMax}
                      onChange={(e) => handleInputChange('creationYearMax', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excludeFranchises">Exclure franchises</Label>
                    <Select value={formData.excludeFranchises} onValueChange={(value) => handleInputChange('excludeFranchises', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">Non</SelectItem>
                        <SelectItem value="yes">Oui</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
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