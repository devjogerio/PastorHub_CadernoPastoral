import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  User,
  Bell,
  Cloud,
  Palette,
  Shield,
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Globe,
  Download,
  Trash2,
  LogOut,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function MobileSettings() {
  return (
    <div className="space-y-4 pb-20">
      {/* Header with User Profile */}
      <div className="bg-gradient-to-br from-[#002645] to-[#3261AB] text-white p-6 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-20 h-20 border-4 border-[#95C121]">
            <AvatarFallback className="bg-[#95C121] text-white text-2xl">
              PS
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl mb-1">Pastor Silva</h2>
            <p className="text-sm text-white/80">pastor@igreja.com</p>
            <Badge className="mt-2 bg-[#95C121] text-white border-[#95C121]">
              Plano Premium
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="geral" className="px-4">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="sobre">Sobre</TabsTrigger>
        </TabsList>

        {/* Aba Geral */}
        <TabsContent value="geral" className="space-y-3 mt-4">
          {/* Perfil */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-[#002645]" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-between h-auto py-3">
                <span>Editar Perfil</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Separator />
              <Button variant="ghost" className="w-full justify-between h-auto py-3">
                <span>Alterar Senha</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Separator />
              <Button variant="ghost" className="w-full justify-between h-auto py-3">
                <span>Foto de Perfil</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Aparência */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#002645]" />
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-[#95C121]" />
                  <div>
                    <Label>Modo Escuro</Label>
                    <p className="text-xs text-muted-foreground">Ativar tema escuro</p>
                  </div>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-[#3261AB]" />
                  <div>
                    <Label>Idioma</Label>
                    <p className="text-xs text-muted-foreground">Português (BR)</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#002645]" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receber alertas</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>E-mail</Label>
                  <p className="text-xs text-muted-foreground">Notificações por e-mail</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Som</Label>
                  <p className="text-xs text-muted-foreground">Sons de notificação</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Dados */}
        <TabsContent value="dados" className="space-y-3 mt-4">
          {/* Sincronização */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#002645]" />
                Sincronização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sincronização Automática</Label>
                  <p className="text-xs text-muted-foreground">Quando online</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <Button variant="outline" className="w-full justify-between">
                <span>Google Calendar</span>
                <Badge className="bg-green-500 text-white">Conectado</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>Microsoft Outlook</span>
                <Badge variant="secondary">Desconectado</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>Apple Calendar</span>
                <Badge variant="secondary">Desconectado</Badge>
              </Button>
              <Separator />
              <Button variant="outline" className="w-full">
                <Cloud className="w-4 h-4 mr-2" />
                Sincronizar Agora
              </Button>
            </CardContent>
          </Card>

          {/* Armazenamento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="w-4 h-4 text-[#002645]" />
                Armazenamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sermões</span>
                  <span className="text-muted-foreground">2.4 MB</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#95C121] w-[60%]"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Atendimentos</span>
                  <span className="text-muted-foreground">1.2 MB</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#3261AB] w-[30%]"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Utilizado</span>
                  <span className="text-muted-foreground">3.6 MB / 100 MB</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#002645] w-[4%]"></div>
                </div>
              </div>
              <Separator />
              <Button variant="outline" className="w-full" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar Todos os Dados
              </Button>
              <Button variant="outline" className="w-full text-red-500 hover:text-red-600" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Cache
              </Button>
            </CardContent>
          </Card>

          {/* Privacidade */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#002645]" />
                Privacidade e Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-between h-auto py-3">
                <span>Política de Privacidade</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Separator />
              <Button variant="ghost" className="w-full justify-between h-auto py-3">
                <span>Termos de Uso</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Bloqueio Automático</Label>
                  <p className="text-xs text-muted-foreground">Após 5 minutos</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Sobre */}
        <TabsContent value="sobre" className="space-y-3 mt-4">
          {/* App Info */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#002645] to-[#3261AB] flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg mb-1">PastorHub</h3>
              <p className="text-sm text-muted-foreground mb-4">Versão 1.0.0</p>
              <Badge className="bg-[#95C121] text-white">Atualizado</Badge>
            </CardContent>
          </Card>

          {/* Ajuda e Suporte */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#002645]" />
                Ajuda e Suporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-between h-auto py-3">
                <span>Central de Ajuda</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Separator />
              <Button variant="ghost" className="w-full justify-between h-auto py-3">
                <span>Tutoriais</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Separator />
              <Button variant="ghost" className="w-full justify-between h-auto py-3">
                <span>Reportar Problema</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Separator />
              <Button variant="ghost" className="w-full justify-between h-auto py-3">
                <span>Fale Conosco</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Créditos */}
          <Card>
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              <p className="mb-2">Desenvolvido com ❤️ para pastores</p>
              <p className="text-xs">© 2024 PastorHub. Todos os direitos reservados.</p>
            </CardContent>
          </Card>

          {/* Logout */}
          <Button
            variant="outline"
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
