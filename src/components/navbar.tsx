import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { NavigationSheet } from "@/components/navigation-sheet";
import { ModeToggle } from './mode-toogle';
import { UserProfileButton } from './UserProfileButton';
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <nav className="h-20 bg-background border-b">
      <div className="h-full flex items-center justify-between max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Logo + Desktop Menu */}
        <div className="flex items-center gap-6 sm:gap-10 lg:gap-12">
          <Logo />

          {/* Menu PC seulement */}
          <NavMenu className="hidden lg:block" />
        </div>

        {/* Buttons + Mode + Mobile Menu */}
        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {!isAuthenticated ? (
                <>
                  {/* Se connecter : visible à partir de sm */}
                  <Link to="/login">
                    <Button variant="outline" className="hidden sm:inline-flex">
                      Se connecter
                    </Button>
                  </Link>

                  {/* S'inscrire : visible partout */}
                  <Link to="/signup">
                    <Button>
                      S'inscrire
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {/* Bouton profil utilisateur */}
                  <UserProfileButton />
                </>
              )}
            </>
          )}

          <ModeToggle />

          {/* Menu mobile/tablette */}
          <div className="lg:hidden">
            <NavigationSheet />
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
