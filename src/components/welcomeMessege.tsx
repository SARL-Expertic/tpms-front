import { useAuth } from "@/providers/AuthContext";


export default function WelcomeMessage() {
  const { user } = useAuth();
  return (
    <div>
      <p className="text-xl text-[#707EAE]">Bonjour {user?.name},</p>
      <h1 className="text-4xl font-bold text-[#2B3674]" >Bienvenue chez EXPERTIC !</h1>
    </div>
  );
}