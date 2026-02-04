import { useState } from "react";
import { Plus, Briefcase, TrendingUp } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  mockPositions, 
  mockLevels,
  getLevelsByPosition,
} from "@/data/teamData";
import { PERSON_TYPE_LABELS } from "@/types/team";
import { formatCurrency } from "@/lib/teamCostCalculations";

export default function PositionsLevelsList() {
  const [activeTab, setActiveTab] = useState("positions");

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cargos e Níveis</h1>
            <p className="text-muted-foreground">
              Gerencie cargos, níveis salariais e índices de PPR
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cargo
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Nível
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="border-warning bg-warning/10">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-warning-foreground mt-0.5" />
              <div>
                <p className="font-medium">Índice de PPR</p>
                <p className="text-sm text-muted-foreground">
                  O índice de PPR está armazenado para uso futuro. O cálculo de PPR será implementado em fase posterior.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="positions" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Cargos
            </TabsTrigger>
            <TabsTrigger value="levels" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Níveis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cargos</CardTitle>
                <CardDescription>
                  {mockPositions.filter(p => p.isActive).length} cargos ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Cargo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Níveis Associados</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPositions.map((position) => {
                      const levels = getLevelsByPosition(position.id);
                      
                      return (
                        <TableRow key={position.id}>
                          <TableCell className="font-medium">
                            {position.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {PERSON_TYPE_LABELS[position.type]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {levels.map(level => (
                                <Badge key={level.id} variant="secondary" className="text-xs">
                                  {level.name}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={position.isActive ? "default" : "secondary"}>
                              {position.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="levels" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Níveis</CardTitle>
                <CardDescription>
                  {mockLevels.filter(l => l.isActive).length} níveis ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead className="text-right">Salário Base</TableHead>
                      <TableHead className="text-right">
                        <span className="flex items-center justify-end gap-1">
                          Índice PPR
                          <Badge variant="outline" className="text-xs ml-1">
                            Inativo
                          </Badge>
                        </span>
                      </TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockLevels.map((level) => {
                      const position = mockPositions.find(p => p.id === level.positionId);
                      
                      return (
                        <TableRow key={level.id}>
                          <TableCell className="font-medium">
                            {position?.name}
                          </TableCell>
                          <TableCell>{level.name}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(level.baseSalary)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-muted-foreground">
                              {level.pprIndex.toFixed(2)}x
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={level.isActive ? "default" : "secondary"}>
                              {level.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
