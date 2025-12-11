import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="bg-card border-2 border-foreground/20 rounded-lg p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-red-900/40 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-900 dark:text-red-200" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">{t.notFound.title}</h1>
          <p className="text-lg text-muted-foreground">
            {t.notFound.subtitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {t.notFound.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/"
            className="flex items-center justify-between p-4 bg-card border-2 border-foreground/20 rounded-lg hover:border-primary/50 transition-colors group"
          >
            <div className="text-left">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {t.notFound.inventory}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t.notFound.inventoryDesc}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Link
            to="/sales"
            className="flex items-center justify-between p-4 bg-card border-2 border-foreground/20 rounded-lg hover:border-primary/50 transition-colors group"
          >
            <div className="text-left">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {t.notFound.pointOfSale}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t.notFound.pointOfSaleDesc}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Link
            to="/analytics"
            className="flex items-center justify-between p-4 bg-card border-2 border-foreground/20 rounded-lg hover:border-primary/50 transition-colors group"
          >
            <div className="text-left">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {t.notFound.analytics}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t.notFound.analyticsDesc}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
