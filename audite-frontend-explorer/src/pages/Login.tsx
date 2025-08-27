import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import BrandButton from "@/components/ui/BrandButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password);
      toast.success("Inicio de sesión exitoso");
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      toast.error("Error al iniciar sesión. Verifique sus credenciales.");
      console.error("Login error", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="block">
            <img 
              src="/logo primary@2x.png" 
              alt="AuditE - Conecta. Ahorra. Transforma." 
              className="logo-primary mx-auto mb-4"
            />
          </Link>
          <div className="slogan text-lg text-audite-secondary">
            Conecta. Ahorra. Transforma.
          </div>
        </div>
        
        <Card className="animate-fade-in dashboard-card border-audite-accent-medium/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-brand text-audite-dark">
              Iniciar sesión
            </CardTitle>
            <CardDescription className="text-center font-body text-audite-secondary">
              Inicia sesión para acceder a tu cuenta de AuditE
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body text-audite-dark">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="nombre@empresa.com" 
                          className="border-audite-accent-medium/30 focus:border-primary"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body text-audite-dark">Contraseña</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••" 
                          className="border-audite-accent-medium/30 focus:border-primary"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <BrandButton type="submit" className="w-full" variant="primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </BrandButton>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <div className="w-full text-center font-body text-audite-secondary">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="text-primary hover:text-audite-secondary transition-colors font-semibold">
                Regístrate
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center mt-6">
          <Link 
            to="/admin/login" 
            className="text-sm text-audite-secondary hover:text-audite-dark transition-colors font-body"
          >
            ¿Eres administrador? Accede aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
